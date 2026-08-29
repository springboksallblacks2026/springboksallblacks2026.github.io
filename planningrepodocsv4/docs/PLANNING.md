# Project Brief — Baltimore Fan Hub for Springboks v All Blacks

*Written 2026-08-29 (14 days before the match). This document records what
was verified, what's feasible, the recommended build, and the decisions
still open. It is the single source of truth for scope discussions.*

> **Decisions locked (2026-08-29, from Aimee):**
> 1. **Direction: Mockup A only**, restyled after visitbaltimore.org — light
>    tourism-site look, illustrated/photo event cards, prominent
>    **"View Original"** buttons. Mockup B is superseded.
> 2. **Site name:** *All Events · Springboks v All Blacks 2026 · Baltimore*.
> 3. **No on-site posting** — no form, no board, no accounts. The site is a
>    pure aggregator; fans are encouraged to post on Reddit / the Facebook
>    groups, which the site features and links back to.
> 4. **Specific FB group / Reddit thread links come later** — the site shows
>    a "links coming soon" note until Aimee supplies them; meanwhile generic
>    working links (r/rugbyunion, a Reddit search, an FB group search) stand in.
> 5. **Ticket purchase links included** (Ticketmaster; official pages).
> 6. **Hosting: free, and not under the personal GitHub URL** — see §4a.
>    → **Decided: GitHub org Pages.** Aimee creates a free org (target name
>    `springboksallblacks2026`) → site lives at
>    `https://springboksallblacks2026.github.io` from an org repo named
>    `springboksallblacks2026.github.io`. No GitHub user login holds that
>    name as of 2026-08-29 (org-name collision is confirmed at creation).

---

## 1. The event (verified facts, with sources)

