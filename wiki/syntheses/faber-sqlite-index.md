---
title: "Faber SQLite Index — Vision & Schema"
type: synthesis
trigger: insight
question: "Should Faber's structured knowledge be mirrored to SQLite for agent-optimized querying?"
sources_consulted: []
concepts_involved: [skill-era, encoded-judgment, leverage]
entities_involved: [alteramens]
created: 2026-04-05
updated: 2026-04-05
maturity: draft
---

# Faber SQLite Index — Vision & Schema

## The Verdict: YES

After analyzing every angle — the current wiki structure, the skill implementations, the data shapes, the relationship graph, how I (Claude Code) actually interact with the wiki, and where the bottlenecks are — the answer is clear: **a SQLite index layer makes Faber dramatically more capable as it scales.**

But the architecture must be right: **SQLite as a derived index, not a replacement.**

---

## The Problem Today

The current Faber wiki (27 pages, 4 types, 6 skills) works. But every structured operation requires the same expensive pattern:

```
Glob wiki/**/*.md → Read each file → Parse YAML frontmatter → Build in-memory graph → Query the graph
```

**What this costs in practice:**

| Operation | Tool calls today (27 pages) | At 100 pages | At 500 pages |
|-----------|----------------------------|--------------|--------------|
| Lint (full audit) | ~30 Reads + processing | ~105 Reads | ~505 Reads |
| Status (dashboard) | ~27 Reads (frontmatter only) | ~100 Reads | ~500 Reads |
| Query (find relevant pages) | 1 Read (index) + ~5 Reads | 1 + ~10 Reads | 1 + ~20 Reads |
| Ingest (check existing pages) | ~10 Reads | ~20 Reads | ~50 Reads |

Each Read consumes context window. At scale, a lint operation would eat the entire context just loading frontmatter.

**The deeper problem:** The wiki's frontmatter IS a relational database — it just doesn't know it. Sources reference entities and concepts. Entities reference other entities, concepts, and sources. Concepts reference concepts, sources, and entities. Syntheses reference all three. This is a **graph of typed relationships** stored as flat YAML arrays in disconnected files.

---

## The Architecture

```
┌──────────────────────────────────────────────────┐
│                 Source of Truth                    │
│            wiki/**/*.md (Markdown files)           │
│      Human-readable · Obsidian-compatible · Git    │
└──────────────────────┬───────────────────────────┘
                       │
                  faber-sync
                  (parse → populate)
                       │
                       ▼
┌──────────────────────────────────────────────────┐
│                 Derived Index                      │
│              wiki/faber.db (SQLite)                │
│      Agent-optimized · SQL queries · FTS5          │
│                                                    │
│    .gitignore'd — can always be rebuilt from .md   │
└──────────────────────────────────────────────────┘
```

**Rules:**
1. Files are ALWAYS the source of truth
2. The .db is derived — delete it, rebuild from files, same result
3. Ingest/Seed write .md files first, then sync to DB
4. Query/Lint/Status read from DB for structure, from .md for prose (when needed)
5. `faber.db` goes in `.gitignore`
6. A `faber-sync` skill rebuilds the DB from scratch (idempotent, fast)

This follows a well-established pattern: git itself has loose objects (files) + an index (binary). Obsidian has .md files + an internal metadata cache. The pattern works.

---

## What Becomes Trivial with SQL

### Lint — currently the most expensive operation

**Orphan detection** (pages with no inbound references):
```sql
SELECT p.slug, p.type FROM pages p
LEFT JOIN page_relations pr ON pr.to_slug = p.slug
WHERE pr.from_slug IS NULL
  AND p.type != 'meta';
```
Currently: read every page, parse every wikilink, build adjacency list, scan for zero in-degree nodes.

**Phantom links** (wikilinks to nonexistent pages):
```sql
SELECT pw.from_slug, pw.target FROM prose_wikilinks pw
LEFT JOIN pages p ON p.slug = pw.target
WHERE p.slug IS NULL;
```
Currently: grep every file for `[[...]]`, extract targets, check if files exist.

**Thin pages** (entities/concepts with only 1 source):
```sql
SELECT p.slug, p.title, COUNT(pr.from_slug) as source_count
FROM pages p
LEFT JOIN page_relations pr ON pr.to_slug = p.slug AND pr.relation_type = 'has_entity'
WHERE p.type IN ('entity', 'concept')
GROUP BY p.slug
HAVING source_count <= 1;
```

