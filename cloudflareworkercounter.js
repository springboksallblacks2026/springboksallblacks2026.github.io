/**
 * Visitor counter for springboksallblacks2026.github.io
 * ------------------------------------------------------
 * Runs as a free Cloudflare Worker. Because it lives on YOUR worker URL
 * (not a known analytics domain), ad blockers don't block it — so it
 * counts everyone.
 *
 * Privacy: no cookies, no IP addresses stored. Each visitor is remembered
 * for 24h only as an anonymous SHA-256 hash (IP + browser + date), purely
 * so refreshes don't inflate the count. Same approach GoatCounter uses.
 *
 * Routes:
 *   POST /hit    -> count a visit (deduped: one per visitor per day)
 *   GET  /count  -> {"count": <total>}
 *
 * DEPLOY (one time, ~5 minutes, all in the browser):
 *   1. Sign up free at dash.cloudflare.com
 *   2. Workers & Pages -> Create -> Create Worker -> name it
 *      "bmore-rugby-counter" -> Deploy -> "Edit code" -> replace the
 *      hello-world code with THIS ENTIRE FILE -> Deploy.
 *   3. Storage & Databases -> KV -> Create namespace -> name "rugby-counts".
 *   4. Back on the worker: Settings -> Bindings -> Add -> KV namespace ->
 *      Variable name: COUNTS  (exactly that) -> select "rugby-counts" -> Save.
 *   5. Copy the worker's URL (https://bmore-rugby-counter.<yours>.workers.dev)
 *      and paste it into index.html where COUNTER_URL is defined. Push.
 *   6. Test: open <worker URL>/count in a browser -> {"count":0}. Visit the
 *      site (ad blocker on is fine) -> /count goes to 1.
 *
 * Free-tier notes: Cloudflare KV allows ~1,000 writes/day, which covers
 * roughly 500 NEW visitors/day. Beyond that the counter pauses until the
 * next day (UTC) — the site itself is never affected. Treat the number as
 * a floor, not accounting.
 */

const ALLOWED_ORIGIN = "https://springboksallblacks2026.github.io";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Cache-Control": "no-store",
  };
}

async function sha256hex(text) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text)
  );
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = corsHeaders();

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }

    // Current total, for the page to display.
    if (url.pathname === "/count") {
      const count = parseInt((await env.COUNTS.get("total")) || "0", 10);
      return new Response(JSON.stringify({ count }), {
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }

    // Record a visit.
    if (url.pathname === "/hit" && request.method === "POST") {
      const ua = request.headers.get("User-Agent") || "";
      // Link-preview fetchers and crawlers don't run the page's JS anyway,
      // but filter the obvious ones that might.
      if (/bot|crawl|spider|preview|monitor|lighthouse|headless/i.test(ua)) {
        return new Response(null, { status: 204, headers });
      }

      const ip = request.headers.get("CF-Connecting-IP") || "0";
      const day = new Date().toISOString().slice(0, 10);
      const visitorKey = "v:" + (await sha256hex(ip + "|" + ua + "|" + day));

      // Only count each visitor once per day; the hash expires after ~25h.
      if ((await env.COUNTS.get(visitorKey)) === null) {
        await env.COUNTS.put(visitorKey, "1", { expirationTtl: 90000 });
        const total = parseInt((await env.COUNTS.get("total")) || "0", 10) + 1;
        await env.COUNTS.put("total", String(total));
      }
      return new Response(null, { status: 204, headers });
    }

    return new Response("rugby visit counter · POST /hit · GET /count", {
      status: 200,
      headers,
    });
  },
};
