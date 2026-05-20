import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { join } from "node:path";
import { openStore } from "@pca/core";
import { withTempHome } from "./helpers.ts";
import { reviewLinks } from "../src/ctx-commands/review.ts";

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

describe("reviewLinks — dangling", () => {
  test("clean store reports zero dangling / redundant / orphan only", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      "test",
    );
    store.close();

    const r = await reviewLinks({ dbPath });
    expect(r.dangling).toEqual([]);
    expect(r.redundant).toEqual([]);
    expect(r.orphans).toEqual([]);
  });

  test("detects link pointing to a missing src/dst (orphan row in DB)", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    const link = await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      "test",
    );
    // Forcefully delete the entity row to simulate a missing target (cannot
    // happen via the public API — FK constraints block it — but external
    // writers, DB imports, or migrations could produce this state. Review
    // must still surface it.
    await store.client.execute("PRAGMA foreign_keys = OFF");
    await store.client.execute({
      sql: "DELETE FROM entities WHERE id = ?",
      args: [b.id],
    });
    await store.client.execute("PRAGMA foreign_keys = ON");
    store.close();

    const r = await reviewLinks({ dbPath });
    expect(r.dangling).toHaveLength(1);
    expect(r.dangling[0]!.link_id).toBe(link.id);
    expect(r.dangling[0]!.reasons).toContain("dst-missing");
  });

  test("does NOT flag a link that cascade-invalidation already cleaned up", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      "test",
    );
    await store.invalidateEntity(b.id, "test"); // cascade marks the link invalid
    store.close();

    const r = await reviewLinks({ dbPath });
    expect(r.dangling).toEqual([]);
  });

  test("flags a link whose dst is invalidated but link still active (cascade was bypassed)", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    const link = await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      "test",
    );
    // Bypass cascade — simulate legacy data: directly mark entity invalidated
    // without going through invalidateEntity().
    await store.client.execute({
      sql: "UPDATE entities SET status='invalidated', invalidated_at=datetime('now') WHERE id=?",
      args: [b.id],
    });
    store.close();

    const r = await reviewLinks({ dbPath });
    expect(r.dangling).toHaveLength(1);
    expect(r.dangling[0]!.link_id).toBe(link.id);
    expect(r.dangling[0]!.reasons).toContain("dst-invalidated");
  });

  test("does NOT flag links to archived entities (archived ≠ dangling)", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      "test",
    );
    await store.client.execute({
      sql: "UPDATE entities SET status='archived' WHERE id=?",
      args: [b.id],
    });
    store.close();

    const r = await reviewLinks({ dbPath });
    expect(r.dangling).toEqual([]);
  });
});

describe("reviewLinks — redundant", () => {
  test("detects multiple non-invalidated links with same (src, dst, relation)", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    const l1 = await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of", weight: 1.0 },
      "test",
    );
    const l2 = await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of", weight: 1.0 },
      "test",
    );
    store.close();

    const r = await reviewLinks({ dbPath });
    expect(r.redundant).toHaveLength(1);
    const grp = r.redundant[0]!;
    expect(grp.link_ids.sort()).toEqual([l1.id, l2.id].sort());
  });

  test("doesn't flag distinct-relation links between same pair as redundant", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      "test",
    );
    await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "related-to" },
      "test",
    );
    store.close();

    const r = await reviewLinks({ dbPath });
    expect(r.redundant).toEqual([]);
  });
});

describe("reviewLinks — orphan entities", () => {
  test("flags an active goal with no in/out non-invalidated links", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const lonely = await store.createEntity(
      { type: "goal", title: "Lonely", attrs: { timeframe: "mid" } },
      "test",
    );
    store.close();

    const r = await reviewLinks({ dbPath });
    expect(r.orphans.map((o) => o.id)).toContain(lonely.id);
  });

  test("does not flag event/state types (exempt)", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    await store.createEntity({ type: "event", title: "ev", attrs: {} }, "test");
    await store.createEntity(
      { type: "state", title: "st", attrs: { energy: "low" } },
      "test",
    );
    store.close();

    const r = await reviewLinks({ dbPath });
    expect(r.orphans).toEqual([]);
  });

  test("does not flag entities that have at least one active link", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      "test",
    );
    store.close();

    const r = await reviewLinks({ dbPath });
    expect(r.orphans.map((o) => o.id)).not.toContain(a.id);
    expect(r.orphans.map((o) => o.id)).not.toContain(b.id);
  });
});

