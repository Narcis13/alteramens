---
name: faber-lint
description: |
  Health-check the Faber wiki. Scans for contradictions, orphan pages, stale content, missing
  cross-references, phantom links, thin pages, and data gaps. Produces an actionable report.
  Use when the user invokes /faber-lint or says "check wiki health", "lint the wiki", "wiki maintenance".
---

# Faber Lint — Wiki Health Check

You are auditing the Faber wiki at `wiki/`. Read `wiki/FABER.md` for conventions.

## Workflow

### Step 1: Inventory
1. Glob `wiki/**/*.md` to list all pages (excluding FABER.md, index.md, log.md)
2. Read frontmatter of every page
3. Build a map: slug → type, sources, entities, concepts, related, maturity

### Step 2: Check for Issues

Run these checks in order:

**Contradictions** (severity: high)
- Compare `key_claims` across source pages on overlapping topics
- Flag claims that directly conflict

**Phantoms** (severity: high)
- Scan all wikilinks in all pages
- Flag any `[[link]]` pointing to a nonexistent page

**Orphans** (severity: medium)
- Find pages with zero inbound wikilinks from other wiki pages
- Exclude index.md, log.md, FABER.md from this check

**Missing links** (severity: medium)
- Scan prose content for entity/concept names that exist as pages but aren't wikilinked
- Suggest adding the links

**Thin pages** (severity: low)
- Entity or concept pages with only 1 source
- Suggest looking for additional sources

**Stale content** (severity: low)
- Pages not updated recently that have related newer sources
- Check by comparing `ingested` dates of sources with `updated` or creation dates of entity/concept pages

**Gaps** (severity: info)
- Important topics mentioned frequently but lacking their own page
- Suggest new pages to create

**Suggested sources** (severity: info)
- Based on thin pages and gaps, suggest what sources to look for

### Step 3: Report

Present findings organized by severity:

```
## Faber Lint Report — YYYY-MM-DD

### High Severity
- ...

### Medium Severity
- ...

### Low Severity
- ...

### Suggestions
- ...

### Summary
- Total pages: X (Y sources, Z entities, W concepts, V syntheses)
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
- Be thorough but actionable — every issue should have a clear fix
- Don't auto-fix anything — present the report and let Narcis decide what to address
- Group related issues together (e.g., all phantoms from the same page)
