---
title: "Faber — The Builder's Codex"
type: meta
version: "1.0"
created: 2026-04-04
---

# Faber — The Builder's Codex

Faber is a self-contained, portable knowledge library maintained by Claude Code. It can live next to a workspace vault (the current Alteramens setup) or stand alone. The library is declared by `wiki/.faber.toml`, which tells skills where to find surrounding vault roles — but the library itself owns no content outside `wiki/`.

**Faber** = Latin for "craftsman, builder, maker." Homo faber — man the maker.

**The pattern:** Instead of re-deriving knowledge from scratch on every question (like RAG), Claude incrementally builds and maintains a structured wiki. Knowledge is compiled once and kept current. Cross-references are already there. Contradictions are already flagged. The synthesis already reflects everything ingested.

**Roles:**
- **Narcis** curates sources, directs analysis, asks questions, decides what matters
- **Claude** does everything else — summarizing, cross-referencing, filing, maintaining consistency

## Architecture

```
SCHEMA (this file)       →  Conventions, formats, workflows
MARKER (.faber.toml)     →  Declares this directory as a Faber library, configures paths
WIKI (wiki/)             →  LLM-written pages: sources, entities, concepts, syntheses
SQLITE (faber.db)        →  Derived index for agent-optimized querying (rebuild anytime)
SURROUNDING VAULT        →  inbox/, workshop/, projects/, archive/ (resolved via .faber.toml)
```

Claude reads surrounding vault content but never modifies the raw `inbox/`. Claude owns the wiki layer entirely. Skills auto-discover the wiki by walking up from `cwd` until they find a `.faber.toml`.

**Key rule:** `.md` files are ALWAYS the source of truth. `faber.db` is derived — delete it, run `python3 wiki/faber_sync.py`, same result. The DB goes in `.gitignore`.

## Directory Structure

```
alteramens/                  # workspace root (one possible host for Faber)
├── inbox/                   # surrounding vault — raw material
│   └── clippings/
├── workshop/                # surrounding vault — drafts, ideas, experiments
│   ├── drafts/
│   ├── ideas/
│   ├── experiments/
│   └── notes/
├── projects/                # surrounding vault — applied work
├── archive/                 # surrounding vault — parked work
├── slides/                  # surrounding vault — generated HTML decks
└── wiki/                    # ← The Faber library (self-contained)
    ├── .faber.toml          # Marker + config (vault_root, slides_output, ...)
    ├── FABER.md             # This file — schema & conventions
    ├── faber_sync.py        # Python script to rebuild faber.db from .md files
    ├── faber.db             # SQLite index (derived, .gitignored)
    ├── index.md             # Auto-generated dashboard (by faber_sync.py)
    ├── log.md               # Chronological operations log (append-only)
    ├── sources/             # Summaries of ingested material
    ├── entities/            # People, companies, tools, frameworks
    ├── concepts/            # Patterns, models, mental frameworks
    ├── syntheses/           # Cross-cutting analyses & filed queries
    └── assets/              # Images organized by source slug
        └── {source-slug}/
```

## Page Types

### Source (`wiki/sources/`)
Summary of an ingested source. Links to extracted entities and concepts.

Frontmatter:
```yaml
---
title: ""
type: source
format: article  # article | book | paper | transcript | interview | thread | regulation | code | gist
origin: vault  # vault | web | conversation | pdf
source_ref: ""  # vault path, URL, or "conversation:YYYY-MM-DD"
ingested: YYYY-MM-DD
guided: true  # was guided ingest done with user?
entities: []  # slugs of entity pages
concepts: []  # slugs of concept pages
key_claims: []  # string list of notable claims
confidence: high  # low | medium | high
images: []  # optional — only if images pass the 4-gate test (see Image Policy)
  # - path: assets/source-slug/name.png
  #   description: "one-line description"
---
```

### Entity (`wiki/entities/`)
A person, company, tool, framework, or recurring noun across sources.

Frontmatter:
```yaml
---
title: ""
type: entity
category: person  # person | company | tool | framework | platform | regulation | methodology
aliases: []
first_seen: ""  # source slug where first encountered
sources: []  # source slugs
related_entities: []
related_concepts: []
vault_refs: []  # paths to vault docs where this entity is relevant
status: active  # active | historical | deprecated
---
```

### Concept (`wiki/concepts/`)
A pattern, model, framework, or principle. The core value of the wiki.

Frontmatter:
```yaml
---
title: ""
type: concept
category: mental-model  # decision-framework | competitive-intel | technical-playbook | mental-model | pattern | anti-pattern
sources: []  # source slugs
entities: []  # entity slugs
related: []  # other concept slugs
maturity: seed  # seed | developing | mature | challenged
confidence: high  # low | medium | high
contradictions: []  # refs to contradicting claims
applications: []  # wikilinks to vault docs where applied
---
```

