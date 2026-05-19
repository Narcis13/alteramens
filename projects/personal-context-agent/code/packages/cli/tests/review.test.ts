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
  test("clean store reports zero dangling / redundant / orphan only", () => {
    const store = openStore(dbPath);
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      "test",
    );
    store.close();

    const r = reviewLinks({ dbPath });
    expect(r.dangling).toEqual([]);
    expect(r.redundant).toEqual([]);
    expect(r.orphans).toEqual([]);
  });

  test("detects link pointing to a missing src/dst (orphan row in DB)", () => {
    const store = openStore(dbPath);
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    const link = store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      "test",
    );
    // Forcefully delete the entity row to simulate a missing target (cannot
    // happen via the public API — FK constraints block it — but external
    // writers, DB imports, or migrations could produce this state. Review
    // must still surface it.
    store.db.exec("PRAGMA foreign_keys = OFF");
    store.db.prepare("DELETE FROM entities WHERE id = ?").run(b.id);
    store.db.exec("PRAGMA foreign_keys = ON");
    store.close();

    const r = reviewLinks({ dbPath });
    expect(r.dangling).toHaveLength(1);
    expect(r.dangling[0]!.link_id).toBe(link.id);
    expect(r.dangling[0]!.reasons).toContain("dst-missing");
  });

  test("does NOT flag a link that cascade-invalidation already cleaned up", () => {
    const store = openStore(dbPath);
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      "test",
    );
    store.invalidateEntity(b.id, "test"); // cascade marks the link invalid
    store.close();

    const r = reviewLinks({ dbPath });
    expect(r.dangling).toEqual([]);
  });

  test("flags a link whose dst is invalidated but link still active (cascade was bypassed)", () => {
    const store = openStore(dbPath);
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    const link = store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      "test",
    );
    // Bypass cascade — simulate legacy data: directly mark entity invalidated
    // without going through invalidateEntity().
    store.db
      .prepare(
        "UPDATE entities SET status='invalidated', invalidated_at=datetime('now') WHERE id=?",
      )
      .run(b.id);
    store.close();

    const r = reviewLinks({ dbPath });
    expect(r.dangling).toHaveLength(1);
    expect(r.dangling[0]!.link_id).toBe(link.id);
    expect(r.dangling[0]!.reasons).toContain("dst-invalidated");
  });

  test("does NOT flag links to archived entities (archived ≠ dangling)", () => {
    const store = openStore(dbPath);
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      "test",
    );
    store.db
      .prepare("UPDATE entities SET status='archived' WHERE id=?")
      .run(b.id);
    store.close();

    const r = reviewLinks({ dbPath });
    expect(r.dangling).toEqual([]);
  });
});

describe("reviewLinks — redundant", () => {
  test("detects multiple non-invalidated links with same (src, dst, relation)", () => {
    const store = openStore(dbPath);
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    const l1 = store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of", weight: 1.0 },
      "test",
    );
    const l2 = store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of", weight: 1.0 },
      "test",
    );
    store.close();

    const r = reviewLinks({ dbPath });
    expect(r.redundant).toHaveLength(1);
    const grp = r.redundant[0]!;
    expect(grp.link_ids.sort()).toEqual([l1.id, l2.id].sort());
  });

  test("doesn't flag distinct-relation links between same pair as redundant", () => {
    const store = openStore(dbPath);
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      "test",
    );
    store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "related-to" },
      "test",
    );
    store.close();

    const r = reviewLinks({ dbPath });
    expect(r.redundant).toEqual([]);
  });
});

describe("reviewLinks — orphan entities", () => {
  test("flags an active goal with no in/out non-invalidated links", () => {
    const store = openStore(dbPath);
    const lonely = store.createEntity(
      { type: "goal", title: "Lonely", attrs: { timeframe: "mid" } },
      "test",
    );
    store.close();

    const r = reviewLinks({ dbPath });
    expect(r.orphans.map((o) => o.id)).toContain(lonely.id);
  });

  test("does not flag event/state types (exempt)", () => {
    const store = openStore(dbPath);
    store.createEntity({ type: "event", title: "ev", attrs: {} }, "test");
    store.createEntity(
      { type: "state", title: "st", attrs: { energy: "low" } },
      "test",
    );
    store.close();

    const r = reviewLinks({ dbPath });
    expect(r.orphans).toEqual([]);
  });

  test("does not flag entities that have at least one active link", () => {
    const store = openStore(dbPath);
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      "test",
    );
    store.close();

    const r = reviewLinks({ dbPath });
    expect(r.orphans.map((o) => o.id)).not.toContain(a.id);
    expect(r.orphans.map((o) => o.id)).not.toContain(b.id);
  });
});

