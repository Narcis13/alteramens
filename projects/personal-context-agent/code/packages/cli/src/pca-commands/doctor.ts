// `pca doctor` — health checks over the PCA install. Each check returns a
// {name, status, detail}. Caller decides exit code: any 'fail' → nonzero.

import { accessSync, constants, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { openStore } from "@pca/core";
import type { Check, DoctorResult } from "./util.ts";

export type DoctorOptions = {
  dbPath: string;
  mcpConfigPath: string;
  skillsDir: string;
  expectedSchemaVersion?: number;
  expectedMcpServerName?: string;
  expectedSkillName?: string;
};

export async function doctor(opts: DoctorOptions): Promise<DoctorResult> {
  const checks: Check[] = [
    await checkDb(opts),
    checkMcp(opts),
    checkSkill(opts),
  ];
  // Stale-entities check runs only if DB check passed.
  if (checks[0]!.status !== "fail") {
    checks.push(await checkStale(opts));
  }
  return { checks, allOk: checks.every((c) => c.status !== "fail") };
}

// ── individual checks ────────────────────────────────────────────────────────

async function checkDb(opts: DoctorOptions): Promise<Check> {
  // Bumped to 4 with Phase B (raw-capture stream). DBs older than this lack
  // the `captures` schema and will fail every /ctx-add call that opens a
  // capture in Step 0.4. Re-running `pca init` re-applies migrations safely.
  const expected = opts.expectedSchemaVersion ?? 4;
  if (!existsSync(opts.dbPath)) {
    return {
      name: "db",
      status: "fail",
      detail: `DB missing at ${opts.dbPath} — run 'pca init'`,
    };
  }
  try {
    accessSync(opts.dbPath, constants.R_OK | constants.W_OK);
  } catch {
    return {
      name: "db",
      status: "fail",
      detail: `DB not readable/writable at ${opts.dbPath}`,
    };
  }
  let actual: number | null = null;
  try {
    const store = await openStore({ url: `file:${opts.dbPath}` });
    const result = await store.client.execute(
      "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1",
    );
    const row = result.rows[0] as unknown as { version: number } | undefined;
    actual = row?.version ?? null;
    store.close();
  } catch (e) {
    return {
      name: "db",
      status: "fail",
      detail: `Cannot open store: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
  if (actual === null) {
    return {
      name: "db",
      status: "fail",
      detail: "No schema migrations recorded — DB is malformed",
    };
  }
  if (actual < expected) {
    return {
      name: "db",
      status: "fail",
      detail: `Schema version ${actual} < expected ${expected}. Re-open via 'pca init' to migrate.`,
    };
  }
  return {
    name: "db",
    status: "ok",
    detail: `Store at ${opts.dbPath} (schema v${actual})`,
  };
}

function checkMcp(opts: DoctorOptions): Check {
  const name = opts.expectedMcpServerName ?? "pca";
  if (!existsSync(opts.mcpConfigPath)) {
    return {
      name: "mcp",
      status: "fail",
      detail: `MCP config missing at ${opts.mcpConfigPath} — run 'pca install-mcp'`,
    };
  }
  let parsed: { mcpServers?: Record<string, unknown> };
  try {
    parsed = JSON.parse(readFileSync(opts.mcpConfigPath, "utf-8")) as {
      mcpServers?: Record<string, unknown>;
    };
  } catch (e) {
    return {
      name: "mcp",
      status: "fail",
      detail: `MCP config not valid JSON: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
  const servers = parsed.mcpServers ?? {};
  if (!(name in servers)) {
    return {
      name: "mcp",
      status: "fail",
      detail: `'${name}' MCP server not registered in ${opts.mcpConfigPath} — run 'pca install-mcp'`,
    };
  }
  return {
    name: "mcp",
    status: "ok",
    detail: `'${name}' registered in ${opts.mcpConfigPath}`,
  };
}

function checkSkill(opts: DoctorOptions): Check {
  const name = opts.expectedSkillName ?? "ctx-add";
  const target = join(opts.skillsDir, name, "SKILL.md");
  if (!existsSync(target)) {
    return {
      name: "skill",
      status: "fail",
      detail: `Skill '${name}' not installed (expected at ${target}) — run 'pca install-skill ${name}'`,
    };
  }
  return {
    name: "skill",
    status: "ok",
    detail: `Skill '${name}' present at ${target}`,
  };
}

async function checkStale(opts: DoctorOptions): Promise<Check> {
  try {
    const store = await openStore({ url: `file:${opts.dbPath}` });
    const stale = await store.listStale();
    store.close();
    if (stale.length === 0) {
      return { name: "stale", status: "ok", detail: "No stale entities" };
    }
    return {
      name: "stale",
      status: "warn",
      detail: `${stale.length} stale entit${stale.length === 1 ? "y" : "ies"} — run 'ctx review --stale' (coming in next session)`,
    };
  } catch (e) {
    return {
      name: "stale",
      status: "warn",
      detail: `Could not query stale entities: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}