### Synthesis (`wiki/syntheses/`)
Cross-cutting analyses, filed queries, comparisons. The compounding output.

Frontmatter:
```yaml
---
title: ""
type: synthesis
trigger: query  # query | lint | insight | comparison
question: ""  # what prompted this synthesis
sources_consulted: []
concepts_involved: []
entities_involved: []
created: YYYY-MM-DD
updated: YYYY-MM-DD
maturity: draft  # draft | developing | mature
---
```

### Universal field: `alignment` (optional, any page type)

Any wiki page may declare how it relates to Narcis's active pillars (`self/narcis-pillars.md`).
Populated by `/faber-ingest` Phase 3b (alignment & stance detection) and synced into the
`self_alignment` SQLite table.

```yaml
alignment:
  - pillar: skill-era-craftsmanship
    relation: reinforces     # reinforces | weakens | contradicts | neutral
    source_event: "YYYY-MM-DD ingest | {Title}"
```

- `pillar` — slug of an active pillar (or the long form `pillar_slug:`).
- `relation` — one of `reinforces | weakens | contradicts | neutral`. Only write `neutral` when a previous non-neutral mark needs to be explicitly reset; otherwise omit.
- `source_event` (optional) — free-text trail (ideally the log entry title that produced it).
- `page_slug` (optional) — defaults to the declaring page. Override only when you are declaring alignment on behalf of a different page (rare).

Query the combined view with `SELECT * FROM v_narcis_alignment`.

## Slug Convention

Page filenames use kebab-case slugs: `naval-ravikant.md`, `permissionless-leverage.md`, `saas-pricing-models.md`. The slug is the canonical identifier used in frontmatter references.

## Operations

### Ingest (guided)
When a source is provided:
1. Read the source fully
2. Present key takeaways — discuss with Narcis what matters
3. Narcis directs emphasis (what to highlight, what to skip)
4. Identify entities, concepts, key claims
5. Create source summary page in `wiki/sources/`
6. Create OR update entity pages in `wiki/entities/`
7. Create OR update concept pages in `wiki/concepts/`
8. Update cross-references across affected pages
9. Create synthesis page if warranted
10. Update `wiki/index.md`
11. Append to `wiki/log.md`
12. Show summary: pages created, pages updated, new connections

**Key rule:** When updating existing pages, ADD to them. Never remove content unless contradicted — instead, note the contradiction with the source that challenges the claim.

### Query
When asked about accumulated knowledge:
1. Read `wiki/index.md` to find relevant pages
2. Read relevant pages (entities, concepts, sources)
3. Synthesize answer with inline citations using wikilinks
4. Present answer
5. Offer to file as synthesis page
6. If filed: update index and log

### Lint
Periodic health check. Scan for:
- **Contradictions** — different claims about the same topic across pages
- **Orphans** — pages with no inbound wikilinks from other wiki pages
- **Stale** — pages not updated in >30 days despite related new sources
- **Missing links** — entity/concept mentioned in prose but not linked
- **Phantoms** — wikilinks pointing to nonexistent pages
- **Thin** — entity or concept with only 1 source (needs more evidence)
- **Gaps** — important topics with no dedicated page
- **Suggested sources** — what to look for based on gaps

## Cross-Linking Conventions

### Within wiki
Use filename wikilinks:
```
See [[specific-knowledge]] for the framework.
Related: [[naval-ravikant]], [[productize-yourself]]
```

### Wiki to vault
Use full relative paths:
```
Applied in [[projects/contzo/decisions|Contzo Decisions]]
```

### Vault to wiki
Use full path from vault root:
```
See [[wiki/concepts/permissionless-leverage]]
```

## Index Format

`wiki/index.md` is a catalog of all wiki pages, organized by type. Each entry: wikilink + one-line summary + key metadata in brackets. Updated on every ingest.

## Log Format

`wiki/log.md` is append-only AND parsed into structured `log_events` rows by `faber_sync.py`.
The format is a contract — keep it consistent so the parser stays accurate.

### Header (mandatory)

```
## [YYYY-MM-DD] operation | Title
```

- `YYYY-MM-DD` — ISO date
- `operation` — one of: `init`, `seed`, `ingest`, `build`, `link`, `query`, `lint`,
  `query → synthesis` (multi-word allowed)
- `Title` — free-form, short

### Body (parseable bullets)

The parser recognizes these labelled lines under each header. Keep the labels exact:

