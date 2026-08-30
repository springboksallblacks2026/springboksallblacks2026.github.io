# springboksallblacks2026.github.io

**All Events · Springboks v All Blacks 2026 · Baltimore** — an unofficial,
fan-made event aggregator for the Rugby's Greatest Rivalry finale at
M&T Bank Stadium, Saturday September 12, 2026 (5:00 PM ET).

Live at: **https://springboksallblacks2026.github.io**

The site collects meetups, watch parties, and matchday info in one place.
It hosts nothing itself — every card links back to the original public
listing or thread.

## How the site works

```
index.html          the whole site (one page, no build step)
data/events.json    curated event cards  ← EDIT THIS to add/change events
data/reddit.json    latest Reddit threads ← written by the bot, don't edit
scripts/fetch_reddit.py        the Reddit puller
.github/workflows/refresh.yml  runs the puller 4x/day + commits changes
og.png              the preview image shown when the link is shared
```

GitHub Pages serves the site straight from the `main` branch. Every push —
yours or the refresh bot's — updates the live site within a minute or two.

## Add or edit an event (the common task)

1. Open `data/events.json` (on github.com just click the file → pencil icon).
2. Copy an existing block between `{ ... }`, paste it, and edit the fields.
   The `_comment` at the top of the file explains each field. Keep the comma
   rules of JSON in mind (a comma between blocks, none after the last one).
3. Commit. The live site updates itself a minute later.

Ground rules used for this site: public venues only, no ticket resale posts,
no personal contact info — link to the organizer's own public post instead.

## The automatic Reddit refresh

`refresh.yml` runs four times a day (and on demand: **Actions tab →
"Refresh event data" → Run workflow**). It searches r/rugbyunion and
r/baltimore for Baltimore-test threads and rewrites `data/reddit.json`.
If Reddit refuses the request, the script keeps the last good data and the
site is unaffected. It uses only GitHub's built-in token — no secrets, no
external accounts.

Note: scheduled workflows pause automatically if the repo has no activity
for 60 days — irrelevant before Sept 12, and after the match it can be
switched off by deleting `refresh.yml`.

## The visitor counter

The bottom of the page (just after the community section) shows "This site
has been visited N times". The line stays hidden until the count is at
least 1, so a brand-new or unreachable counter never shows a sad "0".

Two counting systems work together:

**A. Cloudflare Worker — the number on the page (counts everyone, ad
blockers included).** Blockers work by blocking *known analytics domains*;
this counter runs on your own `workers.dev` URL, which no blocklist has.
No cookies, no IPs stored — visitors are deduped per day via an anonymous
24-hour hash. One-time setup (~5 min, all in the browser): follow the
step-by-step DEPLOY comment at the top of
[`scripts/cloudflare-worker-counter.js`](scripts/cloudflare-worker-counter.js),
then paste the worker's URL into the `COUNTER_URL` line near the bottom of
`index.html` and push. Free-tier note: covers roughly 500 *new* visitors
per day; past that, counting pauses until the next day (UTC) — the site
itself is never affected.

**B. GoatCounter — the traffic dashboard (and display fallback).** Your
dashboard at `springboksallblacks2026.goatcounter.com` shows referrers
(how many visitors came from Facebook vs Reddit), pages, and countries —
but ad blockers block its script (`gc.zgo.at`), so it undercounts and its
numbers will run lower than the Worker's. That's expected. If the Worker
isn't set up or is unreachable, the page falls back to displaying
GoatCounter's total.
One-time setup:

1. Sign up at goatcounter.com with the site code
   **`springboksallblacks2026`** (the code must match the two
   `springboksallblacks2026.goatcounter.com` URLs near the bottom of
   `index.html` — if you pick a different code, update those two URLs).
2. In GoatCounter → Settings, make sure the **visitor counter** option
   ("allow adding a visitor counter to your website") is enabled.
3. Done. Counting starts from setup day (past visits can't be backfilled).
   The footer line stays hidden until a count loads, so nothing looks
   broken before setup. Your traffic dashboard — including how many
   visitors came from Facebook vs Reddit — lives at
   `https://springboksallblacks2026.goatcounter.com`.

## Manual updates worth knowing about

- **Series score**: after Test 3 (Sept 5), update the "SERIES BAR" cells in
  `index.html` — the block is marked with an HTML comment.
- **Facebook group links**: the site shows "links coming soon" — replace the
  Facebook search links in `index.html` with the real group URLs when ready.
- **After the match**: the countdown reaches zero gracefully; the hero copy
  can be swapped for a "thanks/recap" message.

---

*Unofficial, fan-made. Not affiliated with SA Rugby, New Zealand Rugby, the
Baltimore Ravens, M&T Bank Stadium, or the event organizers. Event details
change — always confirm on the original listing.*
