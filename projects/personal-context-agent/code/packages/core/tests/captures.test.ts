// Phase A — captures store tests. Verifies the raw-input memory stream
// primitive: writes, status transitions, provenance joins, FTS5 search.
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { withTempStore } from "./helpers.ts";
import { StoreError, type Store } from "../src/index.ts";

let store: Store;
let cleanup: () => void;

beforeEach(() => {
  const t = withTempStore();
  store = t.store;
  cleanup = t.cleanup;
});

afterEach(() => cleanup?.());

const ACTOR = "test";

describe("schema — captures migrations", () => {
  test("creates captures + capture_entities + capture_links tables", () => {
    const tables = (
      store.db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
        )
        .all() as Array<{ name: string }>
    ).map((r) => r.name);
    expect(tables).toContain("captures");
    expect(tables).toContain("capture_entities");
    expect(tables).toContain("capture_links");
  });

  test("creates fts_captures virtual table", () => {
    const tables = (
      store.db
        .prepare(
          "SELECT name FROM sqlite_master WHERE type='table' AND name='fts_captures'",
        )
        .all() as Array<{ name: string }>
    ).map((r) => r.name);
    expect(tables).toEqual(["fts_captures"]);
  });

  test("events.operation accepts 'capture' and 'capture-update'", () => {
    // If the CHECK constraint hadn't been extended by 0004, these would throw.
    store.db
      .prepare(
        `INSERT INTO events (occurred_at, actor, operation) VALUES (?, ?, ?)`,
      )
      .run("2026-01-01T00:00:00.000Z", "test", "capture");
    store.db
      .prepare(
        `INSERT INTO events (occurred_at, actor, operation) VALUES (?, ?, ?)`,
      )
      .run("2026-01-01T00:00:00.000Z", "test", "capture-update");
  });
});

describe("recordCapture — round-trip", () => {
  test("persists raw_text verbatim and assigns defaults", () => {
    const text = "Mihai a luat 9.50 la simulare la mate";
    const cap = store.recordCapture({ raw_text: text }, ACTOR);

    expect(cap.id).toBeString();
    expect(cap.raw_text).toBe(text);
    expect(cap.source).toBe("claude-code:ctx-add");
    expect(cap.scope).toBe("general");
    expect(cap.status).toBe("pending");
    expect(cap.processed_at).toBeNull();
    expect(cap.classification_summary).toBeNull();
    expect(cap.actor).toBe(ACTOR);
    expect(cap.session_id).toBeNull();
    expect(cap.raw_lang).toBeNull();
    expect(cap.meta).toBeNull();
    expect(Date.parse(cap.occurred_at)).not.toBeNaN();
  });

  test("preserves multiline and unicode input bit-for-bit", () => {
    const text = "Linia 1 cu ăâîșț\nLinia 2 — punctuație: «citat», 9.50!";
    const cap = store.recordCapture({ raw_text: text }, ACTOR);
    const refetched = store.getCapture(cap.id);
    expect(refetched?.raw_text).toBe(text);
  });

  test("rejects empty raw_text", () => {
    expect(() => store.recordCapture({ raw_text: "" }, ACTOR)).toThrow(StoreError);
  });

  test("honours optional fields", () => {
    const cap = store.recordCapture(
      {
        raw_text: "x",
        source: "claude-code:ctx-mirror",
        session_id: "sess-abc",
        scope: "project:pca",
        raw_lang: "ro",
        meta: { cwd: "/tmp/x", client: "claude-code" },
      },
      ACTOR,
    );
    expect(cap.source).toBe("claude-code:ctx-mirror");
    expect(cap.session_id).toBe("sess-abc");
    expect(cap.scope).toBe("project:pca");
    expect(cap.raw_lang).toBe("ro");
    expect(cap.meta).toEqual({ cwd: "/tmp/x", client: "claude-code" });
  });

  test("writes a 'capture' event without duplicating raw_text in payload", () => {
    const cap = store.recordCapture({ raw_text: "long-secret-text" }, ACTOR);
    const rows = store.db
      .prepare("SELECT * FROM events WHERE operation = 'capture'")
      .all() as Array<{ payload: string | null; actor: string }>;
    expect(rows).toHaveLength(1);
    expect(rows[0]!.actor).toBe(ACTOR);
    const payload = JSON.parse(rows[0]!.payload!) as Record<string, unknown>;
    expect(payload.capture_id).toBe(cap.id);
    expect(payload.raw_text_length).toBe("long-secret-text".length);
    // raw_text must NOT be duplicated into the event payload.
    expect(JSON.stringify(payload)).not.toContain("long-secret-text");
  });
});

