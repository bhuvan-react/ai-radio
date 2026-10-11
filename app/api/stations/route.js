/**
 * Station directory, proxied.
 *
 * Radio Browser is a free community API with no key. Calling it from the
 * browser directly would work most days, but proxying through here buys three
 * things worth having:
 *
 *   - no CORS surprises when a mirror is replaced
 *   - a User-Agent, which the project asks clients to send
 *   - caching, so flipping between tabs does not hammer a volunteer-run service
 *
 * Mirrors go down individually, so each request tries them in turn.
 */

import { findCollection } from "@/lib/collections";

const MIRRORS = [
  "https://de1.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
  "https://at1.api.radio-browser.info",
];

const UA = "AI-Radio/0.1 (https://github.com/swais)";

async function fetchFromAnyMirror(path, revalidate) {
  let lastError;
  for (const base of MIRRORS) {
    try {
      const res = await fetch(`${base}${path}`, {
        headers: { "User-Agent": UA },
        next: { revalidate },
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) return await res.json();
      lastError = new Error(`${base} returned ${res.status}`);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error("No mirror responded");
}

/** Strip the directory's 30-odd fields down to what the UI renders. */
function toStation(s) {
  return {
    id: s.stationuuid,
    name: s.name?.trim() || "Unknown station",
    url: s.url_resolved || s.url,
    favicon: s.favicon || null,
    country: s.country || "",
    countryCode: s.countrycode || "",
    language: s.language || "",
    tags: (s.tags || "").split(",").map((t) => t.trim()).filter(Boolean).slice(0, 3),
    bitrate: s.bitrate || 0,
    votes: s.votes || 0,
  };
}

/** Merge several directory queries into one deduplicated list. */
async function fetchCollection(collection, revalidate) {
  const results = await Promise.all(
    collection.queries.map(async (q) => {
      const search = new URLSearchParams({
        ...(q.params ?? {}),
        limit: "120",
        hidebroken: "true",
        order: "clickcount",
        reverse: "true",
      });
      try {
        return await fetchFromAnyMirror(`/json/stations/${q.path}?${search}`, revalidate);
      } catch {
        // One query failing should not empty the whole collection — a
        // Devotional list built from four searches is still useful on three.
        return [];
      }
    })
  );
  return results.flat();
}

export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const scope = params.get("scope") || "india";
  const query = (params.get("q") || "").trim();
  const collectionId = params.get("collection");
  const limit = Math.min(Number(params.get("limit")) || 100, 200);
  const offset = Math.max(Number(params.get("offset")) || 0, 0);

  // Collections merge several queries, so they cannot be paged by offset.
  // They are bounded anyway — the largest is a couple of hundred stations.
  if (collectionId) {
    const collection = findCollection(collectionId);
    if (!collection) {
      return Response.json({ stations: [], error: "Unknown collection" }, { status: 404 });
    }
    try {
      const raw = await fetchCollection(collection, 3600);
      const seen = new Set();
      const stations = raw
        .map(toStation)
        .filter((s) => s.url && s.url.startsWith("https://"))
        .filter((s) => !seen.has(s.id) && seen.add(s.id));
      return Response.json({ stations, offset: 0, hasMore: false });
    } catch (err) {
      return Response.json(
        { stations: [], error: err?.message ?? "Station directory unavailable" },
        { status: 502 }
      );
    }
  }

  const common =
    `limit=${limit}&offset=${offset}&hidebroken=true&order=clickcount&reverse=true`;

  let path;
  let revalidate;

  if (query) {
    // A search is per-visitor, so cache it only briefly.
    path = `/json/stations/search?name=${encodeURIComponent(query)}&${common}`;
    revalidate = 300;
  } else if (scope === "india") {
    path = `/json/stations/bycountrycodeexact/IN?${common}`;
    revalidate = 3600;
  } else {
    // "International" is everywhere except India — the India tab covers that,
    // and leaving it in would make the two tabs look nearly identical.
    // The generic search endpoint is used rather than topclick because it
    // takes an offset, and topclick returns one fixed block.
    path = `/json/stations/search?${common}`;
    revalidate = 3600;
  }

  try {
    const raw = await fetchFromAnyMirror(path, revalidate);

    // Plain-HTTP streams are dropped. The site is served over HTTPS, and a
    // browser blocks mixed content outright — so those stations can never
    // play once deployed, however healthy the directory thinks they are.
    // Roughly one in five, and offering a station that always fails is worse
    // than offering four fewer that work.
    const rawList = Array.isArray(raw) ? raw : [];

    let stations = rawList
      .map(toStation)
      .filter((s) => s.url && s.url.startsWith("https://"));

    if (!query && scope !== "india") {
      stations = stations.filter((s) => s.countryCode !== "IN");
    }

    // The directory happily returns the same station twice from different
    // mirrors, and a duplicated React key is a real bug rather than a cosmetic
    // one, so dedupe here instead of in the component.
    const seen = new Set();
    stations = stations.filter((s) => !seen.has(s.id) && seen.add(s.id));

    // Whether more pages exist is judged on what the directory returned, not
    // on what survived filtering. A page where most stations were HTTP-only
    // still means there is another page behind it.
    return Response.json({
      stations,
      offset,
      hasMore: rawList.length === limit,
    });
  } catch (err) {
    return Response.json(
      { stations: [], error: err?.message ?? "Station directory unavailable" },
      { status: 502 }
    );
  }
}
