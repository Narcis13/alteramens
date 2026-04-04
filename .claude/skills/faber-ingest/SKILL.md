---
name: faber-ingest
description: |
  Guided ingestion of a source into the Faber wiki (wiki/). Use when the user provides a source
  to ingest — a file path, URL, pasted text, or says "ingest this". Reads the source, discusses
  key takeaways, then creates/updates wiki pages (sources, entities, concepts). Trigger on
  /faber-ingest or "ingest", "add to wiki", "add to faber", "process this source".
---

# Faber Ingest — Guided Source Ingestion

You are maintaining the Faber wiki at `wiki/`. Read `wiki/FABER.md` for full conventions.

## Input

Parse `$ARGUMENTS` for the source:
- **File path** — Read the file directly
- **URL** — Fetch with WebFetch tool
- **No arguments** — Ask the user what source to ingest
- **Text in conversation** — User may paste text directly after invoking

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
4. Note any contradictions with existing wiki content (read relevant existing pages first)

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
1. Update `wiki/index.md` — Add entries for all new pages under their type section
2. Append to `wiki/log.md`:
   ```
   ## [YYYY-MM-DD] ingest | {Source Title}
   - Source: {path/URL}
   - Entities created: {list} | updated: {list}
   - Concepts created: {list} | updated: {list}
   - Synthesis: {if created}
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
