---
name: faber-ingest
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

### Phase 4: Update Meta
1. Append to `wiki/log.md`:
   ```
   ## [YYYY-MM-DD] ingest | {Source Title}
   - Source: {path/URL}
   - Entities created: {list} | updated: {list}
   - Concepts created: {list} | updated: {list}
   - Synthesis: {if created}
   ```
2. **Run faber-sync** to rebuild the database and regenerate index.md:
   ```bash
   python3 "$WIKI_ROOT/faber_sync.py"
   ```
3. **Verify** — Run a quick lint check for broken references:
   ```bash
   sqlite3 $WIKI_ROOT/faber.db "SELECT * FROM v_phantoms;"
   ```

### Phase 5: Report
Show a summary:
- Pages created (with links)
- Pages updated (with what changed)
- New connections discovered
- Any contradictions flagged

## Rules
- Always read `wiki/FABER.md` first for conventions
- Read existing pages before updating them — never overwrite, always append/merge
- Respect "skip" directives from Narcis
- Use kebab-case slugs for filenames
- All wiki pages must have valid YAML frontmatter matching the schema in FABER.md
- Cross-link to vault documents where the entity/concept is relevant using `[[vault-path|Display Name]]`
- When in doubt about maturity/confidence, start conservative (seed/medium)
- **Always run faber-sync as the last step** — never skip this
