#!/usr/bin/env bun
// pca-mcp-server — stdio MCP server exposing the Personal Context Agent core.
// All logs go to stderr; stdout is reserved for JSON-RPC.
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { loadDotenv, openStore, resolveStoreOptions } from "@pca/core";
import { buildServer } from "./server.ts";

async function main(): Promise<void> {
  // MCP is launched by Claude Code with arbitrary cwd, so Bun's automatic
  // .env discovery isn't reliable here — load it explicitly from this file's
  // location. Shared with the `ctx` CLI via @pca/core.
  const envPath = loadDotenv({ startDir: import.meta.dir });
  const opts = resolveStoreOptions();
  if (!opts.syncUrl) {
    process.stderr.write(
      "[pca-mcp-server] WARN: TURSO_DB_URL missing or unset, running in local-only mode\n",
    );
  }

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
