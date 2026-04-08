---
name: faber-lint
description: |
  Health-check the Faber wiki. Scans for contradictions, orphan pages, stale content, missing
  cross-references, phantom links, thin pages, log integrity issues, and data gaps.
  Produces an actionable report. Use when the user invokes /faber-lint or says
  "check wiki health", "lint the wiki", "wiki maintenance".
---

# Faber Lint — Wiki Health Check

You are auditing the Faber wiki located via `.faber.toml` auto-discovery. Read `$WIKI_ROOT/FABER.md` for conventions.

## Wiki Discovery

Resolve the wiki path at the start of every bash block (fresh subshell per tool call):

```bash
WIKI_ROOT=$(d="$PWD"; while [ "$d" != "/" ]; do
  [ -f "$d/wiki/.faber.toml" ] && { echo "$d/wiki"; break; }
  [ -f "$d/.faber.toml" ] && { echo "$d"; break; }
  d=$(dirname "$d")
done)
[ -z "$WIKI_ROOT" ] && { echo "Error: no .faber.toml found from $PWD" >&2; exit 1; }
```

All SQL and sync commands below use `"$WIKI_ROOT/faber.db"` and `python3 "$WIKI_ROOT/faber_sync.py"`.

The DB has two layers — both must be checked:
1. **Knowledge graph** — orphans, phantoms, thin pages, contradictions
2. **Temporal layer** — log integrity, log phantom refs, stale concepts (via log activity)

## Pre-check: Ensure DB is Current

```bash
python3 "$WIKI_ROOT/faber_sync.py"
```

This rebuilds `faber.db` from all `.md` files and parses `log.md` into structured events. Idempotent.

## Workflow

### Step 1: Structural Checks via SQL

```bash
echo "=== PHANTOMS (broken wikilinks) ===" && \
sqlite3 $WIKI_ROOT/faber.db "SELECT from_slug, target FROM v_phantoms;" && \
echo "" && \
echo "=== ORPHANS (no inbound links) ===" && \
sqlite3 $WIKI_ROOT/faber.db "SELECT slug, type, title FROM v_orphans;" && \
echo "" && \
echo "=== THIN PAGES (≤1 source) ===" && \
sqlite3 $WIKI_ROOT/faber.db "SELECT slug, type, title, source_count FROM v_thin_pages;" && \
echo "" && \
echo "=== MATURITY ===" && \
sqlite3 $WIKI_ROOT/faber.db "SELECT * FROM v_maturity;" && \
echo "" && \
echo "=== CONFIDENCE ===" && \
sqlite3 $WIKI_ROOT/faber.db "SELECT * FROM v_confidence;" && \
echo "" && \
echo "=== DASHBOARD ===" && \
sqlite3 $WIKI_ROOT/faber.db "SELECT * FROM v_dashboard;"
```

### Step 2: Temporal Layer Checks (NEW)

```bash
echo "=== LOG INTEGRITY MISMATCHES ===" && \
sqlite3 -header -column $WIKI_ROOT/faber.db "
  SELECT id, event_date, substr(title,1,40) AS title,
         claimed_sources_created AS c_src,  actual_sources_created AS a_src,
         claimed_entities_created AS c_ent, actual_entities_created AS a_ent,
         claimed_concepts_created AS c_con, actual_concepts_created AS a_con
  FROM v_log_mismatches;
" && \
echo "" && \
echo "=== PHANTOM LOG REFS (slugs in log but not in pages) ===" && \
sqlite3 -header -column $WIKI_ROOT/faber.db "SELECT * FROM v_phantom_log_refs;" && \
echo "" && \
echo "=== STALE CONCEPTS (no log touch in 30+ days) ===" && \
sqlite3 -header -column $WIKI_ROOT/faber.db "
  SELECT slug, type, maturity,
         COALESCE(last_touched, 'never') AS last_touched,
         COALESCE(days_since_touch, 999) AS days
  FROM v_stale_concepts
  ORDER BY days DESC;
" && \
echo "" && \
echo "=== ORPHANED LOG EVENTS (events with no junction rows) ===" && \
sqlite3 -header -column $WIKI_ROOT/faber.db "
  SELECT le.id, le.event_date, le.operation, le.title
  FROM log_events le
  WHERE le.touched_page_count = 0
    AND le.operation IN ('ingest','seed');
"
```

### Step 3: Content Checks

**Contradictions** (severity: high)
```bash
sqlite3 $WIKI_ROOT/faber.db "SELECT source_slug, claim FROM key_claims ORDER BY source_slug;"
```
Compare claims on overlapping topics. Flag direct conflicts.

For automated scanning, use FTS on claims:
```bash
sqlite3 $WIKI_ROOT/faber.db "
  SELECT source_slug, snippet(fts_claims, 1, '»', '«', '...', 40)
  FROM fts_claims
  WHERE fts_claims MATCH 'keyword';
"
```

**Missing links** (severity: medium)
```bash
sqlite3 $WIKI_ROOT/faber.db "
  SELECT p.slug, p.title FROM pages p
  WHERE p.type IN ('entity','concept')
  AND EXISTS (
    SELECT 1 FROM pages p2
    WHERE p2.prose LIKE '%' || p.title || '%'
    AND p2.slug != p.slug
    AND NOT EXISTS (
      SELECT 1 FROM prose_wikilinks pw
      WHERE pw.from_slug = p2.slug AND pw.target = p.slug
    )
  );
"
```

**Backlink-poor pages** (severity: low)
```bash
sqlite3 $WIKI_ROOT/faber.db "
  SELECT p.slug, p.type, COALESCE(b.backlink_count, 0) AS backlinks
  FROM pages p
  LEFT JOIN v_backlinks b ON b.slug = p.slug
  WHERE p.type IN ('entity','concept')
  ORDER BY backlinks ASC LIMIT 10;
"
```

### Step 4: Report

Present findings organized by severity:

```
## Faber Lint Report — YYYY-MM-DD

### High Severity
- Phantoms: [[X]] broken wikilinks
- Log mismatches: N events where totals claim more pages created than actual
- Phantom log refs: N slugs referenced in log.md but missing from pages
- Contradictions: conflicting claims across sources

### Medium Severity
- Orphans: N pages with no inbound links
- Missing links: entity/concept names not wikilinked
- Orphaned ingest events: ingest entries with no parsed page refs

### Low Severity
- Thin pages: entity/concept with only 1 source
- Stale concepts: not touched by any log event in 30+ days
- Backlink-poor pages: top 10 with fewest inbound links

### Suggestions
- Gaps: important topics without dedicated pages
- Suggested sources: what to look for

### Summary
- Total pages: X | Total log events: X
- Issues found: X high, Y medium, Z low
- Suggestions: X
```

### Step 5: Log

Append to `wiki/log.md`:
```
## [YYYY-MM-DD] lint | Health Check
- Issues: X high, Y medium, Z low
- Suggestions: X
```

## Rules
- Use SQL queries first — only read `.md` files when prose analysis is needed
- Be thorough but actionable — every issue should have a clear fix
- Don't auto-fix anything — present the report and let Narcis decide
- **Surface log mismatches and phantom log refs prominently** — these indicate the log narrative has drifted from reality
- Group related issues together (e.g., all phantoms from the same page)
- After lint, run `python3 "$WIKI_ROOT/faber_sync.py"` so the new lint entry in log.md is indexed