describe("updateCaptureStatus — transitions", () => {
  test("pending → processed with summary", () => {
    const cap = store.recordCapture({ raw_text: "Ship PCA" }, ACTOR);
    const updated = store.updateCaptureStatus(cap.id, "processed", ACTOR, {
      types_proposed: ["goal"],
      types_saved: ["goal"],
      entity_ids: ["E1"],
      link_ids: [],
      entity_count: 1,
      link_count: 0,
    });
    expect(updated.status).toBe("processed");
    expect(updated.processed_at).not.toBeNull();
    expect(updated.classification_summary?.entity_count).toBe(1);
  });

  test("pending → aborted retains raw_text and stores aborted_reason", () => {
    const cap = store.recordCapture({ raw_text: "Maybe Turso?" }, ACTOR);
    const updated = store.updateCaptureStatus(cap.id, "aborted", ACTOR, {
      aborted_reason: "user declined",
    });
    expect(updated.status).toBe("aborted");
    expect(updated.raw_text).toBe("Maybe Turso?");
    expect(updated.classification_summary?.aborted_reason).toBe("user declined");
  });

  test("cannot transition out of terminal status", () => {
    const cap = store.recordCapture({ raw_text: "x" }, ACTOR);
    store.updateCaptureStatus(cap.id, "aborted", ACTOR);
    expect(() => store.updateCaptureStatus(cap.id, "processed", ACTOR)).toThrow(
      StoreError,
    );
  });

  test("missing capture id throws NOT_FOUND", () => {
    let err: unknown;
    try {
      store.updateCaptureStatus("01ZZZZZZZZZZZZZZZZZZZZZZZZ", "processed", ACTOR);
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(StoreError);
    expect((err as StoreError).code).toBe("NOT_FOUND");
  });

  test("logs a 'capture-update' event", () => {
    const cap = store.recordCapture({ raw_text: "x" }, ACTOR);
    store.updateCaptureStatus(cap.id, "processed", ACTOR, { entity_count: 0 });
    const rows = store.db
      .prepare("SELECT * FROM events WHERE operation = 'capture-update'")
      .all() as Array<{ payload: string | null }>;
    expect(rows).toHaveLength(1);
    const payload = JSON.parse(rows[0]!.payload!) as { capture_id: string };
    expect(payload.capture_id).toBe(cap.id);
  });
});

describe("provenance joins", () => {
  test("linkCaptureToEntity inserts into capture_entities", () => {
    const cap = store.recordCapture({ raw_text: "Mihai" }, ACTOR);
    const entity = store.createEntity(
      { type: "person", title: "Mihai", attrs: { relation: "son", importance: "high" } },
      ACTOR,
    );
    store.linkCaptureToEntity(cap.id, entity.id);

    const rows = store.db
      .prepare(
        "SELECT capture_id, entity_id FROM capture_entities WHERE capture_id = ?",
      )
      .all(cap.id) as Array<{ capture_id: string; entity_id: string }>;
    expect(rows).toEqual([{ capture_id: cap.id, entity_id: entity.id }]);
  });

  test("linkCaptureToEntity is idempotent (INSERT OR IGNORE)", () => {
    const cap = store.recordCapture({ raw_text: "x" }, ACTOR);
    const entity = store.createEntity(
      { type: "person", title: "A", attrs: { relation: "x", importance: "low" } },
      ACTOR,
    );
    store.linkCaptureToEntity(cap.id, entity.id);
    store.linkCaptureToEntity(cap.id, entity.id);
    const count = store.db
      .prepare("SELECT count(*) as c FROM capture_entities")
      .get() as { c: number };
    expect(count.c).toBe(1);
  });

  test("linkCaptureToEntity throws NOT_FOUND for missing capture", () => {
    const entity = store.createEntity(
      { type: "person", title: "A", attrs: { relation: "x", importance: "low" } },
      ACTOR,
    );
    expect(() =>
      store.linkCaptureToEntity("01ZZZZZZZZZZZZZZZZZZZZZZZZ", entity.id),
    ).toThrow(StoreError);
  });

  test("linkCaptureToLink inserts into capture_links", () => {
    const cap = store.recordCapture({ raw_text: "x" }, ACTOR);
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const link = store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      ACTOR,
    );
    store.linkCaptureToLink(cap.id, link.id);
    const rows = store.db
      .prepare("SELECT capture_id, link_id FROM capture_links")
      .all() as Array<{ capture_id: string; link_id: string }>;
    expect(rows).toEqual([{ capture_id: cap.id, link_id: link.id }]);
  });
});