describe("reviewLinks --fix", () => {
  test("invalidates all dangling links", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    const link = await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      "test",
    );
    // Bypass cascade
    await store.client.execute({
      sql: "UPDATE entities SET status='invalidated', invalidated_at=datetime('now') WHERE id=?",
      args: [b.id],
    });
    store.close();

    const r = await reviewLinks({ dbPath, fix: true });
    expect(r.fixed?.dangling).toBe(1);

    const store2 = await openStore({ url: `file:${dbPath}` });
    const rs = await store2.client.execute({
      sql: "SELECT invalidated_at FROM links WHERE id = ?",
      args: [link.id],
    });
    const row = rs.rows[0] as unknown as { invalidated_at: string | null };
    store2.close();
    expect(row.invalidated_at).not.toBeNull();

    // Subsequent review should show 0 dangling
    const r2 = await reviewLinks({ dbPath });
    expect(r2.dangling).toEqual([]);
  });

  test("dedupes redundant links by keeping highest-weight (tiebreak: newest)", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    const lLow = await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of", weight: 0.5 },
      "test",
    );
    await Bun.sleep(5);
    const lHigh = await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of", weight: 1.0 },
      "test",
    );
    store.close();

    const r = await reviewLinks({ dbPath, fix: true });
    expect(r.fixed?.redundant).toBe(1);
    expect(r.redundant[0]!.kept_link_id).toBe(lHigh.id);
    expect(r.redundant[0]!.invalidated_link_ids).toEqual([lLow.id]);

    // Verify in DB
    const store2 = await openStore({ url: `file:${dbPath}` });
    const lowRs = await store2.client.execute({
      sql: "SELECT invalidated_at FROM links WHERE id = ?",
      args: [lLow.id],
    });
    const highRs = await store2.client.execute({
      sql: "SELECT invalidated_at FROM links WHERE id = ?",
      args: [lHigh.id],
    });
    const lowRow = lowRs.rows[0] as unknown as { invalidated_at: string | null };
    const highRow = highRs.rows[0] as unknown as { invalidated_at: string | null };
    store2.close();
    expect(lowRow.invalidated_at).not.toBeNull();
    expect(highRow.invalidated_at).toBeNull();
  });

  test("dedupe with equal weights keeps the newest", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    const lOld = await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of", weight: 1.0 },
      "test",
    );
    await Bun.sleep(5);
    const lNew = await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of", weight: 1.0 },
      "test",
    );
    store.close();

    const r = await reviewLinks({ dbPath, fix: true });
    expect(r.redundant[0]!.kept_link_id).toBe(lNew.id);
    expect(r.redundant[0]!.invalidated_link_ids).toEqual([lOld.id]);
  });

  test("orphans are never modified by --fix", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const lonely = await store.createEntity(
      { type: "goal", title: "Lonely", attrs: { timeframe: "mid" } },
      "test",
    );
    store.close();

    const r = await reviewLinks({ dbPath, fix: true });
    expect(r.orphans.map((o) => o.id)).toContain(lonely.id);

    const store2 = await openStore({ url: `file:${dbPath}` });
    const rs = await store2.client.execute({
      sql: "SELECT status FROM entities WHERE id = ?",
      args: [lonely.id],
    });
    const row = rs.rows[0] as unknown as { status: string };
    store2.close();
    expect(row.status).toBe("active");
  });
});

describe("reviewLinks — performance smoke", () => {
  test("runs in <500ms over a store with ~1000 links", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const entities = [];
    for (let i = 0; i < 50; i++) {
      entities.push(
        await store.createEntity(
          { type: "goal", title: `g${i}`, attrs: { timeframe: "mid" } },
          "test",
        ),
      );
    }
    for (let i = 0; i < 1000; i++) {
      const a = entities[i % 50]!;
      const b = entities[(i + 1) % 50]!;
      if (a.id === b.id) continue;
      await store.createLink(
        { src_id: a.id, dst_id: b.id, relation: "related-to" },
        "test",
      );
    }
    store.close();

    const start = performance.now();
    await reviewLinks({ dbPath });
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(500); // generous CI bound; spec target is 100ms
  });
});