**Maturity distribution:**
```sql
SELECT maturity, COUNT(*) FROM pages
WHERE type = 'concept'
GROUP BY maturity;
```

### Query — currently limited to index.md scanning

**Find concepts related to a topic, ranked by connection density:**
```sql
SELECT p.slug, p.title, p.maturity, p.confidence,
       COUNT(DISTINCT pr.from_slug) as connection_count
FROM pages p
JOIN page_relations pr ON pr.to_slug = p.slug OR pr.from_slug = p.slug
WHERE p.type = 'concept'
  AND p.slug IN (
    SELECT to_slug FROM page_relations WHERE from_slug = 'skill-era'
    UNION
    SELECT from_slug FROM page_relations WHERE to_slug = 'skill-era'
  )
GROUP BY p.slug
ORDER BY connection_count DESC;
```

**Full-text search across all prose:**
```sql
SELECT slug, title, snippet(fts_content, 4, '**', '**', '...', 30)
FROM fts_content
WHERE fts_content MATCH 'leverage AND judgment'
ORDER BY rank;
```

**Cross-type traversal** (given an entity, find all concepts from its sources):
```sql
SELECT DISTINCT c.slug, c.title, c.maturity
FROM pages e
JOIN page_relations er ON er.from_slug = e.slug AND er.relation_type = 'has_source'
JOIN page_relations sr ON sr.from_slug = er.to_slug AND sr.relation_type = 'has_concept'
JOIN pages c ON c.slug = sr.to_slug
WHERE e.slug = 'naval-ravikant';
```

### Status — currently requires reading all frontmatter

**Full dashboard in one query:**
```sql
SELECT type,
       COUNT(*) as count,
       GROUP_CONCAT(CASE WHEN maturity IS NOT NULL THEN maturity END) as maturities
FROM pages
WHERE type != 'meta'
GROUP BY type;
```

### Ingest — smarter duplicate/update detection

**Check if an entity already exists (including aliases):**
```sql
SELECT p.slug, p.title FROM pages p
LEFT JOIN aliases a ON a.entity_slug = p.slug
WHERE p.slug = 'naval-ravikant'
   OR p.title LIKE '%Naval%'
   OR a.alias LIKE '%Naval%';
```

---

## What SQL Cannot Replace

- **The prose itself** — the reasoning, the narrative, the wisdom. SQL stores the skeleton; prose is the flesh.
- **Creative synthesis** — connecting ideas, finding non-obvious patterns. That's LLM work.
- **Obsidian rendering** — the .md files must exist and be well-formed for the vault to work.
- **Git history** — version control on the actual content, not on a binary blob.
- **Guided ingest** — the conversation with Narcis about emphasis and direction.

**The rule:** SQL handles WHERE/JOIN/GROUP BY. Prose handles WHY.

---

## Database Schema

