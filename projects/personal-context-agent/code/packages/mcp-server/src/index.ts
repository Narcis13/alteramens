#!/usr/bin/env bun
// pca-mcp-server — stdio MCP server exposing the Personal Context Agent core.
// All logs go to stderr; stdout is reserved for JSON-RPC.
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { openStore } from "@pca/core";
import { buildServer } from "./server.ts";

function resolveDbPath(): string {
  if (process.env.PCA_DB && process.env.PCA_DB.length > 0) return process.env.PCA_DB;
  return join(homedir(), ".pca", "store.db");
}

async function main(): Promise<void> {
  const dbPath = resolveDbPath();
  mkdirSync(dirname(dbPath), { recursive: true });

  const store = openStore(dbPath);
  const actor = process.env.PCA_ACTOR ?? "claude-code:mcp";
  const server = buildServer({ store, actor });

  const transport = new StdioServerTransport();

  process.on("SIGINT", () => shutdown(store, 0));
  process.on("SIGTERM", () => shutdown(store, 0));

  await server.connect(transport);
  process.stderr.write(`[pca-mcp-server] connected (db=${dbPath})\n`);
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
