---
title: "Faber Model B Migration — Library + Workshop"
type: doc
status: complete
created: 2026-04-07
completed: 2026-04-08
related:
  - "[[CLAUDE]]"
  - "[[wiki/FABER]]"
---

# Faber Model B Migration — Library + Workshop

## Status

| Stage | Description | Reached? |
|---|---|---|
| **A** | Vault-embedded wiki, free-form folders, conceptual roles documented | ✅ **2026-04-07** |
| **B** | Library + Workshop — physical role separation, wiki auto-discovery | ✅ **2026-04-08** |
| **C** | Multi-library federation (alteramens-wiki + health-it-wiki + ...) | 🔮 future |

This document captures **what was needed to move from Stage A → Stage B**. Stage A was a config file + mental model upgrade with zero risk. Stage B was the physical refactor that unlocked portability and multi-domain scaling. Both are now complete; the doc remains as an archaeological record of the migration.

---

## What Stage A delivered (already done)

1. **`wiki/.faber.toml`** marker file declares the wiki as a self-contained Faber library with explicit paths to vault root, slides output, and skill defaults.
2. **`CLAUDE.md`** updated with:
   - Vault role mapping (inbox / workshop / library / application)
   - Vault ↔ Wiki conceptual model
   - Promotion path from raw → structured → applied
   - "Where does this go?" decision rule
3. **No folders moved.** Existing free-form structure preserved. Roles are mental conventions, not enforced layout.

---

## What Stage B delivers

| Property | Stage A (now) | Stage B (target) |
|---|---|---|
| Vault layout | Free-form, role-by-convention | Physical separation: `inbox/`, `workshop/`, `projects/`, `wiki/` |
| Wiki portability | Marker file exists, but skills hardcode `wiki/` relative to cwd | Skills auto-discover via `.faber.toml` walk-up |
| `vault_refs` resolution | Implicitly relative to parent of `wiki/` | Explicitly relative to `vault_root` from config |
| Multi-domain readiness | Single wiki only | Wiki extractable to its own repo without breaking skills |
| `faber_sync.py` location | Inside `wiki/` (mixed content + tooling) | Optionally moved to `tools/faber/` (content stays pure) |

---

## Migration Steps (in order)

Each step is **independently committable** and reversible. Verify after each step before moving to the next.

### Step 1 — Create role-based vault folders

```bash
cd /Users/narcisbrindusescu/DEV/alteramens

# Create the new role-based structure (empty for now)
mkdir -p inbox workshop
```

**Verify:** `ls` shows `inbox/` and `workshop/` exist alongside existing folders.

---

### Step 2 — Migrate inbox content

Move raw, unprocessed material:

```bash
mv Clippings inbox/clippings
# Optionally: mv any other "raw saved articles" folders
```

**Verify:**
- `ls inbox/` shows `clippings/`
- Old `Clippings/` is gone
- Update any wikilinks `[[Clippings/...]]` → `[[inbox/clippings/...]]` (search vault for matches first)

```bash
# Find vault wikilinks that point to Clippings/
grep -r "\[\[Clippings/" . --include="*.md" --exclude-dir=wiki --exclude-dir=.git
```

---

### Step 3 — Migrate workshop content

Move drafty, exploratory material:

```bash
mv ideas workshop/ideas
mv concepts workshop/drafts        # rename: vault "concepts" become "drafts" to avoid confusion with wiki/concepts/
mv experiments workshop/experiments
mv notes workshop/notes
```

**Why rename `concepts/` → `workshop/drafts/`:** today both `concepts/` (vault) and `wiki/concepts/` exist, causing constant confusion. After Stage B, wiki has *the* concepts; the vault holds only *drafts that may become concepts*.

**Verify:**
- `ls workshop/` shows `ideas/ drafts/ experiments/ notes/`
- Update wikilinks across the vault:

```bash
grep -rn "\[\[ideas/" . --include="*.md" --exclude-dir=.git
grep -rn "\[\[concepts/" . --include="*.md" --exclude-dir=wiki --exclude-dir=.git
grep -rn "\[\[experiments/" . --include="*.md" --exclude-dir=.git
grep -rn "\[\[notes/" . --include="*.md" --exclude-dir=.git
```

For each match, rewrite the link path. **Important:** `wiki/concepts/` references are NOT vault concepts and should NOT be touched.

---

### Step 4 — Update wiki vault_refs and applications

Wiki pages have `vault_refs` and `applications` arrays in frontmatter pointing into the vault. Some of these now point to old paths.

```bash
# Find affected wiki pages
sqlite3 -readonly wiki/faber.db <<'SQL'
SELECT page_slug, vault_path, ref_type FROM vault_refs
WHERE vault_path LIKE 'concepts/%'
   OR vault_path LIKE 'ideas/%'
   OR vault_path LIKE 'experiments/%'
   OR vault_path LIKE 'notes/%'
   OR vault_path LIKE 'Clippings/%';
SQL
```

For each row, find and edit the corresponding wiki page's frontmatter:
- `concepts/foo.md` → `workshop/drafts/foo.md`
- `ideas/bar.md` → `workshop/ideas/bar.md`
- etc.

After edits, run `/faber-sync` to refresh `faber.db`.

**Verify:** the same query above returns zero rows.

---

### Step 5 — Update CLAUDE.md vault structure table

Replace the Stage A table with the Stage B physical structure (folders now match roles 1:1). Remove the "Stage A → Stage B" warning note since the migration is complete.

---

### Step 6 — Make skills wiki-discoverable

Update each `faber-*` skill to walk up from `cwd` looking for `.faber.toml`, then read paths from it instead of assuming `wiki/` is in cwd.

**Pattern to add at the start of every faber skill:**