describe("listCaptures — filters", () => {
  function seed() {
    // Insert with explicit occurred_at via direct SQL so we can test
    // since/until without sleeping.
    const ids: string[] = [];
    const seedRows: Array<{
      iso: string;
      text: string;
      status: "pending" | "processed" | "aborted";
      source: string;
    }> = [
      { iso: "2026-05-10T10:00:00.000Z", text: "alpha first", status: "processed", source: "claude-code:ctx-add" },
      { iso: "2026-05-15T11:00:00.000Z", text: "beta middle Razvan", status: "aborted", source: "claude-code:ctx-add" },
      { iso: "2026-05-20T12:00:00.000Z", text: "gamma latest mihai", status: "pending", source: "claude-code:ctx-mirror" },
    ];
    for (const r of seedRows) {
      const id = `01CAP${r.iso.replace(/[^0-9]/g, "").slice(0, 21)}`.slice(0, 26);
      store.db
        .prepare(
          `INSERT INTO captures (id, occurred_at, raw_text, source, actor, scope, status)
           VALUES (?, ?, ?, ?, ?, 'general', ?)`,
        )
        .run(id, r.iso, r.text, r.source, ACTOR, r.status);
      ids.push(id);
    }
    return ids;
  }

  test("returns all newest-first by default", () => {
    seed();
    const items = store.listCaptures();
    expect(items.map((c) => c.raw_text)).toEqual([
      "gamma latest mihai",
      "beta middle Razvan",
      "alpha first",
    ]);
  });

  test("filters by since (inclusive lower bound)", () => {
    seed();
    const items = store.listCaptures({ since: "2026-05-12T00:00:00.000Z" });
    expect(items.map((c) => c.raw_text)).toEqual([
      "gamma latest mihai",
      "beta middle Razvan",
    ]);
  });

  test("filters by until (inclusive upper bound)", () => {
    seed();
    const items = store.listCaptures({ until: "2026-05-15T23:59:59.000Z" });
    expect(items.map((c) => c.raw_text)).toEqual([
      "beta middle Razvan",
      "alpha first",
    ]);
  });

  test("filters by status", () => {
    seed();
    const items = store.listCaptures({ status: "aborted" });
    expect(items.map((c) => c.status)).toEqual(["aborted"]);
  });

  test("filters by source", () => {
    seed();
    const items = store.listCaptures({ source: "claude-code:ctx-mirror" });
    expect(items.map((c) => c.raw_text)).toEqual(["gamma latest mihai"]);
  });

  test("limit caps results and is clamped to 500", () => {
    seed();
    expect(store.listCaptures({ limit: 1 })).toHaveLength(1);
    expect(store.listCaptures({ limit: 999 })).toHaveLength(3);
  });

  test("fts search matches raw_text tokens", () => {
    seed();
    const items = store.listCaptures({ fts: "razvan" });
    expect(items.map((c) => c.raw_text)).toEqual(["beta middle Razvan"]);

    const items2 = store.listCaptures({ fts: "mihai OR alpha" });
    expect(items2.map((c) => c.raw_text).sort()).toEqual([
      "alpha first",
      "gamma latest mihai",
    ]);
  });
});

describe("fts5 triggers", () => {
  test("INSERT populates the FTS index", () => {
    store.recordCapture({ raw_text: "uniquetokenxyz123 phrase" }, ACTOR);
    const items = store.listCaptures({ fts: "uniquetokenxyz123" });
    expect(items).toHaveLength(1);
  });

  test("UPDATE refreshes the FTS index after status change", () => {
    const cap = store.recordCapture({ raw_text: "beforetoken phrase" }, ACTOR);
    store.updateCaptureStatus(cap.id, "processed", ACTOR);
    // Status update must not break FTS — the row is still findable by raw_text.
    const items = store.listCaptures({ fts: "beforetoken" });
    expect(items.map((c) => c.id)).toEqual([cap.id]);
  });
});
