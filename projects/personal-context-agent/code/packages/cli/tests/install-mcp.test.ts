import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { withTempHome } from "./helpers.ts";
import { installMcp } from "../src/pca-commands/install-mcp.ts";

let home: string;
let cleanup: () => void;
let mcpPath: string;

beforeEach(() => {
  const t = withTempHome();
  home = t.home;
  cleanup = t.cleanup;
  mcpPath = join(home, ".claude", "mcp.json");
});

afterEach(() => cleanup?.());

const ENTRY = {
  command: "/abs/path/to/bun",
  args: ["run", "/abs/path/to/index.ts"],
  env: { PCA_DB: "/abs/path/to/store.db" },
  description: "PCA — MCP server",
};

describe("install-mcp", () => {
  test("creates config file with pca entry when none exists", () => {
    const r = installMcp({ mcpConfigPath: mcpPath, entry: ENTRY });
    expect(r.ok).toBe(true);
    expect(r.message).toContain("Installed");
    const parsed = JSON.parse(readFileSync(mcpPath, "utf-8"));
    expect(parsed.mcpServers.pca).toEqual(ENTRY);
  });

  test("preserves existing mcpServers entries", () => {
    mkdirSync(dirname(mcpPath), { recursive: true });
    writeFileSync(
      mcpPath,
      JSON.stringify({
        mcpServers: {
          clipboard: {
            command: "bun",
            args: ["run", "/clipx/index.ts"],
            description: "Clipboard server",
          },
        },
      }),
    );

    installMcp({ mcpConfigPath: mcpPath, entry: ENTRY });
    const parsed = JSON.parse(readFileSync(mcpPath, "utf-8"));
    expect(Object.keys(parsed.mcpServers).sort()).toEqual(["clipboard", "pca"]);
    expect(parsed.mcpServers.clipboard.command).toBe("bun");
    expect(parsed.mcpServers.pca).toEqual(ENTRY);
  });

  test("preserves top-level keys outside mcpServers", () => {
    mkdirSync(dirname(mcpPath), { recursive: true });
    writeFileSync(
      mcpPath,
      JSON.stringify({
        someOtherSetting: "preserved",
        mcpServers: {},
      }),
    );
    installMcp({ mcpConfigPath: mcpPath, entry: ENTRY });
    const parsed = JSON.parse(readFileSync(mcpPath, "utf-8"));
    expect(parsed.someOtherSetting).toBe("preserved");
    expect(parsed.mcpServers.pca).toEqual(ENTRY);
  });

  test("re-running updates existing pca entry (and message reports update)", () => {
    installMcp({ mcpConfigPath: mcpPath, entry: ENTRY });
    const r2 = installMcp({
      mcpConfigPath: mcpPath,
      entry: { ...ENTRY, command: "/new/bun" },
    });
    expect(r2.message).toContain("Updated");
    const parsed = JSON.parse(readFileSync(mcpPath, "utf-8"));
    expect(parsed.mcpServers.pca.command).toBe("/new/bun");
  });

  test("creates .bak when overwriting existing file", () => {
    mkdirSync(dirname(mcpPath), { recursive: true });
    writeFileSync(mcpPath, JSON.stringify({ mcpServers: {} }));
    installMcp({ mcpConfigPath: mcpPath, entry: ENTRY });
    expect(existsSync(`${mcpPath}.bak`)).toBe(true);
  });

  test("does NOT create .bak on fresh install (no prior file)", () => {
    installMcp({ mcpConfigPath: mcpPath, entry: ENTRY });
    expect(existsSync(`${mcpPath}.bak`)).toBe(false);
  });

  test("refuses to overwrite if existing file is not valid JSON", () => {
    mkdirSync(dirname(mcpPath), { recursive: true });
    writeFileSync(mcpPath, "{ this is not json");
    const r = installMcp({ mcpConfigPath: mcpPath, entry: ENTRY });
    expect(r.ok).toBe(false);
    expect(r.message).toContain("not valid JSON");
    // Original content untouched
    expect(readFileSync(mcpPath, "utf-8")).toBe("{ this is not json");
  });

  test("refuses if existing JSON is an array (not an object)", () => {
    mkdirSync(dirname(mcpPath), { recursive: true });
    writeFileSync(mcpPath, "[]");
    const r = installMcp({ mcpConfigPath: mcpPath, entry: ENTRY });
    expect(r.ok).toBe(false);
    expect(r.message).toContain("not a JSON object");
  });

  test("uses custom serverName when provided", () => {
    installMcp({
      mcpConfigPath: mcpPath,
      serverName: "pca-dev",
      entry: ENTRY,
    });
    const parsed = JSON.parse(readFileSync(mcpPath, "utf-8"));
    expect(parsed.mcpServers["pca-dev"]).toEqual(ENTRY);
    expect(parsed.mcpServers.pca).toBeUndefined();
  });

  test("output JSON is pretty-printed (2-space indent, trailing newline)", () => {
    installMcp({ mcpConfigPath: mcpPath, entry: ENTRY });
    const raw = readFileSync(mcpPath, "utf-8");
    expect(raw.endsWith("\n")).toBe(true);
    expect(raw).toContain('  "mcpServers"'); // 2-space indent
  });
});