```bash
# Discover the nearest Faber library
find_faber_root() {
    local dir="$PWD"
    while [ "$dir" != "/" ]; do
        if [ -f "$dir/wiki/.faber.toml" ]; then
            echo "$dir/wiki"
            return 0
        fi
        if [ -f "$dir/.faber.toml" ]; then
            echo "$dir"
            return 0
        fi
        dir=$(dirname "$dir")
    done
    return 1
}

WIKI_ROOT=$(find_faber_root) || { echo "No Faber library found"; exit 1; }
VAULT_ROOT=$(python3 -c "import tomllib; print(tomllib.load(open('$WIKI_ROOT/.faber.toml', 'rb'))['paths']['vault_root'])")
```

**Skills to update:**
- `faber-sync` — operate on `$WIKI_ROOT` instead of `wiki/`
- `faber-status` — same
- `faber-query` — same
- `faber-lint` — same
- `faber-link` — read `vault_root` from config; resolve vault_refs relative to it
- `faber-seed` — same
- `faber-ingest` — same; default `--origin vault` resolves paths under `vault_root`
- `faber-slides` — read `slides.output_dir` from config

**Verify:** `cd workshop/drafts/ && /faber-status` works (skill discovers wiki by walking up).

---

### Step 7 — Update FABER.md

Change the framing in the schema doc:

```diff
- Faber is a persistent, compounding knowledge base maintained by Claude Code.
- It sits inside the Alteramens Obsidian vault and accumulates a builder's knowledge.
+ Faber is a self-contained, portable knowledge library maintained by Claude Code.
+ It can live next to a workspace vault (the Alteramens setup) or stand alone.
+ See `wiki/.faber.toml` for the configuration that connects this library to its
+ surrounding workspace.
```

Also update the "Directory Structure" diagram to show the role-based vault layout next to the wiki.

---

### Step 8 — (Optional) Move `faber_sync.py` out of `wiki/`

Pure-content separation. Move the sync script to `tools/faber/sync.py`. Update `.faber.toml`:

```toml
[faber]
sync_script = "../tools/faber/sync.py"
```

And update `wiki/index.md` references and CLAUDE.md.

**This step is optional.** It's cleaner architecturally but provides no functional gain. Skip until you have a second wiki.

---

## Migration Verification Checklist

After all steps complete:

- [ ] `inbox/`, `workshop/`, `projects/`, `wiki/` exist as top-level folders
- [ ] `Clippings/`, `ideas/`, `concepts/` (vault), `experiments/`, `notes/` no longer exist at root
- [ ] All vault wikilinks resolve correctly (no broken `[[...]]`)
- [ ] `faber-sync` runs cleanly with zero warnings
- [ ] `sqlite3 wiki/faber.db "SELECT count(*) FROM v_phantoms"` returns 0
- [ ] `vault_refs` table contains zero references to old paths
- [ ] `cd workshop/drafts/ && /faber-status` works (auto-discovery)
- [ ] CLAUDE.md vault structure table reflects new layout
- [ ] FABER.md no longer says "sits inside the vault"
- [ ] One commit per step in git history (easy rollback)

---

## What Stage B does NOT do

Things deliberately left for Stage C:

- **Multiple wikis.** Stage B keeps a single wiki (alteramens). Stage C introduces parallel libraries.
- **Cross-library federation.** No cross-wiki queries. Each wiki is an island.
- **Wiki extraction to separate repo.** Stage B keeps the wiki in the same git repo as the workspace. Stage C may extract it.
- **Faber as a CLI tool.** Skills remain Bash + sqlite3 invocations. No `faber` Python package yet.
- **MCP server exposure.** No remote access to wikis via MCP. Future work.

---

## Stage C — Multi-Library Federation (sketch)

When you have a second domain (e.g. healthcare IT knowledge from your day job), Stage C kicks in:

```
~/notes/
├── alteramens/                    # current vault, post-Stage-B
│   ├── inbox/ workshop/ projects/ slides/
│   ├── wiki/ (.faber.toml: name=alteramens)
│   └── CLAUDE.md
│
├── health-it/                     # new domain
│   ├── inbox/ workshop/ projects/
│   ├── wiki/ (.faber.toml: name=health-it)
│   └── CLAUDE.md
│
└── shared/
    └── .claude/skills/faber-*/    # global skills, work on any wiki
```

**Benefits:**
- Domain isolation — Rails knowledge doesn't pollute healthcare knowledge
- Per-domain compounding — each wiki grows independently
- Skills are domain-agnostic — same `/faber-query` works on any wiki
- Publishable units — `health-it/wiki/` could become a public knowledge cartridge

**Cross-domain queries (future):** A federation layer can `UNION` SELECT across multiple `faber.db` files when needed. Implemented as a separate skill (`/faber-federated-query`).

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Broken wikilinks after folder moves | grep + sed pass after each move; verify with `/faber-lint` |
| `vault_refs` pointing to old paths | Step 4 explicitly catches these; verify with SQL query |
| Skill auto-discovery breaks for old workflows | Keep cwd-based fallback in skills for one cycle, then remove |
| Obsidian indexing confusion after rename | Reload Obsidian vault; check graph view |
| Git history harder to follow across moves | Use `git mv` for renames; commit each step separately |

---

## When to start Stage B

Triggers that say "now is the time":

- Wiki crosses ~100 pages and "where does this go?" becomes daily friction
- You start a second domain (work knowledge, side project) that wants its own wiki
- You want to publish the wiki as a standalone artifact
- You catch yourself doing `/faber-query` from the wrong directory and getting confused
- You want to share `wiki/` with someone without sharing your personal vault content

Until then, Stage A is sufficient and zero-friction.
