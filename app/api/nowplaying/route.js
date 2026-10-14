/**
 * What song is playing, read from the stream itself.
 *
 * Shoutcast and Icecast servers interleave a metadata block into the audio
 * every `icy-metaint` bytes, carrying `StreamTitle='…'`. A browser cannot see
 * it — the `<audio>` element consumes the stream and exposes nothing — so the
 * server opens its own connection, reads exactly one metadata block, and
 * hands back the title.
 *
 * Measured against real Indian stations before building: of three Telugu
 * streams, two carried live song titles ("10 Tharuvathi panulella") and one
 * sent no metadata at all. HLS streams (.m3u8) never do. So the caller must
 * treat a missing title as normal rather than as a failure.
 */

import net from "node:net";
import tls from "node:tls";
import dns from "node:dns/promises";

// Sockets and TLS are Node APIs; this route cannot run on the edge runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONNECT_TIMEOUT = 7000;
/** One metadata block sits at most ~16KB in; past 96KB something is wrong. */
const MAX_BYTES = 96 * 1024;

/**
 * Refuse anything pointing inside the network this server sits on.
 *
 * The stream URL arrives from the client, so without this the endpoint would
 * happily fetch `http://169.254.169.254/` or a database on a private subnet
 * and report what it found. The hostname is resolved first, because a public
 * name can still answer with a private address.
 */
function isPrivateAddress(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      (a === 100 && b >= 64 && b <= 127)
    );
  }
  const lower = ip.toLowerCase();
  return (
    lower === "::1" ||
    lower === "::" ||
    lower.startsWith("fc") ||
    lower.startsWith("fd") ||
    lower.startsWith("fe80") ||
    lower.startsWith("::ffff:")
  );
}

async function assertPublicHost(hostname) {
  if (net.isIP(hostname) && isPrivateAddress(hostname)) return false;
  try {
    const records = await dns.lookup(hostname, { all: true });
    return records.length > 0 && !records.some((r) => isPrivateAddress(r.address));
  } catch {
    return false;
  }
}

/** Pull `StreamTitle` out of one metadata block, or null. */
function readTitle(raw) {
  const match = /StreamTitle='([^']*)'/.exec(raw);
  if (!match) return null;
  const title = match[1].trim();
  return title.length ? title.slice(0, 160) : null;
}

function fetchIcyTitle(url) {
  return new Promise((resolve) => {
    const target = new URL(url);
    const secure = target.protocol === "https:";
    const port = Number(target.port) || (secure ? 443 : 80);
    const path = `${target.pathname}${target.search}` || "/";

    let socket;
    let settled = false;
    let buffer = Buffer.alloc(0);
    let metaint = null;
    let headerDone = false;

    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      // Always destroy: this is a live stream and it never ends on its own.
      try { socket?.destroy(); } catch { /* already gone */ }
      resolve(value);
    };

    const timer = setTimeout(() => finish(null), CONNECT_TIMEOUT);

    const onConnect = () => {
      socket.write(
        `GET ${path} HTTP/1.0\r\n` +
        `Host: ${target.hostname}\r\n` +
        `Icy-MetaData: 1\r\n` +
        `User-Agent: SV-Radio/0.1\r\n` +
        `Connection: close\r\n\r\n`
      );
    };

    const onData = (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);
      if (buffer.length > MAX_BYTES) return finish(null);

      if (!headerDone) {
        const split = buffer.indexOf("\r\n\r\n");
        if (split === -1) return;
        const headers = buffer.subarray(0, split).toString("latin1");
        const found = /icy-metaint\s*:\s*(\d+)/i.exec(headers);
        // No metaint means the station sends no in-stream metadata. That is a
        // normal answer, not an error — plenty of stations never send it.
        if (!found) return finish(null);
        metaint = Number(found[1]);
        buffer = buffer.subarray(split + 4);
        headerDone = true;
      }

      // One length byte sits after `metaint` audio bytes; it counts 16-byte
      // units, and zero means "nothing changed since last time".
      if (buffer.length < metaint + 1) return;
      const blockLength = buffer[metaint] * 16;
      if (blockLength === 0) return finish(null);
      if (buffer.length < metaint + 1 + blockLength) return;

      const block = buffer
        .subarray(metaint + 1, metaint + 1 + blockLength)
        .toString("utf8")
        .replace(/\0+$/, "");
      finish(readTitle(block));
    };

    try {
      socket = secure
        ? tls.connect({ host: target.hostname, port, servername: target.hostname }, onConnect)
        : net.connect({ host: target.hostname, port }, onConnect);
      socket.setTimeout(CONNECT_TIMEOUT, () => finish(null));
      socket.on("data", onData);
      socket.on("error", () => finish(null));
      socket.on("end", () => finish(null));
      socket.on("close", () => finish(null));
    } catch {
      finish(null);
    }
  });
}

export async function GET(request) {
  const raw = request.nextUrl.searchParams.get("url");
  if (!raw) return Response.json({ title: null }, { status: 400 });

  let target;
  try {
    target = new URL(raw);
  } catch {
    return Response.json({ title: null }, { status: 400 });
  }

  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return Response.json({ title: null }, { status: 400 });
  }

  // HLS carries its metadata in the playlist, not inline, so there is nothing
  // here to read. Answering immediately saves opening a pointless connection.
  if (target.pathname.endsWith(".m3u8")) {
    return Response.json({ title: null, reason: "hls" });
  }

  if (!(await assertPublicHost(target.hostname))) {
    return Response.json({ title: null }, { status: 400 });
  }

  const title = await fetchIcyTitle(target.toString());

  return Response.json(
    { title },
    {
      // Short, but enough that several listeners on one station share a read
      // rather than each opening their own connection to it.
      headers: { "Cache-Control": "public, max-age=15" },
    }
  );
}
