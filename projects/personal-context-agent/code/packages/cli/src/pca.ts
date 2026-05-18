#!/usr/bin/env bun
// `pca` admin CLI — entry point. Thin layer over pure command functions in
// ./pca-commands/. All side-effects (printing, exit codes) live here.
//
// Subcommands:
//   pca init              [--db PATH]
//   pca install-mcp       [client]  [--config PATH] [--db PATH] [--bin NAME]
//   pca install-skill     <name>    [--skills-dir DIR] [--source PATH] [--force]
//   pca doctor            [--db PATH] [--config PATH] [--skills-dir DIR]
//   pca version
//   pca help

import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { defaultPaths, resolveServerCommand } from "./pca-commands/util.ts";
import type { CheckStatus, CommandResult, DoctorResult } from "./pca-commands/util.ts";
import { initStore } from "./pca-commands/init.ts";
import { installMcp } from "./pca-commands/install-mcp.ts";
import { installSkill } from "./pca-commands/install-skill.ts";
import { doctor } from "./pca-commands/doctor.ts";

const VERSION = "0.0.1";

const USAGE = `pca — Personal Context Agent admin CLI (v${VERSION})

Usage:
  pca init                            Create ~/.pca/store.db and run migrations
  pca install-mcp [client]            Register pca MCP server with a client
  pca install-skill <name>            Copy SKILL.md to ~/.claude/skills/<name>/
  pca doctor                          Verify install
  pca version
  pca help

Common flags:
  --db PATH                           Store path (default ~/.pca/store.db)
  --config PATH                       MCP config path (default ~/.claude/mcp.json)
  --skills-dir DIR                    Skills dir (default ~/.claude/skills)
  --source PATH                       Skill source SKILL.md (install-skill)
  --bin NAME                          MCP server bin name (default pca-mcp-server)
  --force                             Overwrite without prompt
`;

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const [cmd, ...rest] = argv;

  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
    process.stdout.write(USAGE);
    process.exit(cmd ? 0 : 1);
  }

  if (cmd === "version" || cmd === "--version" || cmd === "-v") {
    process.stdout.write(`pca ${VERSION}\n`);
    process.exit(0);
  }

  try {
    switch (cmd) {
      case "init":
        runInit(rest);
        break;
      case "install-mcp":
        runInstallMcp(rest);
        break;
      case "install-skill":
        runInstallSkill(rest);
        break;
      case "doctor":
        runDoctor(rest);
        break;
      default:
        process.stderr.write(`Unknown command: ${cmd}\n\n${USAGE}`);
        process.exit(1);
    }
  } catch (e) {
    process.stderr.write(
      `pca: ${e instanceof Error ? e.message : String(e)}\n`,
    );
    process.exit(1);
  }
}

// ── command dispatchers ─────────────────────────────────────────────────────

function runInit(args: string[]): void {
  const { values } = parseArgs({
    args,
    options: { db: { type: "string" } },
    strict: true,
  });
  const dbPath = values.db ?? defaultPaths().dbPath;
  finishCommand(initStore({ dbPath }));
}

function runInstallMcp(args: string[]): void {
  const { values, positionals } = parseArgs({
    args,
    options: {
      config: { type: "string" },
      db: { type: "string" },
      bin: { type: "string" },
    },
    allowPositionals: true,
    strict: true,
  });
  const client = positionals[0] ?? "claude-code";
  if (client !== "claude-code") {
    finishCommand({
      ok: false,
      message: `Only 'claude-code' is supported as MCP client in this MVP (got '${client}')`,
    });
    return;
  }
  const paths = defaultPaths();
  const dbPath = values.db ?? paths.dbPath;
  const mcpConfigPath = values.config ?? paths.mcpConfigPath;

  const cmd = resolveServerCommand({ binName: values.bin });
  if (!cmd) {
    finishCommand({
      ok: false,
      message:
        "Could not locate pca-mcp-server. Install it via npm or run from the monorepo.",
    });
    return;
  }

  finishCommand(
    installMcp({
      mcpConfigPath,
      entry: {
        command: cmd.command,
        args: cmd.args,
        env: { PCA_DB: dbPath },
        description: "Personal Context Agent — MCP server (Layer 1 tools)",
      },
    }),
  );
}

function runInstallSkill(args: string[]): void {
  const { values, positionals } = parseArgs({
    args,
    options: {
      "skills-dir": { type: "string" },
      source: { type: "string" },
      force: { type: "boolean" },
    },
    allowPositionals: true,
    strict: true,
  });
  const name = positionals[0];
  if (!name) {
    finishCommand({ ok: false, message: "install-skill: missing <name>" });
    return;
  }
  const skillsDir = values["skills-dir"] ?? defaultPaths().skillsDir;
  const sourcePath = values.source ?? defaultSkillSource(name);
  finishCommand(
    installSkill({ name, sourcePath, skillsDir, force: values.force ?? false }),
  );
}

function runDoctor(args: string[]): void {
  const { values } = parseArgs({
    args,
    options: {
      db: { type: "string" },
      config: { type: "string" },
      "skills-dir": { type: "string" },
    },
    strict: true,
  });
  const paths = defaultPaths();
  const result = doctor({
    dbPath: values.db ?? paths.dbPath,
    mcpConfigPath: values.config ?? paths.mcpConfigPath,
    skillsDir: values["skills-dir"] ?? paths.skillsDir,
  });
  process.stdout.write(formatDoctor(result));
  process.exit(result.allOk ? 0 : 1);
}

// ── helpers ─────────────────────────────────────────────────────────────────

function finishCommand(r: CommandResult): never {
  const stream = r.ok ? process.stdout : process.stderr;
  stream.write(`${r.message}\n`);
  if (r.detail) stream.write(`  ${r.detail}\n`);
  process.exit(r.ok ? 0 : 1);
}

const ICON: Record<CheckStatus, string> = {
  ok: "✓",
  warn: "⚠",
  fail: "✗",
};

function formatDoctor(r: DoctorResult): string {
  const lines = r.checks.map(
    (c) => `${ICON[c.status]} ${c.name.padEnd(8)} ${c.detail}`,
  );
  lines.push("");
  lines.push(r.allOk ? "All checks passed." : "One or more checks failed.");
  return `${lines.join("\n")}\n`;
}

function defaultSkillSource(name: string): string {
  // packages/cli/src/pca.ts → packages/skill-<name>/SKILL.md
  return resolve(
    import.meta.dir,
    "..",
    "..",
    `skill-${name}`,
    "SKILL.md",
  );
}

await main();
