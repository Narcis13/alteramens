---
name: faber-seed
description: |
  Autonomous vault seeding for Faber wiki. Scans the Alteramens vault for high-value content
  and creates initial wiki pages (sources, entities, concepts). First pass is autonomous;
  user reviews and refines afterward. Trigger on /faber-seed or "seed the wiki", "bootstrap faber",
  "process vault into wiki".
---

# Faber Seed — Autonomous Vault Seeding

You are bootstrapping the Faber wiki by processing existing vault content. Read `$WIKI_ROOT/FABER.md` for conventions.

## Wiki Discovery

Resolve wiki + vault paths before any bash block:

```bash
WIKI_ROOT=$(d="$PWD"; while [ "$d" != "/" ]; do
  [ -f "$d/wiki/.faber.toml" ] && { echo "$d/wiki"; break; }
  [ -f "$d/.faber.toml" ] && { echo "$d"; break; }
  d=$(dirname "$d")
done)
[ -z "$WIKI_ROOT" ] && { echo "Error: no .faber.toml found from $PWD" >&2; exit 1; }
VAULT_ROOT=$(dirname "$WIKI_ROOT")   # hosts inbox/, workshop/, projects/
```

## Vault Sources to Process

Scan these locations under `$VAULT_ROOT` in priority order:

1. **`Foundation.md`** — Naval's Productize Yourself framework (highest priority)
2. **`MANIFEST.md`** — Alteramens vision, mission, principles
3. **`workshop/drafts/*.md`** — Validated concepts with research
4. **`workshop/ideas/*.md`** — Raw ideas (skip status: killed)
5. **`strategies/*.md`** — GTM and business strategy docs
6. **`projects/*/decisions.md`** — Decision logs from active projects
7. **`projects/*/learnings.md`** — Learnings from active projects
8. **`inbox/clippings/*.md`** — Web-clipped articles waiting for ingest

## Workflow

### Phase 1: Scan
1. Glob each location above
2. Read file frontmatter and first ~50 lines to assess value
3. Build a processing queue, skip:
   - Empty files or stub files with no substantive content
   - Files with status: `killed` in frontmatter
   - Binary files, images
4. Report total files to process and estimated scope

### Phase 2: Process (autonomous)
For each file in the queue:
1. Read the full content
2. Extract entities, concepts, key claims
3. Create wiki pages:
   - Source summary in `wiki/sources/`
   - Entity pages in `wiki/entities/` (create or merge if exists)
   - Concept pages in `wiki/concepts/` (create or merge if exists)
4. All seeded pages get `guided: false` in frontmatter
5. Build cross-references as you go

### Phase 3: Synthesize
After processing all files:
1. Look for cross-cutting themes
2. Create 2-3 synthesis pages for the most significant patterns
3. These are the "big picture" insights from the vault

### Phase 4: Build Index
1. Write comprehensive seeding entry in `wiki/log.md`
2. Run `python3 "$WIKI_ROOT/faber_sync.py"` to rebuild faber.db and regenerate index.md

### Phase 5: Report
Present to user:
- Total pages created by type
- Most connected entities (hubs)
- Key concepts extracted
- Synthesis themes identified
- Suggested next steps (guided refinement, additional sources)

## Rules
- This is AUTONOMOUS — don't ask permission for each file, just process them
- But DO present the full report at the end for review
- Mark all seeded pages as `guided: false` — they can be refined later via `/faber-ingest`
- When multiple vault files reference the same entity/concept, MERGE into one wiki page
- Prefer quality over quantity — don't create entity pages for entities mentioned only once in passing
- Minimum threshold: an entity/concept needs to appear in 2+ sources OR be central to 1 important source
- Start conservative on maturity: seeded concepts start at `seed` unless strongly evidenced
