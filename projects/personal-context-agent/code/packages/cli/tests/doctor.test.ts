import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { withTempHome } from "./helpers.ts";
import { doctor } from "../src/pca-commands/doctor.ts";
import { initStore } from "../src/pca-commands/init.ts";
import { installMcp } from "../src/pca-commands/install-mcp.ts";
import { installSkill } from "../src/pca-commands/install-skill.ts";
import { openStore } from "@pca/core";

let home: string;
let cleanup: () => void;
let dbPath: string;
let mcpConfigPath: string;
let skillsDir: string;
let sourceSkill: string;

beforeEach(() => {
  const t = withTempHome();
  home = t.home;
  cleanup = t.cleanup;
  dbPath = join(home, ".pca", "store.db");
  mcpConfigPath = join(home, ".claude", "mcp.json");
  skillsDir = join(home, ".claude", "skills");
  sourceSkill = join(home, "SKILL.md");
  writeFileSync(sourceSkill, "---\nname: ctx-add\n---\n# skill\n");
});

afterEach(() => cleanup?.());

function fullyInstalled() {
  initStore({ dbPath });
  installMcp({
    mcpConfigPath,
    entry: { command: "/bin/true", env: { PCA_DB: dbPath } },
  });
  installSkill({ name: "ctx-add", sourcePath: sourceSkill, skillsDir });
}

function get(checks: { name: string; status: string }[], name: string) {
  return checks.find((c) => c.name === name);
}

describe("doctor", () => {
  test("all-ok install reports ok across the board", () => {
    fullyInstalled();
    const r = doctor({ dbPath, mcpConfigPath, skillsDir });
    expect(r.allOk).toBe(true);
    expect(get(r.checks, "db")?.status).toBe("ok");
    expect(get(r.checks, "mcp")?.status).toBe("ok");
    expect(get(r.checks, "skill")?.status).toBe("ok");
    expect(get(r.checks, "stale")?.status).toBe("ok");
  });

  test("missing DB → db check fails", () => {
    // mcp + skill set up, but no init
    mkdirSync(dirname(mcpConfigPath), { recursive: true });
    installMcp({ mcpConfigPath, entry: { command: "x" } });
    installSkill({ name: "ctx-add", sourcePath: sourceSkill, skillsDir });

    const r = doctor({ dbPath, mcpConfigPath, skillsDir });
    expect(r.allOk).toBe(false);
    expect(get(r.checks, "db")?.status).toBe("fail");
    // stale check skipped when db check fails
    expect(get(r.checks, "stale")).toBeUndefined();
  });

  test("missing MCP entry → mcp check fails", () => {
    initStore({ dbPath });
    mkdirSync(dirname(mcpConfigPath), { recursive: true });
    writeFileSync(mcpConfigPath, JSON.stringify({ mcpServers: { other: {} } }));
    installSkill({ name: "ctx-add", sourcePath: sourceSkill, skillsDir });

    const r = doctor({ dbPath, mcpConfigPath, skillsDir });
    expect(r.allOk).toBe(false);
    expect(get(r.checks, "mcp")?.status).toBe("fail");
  });

  test("missing MCP config file → mcp check fails", () => {
    initStore({ dbPath });
    installSkill({ name: "ctx-add", sourcePath: sourceSkill, skillsDir });

    const r = doctor({ dbPath, mcpConfigPath, skillsDir });
    expect(get(r.checks, "mcp")?.status).toBe("fail");
  });

  test("malformed MCP config JSON → mcp check fails (no throw)", () => {
    initStore({ dbPath });
    mkdirSync(dirname(mcpConfigPath), { recursive: true });
    writeFileSync(mcpConfigPath, "{not json");
    installSkill({ name: "ctx-add", sourcePath: sourceSkill, skillsDir });

    const r = doctor({ dbPath, mcpConfigPath, skillsDir });
    expect(get(r.checks, "mcp")?.status).toBe("fail");
  });

  test("missing skill file → skill check fails", () => {
    initStore({ dbPath });
    installMcp({ mcpConfigPath, entry: { command: "x" } });

    const r = doctor({ dbPath, mcpConfigPath, skillsDir });
    expect(get(r.checks, "skill")?.status).toBe("fail");
  });

  test("stale entities → warn (not fail)", () => {
    fullyInstalled();
    // Inject a stale entity directly via core.
    const store = openStore(dbPath);
    const past = new Date(Date.now() - 86_400_000).toISOString();
    store.createEntity(
      {
        type: "goal",
        title: "expired",
        attrs: { timeframe: "short" },
        expires_at: past,
      },
      "test",
    );
    store.close();

    const r = doctor({ dbPath, mcpConfigPath, skillsDir });
    expect(get(r.checks, "stale")?.status).toBe("warn");
    expect(r.allOk).toBe(true); // warn does not fail overall
  });

  test("custom expected schema version higher than actual → db check fails", () => {
    fullyInstalled();
    const r = doctor({
      dbPath,
      mcpConfigPath,
      skillsDir,
      expectedSchemaVersion: 999,
    });
    expect(get(r.checks, "db")?.status).toBe("fail");
  });

  test("custom expectedSkillName flips skill check", () => {
    fullyInstalled();
    const r = doctor({
      dbPath,
      mcpConfigPath,
      skillsDir,
      expectedSkillName: "not-installed-skill",
    });
    expect(get(r.checks, "skill")?.status).toBe("fail");
  });
});
