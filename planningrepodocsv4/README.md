# All Events · Springboks v All Blacks 2026 · Baltimore

A fan-made **event aggregator** for **Springboks v All Blacks** at
**M&T Bank Stadium, Baltimore — Saturday, September 12, 2026, 5:00 PM ET**
(the fourth and final test of the "Rugby's Greatest Rivalry" series, and the
first time this fixture has ever been played on U.S. soil).

Meetup and event info is scattered across Reddit, Facebook groups, and
official listings. This site collects it in one place — refreshed daily —
and links every card back to its original source. **The site does not host
posts**: fans are pointed to Reddit and the Facebook groups to organize, and
what they post there gets featured here.

## Status: direction locked, mockup v2 approved for review

- **Design**: Mockup A v2 — light, tourism-site style modeled on
  visitbaltimore's event pages: illustrated image cards, date badges, and a
  prominent **"View Original"** button on every event.
  File: [`docs/mockups/mockup-a-matchday-hub.html`](docs/mockups/mockup-a-matchday-hub.html)
- **Site name**: *All Events · Springboks v All Blacks 2026 · Baltimore*
- **No on-site posting** (decided) — no forms, no accounts, no comments.
- **Group links**: the specific Facebook groups / Reddit threads will be
  added later; the site carries a visible "links coming soon" note until then.
- **Tickets**: purchase links (Ticketmaster) in the nav, matchday facts, and
  official-links section.
- Mockup B (`docs/mockups/mockup-b-community-board.html`) is **superseded**
  — kept only for reference.

## Key documents

- [`docs/PLANNING.md`](docs/PLANNING.md) — project brief: verified event
  facts, scraping feasibility findings, architecture, hosting options,
  remaining decisions, roadmap.
- [`docs/mockups/README.md`](docs/mockups/README.md) — mockup guide
  (what's real data vs. sample/illustration).

## Planned architecture

Static site with data refreshed on a schedule:

```
Reddit (r/rugbyunion, r/baltimore)      ─┐  scheduled job (cron)
Official listings watchlist              ─┼─▶ data/events.json ─▶ site rebuilds
Curated adds (owner pastes event links)  ─┘  several times a day
```

### Hosting (free, without exposing a personal GitHub URL)

The repo stays the engine (code + scheduled data refresh); the public URL
comes from a free static host connected to it:

| Option | Free URL example | Notes |
|---|---|---|
| **Cloudflare Pages** (recommended) | `springboksallblacks2026-baltimore.pages.dev` | Generous free tier; cron via Workers |
| **Netlify** | `springboksallblacks2026-baltimore.netlify.app` | Drag-drop or repo-connected; scheduled builds |
| **Vercel** | `springboksallblacks2026.vercel.app` | Free hobby tier; daily cron |
| GitHub org Pages | `springboksallblacks2026.github.io` | Make a free org so the URL isn't the personal username |

## Repository layout

```
README.md            ← you are here
docs/
  PLANNING.md        ← project brief, feasibility findings, decisions
  mockups/
    README.md        ← mockup guide (what's real data vs. sample)
    mockup-a-matchday-hub.html   ← CURRENT direction (v2)
    mockup-b-community-board.html ← superseded, reference only
```

---

*Unofficial, fan-made. Not affiliated with SA Rugby, New Zealand Rugby, the
Baltimore Ravens, M&T Bank Stadium, or the event organizers.*