| Fact | Detail | Source |
|---|---|---|
| Fixture | South Africa Springboks v New Zealand All Blacks | [MD Stadium Authority](https://mdstad.com/events/rugbys-greatest-rivalry-fourth-test-springboks-v-all-blacks-game-time-500pm) |
| Series | "Rugby's Greatest Rivalry" — Test 4 of 4, series finale, first time this fixture is played in the U.S. | [Ravens press release](https://www.baltimoreravens.com/news/mt-bank-stadium-rugby-springboks-all-blacks-tour-press-release), [ESPN](https://africa.espn.com/rugby/story/_/id/47696744/baltimore-host-springboks-all-blacks-greatest-rivalry-finale) |
| Date / time | Saturday Sept 12, 2026 · kickoff 5:00 PM ET | [MD Stadium Authority](https://mdstad.com/events/rugbys-greatest-rivalry-fourth-test-springboks-v-all-blacks-game-time-500pm) (note: some resale listings show other times — treat mdstad.com as authoritative) |
| Venue | M&T Bank Stadium, 1101 Russell St, Baltimore MD 21230 | [Stadium event page](https://www.mandtbankstadium.com/events/detail/rugbys-greatest-rivalry-springboks-vs-all-blacks) |
| Demand | Sellout expected; tickets sold in 48 of 50 states, 7,400+ international | [PressBox](https://pressboxonline.com/2026/08/11/baltimore-takes-center-stage-for-rugbys-greatest-rivalry/) |
| Series state | Test 1 (Aug 22, Ellis Park): NZ 33–16 · Test 2 (Aug 29, Cape Town): SA 33–26 — level 1–1 · Test 3: Sept 5, South Africa | [RugbyPass](https://www.rugbypass.com/news/springboks-all-blacks/), [The Citizen](https://www.citizen.co.za/sport/rugby/springboks-v-all-blacks-second-test-in-cape-town-live-updates/) |

### Real fan events already announced (seed content for launch)

| Event | When / where | Source |
|---|---|---|
| **Braai Army** supporters block (650 seats) + TailGOAT tailgate; "Commando" option for existing ticket holders | Sat Sept 12, outside M&T Bank Stadium | [braaiarmy.com](https://www.braaiarmy.com/springboks-all-blacks-baltimore-old-page) |
| **Gameday Firehouse** pregame | Sat Sept 12, 12:30–8:00 PM, 1202 Ridgely St (steps from stadium) | [Visit Baltimore](https://baltimore.org/event/all-blacks-vs-springboks-pregame-rugbys-greatest-rivalry/) |
| **UCT Alumni & Friends watch party** | Sat Sept 12, One Star Country Club, 38 E Cross St, Federal Hill | [UCT alumni](https://alumni.uct.ac.za/events/springboks-vs-all-black-rugby-watch-party-0) |

## 2. Audiences and their jobs

1. **Ticket holders flying/driving in** — "Where do fans gather before the
   game? How do I get to the stadium? What do I do Friday/Sunday?"
2. **Fans without tickets coming anyway** — "Where's the best watch party /
   pub atmosphere?"
3. **Organizers** (supporter groups, bars, individual fans) — "How do I get
   my event in front of traveling fans?"
4. **Locals** — "Who's coming and where can I join in?"

## 3. Feasibility: what can and cannot be scraped (tested 2026-08-29)

### Facebook — NO (permanent)
Group content sits behind login; scraping violates Meta's ToS; there is no
public API for group posts. **The workaround is human relay**: members of
the groups (starting with Aimee) submit the best posts via the site's form
with a link back to the original FB post. The site links out; it never
copies private content.

### Reddit — YES in production, NO from Claude's sandbox
- The `.json` suffix trick (`reddit.com/r/rugbyunion/search.json?q=...`)
  and Reddit's free registered API both work for low-volume daily pulls.
- **Tested from this Claude session:** blocked twice over — (1) the Claude
  Code environment's network egress policy denies reddit.com at the proxy
  (`CONNECT 403`), and (2) Reddit blocks Anthropic's crawler user-agent, so
  even Claude's hosted web search cannot be scoped to reddit.com.
- **In production this doesn't matter**: the scraper runs in GitHub Actions
  under the project's own identity, not Anthropic's. Plan:
  1. Primary: registered Reddit API app (free, "script" type) with OAuth —
     rate limit ~100 requests/min, we need ~4/day. Credentials live in
     GitHub Actions secrets.
  2. Fallback: plain `.json` endpoints with a descriptive User-Agent —
     works at low volume but datacenter IPs (Actions runners) get 403'd
     unpredictably, so it's the fallback, not the primary.
  3. Graceful failure: if a pull fails, keep last-good data and show its
     timestamp — the site never breaks because Reddit had a mood.
- Sources to pull: `r/rugbyunion` (primary, per Aimee), `r/baltimore` —
  search terms like `baltimore`, `M&T`, `springboks`, `all blacks`.
- To let Claude test Reddit pulls live in a future session: relax the
  environment's network policy in claude.ai/code → environment settings.

### Official/venue listings — YES (whitelist scrape or manual)
baltimore.org, mdstad.com, mandtbankstadium.com, braaiarmy.com are public
pages. Site **links out** to them (visitors are unaffected by any of the
above blocks); the daily job can check a small whitelist of pages for
changes (e.g., kickoff time, parking rules) and flag diffs for review
rather than auto-publishing.

## 4. Recommended architecture (v1)

**Static GitHub Pages site + scheduled GitHub Actions + Google Form intake.**
Free, no servers, no user accounts, nothing to get hacked, easy to hand off.

```
                 ┌────────────────────────────────────────────┐
                 │  GitHub Action (cron: every 3–6h + manual) │
                 └────────────────────────────────────────────┘
                    │             │                  │
        Reddit API/.json   Google Sheet CSV    (optional) listing
        r/rugbyunion,      (Form responses      pages watchlist
        r/baltimore         w/ "approved" col)
                    │             │                  │
                    └──────┬──────┴──────────────────┘
                           ▼
                data/events.json, data/posts.json, data/series.json
                           ▼
                 commit → GitHub Pages redeploys
                           ▼
        https://aimeeliang26.github.io/rugbys-greatest-rivalry-2026/
```

**Content intake (no on-site posting — decided):**
1. **Reddit auto-pull** as described in §3 (r/rugbyunion primary).
2. **Curated adds**: Aimee drops event/post links into `data/events.json`
   (or, later, a private Google Sheet only she edits) — this is how
   Facebook-group finds and official listings get on the site.
3. Every card links back to its original source; replies happen there.
   The site never hosts conversations or collects contact info.

### 4a. Hosting without the personal GitHub URL (free options)

The repo stays the engine (code + scheduled refresh); the public URL comes
from a free host connected to it — none of these expose the GitHub username:

- **Cloudflare Pages** (recommended): `springboksallblacks2026-baltimore.pages.dev`,
  very generous free tier, cron via a free Worker.
- **Netlify**: `springboksallblacks2026-baltimore.netlify.app`, free tier,
  scheduled builds/functions; also supports no-repo drag-and-drop deploys.
- **Vercel**: free hobby tier, `*.vercel.app`, daily cron on hobby.
- **GitHub org Pages**: create a free org (e.g. `springboksallblacks2026`)
  → `springboksallblacks2026.github.io` — still GitHub, but the personal
  username never appears in the URL.
- A custom domain (~$12/yr) can be layered on any of these later; decide
  before wide distribution so shared links don't break.

**Update cadence:** cron every 3–6 hours (Actions cron is fuzzy by up to
~15 min) + `workflow_dispatch` for on-demand refresh + optional "matchday
mode" (hourly) for Sept 11–12. "Daily" is the floor, not the ceiling.

### Options considered and deferred

| Option | Verdict |
|---|---|
| Google-account comments (Firebase/Supabase auth) | **Defer.** Days of work + moderation surface + privacy policy obligations; the form + link-back-to-thread pattern covers 90% of the value. Data lives in JSON, so this can be added later without rearchitecting. |
| Giscus/utterances comments (GitHub accounts) | **Defer.** 30-minute setup but rugby fans don't have GitHub accounts. |
| Embedding FB/Reddit posts | **No.** FB embeds show "log in to view" for group content; Reddit embeds are heavy/janky. Cards + outbound links win. |
| Live map (Leaflet + OpenStreetMap) | **Nice-to-have.** Works fine on GitHub Pages; blocked only inside artifact previews. Add if time allows. |

## 5. Moderation & safety policy (proposed)

- **Human review before publish** — nothing from the form goes live
  unmoderated. Expect ~5–10 min/day, more in the final week.
- **No ticket sales/resale posts** — big matches attract ticket scams;
  point people to official resale only.
- **No personal contact info on the site** — no phone numbers/emails;
  replies happen on the poster's linked FB/Reddit thread.
- **Public venues only** for listed meetups; "meet in public places" note
  in the footer.
- **Always link to the source** — the site restates minimal details and
  defers to the original post/venue, with visible "last updated" stamps.
- **Unofficial disclaimer** everywhere; no official logos or trademarks
  (team names in plain text are fine; the Springbok emblem, silver fern,
  Ravens/M&T marks are not ours to use).

## 6. Unknown unknowns (surfaced for Aimee)

1. **Facebook is relay-only** (see §3) — your group memberships are the
   moat; the site can't replace you.
2. **Reddit blocks Anthropic's crawler + this sandbox blocks Reddit** —
   production pulls are fine (§3); Claude reading Reddit live requires an
   environment network-policy change.
3. **"Live" posting doesn't exist on a static site** — form posts appear at
   the next scheduled rebuild (choose the cadence); instant posting needs a
   backend. Set expectations on the form's confirmation message.
4. **Moderation is a real daily job** — spam, scams, and enthusiastic
   humans. Budget for it or recruit a co-moderator from the FB groups.
5. **Trademark/impersonation line** — "unofficial fan hub" framing, no
   logos, no "official" wording. Also protects you from takedown drama.
6. **Ticket scams cluster around exactly this** — a no-resale policy is
   both safety and legal hygiene.
7. **In-app browsers** — most traffic will open inside the Facebook/Reddit
   apps' webviews. Mobile-first design, no popups, fast load, big tap
   targets (both mockups are built this way).
8. **The link preview decides your click-through** — OpenGraph title/image
   tags matter more than the site itself when you paste the link into a
   group. v1 ships with a proper share card.
9. **Facts drift** — gate times, parking, transit specials will be
   announced late. Drive them from one config file, stamp "last verified",
   and link official pages rather than restating everything.
10. **MARC/Light Rail weekend schedules** are a classic gotcha for DC-based
    fans — verify close to matchday before publishing transit advice.
11. **Analytics or you're flying blind** — a privacy-friendly counter
    (GoatCounter/Plausible, free) tells you whether FB or Reddit is driving
    traffic and which sections matter.
12. **Afterlife** — on Sept 13 the site can flip to a recap/photos/thanks
    page; the repo name is rivalry-specific, which is fine.
13. **Custom domain (optional)** — `*.github.io` URL is free and fine;
    a ~$12 domain looks better in group posts. Decide before distributing
    widely (changing URLs later burns shared links).
14. **An official fan fest may still be announced** — the organizers have
    run them in other host cities; the listings watchlist (§3) catches it.

## 7. Decisions

**Locked 2026-08-29** (see the banner at the top of this document):
direction = Mockup A restyled after visitbaltimore.org · site name =
*All Events · Springboks v All Blacks 2026 · Baltimore* · no on-site
posting/form · group links deferred with a "coming soon" note · ticket
links included · hosting must be free and not the personal GitHub URL.

**Still open:**
- [x] **Host**: decided — GitHub org Pages (`springboksallblacks2026.github.io`).
      Setup steps: (1) Aimee creates the free org on github.com;
      (2) creates public org repo `springboksallblacks2026.github.io`;
      (3) installs the Claude GitHub App on the org so Claude can push;
      (4) Claude pushes the site + daily-refresh Action, enables Pages.
- [ ] **FB groups / Reddit threads list**: send when ready; the site shows
      "links coming soon" until then.
- [ ] **Analytics**: yes/no to a privacy-friendly counter (GoatCounter).
- [ ] **Custom domain**: optional ~$12/yr on top of the free URL.

## 8. Roadmap (working backwards from Sept 12)

| When | Milestone |
|---|---|
| Aug 29–30 | Mockup review → direction locked ✅ (A, v4: light ground + night-match imagery) |
| Aug 29 | v1 production site BUILT ✅ (index.html + events.json + Reddit refresh Action + OG share card) — delivered as a push-ready package for the `springboksallblacks2026.github.io` org repo, since Claude has no push access |
| Sept 1–2 | Reddit auto-pull Action + Sheet ingest running on schedule |
| Sept 2+ | Distribute link in FB groups / Reddit; iterate on what people ask for |
| Sept 5 | Test 3 result → series tracker updates (automated) |
| Sept 11–12 | Matchday mode: hourly refresh, pinned matchday essentials |
| Sept 13+ | Recap page, photo links, thank-yous |

## 9. All sources

- [Maryland Stadium Authority — event listing (kickoff 5:00 PM)](https://mdstad.com/events/rugbys-greatest-rivalry-fourth-test-springboks-v-all-blacks-game-time-500pm)
- [Baltimore Ravens — press release](https://www.baltimoreravens.com/news/mt-bank-stadium-rugby-springboks-all-blacks-tour-press-release)
- [M&T Bank Stadium — event page](https://www.mandtbankstadium.com/events/detail/rugbys-greatest-rivalry-springboks-vs-all-blacks)
- [Visit Baltimore — match listing](https://baltimore.org/event/south-africa-springboks-vs-new-zealand-all-blacks-at-mt-bank-stadium/) · [pregame listing](https://baltimore.org/event/all-blacks-vs-springboks-pregame-rugbys-greatest-rivalry/)
- [Ticketmaster — tickets](https://www.ticketmaster.com/new-zealand-all-blacks-vs-springboks-baltimore-09-12-2026/event/Z7r9jZ1A7Osx9)
- [Braai Army — supporters block & tailgate](https://www.braaiarmy.com/springboks-all-blacks-baltimore-old-page)
- [UCT Alumni — watch party](https://alumni.uct.ac.za/events/springboks-vs-all-black-rugby-watch-party-0)
- [PressBox — demand stats](https://pressboxonline.com/2026/08/11/baltimore-takes-center-stage-for-rugbys-greatest-rivalry/)
- [ESPN — Baltimore hosts the finale](https://africa.espn.com/rugby/story/_/id/47696744/baltimore-host-springboks-all-blacks-greatest-rivalry-finale)
- [RugbyPass — Test 1 report](https://www.rugbypass.com/news/springboks-all-blacks/) · [The Citizen — Test 2 result](https://www.citizen.co.za/sport/rugby/springboks-v-all-blacks-second-test-in-cape-town-live-updates/)
