// `pca init` — create the PCA store directory and DB file.
// Idempotent: re-running on an existing DB is a no-op (schema migrations
// already applied are skipped by the core).

import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { openStore } from "@pca/core";
import type { CommandResult } from "./util.ts";

export function initStore(opts: { dbPath: string }): CommandResult {
  const { dbPath } = opts;
  const dir = dirname(dbPath);

  const existed = existsSync(dbPath);
  mkdirSync(dir, { recursive: true });

  // openStore runs migrations on first open; close immediately.
  const store = openStore(dbPath);
  const version =
    (
      store.db
        .prepare(
          "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1",
        )
        .get() as { version: number } | null
    )?.version ?? 0;
  store.close();

  return {
    ok: true,
    message: existed
      ? `Store already exists at ${dbPath} (schema v${version})`
      : `Initialized store at ${dbPath} (schema v${version})`,
  };
}
