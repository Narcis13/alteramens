import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { join } from "node:path";
import { openStore } from "@pca/core";
import { withTempHome } from "./helpers.ts";
import { migrateLinks } from "../src/pca-commands/migrate-links.ts";

let home: string;
let cleanup: () => void;
let dbPath: string;

beforeEach(() => {
  const t = withTempHome();
  home = t.home;
  cleanup = t.cleanup;
  dbPath = join(home, "store.db");
});

afterEach(() => cleanup?.());

describe("migrateLinks", () => {
  test("no-op when there are no goals with parent_id", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    await store.createEntity(
      { type: "goal", title: "Standalone", attrs: { timeframe: "short" } },
      "test",
    );
    store.close();

    const r = await migrateLinks({ dbPath });
    expect(r.ok).toBe(true);
    expect(r.scanned).toBe(1);
    expect(r.created).toBe(0);
    expect(r.alreadyLinked).toBe(0);
    expect(r.missingParents).toEqual([]);
  });

  test("creates subgoal-of links for goals with valid parent_id", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const parent = await store.createEntity(
      { type: "goal", title: "Parent goal", attrs: { timeframe: "long" } },
      "test",
    );
    const child = await store.createEntity(
      {
        type: "goal",
        title: "Child goal",
        attrs: { timeframe: "short", parent_id: parent.id },
      },
      "test",
    );
    store.close();

    const r = await migrateLinks({ dbPath });
    expect(r.ok).toBe(true);
    expect(r.created).toBe(1);
    expect(r.alreadyLinked).toBe(0);

    const store2 = await openStore({ url: `file:${dbPath}` });
    const links = await store2.listLinks({
      entityId: child.id,
      relation: "subgoal-of",
      direction: "out",
    });
    expect(links).toHaveLength(1);
    expect(links[0]!.dst_id).toBe(parent.id);
    expect(links[0]!.authority).toBe(child.authority);
    store2.close();
  });

  test("idempotent: running twice creates no extra links", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const parent = await store.createEntity(
      { type: "goal", title: "Parent goal", attrs: { timeframe: "long" } },
      "test",
    );
    await store.createEntity(
      {
        type: "goal",
        title: "Child goal",
        attrs: { timeframe: "short", parent_id: parent.id },
      },
      "test",
    );
    store.close();

    const first = await migrateLinks({ dbPath });
    expect(first.created).toBe(1);

    const second = await migrateLinks({ dbPath });
    expect(second.created).toBe(0);
    expect(second.alreadyLinked).toBe(1);

    const store2 = await openStore({ url: `file:${dbPath}` });
    const rs = await store2.client.execute(
      "SELECT COUNT(*) AS n FROM links WHERE relation = 'subgoal-of' AND invalidated_at IS NULL",
    );
    const linkRows = rs.rows[0] as unknown as { n: number };
    store2.close();
    expect(Number(linkRows.n)).toBe(1);
  });

  test("preserves attrs.parent_id for read-compat", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const parent = await store.createEntity(
      { type: "goal", title: "Parent goal", attrs: { timeframe: "long" } },
      "test",
    );
    const child = await store.createEntity(
      {
        type: "goal",
        title: "Child goal",
        attrs: { timeframe: "short", parent_id: parent.id },
      },
      "test",
    );
    store.close();

    await migrateLinks({ dbPath });

    const store2 = await openStore({ url: `file:${dbPath}` });
    const reread = (await store2.getEntity(child.id))!;
    store2.close();
    expect(reread.attrs.parent_id).toBe(parent.id);
  });

  test("skips goals whose parent has been invalidated", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const parent = await store.createEntity(
      { type: "goal", title: "Old parent", attrs: { timeframe: "long" } },
      "test",
    );
    const child = await store.createEntity(
      {
        type: "goal",
        title: "Orphan child",
        attrs: { timeframe: "short", parent_id: parent.id },
      },
      "test",
    );
    await store.invalidateEntity(parent.id, "test");
    store.close();

    const r = await migrateLinks({ dbPath });
    expect(r.created).toBe(0);
    expect(r.missingParents).toHaveLength(1);
    expect(r.missingParents[0]!.goalId).toBe(child.id);
    expect(r.missingParents[0]!.parentId).toBe(parent.id);
  });

  test("emits a `link` event per created link", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const parent = await store.createEntity(
      { type: "goal", title: "Parent", attrs: { timeframe: "long" } },
      "test",
    );
    await store.createEntity(
      {
        type: "goal",
        title: "Child",
        attrs: { timeframe: "short", parent_id: parent.id },
      },
      "test",
    );
    store.close();

    await migrateLinks({ dbPath });

    const store2 = await openStore({ url: `file:${dbPath}` });
    const events = (await store2.listEvents({ limit: 100 })).filter(
      (e) => e.operation === "link" && e.actor === "script:migrate-links",
    );
    store2.close();
    expect(events).toHaveLength(1);
  });
});
