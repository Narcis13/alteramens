// `pca install-mcp` — register the pca MCP server with a Claude Code MCP
// config file. Merges into existing `mcpServers` without clobbering other
// entries. Writes atomically (temp + rename). Backs up the previous file as
// `<file>.bak` (only when overwriting an existing file).

import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname } from "node:path";
import type { CommandResult } from "./util.ts";

export type ServerEntry = {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  description?: string;
};

export type InstallMcpOptions = {
  mcpConfigPath: string;
  serverName?: string; // defaults to "pca"
  entry: ServerEntry;
};

type McpConfig = {
  mcpServers?: Record<string, ServerEntry>;
  [key: string]: unknown;
};

export function installMcp(opts: InstallMcpOptions): CommandResult {
  const name = opts.serverName ?? "pca";
  const path = opts.mcpConfigPath;

  // Read existing or start fresh.
  let existing: McpConfig = {};
  let fileExisted = false;
  if (existsSync(path)) {
    fileExisted = true;
    const raw = readFileSync(path, "utf-8");
    try {
      existing = raw.trim().length === 0 ? {} : (JSON.parse(raw) as McpConfig);
    } catch (e) {
      return {
        ok: false,
        message: `Existing MCP config at ${path} is not valid JSON. Refusing to overwrite.`,
        detail: e instanceof Error ? e.message : String(e),
      };
    }
    if (typeof existing !== "object" || existing === null || Array.isArray(existing)) {
      return {
        ok: false,
        message: `Existing MCP config at ${path} is not a JSON object. Refusing to overwrite.`,
      };
    }
  }

  const servers = { ...(existing.mcpServers ?? {}) };
  const isUpdate = name in servers;
  servers[name] = opts.entry;

  const merged: McpConfig = { ...existing, mcpServers: servers };

  // Backup before overwriting.
  if (fileExisted) {
    try {
      writeFileSync(`${path}.bak`, readFileSync(path));
    } catch (e) {
      return {
        ok: false,
        message: `Failed to write backup ${path}.bak`,
        detail: e instanceof Error ? e.message : String(e),
      };
    }
  }

  // Atomic write: tmp + rename.
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(merged, null, 2)}\n`);
  renameSync(tmp, path);

  return {
    ok: true,
    message: isUpdate
      ? `Updated MCP server '${name}' in ${path}`
      : `Installed MCP server '${name}' in ${path}`,
  };
}
