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
  test("creates the parent dir + DB file when neither exists", async () => {
    expect(existsSync(dbPath)).toBe(false);
    const r = await initStore({ dbPath });
    expect(r.ok).toBe(true);
    expect(r.message).toContain("Initialized store");
    expect(existsSync(dbPath)).toBe(true);
  });

  test("DB is opened with latest schema applied", async () => {
    await initStore({ dbPath });
    const store = await openStore({ url: `file:${dbPath}` });
    const result = await store.client.execute(
      "SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1",
    );
    const row = result.rows[0] as unknown as { version: number } | undefined;
    store.close();
    expect(row?.version).toBe(4);
  });

  test("idempotent: rerunning on existing DB reports already-exists, leaves DB intact", async () => {
    await initStore({ dbPath });
    const store1 = await openStore({ url: `file:${dbPath}` });
    await store1.createEntity(
      { type: "goal", title: "preserved", attrs: { timeframe: "short" } },
      "test",
    );
    store1.close();

    const r = await initStore({ dbPath });
    expect(r.ok).toBe(true);
    expect(r.message).toContain("already exists");

    const store2 = await openStore({ url: `file:${dbPath}` });
    const goals = await store2.listActive("goal");
    store2.close();
    expect(goals.map((g) => g.title)).toEqual(["preserved"]);
  });
});
