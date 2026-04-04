---
title: "Faber — The Builder's Codex"
type: meta
version: "1.0"
created: 2026-04-04
---

# Faber — The Builder's Codex

Faber is a persistent, compounding knowledge base maintained by Claude Code. It sits inside the Alteramens Obsidian vault and accumulates a builder's knowledge: decision frameworks, competitive intelligence, and technical playbooks.

**Faber** = Latin for "craftsman, builder, maker." Homo faber — man the maker.

**The pattern:** Instead of re-deriving knowledge from scratch on every question (like RAG), Claude incrementally builds and maintains a structured wiki. Knowledge is compiled once and kept current. Cross-references are already there. Contradictions are already flagged. The synthesis already reflects everything ingested.

**Roles:**
- **Narcis** curates sources, directs analysis, asks questions, decides what matters
- **Claude** does everything else — summarizing, cross-referencing, filing, maintaining consistency

## Architecture

```
SCHEMA (this file)  →  Conventions, formats, workflows
WIKI (wiki/)        →  LLM-written pages: sources, entities, concepts, syntheses
RAW SOURCES         →  Clippings/, vault docs, URLs, pasted text (immutable)
```

Claude reads raw sources but never modifies them. Claude owns the wiki layer entirely.

## Directory Structure

```
wiki/
├── FABER.md          # This file — schema & conventions
├── index.md          # Content catalog by type
├── log.md            # Chronological operations log
├── sources/          # Summaries of ingested material
├── entities/         # People, companies, tools, frameworks
├── concepts/         # Patterns, models, mental frameworks
└── syntheses/        # Cross-cutting analyses & filed queries
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

`wiki/log.md` is append-only. Each entry:
```
## [YYYY-MM-DD] operation | Title
- Details of what changed
- Pages created/updated
```

Parseable with `grep "^## \[" wiki/log.md | tail -5`.

## Agent Consumption

Wiki pages are dual-layer: YAML frontmatter for machine parsing, prose for human reading.

**Index scan:** Read `wiki/index.md` → select pages by title/summary → read them.
**Frontmatter query:** Grep for `type:`, `category:`, `maturity:` etc. in frontmatter.
**Entity lookup:** Read entity page → follow related_concepts and sources links.

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
