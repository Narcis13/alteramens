// Shared types + path resolution for `pca` subcommands.
//
// Every command function is pure: takes resolved paths in, returns a
// CommandResult, never touches process.exit / console directly. The entry
// script (../pca.ts) prints + exits.

import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { existsSync } from "node:fs";

export type CommandResult = {
  ok: boolean;
  message: string;
  detail?: string;
};

export type CheckStatus = "ok" | "fail" | "warn";

export type Check = {
  name: string;
  status: CheckStatus;
  detail: string;
};

export type DoctorResult = {
  checks: Check[];
  allOk: boolean;
};

export type PcaPaths = {
  dbPath: string;
  mcpConfigPath: string;
  skillsDir: string;
};

export function defaultPaths(home: string = homedir()): PcaPaths {
  return {
    dbPath: join(home, ".pca", "store.db"),
    mcpConfigPath: join(home, ".claude", "mcp.json"),
    skillsDir: join(home, ".claude", "skills"),
  };
}

/**
 * Locate the pca-mcp-server executable. Returns the {command, args} pair to
 * embed into the MCP client config.
 *
 * Strategy:
 *   1. If `pca-mcp-server` is in PATH, use it directly (production install).
 *   2. Else, fall back to `bun run <abs path to packages/mcp-server/src/index.ts>`
 *      relative to this CLI's source location (dev/monorepo mode).
 *   3. If neither is resolvable, return null — caller surfaces the error.
 */
export function resolveServerCommand(opts?: {
  binName?: string;
  monorepoServerPath?: string;
}): { command: string; args: string[] } | null {
  const binName = opts?.binName ?? "pca-mcp-server";
  const fromPath = Bun.which(binName);
  if (fromPath) return { command: fromPath, args: [] };

  const fallback =
    opts?.monorepoServerPath ??
    resolve(import.meta.dir, "..", "..", "..", "mcp-server", "src", "index.ts");
  if (existsSync(fallback)) {
    const bun = Bun.which("bun") ?? "bun";
    return { command: bun, args: ["run", fallback] };
  }
  return null;
}
