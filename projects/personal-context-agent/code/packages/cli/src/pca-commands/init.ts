// `pca init` — create the PCA store directory and DB file.
// Idempotent: re-running on an existing DB is a no-op (schema migrations
// already applied are skipped by the core).

import { existsSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { openStore } from "@pca/core";
import type { CommandResult } from "./util.ts";

export async function initStore(opts: { dbPath: string }): Promise<CommandResult> {
  const { dbPath } = opts;
  const dir = dirname(dbPath);

  const existed = existsSync(dbPath);
  mkdirSync(dir, { recursive: true });

  // openStore runs migrations on first open; close immediately. CLI is
  // local-only (see plan-turso-sync.md §D11) so no syncUrl is passed.
  const store = await openStore({ url: `file:${dbPath}` });
  const result = await store.client.execute(
    "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1",
  );
  const row = result.rows[0] as unknown as { version: number } | undefined;
  const version = row?.version ?? 0;
  store.close();

  return {
    ok: true,
    message: existed
      ? `Store already exists at ${dbPath} (schema v${version})`
      : `Initialized store at ${dbPath} (schema v${version})`,
  };
}
