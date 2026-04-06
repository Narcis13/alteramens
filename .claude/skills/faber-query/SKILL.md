---
name: faber-query
description: |
  Query the Faber wiki for accumulated knowledge. Use when the user asks a question about topics
  covered in the wiki, or invokes /faber-query. Reads the index, finds relevant pages, synthesizes
  an answer with citations. Can file good answers as synthesis pages. Trigger on /faber-query or
  "ask faber", "what does faber know about", "search the wiki".
---

# Faber Query — Search & Synthesize

You are querying the Faber wiki at `wiki/`. Read `wiki/FABER.md` for conventions.

## Input

Parse `$ARGUMENTS` for the question. If no arguments, ask the user what they want to know.

## Pre-check: Ensure DB Exists

```bash
test -f wiki/faber.db || python3 wiki/faber_sync.py
```

## Workflow

### Step 1: Discover via SQL

Use FTS5 full-text search to find relevant pages:

```bash
sqlite3 wiki/faber.db "
  SELECT slug, title, snippet(fts_content, 4, '»', '«', '...', 40)
  FROM fts_content
  WHERE fts_content MATCH 'keyword1 OR keyword2'
  ORDER BY rank
  LIMIT 10;
"
```

Then expand via relations to find connected pages:

```bash
sqlite3 wiki/faber.db "
  SELECT DISTINCT pr.to_slug, p.type, p.title
  FROM page_relations pr
  JOIN pages p ON p.slug = pr.to_slug
  WHERE pr.from_slug IN ('relevant-slug-1', 'relevant-slug-2')
  LIMIT 15;
"
```

For entity lookups (including aliases):
```bash
sqlite3 wiki/faber.db "
  SELECT p.slug, p.title FROM pages p
  LEFT JOIN aliases a ON a.entity_slug = p.slug
  WHERE p.slug LIKE '%keyword%'
     OR p.title LIKE '%keyword%'
     OR a.alias LIKE '%keyword%';
"
```

### Step 2: Read
Read only the truly relevant .md files identified by SQL (not all pages). For each, note:
- Key claims and their confidence
- Sources behind the claims
- Cross-references to other pages
- Contradictions if any exist

### Step 3: Synthesize
Compose an answer that:
- Directly addresses the question
- Cites wiki pages with wikilinks: `[[page-name]]`
- Notes confidence levels where relevant
- Flags contradictions or gaps in coverage
- Suggests related pages the user might want to explore

### Step 4: File (optional)
After presenting the answer, ask:
> "Should I file this as a synthesis page in the wiki?"

If yes:
1. Create `wiki/syntheses/{slug}.md` with full frontmatter
2. Append to `wiki/log.md`
3. Run `python3 wiki/faber_sync.py` to update DB and index

## Rules
- Always cite sources — never present wiki knowledge without attribution
- If the wiki doesn't have relevant content, say so honestly and suggest sources to ingest
- Prefer depth over breadth — read fewer pages thoroughly rather than many superficially
- The answer format should match the question: factual questions get concise answers, analytical questions get structured analysis
- **Use SQL for discovery, .md files for prose** — don't read files just to find relevant pages
