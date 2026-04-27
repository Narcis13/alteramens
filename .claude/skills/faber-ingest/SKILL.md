---
name: faber-ingest
composition_level: molecule
description: |
  Guided ingestion of a source into the Faber wiki (wiki/). Use when the user provides a source
  to ingest — a file path, URL, pasted text, or says "ingest this". Reads the source, discusses
  key takeaways, then creates/updates wiki pages (sources, entities, concepts). Trigger on
  /faber-ingest or "ingest", "add to wiki", "add to faber", "process this source".
---

# Faber Ingest — Guided Source Ingestion

You are maintaining the Faber wiki located via `.faber.toml` auto-discovery. Read `$WIKI_ROOT/FABER.md` for full conventions.

## Wiki Discovery

Resolve the wiki path at the start of every bash block:

```bash
WIKI_ROOT=$(d="$PWD"; while [ "$d" != "/" ]; do
  [ -f "$d/wiki/.faber.toml" ] && { echo "$d/wiki"; break; }
  [ -f "$d/.faber.toml" ] && { echo "$d"; break; }
  d=$(dirname "$d")
done)
[ -z "$WIKI_ROOT" ] && { echo "Error: no .faber.toml found from $PWD" >&2; exit 1; }
VAULT_ROOT=$(dirname "$WIKI_ROOT")   # parent directory hosts inbox/, workshop/, projects/
```

Use `"$WIKI_ROOT/faber.db"` for SQL, `python3 "$WIKI_ROOT/faber_sync.py"` for sync, and
`"$VAULT_ROOT"` as the base for vault paths when reading `inbox/`, `workshop/`, `projects/`, etc.

## Input

Parse `$ARGUMENTS` for the source:
- **File path** — Read the file directly
- **URL** — Fetch with WebFetch tool
- **No arguments** — Ask the user what source to ingest
- **Text in conversation** — User may paste text directly after invoking

## Pre-check: Duplicate Detection

Before ingesting, check if the source already exists:
```bash
sqlite3 $WIKI_ROOT/faber.db "SELECT slug, title FROM pages WHERE type='source' AND (source_ref LIKE '%keyword%' OR title LIKE '%keyword%');"
```
Also check entity aliases to avoid duplicates:
```bash
sqlite3 $WIKI_ROOT/faber.db "SELECT entity_slug, alias FROM aliases WHERE alias LIKE '%name%';"
```

If `faber.db` doesn't exist, run `python3 "$WIKI_ROOT/faber_sync.py"` first.

## Self Context Loading (always, before Phase 1)

Pull active pillars and stances from `faber.db` — used for alignment detection during extraction
and persisted later via `faber-align` (Phase 3b).

```bash
sqlite3 -json "$WIKI_ROOT/faber.db" "SELECT pillars_json, stances_json FROM v_self_active_context;"
```

While summarizing the source:
- **Pillar alignment:** for each key takeaway, silently check whether it reinforces / weakens / contradicts an active pillar. Surface tensions explicitly in Phase 1 discussion ("This source pushes back on pilon X"). This is the preliminary read; the persisted judgment happens in Phase 3b.
- **Stance tension:** if the source contradicts an active stance, flag it in Phase 1 rather than quietly letting it past.
- **Stance candidates:** also watch for claims that **crystallize a new position** Narcis might adopt but has not yet declared. Hold these — they surface in Phase 3b, not Phase 1.
- **Voice preservation on quotes:** when extracting Narcis's own quotes from vault docs, do **not** sterilize Romglish. The `voice_rules` from DB (register, romglish, no-corporate-hedging) govern how his quoted prose is preserved.

This turns ingest from neutral summarization into **compounding corrective** — sources either strengthen or challenge what Narcis has declared, and the record tracks which.

## Workflow

### Phase 1: Read & Discuss
1. Read the source fully
2. Present a concise summary of key takeaways (5-8 bullet points max)
3. Identify preliminary entities and concepts
4. Ask Narcis: "What should I emphasize? Anything to skip?"
5. Wait for direction before proceeding

### Phase 2: Extract
Based on the discussion:
1. **Entities** — People, companies, tools, frameworks mentioned. For each, determine: name, category, aliases
2. **Concepts** — Patterns, models, principles, frameworks. For each, determine: name, category, related concepts
3. **Key claims** — Notable assertions, with confidence assessment
4. Note any contradictions with existing wiki content (query faber.db for related pages first)

### Phase 2b: Image Evaluation (strict — read wiki/FABER.md "Image Policy" section)

**Default: zero images.** Only proceed if the source contains diagrams/charts/visualizations.

For each candidate image, apply the 4-gate test:
1. **Information density:** Can a 2-sentence description convey the same info? If yes → REJECT.
2. **Novelty:** Is this info already in the text you ingested? If yes → REJECT.
3. **Reference value:** Would someone need this image 6 months later? If no → REJECT.
4. **Type:** Is it an architecture diagram, flowchart, data visualization, or org chart? If no → REJECT.

**Hard cap: maximum 2 images per ingest. Zero is the norm.**

If any images pass all 4 gates:
1. Present them to Narcis with pass/fail reasoning per gate
2. Wait for explicit approval before saving
3. If approved: save to `wiki/assets/{source-slug}/` with descriptive kebab-case filename
4. Add `images:` field to source frontmatter
5. Reference in prose: `![description](assets/{source-slug}/filename.png)`

To save images from web sources (Chrome):
```
Use mcp__claude-in-chrome__computer to screenshot specific diagrams, or
download images directly if available.
```