```sql
-- ============================================================
-- FABER.DB — Derived index for the Faber wiki
-- Rebuild with: /faber-sync (parses all wiki/*.md files)
-- ============================================================

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- ============================================================
-- CORE: All wiki pages (single-table inheritance)
-- ============================================================

CREATE TABLE pages (
    slug            TEXT PRIMARY KEY,          -- filename without .md
    title           TEXT NOT NULL,
    type            TEXT NOT NULL              -- source | entity | concept | synthesis
                    CHECK(type IN ('source','entity','concept','synthesis','meta')),
    file_path       TEXT NOT NULL,             -- relative to wiki/

    -- Source fields
    format          TEXT,                      -- article | book | paper | transcript | ...
    origin          TEXT,                      -- vault | web | conversation | pdf
    source_ref      TEXT,                      -- vault path, URL, or conversation:YYYY-MM-DD
    ingested        TEXT,                      -- YYYY-MM-DD
    guided          INTEGER,                   -- 0 or 1

    -- Entity fields
    category        TEXT,                      -- person | company | tool | framework | ...
    first_seen      TEXT,                      -- source slug
    status          TEXT                       -- active | historical | deprecated
                    CHECK(status IS NULL OR status IN ('active','historical','deprecated')),

    -- Concept fields (category reused from entity)
    maturity        TEXT                       -- seed | developing | mature | challenged
                    CHECK(maturity IS NULL OR maturity IN ('seed','developing','mature','challenged')),

    -- Shared fields
    confidence      TEXT                       -- low | medium | high
                    CHECK(confidence IS NULL OR confidence IN ('low','medium','high')),

    -- Synthesis fields
    trigger_type    TEXT                       -- query | lint | insight | comparison
                    CHECK(trigger_type IS NULL OR trigger_type IN ('query','lint','insight','comparison')),
    question        TEXT,                      -- what prompted this synthesis

    -- Timestamps
    created         TEXT,                      -- YYYY-MM-DD
    updated         TEXT,                      -- YYYY-MM-DD

    -- Derived (computed during sync)
    prose           TEXT,                      -- full markdown body (below frontmatter)
    word_count      INTEGER,
    last_synced     TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- ARRAYS: One-to-many fields from frontmatter
-- ============================================================

-- Source key_claims
CREATE TABLE key_claims (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    source_slug     TEXT NOT NULL REFERENCES pages(slug) ON DELETE CASCADE,
    claim           TEXT NOT NULL,
    position        INTEGER NOT NULL DEFAULT 0  -- order in the array
);
CREATE INDEX idx_claims_source ON key_claims(source_slug);

-- Entity aliases
CREATE TABLE aliases (
    entity_slug     TEXT NOT NULL REFERENCES pages(slug) ON DELETE CASCADE,
    alias           TEXT NOT NULL,
    PRIMARY KEY (entity_slug, alias)
);
CREATE INDEX idx_aliases_alias ON aliases(alias);

-- Vault references (entity.vault_refs + concept.applications)
CREATE TABLE vault_refs (
    page_slug       TEXT NOT NULL REFERENCES pages(slug) ON DELETE CASCADE,
    vault_path      TEXT NOT NULL,
    ref_type        TEXT NOT NULL DEFAULT 'vault_ref',
                    -- vault_ref | application | source_ref
    PRIMARY KEY (page_slug, vault_path, ref_type)
);

-- ============================================================
-- RELATIONS: The relational heart — page-to-page connections
-- ============================================================

CREATE TABLE page_relations (
    from_slug       TEXT NOT NULL REFERENCES pages(slug) ON DELETE CASCADE,
    to_slug         TEXT NOT NULL,              -- may reference non-existent slug (phantom)
    relation_type   TEXT NOT NULL,
    /*
      Relation types (derived from frontmatter field):
      ─────────────────────────────────────────────────
      source.entities[]       → 'has_entity'
      source.concepts[]       → 'has_concept'
      entity.sources[]        → 'has_source'
      entity.related_entities → 'related_entity'
      entity.related_concepts → 'related_concept'
      concept.sources[]       → 'has_source'
      concept.entities[]      → 'has_entity'
      concept.related[]       → 'related_to'
      concept.contradictions  → 'contradicts'
      synthesis.sources_consulted  → 'consulted_source'
      synthesis.concepts_involved  → 'involves_concept'
      synthesis.entities_involved  → 'involves_entity'
    */
    PRIMARY KEY (from_slug, to_slug, relation_type)
);
CREATE INDEX idx_relations_to ON page_relations(to_slug);
CREATE INDEX idx_relations_type ON page_relations(relation_type);

-- ============================================================
-- PROSE WIKILINKS: All [[links]] found in body text
-- ============================================================

CREATE TABLE prose_wikilinks (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    from_slug       TEXT NOT NULL REFERENCES pages(slug) ON DELETE CASCADE,
    target          TEXT NOT NULL,              -- the wikilink target text
    display_text    TEXT,                       -- text after | in [[target|display]]
    is_vault_link   INTEGER NOT NULL DEFAULT 0  -- 1 if path contains /
);
CREATE INDEX idx_wikilinks_from ON prose_wikilinks(from_slug);
CREATE INDEX idx_wikilinks_target ON prose_wikilinks(target);

-- ============================================================
-- FULL-TEXT SEARCH: FTS5 for prose content
-- ============================================================

CREATE VIRTUAL TABLE fts_content USING fts5(
    slug UNINDEXED,     -- for joining back to pages
    title,              -- searchable
    type UNINDEXED,     -- for filtering in results
    category,           -- searchable
    prose,              -- the main searchable content
    tokenize='porter unicode61'
);

-- ============================================================
-- VIEWS: Prebuilt queries for common operations
-- ============================================================

-- Dashboard: page counts by type
CREATE VIEW v_dashboard AS
SELECT
    type,
    COUNT(*) as page_count,
    SUM(word_count) as total_words
FROM pages
WHERE type != 'meta'
GROUP BY type;

-- Concept maturity distribution
CREATE VIEW v_maturity AS
SELECT
    maturity,
    COUNT(*) as count,
    GROUP_CONCAT(slug, ', ') as slugs
FROM pages
WHERE type = 'concept' AND maturity IS NOT NULL
GROUP BY maturity;

-- Entity connectivity (ranked by total connections)
CREATE VIEW v_entity_connectivity AS
SELECT
    p.slug,
    p.title,
    COUNT(DISTINCT pr.to_slug) + COUNT(DISTINCT pr2.from_slug) as connections
FROM pages p
LEFT JOIN page_relations pr ON pr.from_slug = p.slug
LEFT JOIN page_relations pr2 ON pr2.to_slug = p.slug
WHERE p.type = 'entity'
GROUP BY p.slug
ORDER BY connections DESC;

-- Orphaned pages (no inbound relations from other wiki pages)
CREATE VIEW v_orphans AS
SELECT p.slug, p.type, p.title
FROM pages p
LEFT JOIN page_relations pr ON pr.to_slug = p.slug
LEFT JOIN prose_wikilinks pw ON pw.target = p.slug
WHERE pr.from_slug IS NULL
  AND pw.from_slug IS NULL
  AND p.type NOT IN ('meta');

-- Phantom links (wikilinks to nonexistent pages)
CREATE VIEW v_phantoms AS
SELECT DISTINCT pw.from_slug, pw.target
FROM prose_wikilinks pw
LEFT JOIN pages p ON p.slug = pw.target
WHERE p.slug IS NULL
  AND pw.is_vault_link = 0;

-- Thin pages (entity/concept with <= 1 source)
CREATE VIEW v_thin_pages AS
SELECT p.slug, p.type, p.title,
       COUNT(pr.from_slug) as source_count
FROM pages p
LEFT JOIN page_relations pr ON (
    pr.to_slug = p.slug AND pr.relation_type IN ('has_source','consulted_source')
) OR (
    pr.from_slug = p.slug AND pr.relation_type IN ('has_entity','has_concept')
)
WHERE p.type IN ('entity', 'concept')
GROUP BY p.slug
HAVING source_count <= 1;

-- Confidence distribution
CREATE VIEW v_confidence AS
SELECT
    confidence,
    type,
    COUNT(*) as count
FROM pages
WHERE confidence IS NOT NULL
GROUP BY confidence, type;

-- ============================================================
-- SYNC METADATA
-- ============================================================

CREATE TABLE sync_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    synced_at       TEXT DEFAULT (datetime('now')),
    pages_synced    INTEGER,
    relations_synced INTEGER,
    wikilinks_synced INTEGER,
    duration_ms     INTEGER
);
```

