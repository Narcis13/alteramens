---
name: faber-lint
description: |
  Health-check the Faber wiki. Scans for contradictions, orphan pages, stale content, missing
  cross-references, phantom links, thin pages, and data gaps. Produces an actionable report.
  Use when the user invokes /faber-lint or says "check wiki health", "lint the wiki", "wiki maintenance".
---

# Faber Lint — Wiki Health Check

You are auditing the Faber wiki at `wiki/`. Read `wiki/FABER.md` for conventions.

## Pre-check: Ensure DB is Current

```bash
python3 wiki/faber_sync.py
```

This rebuilds faber.db from all .md files and regenerates index.md. Fast and idempotent.

## Workflow

### Step 1: Structural Checks via SQL

Run all structural checks with a single Bash call:

```bash
echo "=== PHANTOMS ===" && sqlite3 wiki/faber.db "SELECT from_slug, target FROM v_phantoms;" && \
echo "=== ORPHANS ===" && sqlite3 wiki/faber.db "SELECT slug, type, title FROM v_orphans;" && \
echo "=== THIN PAGES ===" && sqlite3 wiki/faber.db "SELECT slug, type, title, source_count FROM v_thin_pages;" && \
echo "=== MATURITY ===" && sqlite3 wiki/faber.db "SELECT * FROM v_maturity;" && \
echo "=== CONFIDENCE ===" && sqlite3 wiki/faber.db "SELECT * FROM v_confidence;" && \
echo "=== DASHBOARD ===" && sqlite3 wiki/faber.db "SELECT * FROM v_dashboard;"
```

### Step 2: Content Checks (requires reading .md files)

Only read specific files flagged by Step 1, or for these checks:

**Contradictions** (severity: high)
```bash
sqlite3 wiki/faber.db "SELECT source_slug, claim FROM key_claims ORDER BY source_slug;"
```
Compare claims on overlapping topics. Flag direct conflicts.

**Missing links** (severity: medium)
```bash
# Find entity/concept names mentioned in prose but not wikilinked
sqlite3 wiki/faber.db "
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

**Stale content** (severity: low)
```bash
sqlite3 wiki/faber.db "
  SELECT p.slug, p.type, p.title, p.updated
  FROM pages p
  WHERE p.type IN ('entity','concept')
  AND p.updated < date('now', '-30 days')
  ORDER BY p.updated;
"
```

**Gaps** (severity: info)
- Look for recurring terms in prose that don't have dedicated pages
- Suggest new pages to create

### Step 3: Report

Present findings organized by severity:

```
## Faber Lint Report — YYYY-MM-DD

### High Severity
- Phantoms: [[links]] pointing to nonexistent pages
- Contradictions: conflicting claims across sources

### Medium Severity
- Orphans: pages with no inbound links
- Missing links: entity/concept names not wikilinked

### Low Severity
- Thin pages: entity/concept with only 1 source
- Stale content: not updated in >30 days

### Suggestions
- Gaps: important topics without pages
- Suggested sources: what to look for

### Summary
- Total pages: X (via v_dashboard)
- Issues found: X high, Y medium, Z low
- Suggestions: X
```

### Step 4: Log
Append to `wiki/log.md`:
```
## [YYYY-MM-DD] lint | Health Check
- Issues: X high, Y medium, Z low
- Suggestions: X
```

## Rules
- Use SQL queries first — only read .md files when prose analysis is needed
- Be thorough but actionable — every issue should have a clear fix
- Don't auto-fix anything — present the report and let Narcis decide what to address
- Group related issues together (e.g., all phantoms from the same page)
