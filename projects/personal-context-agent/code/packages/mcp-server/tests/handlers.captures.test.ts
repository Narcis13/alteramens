// Phase A — MCP handler tests for the capture surface.
// Phase B — also covers capture_id wiring through record_observation /
// link_entities (provenance joins).
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { withTempStore } from "../../core/tests/helpers.ts";
import { type Store } from "@pca/core";
import {
  HandlerError,
  linkEntities,
  listCaptures,
  recordCapture,
  recordObservation,
  updateCaptureStatus,
} from "../src/handlers.ts";

let store: Store;
let cleanup: () => void;

beforeEach(() => {
  const t = withTempStore();
  store = t.store;
  cleanup = t.cleanup;
});

afterEach(() => cleanup?.());

const ACTOR = "test";

describe("record_capture handler", () => {
  test("returns capture_id + occurred_at on success", () => {
    const r = recordCapture(
      store,
      { raw_text: "Mihai a luat 9.50" },
      ACTOR,
    );
    expect(r.capture_id).toBeString();
    expect(Date.parse(r.occurred_at)).not.toBeNaN();

    // The capture is persisted with status 'pending'.
    const cap = store.getCapture(r.capture_id);
    expect(cap?.status).toBe("pending");
    expect(cap?.raw_text).toBe("Mihai a luat 9.50");
  });

  test("rejects empty raw_text with BAD_INPUT", () => {
    let err: unknown;
    try {
      recordCapture(store, { raw_text: "" }, ACTOR);
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("BAD_INPUT");
  });

  test("passes through optional source / session_id / meta", () => {
    const r = recordCapture(
      store,
      {
        raw_text: "x",
        source: "claude-code:ctx-mirror",
        session_id: "sess-1",
        meta: { cwd: "/tmp" },
      },
      ACTOR,
    );
    const cap = store.getCapture(r.capture_id)!;
    expect(cap.source).toBe("claude-code:ctx-mirror");
    expect(cap.session_id).toBe("sess-1");
    expect(cap.meta).toEqual({ cwd: "/tmp" });
  });
});

describe("update_capture_status handler", () => {
  test("processed terminal with classification_summary", () => {
    const { capture_id } = recordCapture(store, { raw_text: "x" }, ACTOR);
    const r = updateCaptureStatus(
      store,
      {
        capture_id,
        status: "processed",
        classification_summary: {
          types_saved: ["goal"],
          entity_ids: ["E1"],
          entity_count: 1,
          link_count: 0,
        },
      },
      ACTOR,
    );
    expect(r.status).toBe("processed");
    expect(Date.parse(r.processed_at)).not.toBeNaN();
  });

  test("aborted terminal preserves the capture", () => {
    const { capture_id } = recordCapture(store, { raw_text: "y" }, ACTOR);
    const r = updateCaptureStatus(
      store,
      {
        capture_id,
        status: "aborted",
        classification_summary: { aborted_reason: "user declined" },
      },
      ACTOR,
    );
    expect(r.status).toBe("aborted");
    expect(store.getCapture(capture_id)?.raw_text).toBe("y");
  });

  test("rejects invalid transition from terminal to terminal", () => {
    const { capture_id } = recordCapture(store, { raw_text: "x" }, ACTOR);
    updateCaptureStatus(store, { capture_id, status: "aborted" }, ACTOR);
    let err: unknown;
    try {
      updateCaptureStatus(store, { capture_id, status: "processed" }, ACTOR);
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("BAD_TRANSITION");
  });

  test("unknown capture_id surfaces as NOT_FOUND", () => {
    let err: unknown;
    try {
      updateCaptureStatus(
        store,
        { capture_id: "01ZZZZZZZZZZZZZZZZZZZZZZZZ", status: "processed" },
        ACTOR,
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("NOT_FOUND");
  });

  test("rejects non-terminal target status via BAD_INPUT", () => {
    const { capture_id } = recordCapture(store, { raw_text: "x" }, ACTOR);
    let err: unknown;
    try {
      // 'pending' is not a valid terminal — the zod shape blocks this at the
      // transport edge, but the handler also defends.
      updateCaptureStatus(
        store,
        // biome-ignore lint/suspicious/noExplicitAny: deliberately bypassing
        // the typed enum to verify the handler's defense-in-depth guard.
        { capture_id, status: "pending" as any },
        ACTOR,
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("BAD_INPUT");
  });
});

describe("list_captures handler", () => {
  test("returns count + items", () => {
    recordCapture(store, { raw_text: "one" }, ACTOR);
    recordCapture(store, { raw_text: "two" }, ACTOR);
    const r = listCaptures(store, {});
    expect(r.count).toBe(2);
    expect(r.items).toHaveLength(2);
  });

  test("respects limit", () => {
    for (let i = 0; i < 5; i++) {
      recordCapture(store, { raw_text: `msg-${i}` }, ACTOR);
    }
    const r = listCaptures(store, { limit: 2 });
    expect(r.count).toBe(2);
  });

  test("filters by status", () => {
    const { capture_id } = recordCapture(store, { raw_text: "kept" }, ACTOR);
    recordCapture(store, { raw_text: "still-pending" }, ACTOR);
    updateCaptureStatus(store, { capture_id, status: "processed" }, ACTOR);

    const processed = listCaptures(store, { status: "processed" });
    expect(processed.items.map((c) => c.raw_text)).toEqual(["kept"]);

    const pending = listCaptures(store, { status: "pending" });
    expect(pending.items.map((c) => c.raw_text)).toEqual(["still-pending"]);
  });

  test("fts query matches raw_text tokens", () => {
    recordCapture(store, { raw_text: "Mihai 9.50 simulare mate" }, ACTOR);
    recordCapture(store, { raw_text: "Notes on Turso sync story" }, ACTOR);
    const r = listCaptures(store, { fts: "turso" });
    expect(r.items.map((c) => c.raw_text)).toEqual(["Notes on Turso sync story"]);
  });
});

// ── Phase B — capture_id wiring ──────────────────────────────────────────────

describe("record_observation — capture_id provenance", () => {
  test("attaches the new entity to the capture in capture_entities", () => {
    const { capture_id } = recordCapture(
      store,
      { raw_text: "Mihai a luat 9.50" },
      ACTOR,
    );
    const r = recordObservation(
      store,
      {
        text: "Mihai",
        type: "person",
        attrs: { relation: "son", importance: "high" },
        capture_id,
      },
      ACTOR,
    );
    const rows = store.db
      .prepare(
        "SELECT capture_id, entity_id FROM capture_entities WHERE capture_id = ?",
      )
      .all(capture_id) as Array<{ capture_id: string; entity_id: string }>;
    expect(rows).toEqual([{ capture_id, entity_id: r.id }]);
  });

  test("succeeds with no capture_id (backwards compatible)", () => {
    const r = recordObservation(
      store,
      {
        text: "Ship PCA",
        type: "goal",
        attrs: { timeframe: "short" },
      },
      ACTOR,
    );
    expect(r.status).toBe("created");
    const count = store.db
      .prepare("SELECT count(*) AS c FROM capture_entities")
      .get() as { c: number };
    expect(count.c).toBe(0);
  });

  test("INVALID_CAPTURE when capture_id does not exist; no entity is created", () => {
    let err: unknown;
    try {
      recordObservation(
        store,
        {
          text: "Mihai",
          type: "person",
          attrs: { relation: "son", importance: "high" },
          capture_id: "01ZZZZZZZZZZZZZZZZZZZZZZZZ",
        },
        ACTOR,
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("INVALID_CAPTURE");
    // Guarantee no orphan entity was created behind the failed link.
    const count = store.db
      .prepare("SELECT count(*) AS c FROM entities")
      .get() as { c: number };
    expect(count.c).toBe(0);
  });
});

describe("link_entities — capture_id provenance", () => {
  test("attaches the new link to the capture in capture_links", () => {
    const { capture_id } = recordCapture(
      store,
      { raw_text: "A subgoal-of B" },
      ACTOR,
    );
    const a = recordObservation(
      store,
      { text: "A", type: "goal", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = recordObservation(
      store,
      { text: "B", type: "goal", attrs: { timeframe: "mid" } },
      ACTOR,
    );
    const link = linkEntities(
      store,
      {
        src_id: a.id,
        dst_id: b.id,
        relation: "subgoal-of",
        capture_id,
      },
      ACTOR,
    );
    const rows = store.db
      .prepare("SELECT capture_id, link_id FROM capture_links")
      .all() as Array<{ capture_id: string; link_id: string }>;
    expect(rows).toEqual([{ capture_id, link_id: link.id }]);
  });

  test("INVALID_CAPTURE when capture_id does not exist; no link is created", () => {
    const a = recordObservation(
      store,
      { text: "A", type: "goal", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = recordObservation(
      store,
      { text: "B", type: "goal", attrs: { timeframe: "mid" } },
      ACTOR,
    );
    let err: unknown;
    try {
      linkEntities(
        store,
        {
          src_id: a.id,
          dst_id: b.id,
          relation: "subgoal-of",
          capture_id: "01ZZZZZZZZZZZZZZZZZZZZZZZZ",
        },
        ACTOR,
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("INVALID_CAPTURE");
    const count = store.db
      .prepare("SELECT count(*) AS c FROM links")
      .get() as { c: number };
    expect(count.c).toBe(0);
  });

  test("full /ctx-add flow: 1 capture → 2 entities + 1 link, all joined", () => {
    // Simulates the skill: record_capture → record_observation (×2) →
    // link_entities → update_capture_status('processed').
    const { capture_id } = recordCapture(
      store,
      { raw_text: "Mihai (fiul meu) pregătește admiterea la UMF" },
      ACTOR,
    );
    const mihai = recordObservation(
      store,
      {
        text: "Mihai",
        type: "person",
        attrs: { relation: "son", importance: "high" },
        capture_id,
      },
      ACTOR,
    );
    const ev = recordObservation(
      store,
      {
        text: "Pregătește admitere UMF",
        type: "event",
        capture_id,
      },
      ACTOR,
    );
    const link = linkEntities(
      store,
      {
        src_id: mihai.id,
        dst_id: ev.id,
        relation: "subject-of",
        capture_id,
      },
      ACTOR,
    );
    updateCaptureStatus(
      store,
      {
        capture_id,
        status: "processed",
        classification_summary: {
          types_saved: ["person", "event"],
          entity_ids: [mihai.id, ev.id],
          link_ids: [link.id],
          entity_count: 2,
          link_count: 1,
        },
      },
      ACTOR,
    );

    const entRows = store.db
      .prepare("SELECT entity_id FROM capture_entities WHERE capture_id = ?")
      .all(capture_id) as Array<{ entity_id: string }>;
    expect(entRows.map((r) => r.entity_id).sort()).toEqual(
      [mihai.id, ev.id].sort(),
    );
    const linkRows = store.db
      .prepare("SELECT link_id FROM capture_links WHERE capture_id = ?")
      .all(capture_id) as Array<{ link_id: string }>;
    expect(linkRows).toEqual([{ link_id: link.id }]);

    const cap = store.getCapture(capture_id)!;
    expect(cap.status).toBe("processed");
    expect(cap.classification_summary?.entity_count).toBe(2);
    expect(cap.classification_summary?.link_count).toBe(1);
  });
});
