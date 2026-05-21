// Shared environment + store-options resolver used by both the MCP server and
// the `ctx` CLI. Keeps the two surfaces pointing at the same Turso-backed
// embedded replica without duplicating the resolution logic.

import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { OpenStoreOptions } from "./store.ts";

/**
 * Find and load the monorepo `code/.env` file from a known starting directory.
 * `startDir` should be `import.meta.dir` of the caller (mcp-server or cli).
 * Both entry points live at `code/packages/X/src/Y.ts`, so the `.env` sits
 * three levels up. `process.loadEnvFile` would be neat but isn't present in
 * Bun 1.3.x — parse the file ourselves.
 *
 * Existing `process.env` values (e.g. ones passed by Claude Code MCP config)
 * win — the file fills in missing keys only.
 *
 * Returns the absolute path of the loaded file, or null if not found.
 */
export function loadDotenv(opts?: { startDir?: string }): string | null {
  const startDir = opts?.startDir;
  if (!startDir) return null;
  const candidate = join(startDir, "..", "..", "..", ".env");
  if (!existsSync(candidate)) return null;
  let text: string;
  try {
    text = readFileSync(candidate, "utf-8");
  } catch {
    return null;
  }
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
  return candidate;
}

/**
 * Build `OpenStoreOptions` from the current process.env.
 *
 * When `dbOverride` is provided (e.g. via `ctx log --db PATH`), the result is
 * a local-only store at that path — sync is skipped even if Turso env vars
 * are set. This is the escape hatch for tests and one-off inspections of an
 * arbitrary local SQLite file.
 *
 * Otherwise the local file path is resolved in this order:
 *   1. `PCA_LOCAL_REPLICA`             (embedded-replica file, preferred)
 *   2. `PCA_DB`                        (legacy local-only file)
 *   3. `~/.pca/local-replica.db`       (default replica location)
 *
 * Sync is enabled iff `TURSO_DB_URL` is set and doesn't look like a
 * placeholder (`<...>`).
 */
export function resolveStoreOptions(opts?: {
  dbOverride?: string;
}): OpenStoreOptions {
  if (opts?.dbOverride && opts.dbOverride.length > 0) {
    return { url: `file:${opts.dbOverride}` };
  }
  const localPath =
    process.env.PCA_LOCAL_REPLICA && process.env.PCA_LOCAL_REPLICA.length > 0
      ? process.env.PCA_LOCAL_REPLICA
      : process.env.PCA_DB && process.env.PCA_DB.length > 0
        ? process.env.PCA_DB
        : join(homedir(), ".pca", "local-replica.db");
  const syncUrl = process.env.TURSO_DB_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  const syncInterval = process.env.PCA_SYNC_INTERVAL_SEC
    ? Number(process.env.PCA_SYNC_INTERVAL_SEC)
    : undefined;
  if (!syncUrl || syncUrl.startsWith("<")) {
    return { url: `file:${localPath}` };
  }
  return {
    url: `file:${localPath}`,
    syncUrl,
    authToken,
    syncInterval,
  };
}