---

## Skill Integration — How Each Skill Changes

### `/faber-sync` (NEW)

The keystone operation. Parses all `wiki/**/*.md` files and populates `faber.db`.

**When to run:**
- After every ingest/seed (automatically, as the last step)
- On demand if the DB is missing or stale
- Idempotent: always drops and recreates all data (fast at wiki scale)

**Implementation:** A Python or shell script that:
1. Reads each .md file
2. Parses YAML frontmatter (with a simple parser — no heavy deps)
3. Extracts prose body
4. Extracts all `[[wikilinks]]` from prose via regex
5. INSERTs into all tables
6. Populates FTS5

### `/faber-lint` (enhanced)

**Before (current):**
```
1. Glob wiki/**/*.md          — list all files
2. Read every file             — parse frontmatter
3. Build in-memory graph       — in Claude's context window
4. Run checks                  — in Claude's reasoning
5. Report
```

**After (with SQLite):**
```
1. sqlite3 faber.db "SELECT * FROM v_orphans"
2. sqlite3 faber.db "SELECT * FROM v_phantoms"
3. sqlite3 faber.db "SELECT * FROM v_thin_pages"
4. sqlite3 faber.db "SELECT * FROM v_maturity WHERE maturity = 'seed'"
5. sqlite3 faber.db "SELECT * FROM v_confidence WHERE confidence = 'low'"
6. Report
```

