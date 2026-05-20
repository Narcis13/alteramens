import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { withTempHome } from "./helpers.ts";
import { initStore } from "../src/pca-commands/init.ts";
import { openStore } from "@pca/core";

let home: string;
let cleanup: () => void;
let dbPath: string;

beforeEach(() => {
  const t = withTempHome();
  home = t.home;
  cleanup = t.cleanup;
  dbPath = join(home, ".pca", "store.db");
});

afterEach(() => cleanup?.());

describe("init", () => {
  test("creates the parent dir + DB file when neither exists", () => {
    expect(existsSync(dbPath)).toBe(false);
    const r = initStore({ dbPath });
    expect(r.ok).toBe(true);
    expect(r.message).toContain("Initialized store");
    expect(existsSync(dbPath)).toBe(true);
  });

  test("DB is opened with latest schema applied", () => {
    initStore({ dbPath });
    const store = openStore(dbPath);
    const row = store.db
      .prepare("SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1")
      .get() as { version: number } | null;
    store.close();
    expect(row?.version).toBe(4);
  });

  test("idempotent: rerunning on existing DB reports already-exists, leaves DB intact", () => {
    initStore({ dbPath });
    const store1 = openStore(dbPath);
    store1.createEntity(
      { type: "goal", title: "preserved", attrs: { timeframe: "short" } },
      "test",
    );
    store1.close();

    const r = initStore({ dbPath });
    expect(r.ok).toBe(true);
    expect(r.message).toContain("already exists");

    const store2 = openStore(dbPath);
    const goals = store2.listActive("goal");
    store2.close();
    expect(goals.map((g) => g.title)).toEqual(["preserved"]);
  });
});
