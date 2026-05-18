// `pca install-skill <name>` — copy a SKILL.md from the monorepo into the
// user's Claude skills dir. Default target: ~/.claude/skills/<name>/SKILL.md.
//
// Source must be the SKILL.md file (not a dir). For MVP we only ship
// `ctx-add`; the source-of-truth lives at packages/skill-ctx-add/SKILL.md.

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import type { CommandResult } from "./util.ts";

export type InstallSkillOptions = {
  name: string;
  /** Absolute path to the source SKILL.md to copy. */
  sourcePath: string;
  /** Target directory (~/.claude/skills). */
  skillsDir: string;
  /** If true and target already exists, replace it; otherwise leave + report. */
  force?: boolean;
};

export function installSkill(opts: InstallSkillOptions): CommandResult {
  if (!opts.name || opts.name.includes("/") || opts.name.includes("..")) {
    return { ok: false, message: `Invalid skill name: '${opts.name}'` };
  }
  if (!existsSync(opts.sourcePath)) {
    return {
      ok: false,
      message: `Skill source not found: ${opts.sourcePath}`,
    };
  }
  const targetDir = resolve(opts.skillsDir, opts.name);
  const targetFile = join(targetDir, "SKILL.md");

  if (existsSync(targetFile) && !opts.force) {
    const sameContent =
      readFileSync(targetFile, "utf-8") === readFileSync(opts.sourcePath, "utf-8");
    if (sameContent) {
      return {
        ok: true,
        message: `Skill '${opts.name}' already installed at ${targetFile} (identical content)`,
      };
    }
    // Back up the divergent installed copy so the user can compare.
    writeFileSync(`${targetFile}.bak`, readFileSync(targetFile));
  }

  mkdirSync(targetDir, { recursive: true });
  copyFileSync(opts.sourcePath, targetFile);

  return {
    ok: true,
    message: `Installed skill '${opts.name}' at ${targetFile}`,
  };
}
