---
title: "PCA — Live test learnings"
project: personal-context-agent
status: live-test
started: 2026-05-18
prd: prd-mvp.md (v0.3, §18 step 9)
---

# PCA Live Test — Learnings & Friction Log

> **Purpose.** Log everything that creates friction, surprises, or insights during real daily use of `/ctx-add` + `ctx` CLI + MCP tools. Per PRD §18 step 9: "Live test 7 zile — daily use, log în `learnings.md`".

---

## Bootstrap — 2026-05-18

**Sequence executed (from `code/` dir):**

```sh
bun run packages/cli/src/pca.ts init
bun run packages/cli/src/pca.ts install-skill ctx-add
bun run packages/cli/src/pca.ts install-mcp claude-code
bun run packages/cli/src/pca.ts doctor
```

**State produced:**
- `~/.pca/store.db` — schema v1, 16 tables (entities, events, links, annotations, tags, entity_tags, sources, entity_sources, projects, schema_migrations, sqlite_sequence, fts_entities + 4 fts internals).
- `~/.claude/skills/ctx-add/SKILL.md` — installed.
- `~/.claude/mcp.json` — `pca` entry merged alongside existing `clipboard`; `mcp.json.bak` written.
- Doctor: 4/4 checks pass.

**Initial observations / friction:**

1. **No `pca`/`pca-mcp-server` binary in PATH.** Per PRD §5.1 the bootstrap reads `npm install -g @alteramens/pca` then `pca init ...`. In dev/monorepo mode every invocation is `bun run packages/cli/src/pca.ts <cmd>`. Workable for the live test, but ergonomics differ: long commands, must `cd` into `code/`. **Action item:** before publishing, add `package.json` `bin` entries so global install yields short commands; or document a `pca` shell function in the README that wraps `bun run`.

2. **`install-mcp` fallback writes monorepo absolute path.** `~/.claude/mcp.json` now contains `bun run /Users/.../code/packages/mcp-server/src/index.ts`. Pros: zero install friction. Cons: if monorepo path moves, MCP server breaks silently. **Action item:** `pca doctor` should re-resolve the path on every run and warn on mismatch.

3. **Skill hot-reloads; MCP server does not.** As soon as `install-skill` copied SKILL.md, `/ctx-add` appeared in Claude Code's skill list mid-session — no restart needed for the skill. The MCP server, by contrast, is only picked up at Claude Code start, so even with the skill visible the `record_observation` call would fail until a restart. **This is the single most important onboarding gotcha** and must be in the README / `pca doctor` output.

4. **MCP server stderr discipline confirmed.** Smoke test (`initialize` handshake piped over stdio) returned a clean JSON-RPC response on stdout; the "connected" log went to stderr as PRD §11.5 requires. No corruption risk.

---

## 10-capture exercise — 2026-05-18

> Fill this in as you go. Goal: 10 `/ctx-add` invocations spanning ≥ 6 of the 12 entity types. After each capture note: time-to-save, classification correctness (accept / edit / split / reject), surprises.

**Pre-flight checklist:**
- [ ] Restart Claude Code (so the new `pca` MCP server loads).
- [ ] In any project, run `/ctx-add` with a real fact about yourself.
- [ ] Confirm the skill calls the MCP `record_observation` tool (not just an LLM hallucination of saving).
- [ ] After ≥ 1 capture, run `ctx list role` (or whatever type you captured) from terminal to verify the row really exists in `~/.pca/store.db`.

### Capture log

| # | Time | Input (raw) | Proposed type | Edit needed? | Time-to-save | Notes |
|---|------|-------------|---------------|--------------|--------------|-------|
| 1 |  |  |  |  |  |  |
| 2 |  |  |  |  |  |  |
| 3 |  |  |  |  |  |  |
| 4 |  |  |  |  |  |  |
| 5 |  |  |  |  |  |  |
| 6 |  |  |  |  |  |  |
| 7 |  |  |  |  |  |  |
| 8 |  |  |  |  |  |  |
| 9 |  |  |  |  |  |  |
| 10 |  |  |  |  |  |  |

### Type-coverage check (after 10 captures)

Run from `code/` dir:

```sh
sqlite3 ~/.pca/store.db "SELECT type, COUNT(*) FROM entities GROUP BY type ORDER BY COUNT(*) DESC;"
```

Expected: ≥ 6 of the 12 types touched (PRD success criteria §12 #3).

### Friction observed

- (add bullet per friction event — wrong classification, slow round-trip, confusing confirm UX, etc.)

### Surprises

- (positive or negative — things that worked better/worse than expected)

---

## Demo-loop test — after capture set is complete

Per PRD §12 success criteria #3: ask Claude Code something like "cum mă recomanzi să-mi structurez săptămâna" in a fresh conversation. Expect the answer to cite ≥ 5 entities from ≥ 3 different types.

**Verification SQL:**

```sh
# Did Claude call get_self_summary / list_active recently?
sqlite3 ~/.pca/store.db "SELECT occurred_at, actor, operation, entity_id FROM events ORDER BY occurred_at DESC LIMIT 20;"
```

- Result: ?
- Citations in Claude's reply (entities × types): ?
- Pass / fail vs success criterion: ?

---

## Open issues to fix before declaring MVP done

- [ ] (populate as we go)

---

## Notes for next session

- (anything you don't want to forget)
