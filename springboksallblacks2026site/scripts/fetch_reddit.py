#!/usr/bin/env python3
"""Pull recent Baltimore-test threads from Reddit into data/reddit.json.

Runs inside GitHub Actions on a schedule (see .github/workflows/refresh.yml).
Uses Reddit's public .json endpoints with a descriptive User-Agent — no API
key needed at this volume (a handful of requests per day).

Failure policy: if every fetch fails (Reddit sometimes 403s datacenter IPs),
the script exits 0 WITHOUT touching data/reddit.json, so the site keeps the
last good data and never breaks because Reddit had a mood.
"""

import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

USER_AGENT = (
    "web:springboksallblacks2026.github.io:1.0 "
    "(fan event aggregator for the Sept 12 2026 Baltimore test; "
    "contact via GitHub issues on springboksallblacks2026)"
)

# (subreddit, search query) pairs to pull, newest first.
QUERIES = [
    ("rugbyunion", "baltimore"),
    ("baltimore", 'rugby OR springboks OR "all blacks"'),
]

# A post's title must contain at least one of these (case-insensitive)
# to make the list — keeps r/baltimore noise (e.g. school rugby) low
# while staying generous.
KEYWORDS = ("baltimore", "springbok", "all black", "rugby", "m&t")

MAX_POSTS = 12          # newest N shown on the site
MAX_AGE_DAYS = 90       # ignore anything older
OUT_PATH = "data/reddit.json"


def fetch_json(url: str):
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.load(resp)


def main() -> int:
    posts = []
    seen_ids = set()
    any_success = False
    now = time.time()

    for subreddit, query in QUERIES:
        url = (
            f"https://www.reddit.com/r/{subreddit}/search.json?"
            f"q={urllib.parse.quote(query)}&restrict_sr=on&sort=new&limit=25"
        )
        try:
            data = fetch_json(url)
            any_success = True
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError) as exc:
            print(f"warn: fetch failed for r/{subreddit}: {exc}", file=sys.stderr)
            continue

        for child in data.get("data", {}).get("children", []):
            p = child.get("data", {})
            pid = p.get("id")
            title = p.get("title") or ""
            created = p.get("created_utc") or 0
            permalink = p.get("permalink") or ""

            if not pid or pid in seen_ids or not permalink:
                continue
            if now - created > MAX_AGE_DAYS * 86400:
                continue
            if not any(k in title.lower() for k in KEYWORDS):
                continue

            seen_ids.add(pid)
            posts.append(
                {
                    "title": title,
                    "url": "https://www.reddit.com" + permalink,
                    "subreddit": p.get("subreddit") or subreddit,
                    "created_utc": int(created),
                    "num_comments": int(p.get("num_comments") or 0),
                    "score": int(p.get("score") or 0),
                }
            )
        # Be polite between requests.
        time.sleep(2)

    if not any_success:
        print("warn: all fetches failed; keeping last good data", file=sys.stderr)
        return 0

    posts.sort(key=lambda p: p["created_utc"], reverse=True)
    out = {
        "updated": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "posts": posts[:MAX_POSTS],
    }
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"ok: wrote {len(out['posts'])} posts to {OUT_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