### Phase 3: Write Wiki Pages
1. **Source page** — Create `wiki/sources/{slug}.md` with full frontmatter and prose summary
2. **Entity pages** — For each entity:
   - If page exists: ADD new source, update connections, append new info
   - If new: Create `wiki/entities/{slug}.md`
3. **Concept pages** — For each concept:
   - If page exists: ADD new source, update connections, note new claims
   - If new: Create `wiki/concepts/{slug}.md`
4. **Cross-references** — Update `related_entities`, `related_concepts`, `related` fields across all affected pages
5. **Synthesis** — If the source creates a significant new connection or insight, create a synthesis page

### Phase 3b: Alignment & Stance Detection (`/faber-align`)

Post-extract pass that persists the preliminary read from Self Context Loading. Runs **before** the sync in Phase 4.

**1. Alignment persistence — write `alignment:` frontmatter on material pages.**

For the new **source page**, and for each **new concept / new synthesis** (and any
concept / entity whose relevance to a pillar just shifted in this ingest), add an
`alignment:` list to the frontmatter. Each entry maps the page to one active pillar:

```yaml
alignment:
  - pillar: skill-era-craftsmanship
    relation: reinforces           # reinforces | weakens | contradicts | neutral
    source_event: "YYYY-MM-DD ingest | {Title}"
  - pillar: ai-agents-for-solo-builders
    relation: neutral
```

Rules:
- Only emit entries that are **not `neutral`** — neutral is the default and pollutes the table. Exception: if a page was previously marked non-neutral and this source flips it to neutral, emit `neutral` so the corrective record is preserved.
- `page_slug` is implicit (the declaring page) — do not include it.
- `source_event` is a free-text trail, ideally matching the log entry title created in Phase 4.
- **Entities** (people / companies / tools) should stay free of alignment unless the entity *itself* embodies a pillar stance (rare — e.g. a company whose business model contradicts `organic-growth-no-shortcuts`). Default: no alignment on entities.
- **Sources** get aggregated alignment — if the source's claims reinforce pilon X and weaken pilon Y, both go on the source page.

Query active pillars before writing:
```bash
sqlite3 -json "$WIKI_ROOT/faber.db" "SELECT slug, title FROM self_pillars WHERE status = 'active';"
```

**2. Stance candidate detection — surface, do NOT auto-create.**

Compare the source's key claims against the active `stances_json` loaded at the start.
A claim is a **stance candidate** when it:
- Crystallizes a position on a sub-topic Narcis has not yet declared a stance on, OR
- Sharpens / re-frames an existing stance in a way that suggests a revision.

Collect candidates in a list. **Do not edit `wiki/self/narcis-stances.md`** — stances are Narcis's to declare. Present candidates in Phase 5 (report) with this shape:

```
Stance candidates (from this ingest):
  1. on_topic: <sub-topic> — proposed position: "<...>" (evidence: <claim>)
  2. ...
Add to narcis-stances.md? (y/N/edit)
```

If Narcis confirms, append entries to `wiki/self/narcis-stances.md` frontmatter and prose; otherwise drop them. Either way, log the outcome in the Phase 4 log entry (see below).

### Phase 4: Update Meta
1. Append to `wiki/log.md`:
   ```
   ## [YYYY-MM-DD] ingest | {Source Title}
   - Source: {path/URL}
   - Entities created: {list} | updated: {list}
   - Concepts created: {list} | updated: {list}
   - Synthesis: {if created}
   - Alignment: N entries — {pilon: reinforces ×a, weakens ×b, contradicts ×c}
   - Stance candidates: {count} — {accepted | skipped | edited} by Narcis
   ```
   The `Alignment:` and `Stance candidates:` lines are recognised only as free-form body by the log parser (they do not feed `log_event_pages`), but they preserve the outcome of Phase 3b in the permanent log.
2. **Run faber-sync** to rebuild the database and regenerate index.md:
   ```bash
   python3 "$WIKI_ROOT/faber_sync.py"
   ```
3. **Verify** — quick lint + alignment check:
   ```bash
   sqlite3 $WIKI_ROOT/faber.db "SELECT * FROM v_phantoms;"
   sqlite3 $WIKI_ROOT/faber.db "SELECT pillar, relation, COUNT(*) c FROM v_narcis_alignment GROUP BY pillar, relation;"
   ```

### Phase 5: Report
Show a summary:
- Pages created (with links)
- Pages updated (with what changed)
- New connections discovered
- Any contradictions flagged
- **Alignment** — for each pillar, how many pages reinforce / weaken / contradict (after this ingest)
- **Stance candidates surfaced** — the list raised in Phase 3b and Narcis's decision on each

## Rules
- Always read `wiki/FABER.md` first for conventions
- Read existing pages before updating them — never overwrite, always append/merge
- Respect "skip" directives from Narcis
- Use kebab-case slugs for filenames
- All wiki pages must have valid YAML frontmatter matching the schema in FABER.md
- Cross-link to vault documents where the entity/concept is relevant using `[[vault-path|Display Name]]`
- When in doubt about maturity/confidence, start conservative (seed/medium)
- **Alignment discipline:** only emit non-neutral relations. Be explicit about *which* claim reinforces/weakens the pillar — don't fabricate alignment to seem thorough.
- **Never auto-create stances** — stances are Narcis's to declare. Surface candidates only.
- **Always run faber-sync as the last step** — never skip this