| Label | Action stored | Page type |
|---|---|---|
| `Source: <url-or-path>` | sets `source_origin` on event | — |
| `Source page created: <slug>` | created | source |
| `Sources created: a, b, c` | created | source |
| `Sources updated: a, b` | updated | source |
| `Entities created: a, b` | created | entity |
| `Entities updated: a, b` | updated | entity |
| `Concepts created: a, b` | created | concept |
| `Concepts updated: a (note), b (note)` | updated | concept |
| `Syntheses created: a` / `Synthesis created: a` | created | synthesis |
| `Synthesis updated: a` | updated | synthesis |
| `Sources consulted: N (a, b, c)` | consulted | source |
| `Concepts involved: N (a, b)` | involved | concept |
| `Entities involved: N (a, b)` | involved | entity |
| `Vault doc created: path/to/file.md` | created | vault_doc |
| `Vault doc updated: path/to/file.md` | updated | vault_doc |
| `Query: "the question"` | sets `question` on event | — |
| `**Totals: N sources, M entities, K concepts = X new + Y updated**` | sets `claimed_*` columns for integrity check | — |
| `Guided ingest: ...` | sets `guided=1` on event | — |

Parenthetical annotations after slugs (e.g. `skill-era (added section + new source)`)
are stripped — only the slug is stored. Lists like `(none)` or `(none — skipped)`
are recognized as empty.

Unrecognized bullets are still preserved verbatim in `log_events.body`, so nothing is lost.

### Reconciliation

For `ingest` events that have a `Source: <url>` line but no explicit `Source page created`
slug, the parser reconciles by matching the URL against `pages.source_ref` (or fallback:
title against `pages.title`). This means the integrity view (`v_log_mismatches`) catches
events whose totals claim more pages created than actually exist.

### Quick checks

```bash
grep "^## \[" wiki/log.md | tail -5                   # raw last 5 entries
sqlite3 wiki/faber.db "SELECT * FROM v_recent_activity LIMIT 5;"  # parsed
sqlite3 wiki/faber.db "SELECT * FROM v_log_mismatches;"           # integrity
```

## Image Policy — Strict Rules

Images are allowed in source pages ONLY under these conditions. When in doubt, do NOT save the image.

### Hard Limits
- **Maximum 2 images per ingest.** No exceptions. If a source has 5 great diagrams, pick the 2 most irreplaceable.
- **Zero images is the default.** Most ingests should have zero images. Images are the exception, not the norm.

### The Irreplaceability Test (ALL must pass)
An image is saved ONLY if it passes every single gate:

1. **Information density gate:** The image contains structured information (diagram, flowchart, architecture, data visualization) that cannot be fully captured in text. If a 2-sentence description conveys the same information → skip.
2. **Novelty gate:** The information in the image is NOT already present in the ingested text. If the article describes the same diagram in prose → skip, the text is enough.
3. **Reference value gate:** Someone revisiting this source 6 months later would specifically need to see this image to understand a key claim or architecture. If it's illustrative but not essential → skip.
4. **Type gate — ONLY these types qualify:**
   - Architecture diagrams / system diagrams
   - Flowcharts / decision trees
   - Data visualizations with specific numbers not in the text
   - Org charts showing structural relationships
   - **Everything else is automatically rejected:** screenshots of text, profile photos, logos, decorative images, stock photos, code screenshots (transcribe as code blocks instead), memes, banners.

### Storage Convention
```
wiki/assets/{source-slug}/
    {descriptive-name}.png
```
- Filenames: kebab-case, descriptive (e.g., `org-chart-before-after.png`, not `image1.png`)
- Format: PNG preferred, JPEG acceptable
- Reference from source page: `![Short description](assets/{source-slug}/filename.png)`

### Frontmatter
Source pages with images add an `images` field:
```yaml
images:
  - path: assets/source-slug/diagram-name.png
    description: "One-line description of what this image shows"
```

### During Guided Ingest
When processing a source with images, Claude must:
1. List candidate images with one-line descriptions
2. Apply the 4-gate test to each, showing pass/fail reasoning
3. Recommend 0-2 images maximum
4. Ask Narcis for confirmation before saving any image
5. If Narcis says skip → skip. No arguments.

## SQLite Index Layer

`faber.db` is a derived SQLite database that mirrors all frontmatter, relationships, AND
the temporal log for fast agentic querying. Rebuilt from scratch by `python3 wiki/faber_sync.py`
(idempotent, ~120ms). The DB has two layers:

### Layer 1: Knowledge graph (what is known)

