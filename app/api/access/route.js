/**
 * May this person in?
 *
 * The browser sends the credential Google handed it. This route proves the
 * credential is genuine, then asks the access sheet what to do with the person
 * behind it.
 *
 * Verification happens here rather than in the page for a simple reason: a
 * browser can decode an ID token but cannot prove it came from Google, so
 * anyone could claim any address they liked and land an approved row. Checking
 * it server-side means the email on the sheet is the email Google vouched for.
 *
 * The sheet's URL and secret live only in this process. Were they in the page,
 * anyone reading the source could write rows into the sheet directly.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Google verifies its own tokens here; no key handling on our side. */
const TOKENINFO = "https://oauth2.googleapis.com/tokeninfo?id_token=";

async function verifyWithGoogle(credential) {
  const res = await fetch(TOKENINFO + encodeURIComponent(credential), {
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!res.ok) return null;

  const claims = await res.json();

  // `aud` is the whole point of the check: a token minted for some other
  // application is perfectly valid and still must not be accepted here.
  if (claims.aud !== process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) return null;
  if (claims.iss !== "accounts.google.com" && claims.iss !== "https://accounts.google.com") return null;
  if (Number(claims.exp) * 1000 < Date.now()) return null;
  if (claims.email_verified !== "true" && claims.email_verified !== true) return null;
  if (!claims.email) return null;

  return {
    email: String(claims.email).toLowerCase(),
    name: claims.name || "",
    picture: claims.picture || "",
  };
}

async function askTheSheet(user) {
  const url = process.env.GOOGLE_SHEET_URL;
  const secret = process.env.GOOGLE_SHEET_SECRET;
  if (!url || !secret) return { status: "unconfigured" };

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, email: user.email, name: user.name }),
      // Apps Script answers a web app POST with a redirect to its own
      // googleusercontent host, so the redirect has to be followed.
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    if (!res.ok) return { status: "error" };
    const data = await res.json();
    return { status: data.status === "approved" ? "approved" : "pending" };
  } catch {
    // A sheet that cannot be reached must not let anyone in. Failing closed is
    // the only safe direction for an access check.
    return { status: "error" };
  }
}

export async function POST(request) {
  let credential;
  try {
    ({ credential } = await request.json());
  } catch {
    return Response.json({ status: "signed-out" }, { status: 400 });
  }

  if (!credential) return Response.json({ status: "signed-out" }, { status: 400 });

  const user = await verifyWithGoogle(credential);
  if (!user) return Response.json({ status: "signed-out" }, { status: 401 });

  const verdict = await askTheSheet(user);

  return Response.json(
    { ...verdict, email: user.email, name: user.name, picture: user.picture },
    { headers: { "Cache-Control": "no-store" } }
  );
}
