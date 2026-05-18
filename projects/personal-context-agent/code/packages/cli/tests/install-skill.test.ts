import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { withTempHome } from "./helpers.ts";
import { installSkill } from "../src/pca-commands/install-skill.ts";

let home: string;
let cleanup: () => void;
let skillsDir: string;
let sourcePath: string;
const SKILL_CONTENT = "---\nname: ctx-add\n---\n\n# Test skill\n";

beforeEach(() => {
  const t = withTempHome();
  home = t.home;
  cleanup = t.cleanup;
  skillsDir = join(home, ".claude", "skills");
  sourcePath = join(home, "source-SKILL.md");
  writeFileSync(sourcePath, SKILL_CONTENT);
});

afterEach(() => cleanup?.());

describe("install-skill", () => {
  test("creates target dir + copies SKILL.md", () => {
    const r = installSkill({ name: "ctx-add", sourcePath, skillsDir });
    expect(r.ok).toBe(true);
    const target = join(skillsDir, "ctx-add", "SKILL.md");
    expect(existsSync(target)).toBe(true);
    expect(readFileSync(target, "utf-8")).toBe(SKILL_CONTENT);
  });

  test("idempotent when target already has identical content", () => {
    installSkill({ name: "ctx-add", sourcePath, skillsDir });
    const r2 = installSkill({ name: "ctx-add", sourcePath, skillsDir });
    expect(r2.ok).toBe(true);
    expect(r2.message).toContain("already installed");
    expect(existsSync(join(skillsDir, "ctx-add", "SKILL.md.bak"))).toBe(false);
  });

  test("backs up existing divergent target if force=false", () => {
    installSkill({ name: "ctx-add", sourcePath, skillsDir });
    const target = join(skillsDir, "ctx-add", "SKILL.md");
    writeFileSync(target, "different content");

    installSkill({ name: "ctx-add", sourcePath, skillsDir });
    expect(existsSync(`${target}.bak`)).toBe(true);
    expect(readFileSync(`${target}.bak`, "utf-8")).toBe("different content");
    expect(readFileSync(target, "utf-8")).toBe(SKILL_CONTENT);
  });

  test("force=true overwrites without backup", () => {
    installSkill({ name: "ctx-add", sourcePath, skillsDir });
    const target = join(skillsDir, "ctx-add", "SKILL.md");
    writeFileSync(target, "different");

    const r = installSkill({ name: "ctx-add", sourcePath, skillsDir, force: true });
    expect(r.ok).toBe(true);
    expect(existsSync(`${target}.bak`)).toBe(false);
    expect(readFileSync(target, "utf-8")).toBe(SKILL_CONTENT);
  });

  test("rejects invalid names containing path separators or '..'", () => {
    for (const bad of ["../escape", "foo/bar", ""]) {
      const r = installSkill({ name: bad, sourcePath, skillsDir });
      expect(r.ok).toBe(false);
    }
  });

  test("reports missing source", () => {
    const r = installSkill({
      name: "ctx-add",
      sourcePath: join(home, "does-not-exist.md"),
      skillsDir,
    });
    expect(r.ok).toBe(false);
    expect(r.message).toContain("not found");
  });

  test("preserves sibling skills in the same dir", () => {
    mkdirSync(join(skillsDir, "other-skill"), { recursive: true });
    writeFileSync(join(skillsDir, "other-skill", "SKILL.md"), "other");
    installSkill({ name: "ctx-add", sourcePath, skillsDir });
    expect(readFileSync(join(skillsDir, "other-skill", "SKILL.md"), "utf-8")).toBe(
      "other",
    );
  });
});