**Tables:** `pages`, `key_claims`, `aliases`, `vault_refs`, `page_relations`, `prose_wikilinks`, `images`
**Views:** `v_dashboard`, `v_maturity`, `v_entity_connectivity`, `v_orphans`, `v_phantoms`,
`v_thin_pages`, `v_confidence`, `v_backlinks`
**FTS5:** `fts_content` (page prose), `fts_claims` (key claims)

### Layer 2: Temporal layer (how it evolved)

Parsed from `log.md` on every sync. See **Log Format** section for the parsing contract.

**Tables:** `log_events`, `log_event_pages` (junction)
**Views:**
- `v_recent_activity` — events with pages-created/updated counts, ordered by date+position
- `v_log_integrity` — claimed vs actual counts for every event with a Totals line
- `v_log_mismatches` — only rows where claimed ≠ actual (data integrity warnings)
- `v_page_activity` — every page with `times_touched` + `first_touched` + `last_touched`
- `v_recently_touched_pages` — pages ordered by most-recent log touch
- `v_recent_pages` — pages ordered by frontmatter `updated` field
- `v_stale_concepts` — concepts/entities with no log touch in 30+ days
- `v_ingest_velocity` — per-week event/page-creation counts grouped by operation
- `v_daily_activity` — per-day summary of events and pages created
- `v_phantom_log_refs` — slugs referenced in log but missing from `pages`
**FTS5:** `fts_log` (event title + body — enables "what did I work on about X")

### Sync persistence

`sync_log` history is **preserved across rebuilds** so you can track build performance over
time. Everything else is dropped and recreated.

### When to sync

After every ingest, seed, manual page edit, OR manual log.md edit. Run `python3 wiki/faber_sync.py`.

### How skills use the DB

| Skill | Layer | Usage |
|---|---|---|
| `/faber-status` | both | Dashboard queries across all views in one Bash call |
| `/faber-query` | both | FTS topic + temporal log filters; combined queries via JOIN |
| `/faber-lint` | both | Phantom/orphan/thin checks + log integrity + stale concepts |
| `/faber-brief` | temporal | Wake-up briefing for fresh sessions — single SQL pass |
| `/faber-ingest` | knowledge | Duplicate detection via `aliases`, auto-sync at end |
| `/faber-link` | knowledge | Discover candidate links via FTS + alias matching |
| `/faber-slides` | knowledge | Page lookup + relation traversal for deck content |

## Agent Consumption

Wiki pages are dual-layer: YAML frontmatter for machine parsing, prose for human reading.
The SQLite index adds a third layer for efficient structured queries — and the temporal
layer adds a fourth: time-aware queries over the wiki's own evolution.

**Knowledge SQL:** `sqlite3 wiki/faber.db "SELECT ..."` — finding pages, checking relations.
**FTS pages:** `sqlite3 wiki/faber.db "SELECT slug, title FROM fts_content WHERE fts_content MATCH 'keyword'"`
**FTS claims:** `sqlite3 wiki/faber.db "SELECT source_slug, claim FROM fts_claims WHERE fts_claims MATCH 'keyword'"`
**FTS log:** `sqlite3 wiki/faber.db "SELECT event_date, title FROM fts_log WHERE fts_log MATCH 'keyword'"` — find log entries about a topic
**Entity lookup:** `sqlite3 wiki/faber.db "SELECT * FROM pages p LEFT JOIN aliases a ON a.entity_slug = p.slug WHERE ..."` — includes aliases.
**Temporal traversal:** `sqlite3 wiki/faber.db "SELECT le.event_date, le.title, lep.action FROM log_event_pages lep JOIN log_events le ON le.id = lep.event_id WHERE lep.page_slug = 'X'"` — every event that touched page X.
**Wake-up briefing:** `/faber-brief` — single-query session orientation. Use this on cold starts.
**Prose reading:** Read specific `.md` files when you need the full narrative content.

## Dataview Queries

For Obsidian dynamic views:

```dataview
TABLE maturity, confidence, length(sources) AS "Sources"
FROM "wiki/concepts"
SORT maturity DESC
```

```dataview
TABLE category, length(sources) AS "Sources"
FROM "wiki/entities"
SORT title ASC
```

```dataview
TABLE trigger, maturity, updated
FROM "wiki/syntheses"
SORT created DESC
```

## Maintenance Rules

1. Every ingest updates index.md and log.md — no exceptions
2. When a new source contradicts an existing claim, note the contradiction on BOTH pages
3. Concepts start at `seed` maturity and evolve: seed → developing → mature → challenged
4. Entity pages accumulate — they get richer with every source that mentions them
5. Synthesis pages can be updated when new evidence arrives
6. The wiki is a git repo — version history is automatic, use it
7. If Narcis says "skip" or "not important" during guided ingest, respect that — don't create pages for skipped content
