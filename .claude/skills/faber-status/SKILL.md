---
name: faber-status
description: |
  Show Faber wiki dashboard — page counts, recent activity, top entities, maturity distribution,
  cross-link stats. Quick overview of wiki health and size. Trigger on /faber-status or
  "wiki status", "faber dashboard", "how big is the wiki".
---

# Faber Status — Wiki Dashboard

You are reporting on the Faber wiki at `wiki/`.

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
echo "=== RECENT SYNCS ===" && \
sqlite3 -header -column wiki/faber.db "SELECT synced_at, pages_synced, relations_synced, wikilinks_synced, duration_ms FROM sync_log ORDER BY id DESC LIMIT 3;" && \
echo "" && \
echo "=== ORPHANS ===" && \
sqlite3 wiki/faber.db "SELECT COUNT(*) || ' orphan pages' FROM v_orphans;" && \
echo "" && \
echo "=== PHANTOMS ===" && \
sqlite3 wiki/faber.db "SELECT COUNT(*) || ' phantom links' FROM v_phantoms;"
```

Then read `wiki/log.md` (last 20 lines) for recent activity.

For cross-link stats:
```bash
sqlite3 wiki/faber.db "SELECT COUNT(*) || ' wiki→vault refs' FROM vault_refs;" && \
sqlite3 wiki/faber.db "SELECT COUNT(*) || ' vault→wiki wikilinks' FROM prose_wikilinks WHERE is_vault_link = 1;"
```

## Output Format

```
# Faber Status — YYYY-MM-DD

| Type | Count | Words |
|------|-------|-------|
| Sources | X | X |
| Entities | X | X |
| Concepts | X | X |
| Syntheses | X | X |
| **Total** | **X** | **X** |

## Top Entities
1. entity-name (X connections)
2. ...

## Concept Maturity
- Seed: X | Developing: X | Mature: X | Challenged: X

## Health
- Orphans: X | Phantoms: X
- Wiki → Vault: X refs | Vault → Wiki: X links

## Recent Activity
[Last 5 log entries]
```

## Rules
- Keep it concise — this is a dashboard, not a report
- Use SQL queries exclusively — no file reads needed for the dashboard
- No modifications — this is read-only
- Run faber-sync first to ensure data is current
