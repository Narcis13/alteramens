// Handler-layer tests. Pure functions, in-memory temp DB per test.
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { withTempStore } from "../../core/tests/helpers.ts";
import { type Store } from "@pca/core";
import {
  HandlerError,
  confirmEntity,
  getRelevantContext,
  getSelfSummary,
  listActive,
  recordObservation,
  updateEntity,
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

// ────────────────────────────────────────────────────────────────────────────
// get_self_summary
// ────────────────────────────────────────────────────────────────────────────

describe("get_self_summary", () => {
  test("empty store yields all-null/empty summary", () => {
    const r = getSelfSummary(store, {});
    expect(r.self).toBeNull();
    expect(r.active_roles).toEqual([]);
    expect(r.active_goals).toEqual([]);
    expect(r.active_constraints).toEqual([]);
    expect(r.recent_state).toBeNull();
    expect(r.top_people).toEqual([]);
    expect(r.active_stances).toEqual([]);
    expect(r.active_preferences).toEqual([]);
    expect(r.resources_summary).toEqual({ count: 0, sample: [] });
    expect(r.knowledge_summary).toEqual({ count: 0, sample: [] });
    expect(r.places_summary).toEqual({ count: 0, sample: [] });
    expect(r.last_updated).toBeNull();
  });

  test("populated store returns each slot filled correctly", () => {
    store.createEntity(
      {
        type: "self",
        title: "Narcis",
        attrs: { pillars: ["build"], voice_rules: [], narrative: "hospital + builder" },
      },
      ACTOR,
    );
    store.createEntity(
      { type: "role", title: "Hospital IT", attrs: { domain: "defensive" } },
      ACTOR,
    );
    store.createEntity(
      { type: "goal", title: "Ship PCA", attrs: { timeframe: "short" } },
      ACTOR,
    );
    store.createEntity(
      { type: "constraint", title: "Hospital hours", attrs: { kind: "time", hard_or_soft: "hard" } },
      ACTOR,
    );
    store.createEntity(
      { type: "state", title: "tired", attrs: { energy: "low" } },
      ACTOR,
    );
    store.createEntity(
      { type: "person", title: "Mihai", attrs: { relation: "son", importance: "high" } },
      ACTOR,
    );

    const r = getSelfSummary(store, {});
    expect(r.self?.title).toBe("Narcis");
    expect(r.active_roles.map((e) => e.title)).toEqual(["Hospital IT"]);
    expect(r.active_goals.map((e) => e.title)).toEqual(["Ship PCA"]);
    expect(r.active_constraints.map((e) => e.title)).toEqual(["Hospital hours"]);
    expect(r.recent_state?.title).toBe("tired");
    expect(r.top_people.map((e) => e.title)).toEqual(["Mihai"]);
    expect(r.last_updated).not.toBeNull();
  });

  test("resources / knowledge / places use sample truncation", () => {
    for (let i = 0; i < 5; i++) {
      store.createEntity(
        {
          type: "resource",
          title: `tool-${i}`,
          attrs: { kind: "tool" },
        },
        ACTOR,
      );
    }
    const r = getSelfSummary(store, {}, { sampleSize: 3 });
    expect(r.resources_summary.count).toBe(5);
    expect(r.resources_summary.sample).toHaveLength(3);
  });

  test("performance: ≤ 50ms with 100 entities (PRD §12.4 target was 100ms)", () => {
    for (let i = 0; i < 100; i++) {
      store.createEntity(
        { type: "goal", title: `g-${i}`, attrs: { timeframe: "short" } },
        ACTOR,
      );
    }
    const start = performance.now();
    getSelfSummary(store, {});
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(50);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// get_relevant_context
// ────────────────────────────────────────────────────────────────────────────

describe("get_relevant_context", () => {
  test("FTS query returns matching items", () => {
    store.createEntity(
      { type: "goal", title: "Ship PCA MVP", attrs: { timeframe: "short" } },
      ACTOR,
    );
    store.createEntity(
      { type: "goal", title: "Read book", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const r = getRelevantContext(store, { query: "PCA" });
    expect(r.items).toHaveLength(1);
    expect(r.items[0]!.title).toContain("PCA");
    expect(r.total_matched).toBe(1);
    expect(r.retrieval_strategy).toBe("fts5+type-filter");
  });

  test("type filter narrows results", () => {
    store.createEntity(
      { type: "goal", title: "alpha goal", attrs: { timeframe: "short" } },
      ACTOR,
    );
    store.createEntity(
      { type: "knowledge", title: "alpha knowledge", attrs: { domain: "x", depth: "novice" } },
      ACTOR,
    );
    const r = getRelevantContext(store, { query: "alpha", types: ["goal"] });
    expect(r.items).toHaveLength(1);
    expect(r.items[0]!.type).toBe("goal");
  });

  test("max_items caps the result count", () => {
    for (let i = 0; i < 20; i++) {
      store.createEntity(
        { type: "goal", title: `match-${i}`, attrs: { timeframe: "short" } },
        ACTOR,
      );
    }
    const r = getRelevantContext(store, { query: "match", max_items: 3 });
    expect(r.items).toHaveLength(3);
  });

  test("no matches → empty result", () => {
    store.createEntity(
      { type: "goal", title: "alpha", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const r = getRelevantContext(store, { query: "nonexistent" });
    expect(r.items).toEqual([]);
    expect(r.total_matched).toBe(0);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// record_observation
// ────────────────────────────────────────────────────────────────────────────

describe("record_observation", () => {
  test("creates an entity with explicit type and attrs", () => {
    const r = recordObservation(
      store,
      {
        text: "Ship PCA MVP",
        type: "goal",
        attrs: { timeframe: "short" },
      },
      ACTOR,
    );
    expect(r.status).toBe("created");
    expect(r.type).toBe("goal");
    expect(r.id).toBeString();
    expect(r.applied_default_ttl).toBe(true);
    expect(r.expires_at).not.toBeNull();
  });

  test("defaults type to 'event' when omitted", () => {
    const r = recordObservation(
      store,
      { text: "Visited the hospital" },
      ACTOR,
    );
    expect(r.type).toBe("event");
  });

  test("first newline splits title and body", () => {
    const r = recordObservation(
      store,
      { text: "Headline title\nLonger explanatory body text" },
      ACTOR,
    );
    const e = store.getEntity(r.id);
    expect(e?.title).toBe("Headline title");
    expect(e?.body).toBe("Longer explanatory body text");
  });

  test("explicit title overrides text-derivation", () => {
    const r = recordObservation(
      store,
      { text: "raw long thing", title: "Curated title" },
      ACTOR,
    );
    const e = store.getEntity(r.id);
    expect(e?.title).toBe("Curated title");
    expect(e?.body).toBe("raw long thing");
  });

  test("explicit expires_at=null disables TTL → applied_default_ttl=false", () => {
    const r = recordObservation(
      store,
      {
        text: "Long-term goal",
        type: "goal",
        attrs: { timeframe: "long" },
        expires_at: null,
      },
      ACTOR,
    );
    expect(r.expires_at).toBeNull();
    expect(r.applied_default_ttl).toBe(false);
  });

  test("explicit expires_at ISO string is preserved", () => {
    const iso = "2099-01-01T00:00:00.000Z";
    const r = recordObservation(
      store,
      {
        text: "Goal",
        type: "goal",
        attrs: { timeframe: "long" },
        expires_at: iso,
      },
      ACTOR,
    );
    expect(r.expires_at).toBe(iso);
    expect(r.applied_default_ttl).toBe(false);
  });

  test("bad attrs surface as HandlerError (BAD_ATTRS)", () => {
    let err: unknown;
    try {
      recordObservation(
        store,
        { text: "x", type: "goal", attrs: { timeframe: "BOGUS" } },
        ACTOR,
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("BAD_ATTRS");
  });

  test("singleton conflict on duplicate self", () => {
    recordObservation(
      store,
      {
        text: "Narcis",
        type: "self",
        attrs: { pillars: [], voice_rules: [], narrative: "x" },
      },
      ACTOR,
    );
    let err: unknown;
    try {
      recordObservation(
        store,
        {
          text: "Narcis 2",
          type: "self",
          attrs: { pillars: [], voice_rules: [], narrative: "y" },
        },
        ACTOR,
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("SINGLETON_CONFLICT");
  });

  test("empty text rejected", () => {
    let err: unknown;
    try {
      recordObservation(store, { text: "   " }, ACTOR);
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("BAD_INPUT");
  });

  test("authority default is 'observed' when not given", () => {
    const r = recordObservation(
      store,
      { text: "Quick note", type: "event" },
      ACTOR,
    );
    expect(r.authority).toBe("observed");
  });

  test("authority='self-declared' is preserved", () => {
    const r = recordObservation(
      store,
      {
        text: "I prefer plain prose",
        type: "preference",
        attrs: { register: "voice" },
        authority: "self-declared",
      },
      ACTOR,
    );
    expect(r.authority).toBe("self-declared");
  });
});

// ────────────────────────────────────────────────────────────────────────────
// update_entity
// ────────────────────────────────────────────────────────────────────────────

describe("update_entity", () => {
  test("partial update returns previous + current", async () => {
    const created = recordObservation(
      store,
      { text: "Goal A", type: "goal", attrs: { timeframe: "short" } },
      ACTOR,
    );
    await Bun.sleep(5);
    const r = updateEntity(
      store,
      { id: created.id, changes: { title: "Goal B" } },
      ACTOR,
    );
    expect(r.previous.title).toBe("Goal A");
    expect(r.current.title).toBe("Goal B");
  });

  test("NOT_FOUND on bad id", () => {
    let err: unknown;
    try {
      updateEntity(store, { id: "nope", changes: { title: "x" } }, ACTOR);
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("NOT_FOUND");
  });

  test("status='archived' archives the entity", () => {
    const created = recordObservation(
      store,
      { text: "x", type: "goal", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const r = updateEntity(
      store,
      { id: created.id, changes: { status: "archived" } },
      ACTOR,
    );
    expect(r.current.status).toBe("archived");
  });
});

// ────────────────────────────────────────────────────────────────────────────
// confirm_entity
// ────────────────────────────────────────────────────────────────────────────

describe("confirm_entity", () => {
  test("still-true extends expiry", () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    const e = store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "short" }, expires_at: past },
      ACTOR,
    );
    const r = confirmEntity(store, { id: e.id, decision: "still-true" }, ACTOR);
    expect(r.outcome).toBe("extended");
    expect(Date.parse(r.new_expires_at!)).toBeGreaterThan(Date.now());
  });

  test("no-longer-true invalidates", () => {
    const e = store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const r = confirmEntity(store, { id: e.id, decision: "no-longer-true" }, ACTOR);
    expect(r.outcome).toBe("invalidated");
    expect(store.getEntity(e.id)?.status).toBe("invalidated");
  });

  test("modify applies changes + extends expiry", () => {
    const e = store.createEntity(
      { type: "goal", title: "old", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const r = confirmEntity(
      store,
      {
        id: e.id,
        decision: "modify",
        modify: { title: "new", attrs: { timeframe: "mid" } },
      },
      ACTOR,
    );
    expect(r.outcome).toBe("modified");
    const updated = store.getEntity(e.id)!;
    expect(updated.title).toBe("new");
    expect(updated.attrs.timeframe).toBe("mid");
  });

  test("NOT_FOUND on bad id", () => {
    let err: unknown;
    try {
      confirmEntity(store, { id: "nope", decision: "still-true" }, ACTOR);
    } catch (e) {
      err = e;
    }
    expect((err as HandlerError).code).toBe("NOT_FOUND");
  });
});

// ────────────────────────────────────────────────────────────────────────────
// list_active
// ────────────────────────────────────────────────────────────────────────────

describe("list_active", () => {
  test("empty store returns count 0", () => {
    const r = listActive(store, { type: "goal" });
    expect(r).toEqual({ type: "goal", count: 0, items: [] });
  });

  test("returns active items of requested type only", () => {
    store.createEntity(
      { type: "goal", title: "g1", attrs: { timeframe: "short" } },
      ACTOR,
    );
    store.createEntity(
      { type: "constraint", title: "c1", attrs: { kind: "time", hard_or_soft: "hard" } },
      ACTOR,
    );
    const r = listActive(store, { type: "goal" });
    expect(r.count).toBe(1);
    expect(r.items[0]!.title).toBe("g1");
  });

  test("limit caps results", () => {
    for (let i = 0; i < 10; i++) {
      store.createEntity(
        { type: "goal", title: `g-${i}`, attrs: { timeframe: "short" } },
        ACTOR,
      );
    }
    const r = listActive(store, { type: "goal", limit: 3 });
    expect(r.count).toBe(3);
  });

  test("excludes expired", () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    store.createEntity(
      { type: "goal", title: "old", attrs: { timeframe: "short" }, expires_at: past },
      ACTOR,
    );
    store.createEntity(
      { type: "goal", title: "fresh", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const r = listActive(store, { type: "goal" });
    expect(r.items.map((e) => e.title)).toEqual(["fresh"]);
  });
});
