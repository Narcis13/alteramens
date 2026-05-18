# Personal Context Agent (PCA) — code

Implementation of the PCA MVP per `../prd-mvp.md` (v0.3).

## Deviations from PRD

- **Runtime/toolchain:** Bun (instead of pnpm + Node). Reason: avoids new global installs; Bun has built-in TypeScript, test runner, and SQLite.
- **SQLite driver:** `bun:sqlite` (instead of `better-sqlite3`). Reason: zero install, sync API, FTS5 supported.

## Layout

```
packages/
  core/             # @pca/core — store, schema, entity & primitive helpers (DONE)
  mcp-server/       # pca-mcp-server — stdio MCP wrapping core (DONE)
  cli/              # pca admin binary (DONE) + ctx read-only binary (NEXT SESSION)
  skill-ctx-add/    # Claude Code /ctx-add skill — SKILL.md v0 (DONE)
```

## Admin CLI (`pca`)

Subcommands:

```sh
bun run packages/cli/src/pca.ts init                  # ~/.pca/store.db
bun run packages/cli/src/pca.ts install-mcp claude-code
bun run packages/cli/src/pca.ts install-skill ctx-add
bun run packages/cli/src/pca.ts doctor
bun run packages/cli/src/pca.ts version
```

All paths can be overridden via `--db`, `--config`, `--skills-dir`, `--source`
flags (used by the test suite to drive temp dirs).

## MCP server

Binary: `bun packages/mcp-server/src/index.ts`. Reads `$PCA_DB` (default
`~/.pca/store.db`). Six tools per PRD §7: `get_self_summary`,
`get_relevant_context`, `record_observation`, `update_entity`,
`confirm_entity`, `list_active`. Tests cover both the pure handler layer and
the SDK wiring (via `InMemoryTransport`).

## Commands

```sh
bun install
bun test                  # all tests
bun test packages/core    # core tests only
```
