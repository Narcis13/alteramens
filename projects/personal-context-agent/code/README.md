# Personal Context Agent (PCA) — code

Implementation of the PCA MVP per `../prd-mvp.md` (v0.3).

## Deviations from PRD

- **Runtime/toolchain:** Bun (instead of pnpm + Node). Reason: avoids new global installs; Bun has built-in TypeScript, test runner, and SQLite.
- **SQLite driver:** `bun:sqlite` (instead of `better-sqlite3`). Reason: zero install, sync API, FTS5 supported.

## Layout

```
packages/
  core/             # @pca/core — store, schema, entity & primitive helpers (THIS SESSION)
  mcp-server/       # pca-mcp-server — stdio MCP wrapping core (NEXT SESSION)
  cli/              # ctx + pca binaries (LATER)
  skill-ctx-add/    # Claude Code skill (LATER)
```

## Commands

```sh
bun install
bun test                  # all tests
bun test packages/core    # core tests only
```
