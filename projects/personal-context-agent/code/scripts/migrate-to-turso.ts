#!/usr/bin/env bun
// One-shot: pump rows from a legacy bun:sqlite store (the pre-Turso backup)
// into Turso via @libsql/client. Idempotent through INSERT OR IGNORE — every
// primary key is a ULID or an explicit AUTOINCREMENT id, so re-running is
// safe.
//
// Usage:
//   bun run scripts/migrate-to-turso.ts <path-to-legacy-store.db>
//
// Reads TURSO_DB_URL / TURSO_AUTH_TOKEN from code/.env (loaded explicitly
// because Bun's automatic .env discovery depends on cwd).
//
// Schema bootstrap is handled by openStore(): the first connect runs SQL
// migrations against the embedded replica, and writes propagate to remote.
// FTS and views are NOT copied — FTS is rebuilt automatically by per-row
// triggers, and views are part of the schema migrations.

import { Database } from "bun:sqlite";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { openStore } from "@pca/core";

// FK-correct insertion order. Captures-and-friends are append-only and never
// referenced by entities/links/etc., so they slot in after the core graph.
const TABLES_IN_ORDER = [
  "schema_migrations",
  "entities",
  "links",
  "events",
  "captures",
  "annotations",
  "sources",
  "tags",
  "entity_sources",
  "entity_tags",
  "projects",
  "capture_entities",
  "capture_links",
] as const;

// Minimal .env parser — `process.loadEnvFile` isn't available in all Bun
// versions, and we only need KEY=VALUE for two known keys.
function loadEnv(): string {
  const candidate = join(import.meta.dir, "..", ".env");
  if (!existsSync(candidate)) {
    throw new Error(`Missing ${candidate}. Phase 0 must run first.`);
  }
  const text = readFileSync(candidate, "utf-8");
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

async function main(): Promise<void> {
  const arg = process.argv[2];
  if (!arg) {
    process.stderr.write(
      "Usage: bun run scripts/migrate-to-turso.ts <path-to-legacy-store.db>\n",
    );
    process.exit(2);
  }
  const legacyPath = resolve(arg);
  if (!existsSync(legacyPath)) {
    process.stderr.write(`Legacy DB not found: ${legacyPath}\n`);
    process.exit(2);
  }

  const envPath = loadEnv();
  const syncUrl = process.env.TURSO_DB_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (
    !syncUrl ||
    syncUrl.startsWith("<") ||
    !authToken ||
    authToken.startsWith("<")
  ) {
    process.stderr.write(
      `TURSO_DB_URL / TURSO_AUTH_TOKEN missing or unset in ${envPath}.\n`,
    );
    process.exit(2);
  }

  // Temp replica so we don't fight a running MCP that may hold
  // ~/.pca/local-replica.db open. Cleaned up on success.
  const tmpReplica = join(tmpdir(), `pca-migration-${Date.now()}.db`);
  if (existsSync(tmpReplica)) rmSync(tmpReplica);

  console.log(`legacy:  ${legacyPath}`);
  console.log(`replica: ${tmpReplica}`);
  console.log(`remote:  ${syncUrl}`);
  console.log("");

  const legacy = new Database(legacyPath, { readonly: true });

  const store = await openStore({
    url: `file:${tmpReplica}`,
    syncUrl,
    authToken,
    syncInterval: 60,
  });

  console.log("Schema bootstrapped on Turso (via openStore.runMigrations).");
  console.log("");

  let totalInserted = 0;
  let totalSkipped = 0;

  for (const table of TABLES_IN_ORDER) {
    const tableExists = legacy
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = ?`)
      .get(table) as { name: string } | undefined;
    if (!tableExists) {
      console.log(`-- ${table.padEnd(20)} not in legacy DB, skipped`);
      continue;
    }

    const rows = legacy
      .prepare(`SELECT * FROM ${table}`)
      .all() as Record<string, unknown>[];
    if (rows.length === 0) {
      console.log(`-- ${table.padEnd(20)} 0 rows`);
      continue;
    }

    const columns = Object.keys(rows[0]!);
    const colList = columns.map((c) => `"${c}"`).join(", ");
    const placeholders = columns.map(() => "?").join(", ");
    const sql = `INSERT OR IGNORE INTO ${table} (${colList}) VALUES (${placeholders})`;

    let inserted = 0;
    let skipped = 0;
    for (const row of rows) {
      const args = columns.map((c) => {
        const v = (row as Record<string, unknown>)[c];
        return v === undefined ? null : (v as never);
      });
      const res = await store.client.execute({ sql, args });
      if (res.rowsAffected > 0) inserted++;
      else skipped++;
    }
    console.log(
      `++ ${table.padEnd(20)} ${inserted} inserted, ${skipped} skipped (${rows.length} total)`,
    );
    totalInserted += inserted;
    totalSkipped += skipped;
  }

  console.log("");
  console.log("Sync flush…");
  await store.sync();

  console.log("");
  console.log("Verification (legacy vs remote):");
  let allOk = true;
  for (const table of TABLES_IN_ORDER) {
    const legacyRow = legacy
      .prepare(`SELECT COUNT(*) AS n FROM ${table}`)
      .get() as { n: number } | undefined;
    const legacyCount = Number(legacyRow?.n ?? 0);

    const remoteRes = await store.client.execute(
      `SELECT COUNT(*) AS n FROM ${table}`,
    );
    const remoteCount = Number((remoteRes.rows[0] as { n: number }).n);

    // Remote can legitimately have MORE rows than legacy (schema_migrations
    // gets fresh entries from openStore's runMigrations against Turso).
    // Fewer = missing data = failure.
    const ok = remoteCount >= legacyCount;
    if (!ok) allOk = false;
    console.log(
      `  ${(ok ? "ok" : "DIFF").padEnd(4)} ${table.padEnd(20)} legacy=${legacyCount} remote=${remoteCount}`,
    );
  }

  legacy.close();
  store.close();

  if (allOk) {
    for (const f of [tmpReplica, `${tmpReplica}-wal`, `${tmpReplica}-shm`]) {
      try {
        if (existsSync(f)) rmSync(f);
      } catch {
        // best-effort cleanup; nothing else holds these handles by now
      }
    }
    console.log("");
    console.log(
      `Done. ${totalInserted} rows inserted, ${totalSkipped} already present on remote.`,
    );
    process.exit(0);
  } else {
    process.stderr.write(
      `\nFAILED: remote row counts < legacy. Temp replica retained at ${tmpReplica}\n`,
    );
    process.exit(1);
  }
}

await main();
