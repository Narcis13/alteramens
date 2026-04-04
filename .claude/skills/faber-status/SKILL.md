---
name: faber-status
description: |
  Show Faber wiki dashboard — page counts, recent activity, top entities, maturity distribution,
  cross-link stats. Quick overview of wiki health and size. Trigger on /faber-status or
  "wiki status", "faber dashboard", "how big is the wiki".
---

# Faber Status — Wiki Dashboard

You are reporting on the Faber wiki at `wiki/`.

## Workflow

1. **Count pages** by type:
   - Glob `wiki/sources/*.md` → count
   - Glob `wiki/entities/*.md` → count
   - Glob `wiki/concepts/*.md` → count
   - Glob `wiki/syntheses/*.md` → count

2. **Recent activity** — Read `wiki/log.md`, show last 5 entries

3. **Top entities** — Read all entity pages, rank by number of sources (most connected first), show top 5

4. **Maturity distribution** — Read concept page frontmatter, count: seed / developing / mature / challenged

5. **Confidence distribution** — Count across all page types: high / medium / low

6. **Cross-link stats**:
   - Count wikilinks from wiki pages → vault docs (grep for `[[projects/`, `[[concepts/`, `[[ideas/` etc.)
   - Count wikilinks from vault docs → wiki pages (grep vault for `[[wiki/`)

## Output Format

```
# Faber Status — YYYY-MM-DD

| Type | Count |
|------|-------|
| Sources | X |
| Entities | X |
| Concepts | X |
| Syntheses | X |
| **Total** | **X** |

## Recent Activity
[Last 5 log entries]

## Top Entities
1. entity-name (X sources)
2. ...

## Concept Maturity
- Seed: X | Developing: X | Mature: X | Challenged: X

## Cross-Links
- Wiki → Vault: X links
- Vault → Wiki: X links
```

## Rules
- Keep it concise — this is a dashboard, not a report
- Run quickly — only read frontmatter, not full page content
- No modifications — this is read-only
