---
name: faber-sync
description: |
  Rebuild the Faber SQLite index (wiki/faber.db) from all wiki markdown files.
  Run after every ingest/seed, or on demand if the DB is missing or stale.
  Idempotent — always drops and recreates all data. Also regenerates index.md.
  Trigger on /faber-sync or "sync faber", "rebuild faber db", "update faber index".
---

# Faber Sync — Rebuild SQLite Index

Rebuild `$WIKI_ROOT/faber.db` from all `$WIKI_ROOT/**/*.md` files.

## Wiki Discovery

This skill finds the Faber library via `.faber.toml` auto-discovery — it works from any cwd
inside (or below) the host directory. At the start of every bash block, resolve the wiki path:

```bash
WIKI_ROOT=$(d="$PWD"; while [ "$d" != "/" ]; do
  [ -f "$d/wiki/.faber.toml" ] && { echo "$d/wiki"; break; }
  [ -f "$d/.faber.toml" ] && { echo "$d"; break; }
  d=$(dirname "$d")
done)
[ -z "$WIKI_ROOT" ] && { echo "Error: no .faber.toml found from $PWD" >&2; exit 1; }
```

All bash snippets below reference `"$WIKI_ROOT/faber.db"` and `python3 "$WIKI_ROOT/faber_sync.py"`.
Since each Bash tool call runs in a fresh subshell, either prepend the resolver to each block
or resolve once at the start and substitute the absolute path in subsequent calls.

## Usage

Run the sync script:

```bash
python3 "$WIKI_ROOT/faber_sync.py"
```

Options:
- `--wiki-dir <path>` — Override wiki directory (default: `wiki/`)
- `--no-index` — Skip regenerating `index.md`

## What It Does

1. Deletes existing `faber.db` (derived data, always rebuildable)
2. Parses YAML frontmatter from all pages in `wiki/sources/`, `wiki/entities/`, `wiki/concepts/`, `wiki/syntheses/`
3. Populates all tables: `pages`, `key_claims`, `aliases`, `vault_refs`, `page_relations`, `prose_wikilinks`
4. Builds FTS5 full-text search index
5. Creates prebuilt views: `v_dashboard`, `v_maturity`, `v_entity_connectivity`, `v_orphans`, `v_phantoms`, `v_thin_pages`, `v_confidence`
6. Regenerates `wiki/index.md` as a compact auto-generated dashboard
7. Logs sync metadata to `sync_log` table

## When to Run

- **After every ingest** — The last step of `/faber-ingest` should be `faber-sync`
- **After every seed** — Same for `/faber-seed`
- **On demand** — If `faber.db` is missing, stale, or the user asks
- **Safe to run anytime** — Idempotent, fast (~30ms for 40 pages)

## Verification

After sync, you can verify with:
```bash
sqlite3 $WIKI_ROOT/faber.db "SELECT * FROM v_dashboard;"
```
