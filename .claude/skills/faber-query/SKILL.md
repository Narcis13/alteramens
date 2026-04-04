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

## Workflow

### Step 1: Discover
1. Read `wiki/index.md` to scan all cataloged pages
2. Identify relevant pages by title, summary, and type
3. If the question involves specific entities: check `wiki/entities/`
4. If the question involves patterns/frameworks: check `wiki/concepts/`
5. If the question is broad: check `wiki/syntheses/` for existing analyses

### Step 2: Read
Read all relevant pages. For each, note:
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
2. Update `wiki/index.md` — add entry under Syntheses
3. Append to `wiki/log.md`

## Rules
- Always cite sources — never present wiki knowledge without attribution
- If the wiki doesn't have relevant content, say so honestly and suggest sources to ingest
- Prefer depth over breadth — read fewer pages thoroughly rather than many superficially
- The answer format should match the question: factual questions get concise answers, analytical questions get structured analysis
