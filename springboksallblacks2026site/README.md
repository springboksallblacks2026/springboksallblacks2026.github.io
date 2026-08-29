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
