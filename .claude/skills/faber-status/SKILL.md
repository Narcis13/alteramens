---
name: faber-status
description: |
  Show Faber wiki dashboard — page counts, recent activity, top entities, maturity distribution,
  cross-link stats, temporal velocity, and log integrity. Quick overview of wiki health and size.
  Trigger on /faber-status or "wiki status", "faber dashboard", "how big is the wiki".
---

# Faber Status — Wiki Dashboard

You are reporting on the Faber wiki at `wiki/`. The DB has two layers:

1. **Knowledge graph** — `pages`, `key_claims`, `page_relations`, `prose_wikilinks`
2. **Temporal layer** — `log_events`, `log_event_pages` (parsed from `log.md`)

## Pre-check: Ensure DB is Current

```bash
python3 wiki/faber_sync.py
```

## Workflow

Run all dashboard queries in a single Bash call:

```bash
echo "=== DASHBOARD ===" && \
sqlite3 -header -column wiki/faber.db "SELECT * FROM v_dashboard;" && \
echo "" && \
echo "=== TOP ENTITIES ===" && \
sqlite3 -header -column wiki/faber.db "SELECT slug, title, connections FROM v_entity_connectivity LIMIT 5;" && \
echo "" && \
echo "=== MATURITY ===" && \
sqlite3 -header -column wiki/faber.db "SELECT * FROM v_maturity;" && \
echo "" && \
echo "=== CONFIDENCE ===" && \
sqlite3 -header -column wiki/faber.db "SELECT * FROM v_confidence;" && \
echo "" && \
echo "=== HEALTH ===" && \
sqlite3 wiki/faber.db "SELECT COUNT(*) || ' orphans' FROM v_orphans; SELECT COUNT(*) || ' phantoms' FROM v_phantoms; SELECT COUNT(*) || ' phantom log refs' FROM v_phantom_log_refs; SELECT COUNT(*) || ' log mismatches' FROM v_log_mismatches;" && \
echo "" && \
echo "=== RECENT ACTIVITY (last 10 events) ===" && \
sqlite3 -header -column wiki/faber.db "SELECT event_date, operation, substr(title,1,50) AS title, pages_created AS '+', pages_updated AS '~' FROM v_recent_activity LIMIT 10;" && \
echo "" && \
echo "=== RECENTLY TOUCHED PAGES (last 14d) ===" && \
sqlite3 -header -column wiki/faber.db "SELECT slug, type, times_touched AS hits, last_touched FROM v_recently_touched_pages WHERE julianday('now') - julianday(last_touched) <= 14 LIMIT 10;" && \
echo "" && \
echo "=== INGEST VELOCITY (per week) ===" && \
sqlite3 -header -column wiki/faber.db "SELECT week, operation, event_count, pages_created_total AS created FROM v_ingest_velocity LIMIT 10;" && \
echo "" && \
echo "=== DAILY ACTIVITY (last 14d) ===" && \
sqlite3 -header -column wiki/faber.db "SELECT * FROM v_daily_activity WHERE julianday('now') - julianday(event_date) <= 14;" && \
echo "" && \
echo "=== STALE CONCEPTS (>30d untouched) ===" && \
sqlite3 wiki/faber.db "SELECT COUNT(*) || ' stale concepts/entities' FROM v_stale_concepts;" && \
echo "" && \
echo "=== RECENT SYNCS ===" && \
sqlite3 -header -column wiki/faber.db "SELECT synced_at, pages_synced, log_events_synced, duration_ms FROM sync_log ORDER BY id DESC LIMIT 5;"
```

For cross-link stats:
```bash
sqlite3 wiki/faber.db "SELECT COUNT(*) || ' wiki→vault refs' FROM vault_refs;" && \
sqlite3 wiki/faber.db "SELECT COUNT(*) || ' vault→wiki wikilinks' FROM prose_wikilinks WHERE is_vault_link = 1;"
```

## Output Format

```
# Faber Status — YYYY-MM-DD

## Knowledge Graph
| Type | Count | Words |
|------|-------|-------|
| Sources | X | X |
| Entities | X | X |
| Concepts | X | X |
| Syntheses | X | X |
| **Total** | **X** | **X** |

## Top Entities
1. entity-name (X connections)

## Concept Maturity
- Seed: X | Developing: X | Mature: X | Challenged: X

## Health
- Orphans: X | Phantoms: X | Phantom log refs: X | Log mismatches: X
- Wiki → Vault: X refs | Vault → Wiki: X links

## Recent Activity (last 10 events)
- 2026-04-08 ingest — Title (+2 created, ~5 updated)
- ...

## Recently Touched Pages (last 14d)
1. [[slug]] — N× touched, last YYYY-MM-DD

## Ingest Velocity
- Week 2026-W14: 4 ingests, 25 pages created
- Week 2026-W13: 1 ingest, 12 pages created

## Sync History
- Last sync: YYYY-MM-DD HH:MM:SS — N pages, N events, N ms
```

## Rules
- Run `python3 wiki/faber_sync.py` first to ensure DB is current
- Use SQL queries exclusively — no file reads needed for the dashboard
- No modifications — this is read-only
- If `v_log_mismatches` has rows, surface them prominently — they indicate the log claims more pages created than actually exist (data integrity warning)
- If `v_phantom_log_refs` has rows, surface them — references to slugs that no longer exist
