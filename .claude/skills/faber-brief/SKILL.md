---
name: faber-brief
composition_level: atom
description: |
  Wake-up briefing for fresh sessions. Single SQL pass over faber.db that returns "what's been
  happening here lately" — recent events, top active pages, recent syntheses, open threads,
  wiki health summary. Designed for agents starting cold without context. Trigger on /faber-brief
  or "brief me", "session brief", "what's been happening", "ce am lucrat", "wake up faber".
---

# Faber Brief — Session Wake-Up

You are giving Narcis (or a fresh Claude session) a fast situational briefing on the Faber wiki
(located via `.faber.toml` auto-discovery). The goal: in under 30 seconds of reading, the
user/agent should know the current state of the wiki and what's been happening recently.

## Wiki Discovery

Resolve the wiki path before any bash block:

```bash
WIKI_ROOT=$(d="$PWD"; while [ "$d" != "/" ]; do
  [ -f "$d/wiki/.faber.toml" ] && { echo "$d/wiki"; break; }
  [ -f "$d/.faber.toml" ] && { echo "$d"; break; }
  d=$(dirname "$d")
done)
[ -z "$WIKI_ROOT" ] && { echo "Error: no .faber.toml found from $PWD" >&2; exit 1; }
```

All SQL below uses `"$WIKI_ROOT/faber.db"`.

This is the **antidote to "starting cold"**. Instead of reading 5 files to figure out where
things stand, one query gives instant context.

## Pre-check

```bash
test -f $WIKI_ROOT/faber.db || python3 "$WIKI_ROOT/faber_sync.py"
```

## Workflow

Run all briefing queries in a single Bash call:

```bash
echo "=== LAST 10 EVENTS ===" && \
sqlite3 -header -column $WIKI_ROOT/faber.db "
  SELECT event_date, operation, substr(title,1,55) AS title,
         pages_created AS '+', pages_updated AS '~'
  FROM v_recent_activity LIMIT 10;
" && \
echo "" && \
echo "=== HOT PAGES (last 14d, by touch frequency) ===" && \
sqlite3 -header -column $WIKI_ROOT/faber.db "
  SELECT slug, type, times_touched AS hits, last_touched
  FROM v_recently_touched_pages
  WHERE julianday('now') - julianday(last_touched) <= 14
  ORDER BY times_touched DESC, last_touched DESC
  LIMIT 8;
" && \
echo "" && \
echo "=== RECENT SYNTHESES (last 30d) ===" && \
sqlite3 -header -column $WIKI_ROOT/faber.db "
  SELECT slug, title, COALESCE(updated, created) AS dt
  FROM pages
  WHERE type = 'synthesis'
  ORDER BY dt DESC LIMIT 5;
" && \
echo "" && \
echo "=== OPEN THREADS (events with question, no follow-up synthesis) ===" && \
sqlite3 -header -column $WIKI_ROOT/faber.db "
  SELECT le.event_date, le.operation, substr(le.title,1,50) AS title
  FROM log_events le
  WHERE le.body LIKE '%open question%'
     OR le.body LIKE '%deferred%'
     OR le.body LIKE '%not yet%'
     OR le.body LIKE '%not ratified%'
  ORDER BY le.event_date DESC LIMIT 5;
" && \
echo "" && \
echo "=== HEALTH SNAPSHOT ===" && \
sqlite3 $WIKI_ROOT/faber.db "
  SELECT 'Total pages: ' || COUNT(*) FROM pages WHERE type != 'meta';
  SELECT 'Total log events: ' || COUNT(*) FROM log_events;
  SELECT 'Days since last activity: ' || CAST(julianday('now') - julianday(MAX(event_date)) AS INTEGER) FROM log_events;
  SELECT 'Concepts in seed maturity: ' || COUNT(*) FROM pages WHERE type='concept' AND maturity='seed';
  SELECT 'Stale concepts (30d+): ' || COUNT(*) FROM v_stale_concepts;
  SELECT 'Phantom log refs: ' || COUNT(*) FROM v_phantom_log_refs;
  SELECT 'Log mismatches: ' || COUNT(*) FROM v_log_mismatches;
" && \
echo "" && \
echo "=== TOP CONNECTED ENTITIES ===" && \
sqlite3 -header -column $WIKI_ROOT/faber.db "
  SELECT slug, title, connections FROM v_entity_connectivity LIMIT 5;
" && \
echo "" && \
echo "=== INGEST VELOCITY (last 4 weeks) ===" && \
sqlite3 -header -column $WIKI_ROOT/faber.db "
  SELECT week, SUM(event_count) AS events, SUM(pages_created_total) AS created
  FROM v_ingest_velocity
  GROUP BY week
  ORDER BY week DESC LIMIT 4;
"
```

## Output Format

Present a concise briefing in 2-language layout (Romanian for the human-facing summary,
English for technical labels — matches Narcis's collaboration conventions in CLAUDE.md):

```
# Faber Brief — YYYY-MM-DD

**Summary:** N pages, M log events, last activity X days ago.
Wiki health: [GREEN/YELLOW/RED based on mismatches+phantoms+stale count].

## Ce s-a întâmplat recent
- **2026-04-08** ingest — *AI Tutor Admitere* (+2 pages, ~5 updated)
- **2026-04-07** ingest — *Brainstorm AI Tutor Carol Davila* (+11 pages, ~4 updated)
- ...

## Pagini fierbinți (ultimele 14 zile)
1. [[carol-davila-umf]] — entity, 2× touched
2. [[brainstorm-ai-tutor-medicina]] — source, 2× touched
3. ...

## Sinteze recente
- [[ai-tutor-admitere-strategic-frame]] — synthesis (updated 2026-04-08)
- [[saas-launch-manifest]] — synthesis (created 2026-04-06)

## Fire deschise (open threads)
- 2026-04-08 ingest *AI Tutor Admitere* — "Portfolio-level question raised: ... deferred"
- 2026-04-08 ingest *AI Tutor Admitere* — "Brand proposal recorded: AIDIDACT, not yet ratified"

## Velocitate
- W14: N events, M pages created
- W13: N events, M pages created

## Top entități (conectivitate)
1. naval-ravikant (X connections)
2. ...

## Sănătate
- Concepts in seed: N | Stale concepts: N
- Mismatches: N | Phantom refs: N
```

## Rules

- **No file reads.** This is pure SQL. The whole briefing should be derivable from `faber.db`.
- **Be concise.** Maximum ~30 lines of output. The user is orienting, not reading a report.
- **Surface anomalies first** if `health` shows mismatches or phantom refs > 0.
- **Bilingual layout** is intentional — section headers in Romanian, slugs/data in English.
- **Open threads** detection is keyword-based (open question, deferred, not yet, not ratified).
  False positives are fine — better to over-surface unfinished work than to hide it.
- After briefing, if the user asks "what should I work on next?", DO NOT auto-decide. Surface
  3 candidates from open threads + stale concepts + recent syntheses, and let Narcis choose.
- If the wiki has zero log events (cold start), say so plainly and suggest `/faber-seed`.

## Why this exists

Per CLAUDE.md, Narcis has limited time (post-job, 15:00+) and uses AI as a productivity
multiplier. A fresh Claude session shouldn't burn 10 minutes of context window discovering
what was happening. `/faber-brief` is the agent-native version of "good morning, here's what
matters" — it makes the wiki self-aware about its own evolution.
