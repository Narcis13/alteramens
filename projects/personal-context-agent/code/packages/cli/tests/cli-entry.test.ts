// End-to-end test of the actual `pca` entry script via Bun subprocess. Drives
// arg parsing + dispatch + exit codes without mocking. Uses a temp HOME so
// `--db`, `--config`, `--skills-dir` can be passed explicitly.

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { withTempHome } from "./helpers.ts";

const PCA = resolve(import.meta.dir, "..", "src", "pca.ts");
const SKILL_SOURCE = resolve(
  import.meta.dir,
  "..",
  "..",
  "skill-ctx-add",
  "SKILL.md",
);

let home: string;
let cleanup: () => void;

beforeEach(() => {
  const t = withTempHome();
  home = t.home;
  cleanup = t.cleanup;
});

afterEach(() => cleanup?.());

async function run(args: string[]): Promise<{
  exitCode: number;
  stdout: string;
  stderr: string;
}> {
  const proc = Bun.spawn(["bun", "run", PCA, ...args], {
    stdout: "pipe",
    stderr: "pipe",
  });
  const exitCode = await proc.exited;
  const stdout = await new Response(proc.stdout).text();
  const stderr = await new Response(proc.stderr).text();
  return { exitCode, stdout, stderr };
}

describe("pca entry script", () => {
  test("`pca version` exits 0 and prints version", async () => {
    const r = await run(["version"]);
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toMatch(/^pca \d/);
  });

  test("`pca` (no args) prints help and exits nonzero", async () => {
    const r = await run([]);
    expect(r.exitCode).toBe(1);
    expect(r.stdout).toContain("Usage:");
  });

  test("`pca help` exits 0", async () => {
    const r = await run(["help"]);
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain("Usage:");
  });

  test("`pca unknown-cmd` exits 1 with usage on stderr", async () => {
    const r = await run(["wat"]);
    expect(r.exitCode).toBe(1);
    expect(r.stderr).toContain("Unknown command");
  });

  test("`pca init --db PATH` creates the store", async () => {
    const dbPath = join(home, "store.db");
    const r = await run(["init", "--db", dbPath]);
    expect(r.exitCode).toBe(0);
    expect(existsSync(dbPath)).toBe(true);
  });

  test("`pca install-skill <name> --source ... --skills-dir ...` copies file", async () => {
    if (!existsSync(SKILL_SOURCE)) {
      // Test relies on SKILL.md existing in skill-ctx-add package.
      throw new Error(`Test prerequisite missing: ${SKILL_SOURCE}`);
    }
    const skillsDir = join(home, "skills");
    const r = await run([
      "install-skill",
      "ctx-add",
      "--source",
      SKILL_SOURCE,
      "--skills-dir",
      skillsDir,
    ]);
    expect(r.exitCode).toBe(0);
    expect(existsSync(join(skillsDir, "ctx-add", "SKILL.md"))).toBe(true);
  });

  test("`pca install-skill` without <name> exits 1", async () => {
    const r = await run(["install-skill", "--skills-dir", home]);
    expect(r.exitCode).toBe(1);
    expect(r.stderr).toContain("missing <name>");
  });

  test("`pca install-mcp` writes entry with env.PCA_DB", async () => {
    const config = join(home, "mcp.json");
    const dbPath = join(home, "store.db");
    const r = await run([
      "install-mcp",
      "claude-code",
      "--config",
      config,
      "--db",
      dbPath,
    ]);
    expect(r.exitCode).toBe(0);
    const parsed = JSON.parse(readFileSync(config, "utf-8"));
    expect(parsed.mcpServers.pca.env.PCA_DB).toBe(dbPath);
    expect(parsed.mcpServers.pca.command).toBeString();
  });

  test("`pca install-mcp other-client` rejects unsupported clients", async () => {
    const r = await run([
      "install-mcp",
      "claude-desktop",
      "--config",
      join(home, "mcp.json"),
    ]);
    expect(r.exitCode).toBe(1);
    expect(r.stderr).toContain("Only 'claude-code'");
  });

  test("`pca doctor` exits 0 after init + install-mcp + install-skill", async () => {
    if (!existsSync(SKILL_SOURCE)) return;
    const dbPath = join(home, "store.db");
    const config = join(home, "mcp.json");
    const skillsDir = join(home, "skills");

    await run(["init", "--db", dbPath]);
    await run(["install-mcp", "claude-code", "--config", config, "--db", dbPath]);
    await run([
      "install-skill",
      "ctx-add",
      "--source",
      SKILL_SOURCE,
      "--skills-dir",
      skillsDir,
    ]);

    const r = await run([
      "doctor",
      "--db",
      dbPath,
      "--config",
      config,
      "--skills-dir",
      skillsDir,
    ]);
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain("All checks passed");
  });

  test("`pca doctor` exits 1 when nothing is installed", async () => {
    const r = await run([
      "doctor",
      "--db",
      join(home, "missing.db"),
      "--config",
      join(home, "missing.json"),
      "--skills-dir",
      join(home, "missing-skills"),
    ]);
    expect(r.exitCode).toBe(1);
    expect(r.stdout).toContain("failed");
  });

  test("`pca doctor` warns (exit 0) when stale entities exist", async () => {
    if (!existsSync(SKILL_SOURCE)) return;
    const dbPath = join(home, "store.db");
    const config = join(home, "mcp.json");
    const skillsDir = join(home, "skills");
    await run(["init", "--db", dbPath]);
    await run(["install-mcp", "claude-code", "--config", config, "--db", dbPath]);
    await run([
      "install-skill",
      "ctx-add",
      "--source",
      SKILL_SOURCE,
      "--skills-dir",
      skillsDir,
    ]);

    // Inject a stale goal by calling core directly through the test helper.
    const { openStore } = await import("@pca/core");
    const store = openStore(dbPath);
    store.createEntity(
      {
        type: "goal",
        title: "stale",
        attrs: { timeframe: "short" },
        expires_at: new Date(Date.now() - 86_400_000).toISOString(),
      },
      "test",
    );
    store.close();

    const r = await run([
      "doctor",
      "--db",
      dbPath,
      "--config",
      config,
      "--skills-dir",
      skillsDir,
    ]);
    expect(r.exitCode).toBe(0); // warn != fail
    expect(r.stdout).toContain("⚠");
    expect(r.stdout).toContain("stale");
  });
});