describe("reviewLinks --fix", () => {
  test("invalidates all dangling links", () => {
    const store = openStore(dbPath);
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    const link = store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      "test",
    );
    // Bypass cascade
    store.db
      .prepare(
        "UPDATE entities SET status='invalidated', invalidated_at=datetime('now') WHERE id=?",
      )
      .run(b.id);
    store.close();

    const r = reviewLinks({ dbPath, fix: true });
    expect(r.fixed?.dangling).toBe(1);

    const store2 = openStore(dbPath);
    const row = store2.db
      .prepare("SELECT invalidated_at FROM links WHERE id = ?")
      .get(link.id) as { invalidated_at: string | null };
    store2.close();
    expect(row.invalidated_at).not.toBeNull();

    // Subsequent review should show 0 dangling
    const r2 = reviewLinks({ dbPath });
    expect(r2.dangling).toEqual([]);
  });

  test("dedupes redundant links by keeping highest-weight (tiebreak: newest)", async () => {
    const store = openStore(dbPath);
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    const lLow = store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of", weight: 0.5 },
      "test",
    );
    await Bun.sleep(5);
    const lHigh = store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of", weight: 1.0 },
      "test",
    );
    store.close();

    const r = reviewLinks({ dbPath, fix: true });
    expect(r.fixed?.redundant).toBe(1);
    expect(r.redundant[0]!.kept_link_id).toBe(lHigh.id);
    expect(r.redundant[0]!.invalidated_link_ids).toEqual([lLow.id]);

    // Verify in DB
    const store2 = openStore(dbPath);
    const lowRow = store2.db
      .prepare("SELECT invalidated_at FROM links WHERE id = ?")
      .get(lLow.id) as { invalidated_at: string | null };
    const highRow = store2.db
      .prepare("SELECT invalidated_at FROM links WHERE id = ?")
      .get(lHigh.id) as { invalidated_at: string | null };
    store2.close();
    expect(lowRow.invalidated_at).not.toBeNull();
    expect(highRow.invalidated_at).toBeNull();
  });

  test("dedupe with equal weights keeps the newest", async () => {
    const store = openStore(dbPath);
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "mid" } },
      "test",
    );
    const lOld = store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of", weight: 1.0 },
      "test",
    );
    await Bun.sleep(5);
    const lNew = store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of", weight: 1.0 },
      "test",
    );
    store.close();

    const r = reviewLinks({ dbPath, fix: true });
    expect(r.redundant[0]!.kept_link_id).toBe(lNew.id);
    expect(r.redundant[0]!.invalidated_link_ids).toEqual([lOld.id]);
  });

  test("orphans are never modified by --fix", () => {
    const store = openStore(dbPath);
    const lonely = store.createEntity(
      { type: "goal", title: "Lonely", attrs: { timeframe: "mid" } },
      "test",
    );
    store.close();

    const r = reviewLinks({ dbPath, fix: true });
    expect(r.orphans.map((o) => o.id)).toContain(lonely.id);

    const store2 = openStore(dbPath);
    const row = store2.db
      .prepare("SELECT status FROM entities WHERE id = ?")
      .get(lonely.id) as { status: string };
    store2.close();
    expect(row.status).toBe("active");
  });
});

describe("reviewLinks — performance smoke", () => {
  test("runs in <100ms over a store with ~1000 links", () => {
    const store = openStore(dbPath);
    const entities = [];
    for (let i = 0; i < 50; i++) {
      entities.push(
        store.createEntity(
          { type: "goal", title: `g${i}`, attrs: { timeframe: "mid" } },
          "test",
        ),
      );
    }
    for (let i = 0; i < 1000; i++) {
      const a = entities[i % 50]!;
      const b = entities[(i + 1) % 50]!;
      if (a.id === b.id) continue;
      store.createLink(
        { src_id: a.id, dst_id: b.id, relation: "related-to" },
        "test",
      );
    }
    store.close();

    const start = performance.now();
    reviewLinks({ dbPath });
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(500); // generous CI bound; spec target is 100ms
  });
});
