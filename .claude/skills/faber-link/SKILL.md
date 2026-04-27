---
name: faber-link
composition_level: molecule
description: |
  Cross-link tool for Faber wiki. Given a vault document, finds relevant wiki pages and suggests/creates
  wikilinks in both directions. Use when the user invokes /faber-link or says "link this to the wiki",
  "cross-reference with faber", "connect to wiki".
---

# Faber Link — Cross-Link Tool

You are creating cross-references between the Faber wiki and the rest of the Alteramens vault. Read `$WIKI_ROOT/FABER.md` for linking conventions if you need a refresher.

**Source of truth:** `$WIKI_ROOT/*.md` files. The `$WIKI_ROOT/faber.db` SQLite index is a derived view used here for fast discovery — you NEVER write to it directly. After applying link changes, suggest running `/faber-sync` to refresh the index.

## Wiki Discovery

Resolve wiki + vault paths before any bash block:

```bash
WIKI_ROOT=$(d="$PWD"; while [ "$d" != "/" ]; do
  [ -f "$d/wiki/.faber.toml" ] && { echo "$d/wiki"; break; }
  [ -f "$d/.faber.toml" ] && { echo "$d"; break; }
  d=$(dirname "$d")
done)
[ -z "$WIKI_ROOT" ] && { echo "Error: no .faber.toml found from $PWD" >&2; exit 1; }
VAULT_ROOT=$(dirname "$WIKI_ROOT")
```

Use `"$WIKI_ROOT/faber.db"` for SQL, `"$VAULT_ROOT/<path>"` for vault files.

## Input

Parse `$ARGUMENTS` for a vault file path. If no arguments, ask the user which file to cross-link.

## Workflow

### Step 1: Read & verify index

1. Read the specified vault document (frontmatter + full body).
2. Verify `$WIKI_ROOT/faber.db` exists. If missing or older than the most recent `wiki/**/*.md` mtime, warn the user it may be stale and suggest running `/faber-sync` first. Proceed only if the user accepts (or after sync).

```bash
# Existence + freshness check
test -f $WIKI_ROOT/faber.db && \
  echo "db_mtime=$(stat -f %m $WIKI_ROOT/faber.db) newest_md=$(find wiki -name '*.md' -type f -exec stat -f %m {} \; | sort -nr | head -1)"
```

### Step 2: Extract candidate terms from the vault doc

Build a list of candidate terms to look up. Sources to draw from:
- Frontmatter `title`, `tags`, `aliases`
- Capitalized multi-word phrases in the body (likely entity/concept names)
- Existing inline `[[...]]` targets (skip — already linked)
- Domain keywords that match the doc's tags

For each candidate, also generate slugified variants (lowercase, hyphenated) to match wiki slugs.

### Step 3: Query `faber.db` for matches

Use `sqlite3` (read-only) to find candidate wiki pages. The DB is at `$WIKI_ROOT/faber.db`.

**Query A — Exact title / slug match:**
```bash
sqlite3 -readonly $WIKI_ROOT/faber.db <<'SQL'
.mode column
.headers on
SELECT slug, type, title, category, maturity
FROM pages
WHERE type IN ('source','entity','concept','synthesis')
  AND (
    LOWER(title) LIKE '%KEYWORD%'
    OR slug LIKE '%KEYWORD%'
  );
SQL
```

**Query B — Alias match (entities often have aliases):**
```sql
SELECT a.entity_slug, a.alias, p.title, p.type
FROM aliases a JOIN pages p ON p.slug = a.entity_slug
WHERE LOWER(a.alias) LIKE '%KEYWORD%';
```

**Query C — Full-text relevance ranking via FTS5:**
```sql
SELECT slug, type, title, snippet(fts_content, 4, '<<', '>>', '...', 20) AS snip
FROM fts_content
WHERE fts_content MATCH 'KEYWORD1 OR KEYWORD2 OR "multi word phrase"'
ORDER BY rank
LIMIT 15;
```

FTS5 supports: `AND`, `OR`, `NOT`, prefix `term*`, phrases `"exact phrase"`, column filters `title:term`. Use Romanian and English variants when both apply.

**Query D — Avoid noise via word_count / maturity (optional filter):**
```sql
-- Prefer mature concepts over seed/draft
SELECT slug, title FROM pages
WHERE type = 'concept' AND maturity IN ('developing','mature')
  AND slug IN (...candidates from FTS...);
```

**Query E — Reverse: does this vault doc already have backlinks?**
```sql
SELECT page_slug, ref_type
FROM vault_refs
WHERE vault_path = 'workshop/drafts/ai-learning-platform.md';
```
Use this to skip wiki pages that already reference the doc.

Combine results and rank: exact title > alias > high-rank FTS hit. Demote passing mentions.

### Step 4: Determine ref_type for each wiki target

When proposing wiki → vault references, the **frontmatter field name depends on page type**:

| Wiki page type | Frontmatter field | DB `ref_type` |
|----------------|-------------------|---------------|
| `source`       | `vault_refs:`     | `vault_ref`   |
| `entity`       | `vault_refs:`     | `vault_ref`   |
| `concept`      | `applications:`   | `application` |
| `synthesis`    | `vault_refs:`     | `vault_ref`   |

This is critical — putting a vault path under the wrong field will break `faber-sync` parsing or land in the wrong table.

### Step 5: Propose links

Present two lists. Be specific about line numbers and quote the matching text.

**Vault → Wiki links to add:**
```
In workshop/drafts/ai-learning-platform.md, line 32 ("Ipoteze de validat"):
  → Add inline note: > Aplicare: [[wiki/concepts/validate-before-build|Validate Before Build]]
  → Match basis: FTS rank 0.92, title match + 4 hypothesis-driven sections
```

**Wiki → Vault references to add:**
```
In wiki/concepts/validate-before-build.md, frontmatter `applications:` (concept page):
  → Add: "workshop/drafts/ai-learning-platform.md"
  → Reason: vault doc is structured around 3 validation hypotheses + customer interview plan
```

Link conservatively. Quality > quantity. Skip:
- Passing mentions (one-word reference with no surrounding context)
- Pages with `maturity: seed` or `confidence: low` unless it's an unusually strong match
- Pages already linked (check inline `[[...]]` and `vault_refs` table)

### Step 6: Apply (with approval)

Ask: "Should I add these cross-links?"
- **Yes:** Edit both vault and wiki `.md` files. Use the correct frontmatter field per Step 4.
- **Partial:** Let user pick a subset.
- **No:** Stop.

**Never write to `faber.db` directly.** Only edit `.md` files.

### Step 7: Log + suggest re-sync

If links were added, append to `wiki/log.md`:
```
## [YYYY-MM-DD] link | {Vault File}
- Added X vault→wiki links: slug1, slug2, ...
- Added X wiki→vault references: slug3.applications, slug4.vault_refs, ...
```

Then remind the user: "Run `/faber-sync` to refresh `faber.db` with the new links."

## Rules

- **Index, don't index from scratch.** Always query `faber.db` first. Only fall back to filesystem walking if the DB is missing AND the user declines to run `/faber-sync`.
- Never modify vault files without user approval.
- Never write to `faber.db` directly — it is regenerated from `.md` files by `faber-sync`.
- Use the correct frontmatter field per page type (`vault_refs` vs `applications`) — see Step 4.
- Don't over-link — only add links where the reference is substantive, not passing mentions.
- Use display text in wikilinks for clarity: `[[wiki/concepts/leverage|leverage]]`.
- Check existing `vault_refs` (Query E) before proposing wiki→vault refs to avoid duplicates.
