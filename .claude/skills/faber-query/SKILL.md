---
name: faber-query
composition_level: molecule
description: |
  Query the Faber wiki for accumulated knowledge — by topic, by date, by activity. Reads the index,
  finds relevant pages and log events, synthesizes an answer with citations. Can file good answers
  as synthesis pages. Trigger on /faber-query or "ask faber", "what does faber know about",
  "search the wiki", "what did I work on last week".
---

# Faber Query — Search & Synthesize

You are querying the Faber wiki located via `.faber.toml` auto-discovery. Read `$WIKI_ROOT/FABER.md` for conventions.

## Wiki Discovery

Before any bash block, resolve `$WIKI_ROOT` via walk-up:

```bash
WIKI_ROOT=$(d="$PWD"; while [ "$d" != "/" ]; do
  [ -f "$d/wiki/.faber.toml" ] && { echo "$d/wiki"; break; }
  [ -f "$d/.faber.toml" ] && { echo "$d"; break; }
  d=$(dirname "$d")
done)
[ -z "$WIKI_ROOT" ] && { echo "Error: no .faber.toml found from $PWD" >&2; exit 1; }
```

Use `"$WIKI_ROOT/faber.db"` for SQL and `python3 "$WIKI_ROOT/faber_sync.py"` for sync. Each
Bash subshell is fresh — resolve once and substitute the absolute path in subsequent calls.

The Faber DB has TWO query surfaces:
1. **Knowledge layer** (`fts_content`, `pages`, `page_relations`) — what is known
2. **Temporal layer** (`log_events`, `fts_log`, `log_event_pages`) — when/how it evolved

## Input

Parse `$ARGUMENTS` for the question. Recognize temporal modifiers:
- "last week" / "last 7 days" / "săptămâna trecută" → `--since 7d`
- "today" / "azi" → `event_date = date('now')`
- "in March" / "în martie" → `event_date LIKE '2026-03-%'`
- "what did I work on" / "ce am lucrat" → temporal log query, no FTS topic
- "show me everything about X" → FTS topic query, no temporal filter

If no arguments, ask the user what they want to know.

## Pre-check: Ensure DB Exists

```bash
test -f $WIKI_ROOT/faber.db || python3 "$WIKI_ROOT/faber_sync.py"
```

## Self Context Loading (always, before Step 1)

Pull the full active self context — pillars, stances, constraints, voice rules — so synthesis is personalized to where Narcis currently stands, not to generic wiki content.

```bash
sqlite3 -json "$WIKI_ROOT/faber.db" "SELECT * FROM v_self_active_context;"
```

Apply it in Step 3 (Synthesize):
- **Frame answers against active pillars** — e.g., "For your pilon 'AI agents for solo builders', this means…"
- **Flag stance tensions** — if wiki content contradicts an active stance, say so explicitly: "This source contradicts your stance on X. Worth revisiting."
- **Respect constraints** — don't propose actions that ignore the 08-15 work constraint or weakness flags.
- **Voice when writing syntheses** — if the user files the answer as a synthesis page, the `voice_rules` govern the prose. No sterilized LLM tone.

The point: queries return *what's true in the wiki given who Narcis is right now*, not neutral summaries.

## Workflow

### Step 1: Discover via SQL

#### A. Topic queries (FTS on pages)
```bash
sqlite3 $WIKI_ROOT/faber.db "
  SELECT slug, title, snippet(fts_content, 4, '»', '«', '...', 40)
  FROM fts_content
  WHERE fts_content MATCH 'keyword1 OR keyword2'
  ORDER BY rank
  LIMIT 10;
"
```

Expand via relations:
```bash
sqlite3 $WIKI_ROOT/faber.db "
  SELECT DISTINCT pr.to_slug, p.type, p.title
  FROM page_relations pr
  JOIN pages p ON p.slug = pr.to_slug
  WHERE pr.from_slug IN ('relevant-slug-1', 'relevant-slug-2')
  LIMIT 15;
"
```

#### B. Entity lookups (including aliases)
```bash
sqlite3 $WIKI_ROOT/faber.db "
  SELECT p.slug, p.title FROM pages p
  LEFT JOIN aliases a ON a.entity_slug = p.slug
  WHERE p.slug LIKE '%keyword%'
     OR p.title LIKE '%keyword%'
     OR a.alias LIKE '%keyword%';
"
```

#### C. Temporal queries (log events)

"What did I work on last week?"
```bash
sqlite3 -header -column $WIKI_ROOT/faber.db "
  SELECT event_date, operation, title, pages_created AS '+', pages_updated AS '~'
  FROM v_recent_activity
  WHERE julianday('now') - julianday(event_date) <= 7
  ORDER BY event_date DESC, position DESC;
"
```

"Show me everything touching `concept-x` over time"
```bash
sqlite3 -header -column $WIKI_ROOT/faber.db "
  SELECT le.event_date, le.operation, le.title, lep.action
  FROM log_event_pages lep
  JOIN log_events le ON le.id = lep.event_id
  WHERE lep.page_slug = 'concept-x'
  ORDER BY le.event_date DESC;
"
```

"FTS log search — find log entries about a topic"
```bash
sqlite3 -header -column $WIKI_ROOT/faber.db "
  SELECT event_date, operation, title, snippet(fts_log, 4, '»', '«', '...', 30)
  FROM fts_log
  WHERE fts_log MATCH 'distribution OR programmatic'
  ORDER BY rank
  LIMIT 10;
"
```

#### D. Combined topic + temporal

"What did I learn about distribution in the last 14 days?"
```bash
sqlite3 -header -column $WIKI_ROOT/faber.db "
  SELECT DISTINCT p.slug, p.type, p.title, MAX(le.event_date) AS last_touched
  FROM fts_content fc
  JOIN pages p ON p.slug = fc.slug
  LEFT JOIN log_event_pages lep ON lep.page_slug = p.slug
  LEFT JOIN log_events le ON le.id = lep.event_id
  WHERE fts_content MATCH 'distribution'
    AND (le.event_date IS NULL OR julianday('now') - julianday(le.event_date) <= 14)
  GROUP BY p.slug
  ORDER BY last_touched DESC;
"
```

#### E. Claims search (FTS on key_claims)

```bash
sqlite3 -header -column $WIKI_ROOT/faber.db "
  SELECT source_slug, snippet(fts_claims, 1, '»', '«', '...', 40)
  FROM fts_claims
  WHERE fts_claims MATCH 'keyword'
  LIMIT 10;
"
```

### Step 2: Read
Read only the truly relevant `.md` files identified by SQL. For each, note:
- Key claims and confidence
- Sources behind the claims
- Cross-references
- Contradictions if any

### Step 3: Synthesize
Compose an answer that:
- Directly addresses the question
- Cites wiki pages with wikilinks `[[page-name]]`
- For temporal queries, cites log events with date+operation+title
- Notes confidence levels where relevant
- Flags contradictions or gaps
- Suggests related pages

### Step 4: File (optional)
After presenting the answer, ask:
> "Should I file this as a synthesis page in the wiki?"

If yes:
1. Create `wiki/syntheses/{slug}.md` with full frontmatter
2. Append entry to `wiki/log.md` (operation: `query → synthesis`)
3. Run `python3 "$WIKI_ROOT/faber_sync.py"`

## Rules
- Always cite sources — never present wiki knowledge without attribution
- For temporal questions ("what did I work on"), prefer log_events over file mtime
- The answer format should match the question: factual → concise; analytical → structured
- **Use SQL for discovery, .md files for prose** — don't read files just to find relevant pages
- Be honest about gaps: if neither pages nor log mention the topic, say so