**5 SQL queries instead of 30+ file reads.** Same results, fraction of the context.

### `/faber-query` (enhanced)

**Before:** Read index.md → guess which pages are relevant → read them.

**After:**
```sql
-- Step 1: FTS search for the question keywords
SELECT slug, title, snippet(fts_content, 4, '»', '«', '...', 40)
FROM fts_content WHERE fts_content MATCH 'leverage judgment'
ORDER BY rank LIMIT 10;

-- Step 2: Expand via relations
SELECT DISTINCT pr.to_slug FROM page_relations pr
WHERE pr.from_slug IN ('leverage', 'judgment');

-- Step 3: Read only the truly relevant .md files for prose synthesis
```

**Precision:** Find exactly the right pages, not just what happens to appear in the index.

### `/faber-status` (enhanced)

**Before:** 4 Globs + read all entity frontmatter + read all concept frontmatter + grep for links.

**After:**
```sql
SELECT * FROM v_dashboard;
SELECT * FROM v_maturity;
SELECT * FROM v_entity_connectivity LIMIT 5;
SELECT * FROM v_confidence;
SELECT COUNT(*) FROM vault_refs;
```

**One Bash call with piped queries. Done.**

### `/faber-ingest` (enhanced write path)

The creative work doesn't change — reading sources, discussing with Narcis, synthesizing. But the bookkeeping improves:

- **Duplicate detection:** Check aliases table before creating new entities
- **Relationship consistency:** After writing .md files, sync to DB, then run lint queries to catch any broken references immediately
- **Auto-sync:** Last step of ingest = `faber-sync` to keep DB current

---

## What This Unlocks (Future Capabilities)

### 1. Graph Queries
"Show me the shortest path between entity X and concept Y through shared sources."
```sql
-- Two hops: entity → source → concept
SELECT e.slug, s.slug, c.slug
FROM page_relations r1
JOIN page_relations r2 ON r1.to_slug = r2.from_slug
JOIN pages e ON e.slug = r1.from_slug AND e.type = 'entity'
JOIN pages s ON s.slug = r1.to_slug AND s.type = 'source'
JOIN pages c ON c.slug = r2.to_slug AND c.type = 'concept'
WHERE e.slug = ? AND c.slug = ?;
```

### 2. Knowledge Gaps Analysis
"What concepts have low confidence AND are referenced by high-confidence syntheses?"
→ These are the weak links in otherwise strong arguments.

### 3. Source Impact Scoring
"Which source introduced the most new entities and concepts?"
→ Tells you which sources had the highest knowledge density.

### 4. Temporal Analysis
"How has concept maturity evolved over time?" (using git history + ingested dates)

### 5. Export & Visualization
The DB can feed a D3 force graph, a network visualization, or any tool that reads SQLite.

---

## Implementation Estimate

| Step | Description | Complexity |
|------|-------------|------------|
| 1. Schema creation | Create `faber.db` with the schema above | Trivial |
| 2. Sync script | Python script to parse .md → populate DB | ~200 lines |
| 3. `/faber-sync` skill | Skill wrapper for the sync script | Simple |
| 4. Update `/faber-lint` | Replace file reads with SQL queries | Moderate |
| 5. Update `/faber-query` | Add FTS search, keep prose reading | Moderate |
| 6. Update `/faber-status` | Replace with SQL views | Simple |
| 7. Update `/faber-ingest` | Add auto-sync at end of ingest | Simple |

**Total:** A focused build session. The sync script is the only non-trivial piece.

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| DB gets out of sync with files | Sync is idempotent; rebuild anytime. Skills always sync after writes. |
| Binary .db in git | `.gitignore` it. It's derived data. |
| YAML parsing edge cases | Use a proper YAML parser (Python's `yaml` module). Test against all current pages. |
| Obsidian Dataview breaks | Dataview reads .md files, not the DB. No conflict. |
| Over-engineering for 27 pages | The DB is cheap to build. The investment pays off at 50+ pages, which is weeks away if ingestion continues. |

---

## Decision

This is not premature optimization. It's **infrastructure that compounds** — the exact philosophy Faber is built on. Every source ingested makes the wiki larger. Every query against a larger wiki becomes more expensive without an index. The SQLite layer makes Faber's knowledge retrieval scale with its knowledge accumulation.

> "An index is to a wiki what leverage is to effort."
