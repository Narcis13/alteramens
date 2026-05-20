#!/usr/bin/env bun
// pca-mcp-server — stdio MCP server exposing the Personal Context Agent core.
// All logs go to stderr; stdout is reserved for JSON-RPC.
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { openStore, type OpenStoreOptions } from "@pca/core";
import { buildServer } from "./server.ts";

// MCP is launched by Claude Code with arbitrary cwd, so Bun's automatic
// .env discovery isn't reliable here. Walk up from this file to find
// `code/.env` (the monorepo root). `process.loadEnvFile` would be neat but
// isn't present in Bun 1.3.x — parse the file ourselves.
function loadEnv(): string | null {
  const candidate = join(import.meta.dir, "..", "..", "..", ".env");
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
    // Existing process.env values (passed by Claude Code config) win.
    if (process.env[key] === undefined) process.env[key] = value;
  }
  return candidate;
}

function resolveStoreOptions(): OpenStoreOptions {
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
    process.stderr.write(
      "[pca-mcp-server] WARN: TURSO_DB_URL missing or unset, running in local-only mode\n",
    );
    return { url: `file:${localPath}` };
  }
  return {
    url: `file:${localPath}`,
    syncUrl,
    authToken,
    syncInterval,
  };
}

async function main(): Promise<void> {
  const envPath = loadEnv();
  const opts = resolveStoreOptions();

  // url is always `file:<absolute path>` here; strip the scheme to ensure
  // the parent directory exists before libsql touches it.
  const localFile = opts.url.replace(/^file:/, "");
  mkdirSync(dirname(localFile), { recursive: true });

  const store = await openStore(opts);
  const actor = process.env.PCA_ACTOR ?? "claude-code:mcp";
  const server = buildServer({ store, actor });

  const transport = new StdioServerTransport();

  process.on("SIGINT", () => shutdown(store, 0));
  process.on("SIGTERM", () => shutdown(store, 0));

  await server.connect(transport);

  const syncDesc = opts.syncUrl
    ? `sync=${opts.syncInterval ?? 60}s, remote=${opts.syncUrl}`
    : "local-only";
  const envDesc = envPath ? ` (env=${envPath})` : "";
  process.stderr.write(
    `[pca-mcp-server] connected (replica=${localFile}, ${syncDesc})${envDesc}\n`,
  );
}

function shutdown(store: { close: () => void }, code: number): never {
  try {
    store.close();
  } catch {
    // ignore
  }
  process.exit(code);
}

main().catch((e: unknown) => {
  process.stderr.write(
    `[pca-mcp-server] fatal: ${e instanceof Error ? e.stack ?? e.message : String(e)}\n`,
  );
  process.exit(1);
});
