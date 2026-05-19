// Handler-layer tests. Pure functions, in-memory temp DB per test.
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { withTempStore } from "../../core/tests/helpers.ts";
import { type Store } from "@pca/core";
import {
  HandlerError,
  confirmEntity,
  getNeighbors,
  getRelevantContext,
  getSelfSummary,
  invalidateLink,
  linkEntities,
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
    expect(r.key_links).toEqual([]);
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

  test("key_links: surfaces links touching self / goals / people / constraints", () => {
    store.createEntity(
      {
        type: "self",
        title: "Narcis",
        attrs: { pillars: ["build"], voice_rules: [], narrative: "n" },
      },
      ACTOR,
    );
    const goal = store.createEntity(
      { type: "goal", title: "Ship", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const wife = store.createEntity(
      {
        type: "person",
        title: "Wife",
        attrs: { relation: "wife", importance: "high" },
      },
      ACTOR,
    );
    const constraint = store.createEntity(
      {
        type: "constraint",
        title: "Hospital hours",
        attrs: { kind: "time", hard_or_soft: "hard" },
      },
      ACTOR,
    );
    const orphanGoal = store.createEntity(
      { type: "goal", title: "Orphan", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const orphanPerson = store.createEntity(
      {
        type: "person",
        title: "Stranger",
        attrs: { relation: "other", importance: "low" },
      },
      ACTOR,
    );

    // Touches goal + person — should appear.
    linkEntities(
      store,
      { src_id: goal.id, dst_id: wife.id, relation: "collaborates-with" },
      ACTOR,
    );
    // Touches goal + constraint — should appear.
    linkEntities(
      store,
      { src_id: goal.id, dst_id: constraint.id, relation: "addresses" },
      ACTOR,
    );
    // Both endpoints are unrelated to anchors after invalidation below.
    linkEntities(
      store,
      { src_id: orphanGoal.id, dst_id: orphanPerson.id, relation: "collaborates-with" },
      ACTOR,
    );

    // Remove orphanGoal/orphanPerson from anchor sets so that their link is not surfaced.
    store.invalidateEntity(orphanGoal.id, ACTOR);
    store.invalidateEntity(orphanPerson.id, ACTOR);

    const r = getSelfSummary(store, {});
    expect(r.key_links.length).toBe(2);
    const relations = r.key_links.map((kl) => kl.link.relation).sort();
    expect(relations).toEqual(["addresses", "collaborates-with"]);
    // Light projection — no body on endpoints.
    const sample = r.key_links[0]!;
    expect(sample.src).toHaveProperty("title");
    expect(sample.src).not.toHaveProperty("body");
    expect(sample.dst).toHaveProperty("type");
  });

  test("key_links: dedupes a single link reachable from both endpoints", () => {
    const goal = store.createEntity(
      { type: "goal", title: "G", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const wife = store.createEntity(
      {
        type: "person",
        title: "Wife",
        attrs: { relation: "wife", importance: "high" },
      },
      ACTOR,
    );
    linkEntities(
      store,
      { src_id: goal.id, dst_id: wife.id, relation: "collaborates-with" },
      ACTOR,
    );

    const r = getSelfSummary(store, {});
    // Both goal AND wife are anchors, but the single link must appear once.
    expect(r.key_links).toHaveLength(1);
  });

  test("key_links: drops `related-to` once 6+ high-signal links exist", () => {
    const self = store.createEntity(
      {
        type: "self",
        title: "Me",
        attrs: { pillars: [], voice_rules: [], narrative: "n" },
      },
      ACTOR,
    );
    // 6 high-signal links: self → 6 distinct stances via `reinforces`.
    for (let i = 0; i < 6; i++) {
      const stance = store.createEntity(
        {
          type: "stance",
          title: `stance-${i}`,
          attrs: { reason: "x" },
        },
        ACTOR,
      );
      // reinforces: stance → self
      linkEntities(
        store,
        { src_id: stance.id, dst_id: self.id, relation: "reinforces" },
        ACTOR,
      );
    }
    // One low-signal `related-to` from a goal to a knowledge.
    const goal = store.createEntity(
      { type: "goal", title: "G", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const knowledge = store.createEntity(
      {
        type: "knowledge",
        title: "K",
        attrs: { domain: "x", depth: "novice" },
      },
      ACTOR,
    );
    linkEntities(
      store,
      { src_id: goal.id, dst_id: knowledge.id, relation: "related-to" },
      ACTOR,
    );

    const r = getSelfSummary(store, {});
    const hasRelatedTo = r.key_links.some((kl) => kl.link.relation === "related-to");
    expect(hasRelatedTo).toBe(false);
    // All surviving entries should be the high-signal `reinforces`.
    expect(r.key_links.every((kl) => kl.link.relation === "reinforces")).toBe(true);
  });

  test("key_links: keeps `related-to` when high-signal pool is small", () => {
    const goal = store.createEntity(
      { type: "goal", title: "G", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const place = store.createEntity(
      { type: "place", title: "Hospital", attrs: { kind: "physical" } },
      ACTOR,
    );
    linkEntities(
      store,
      { src_id: goal.id, dst_id: place.id, relation: "related-to" },
      ACTOR,
    );

    const r = getSelfSummary(store, {});
    expect(r.key_links).toHaveLength(1);
    expect(r.key_links[0]!.link.relation).toBe("related-to");
  });

  test("key_links: respects keyLinksLimit cap", () => {
    const self = store.createEntity(
      {
        type: "self",
        title: "Me",
        attrs: { pillars: [], voice_rules: [], narrative: "n" },
      },
      ACTOR,
    );
    for (let i = 0; i < 4; i++) {
      const stance = store.createEntity(
        {
          type: "stance",
          title: `s-${i}`,
          attrs: { reason: "x" },
        },
        ACTOR,
      );
      linkEntities(
        store,
        { src_id: stance.id, dst_id: self.id, relation: "reinforces" },
        ACTOR,
      );
    }
    const r = getSelfSummary(store, {}, { keyLinksLimit: 2 });
    expect(r.key_links).toHaveLength(2);
  });

  test("key_links: includeKeyLinks=false skips the slot entirely", () => {
    const goal = store.createEntity(
      { type: "goal", title: "G", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const wife = store.createEntity(
      {
        type: "person",
        title: "Wife",
        attrs: { relation: "wife", importance: "high" },
      },
      ACTOR,
    );
    linkEntities(
      store,
      { src_id: goal.id, dst_id: wife.id, relation: "collaborates-with" },
      ACTOR,
    );
    const r = getSelfSummary(store, {}, { includeKeyLinks: false });
    expect(r.key_links).toEqual([]);
  });

  test("key_links: ranks by weight DESC then created_at DESC", () => {
    const self = store.createEntity(
      {
        type: "self",
        title: "Me",
        attrs: { pillars: [], voice_rules: [], narrative: "n" },
      },
      ACTOR,
    );
    const sLow = store.createEntity(
      {
        type: "stance",
        title: "low",
        attrs: { reason: "x" },
      },
      ACTOR,
    );
    const sHigh = store.createEntity(
      {
        type: "stance",
        title: "high",
        attrs: { reason: "y" },
      },
      ACTOR,
    );
    // Create the weight=0.2 link first, weight=0.9 link second — recency would
    // favor the second; weight should still dominate.
    linkEntities(
      store,
      { src_id: sLow.id, dst_id: self.id, relation: "reinforces", weight: 0.2 },
      ACTOR,
    );
    linkEntities(
      store,
      { src_id: sHigh.id, dst_id: self.id, relation: "reinforces", weight: 0.9 },
      ACTOR,
    );

    const r = getSelfSummary(store, {});
    expect(r.key_links[0]!.link.weight).toBe(0.9);
    expect(r.key_links[1]!.link.weight).toBe(0.2);
  });

  test("key_links: excludes invalidated links", () => {
    const goal = store.createEntity(
      { type: "goal", title: "G", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const wife = store.createEntity(
      {
        type: "person",
        title: "Wife",
        attrs: { relation: "wife", importance: "high" },
      },
      ACTOR,
    );
    const link = linkEntities(
      store,
      { src_id: goal.id, dst_id: wife.id, relation: "collaborates-with" },
      ACTOR,
    );
    invalidateLink(store, { link_id: link.id }, ACTOR);

    const r = getSelfSummary(store, {});
    expect(r.key_links).toEqual([]);
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

// ────────────────────────────────────────────────────────────────────────────
// link_entities
// ────────────────────────────────────────────────────────────────────────────

describe("link_entities", () => {
  test("creates a link between two active entities", () => {
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const link = linkEntities(
      store,
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      ACTOR,
    );
    expect(link.id).toBeString();
    expect(link.src_id).toBe(a.id);
    expect(link.dst_id).toBe(b.id);
    expect(link.relation).toBe("subgoal-of");
    expect(link.weight).toBe(1.0);
    expect(link.authority).toBe("observed");
    expect(link.invalidated_at).toBeNull();
  });

  test("rejects when src does not exist (NOT_FOUND)", () => {
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    let err: unknown;
    try {
      linkEntities(
        store,
        { src_id: "missing", dst_id: b.id, relation: "subgoal-of" },
        ACTOR,
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("NOT_FOUND");
  });

  test("rejects when dst does not exist (NOT_FOUND)", () => {
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    let err: unknown;
    try {
      linkEntities(
        store,
        { src_id: a.id, dst_id: "missing", relation: "subgoal-of" },
        ACTOR,
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("NOT_FOUND");
  });

  test("rejects when src is invalidated (INACTIVE_ENTITY)", () => {
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    store.invalidateEntity(a.id, ACTOR);
    let err: unknown;
    try {
      linkEntities(
        store,
        { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
        ACTOR,
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("INACTIVE_ENTITY");
  });

  test("rejects when dst is invalidated (INACTIVE_ENTITY)", () => {
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    store.invalidateEntity(b.id, ACTOR);
    let err: unknown;
    try {
      linkEntities(
        store,
        { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
        ACTOR,
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("INACTIVE_ENTITY");
  });

  test("rejects self-link (BAD_INPUT)", () => {
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    let err: unknown;
    try {
      linkEntities(
        store,
        { src_id: a.id, dst_id: a.id, relation: "related-to" },
        ACTOR,
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("BAD_INPUT");
  });

  test("unknown relation is rejected (UNKNOWN_RELATION)", () => {
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    let err: unknown;
    try {
      linkEntities(
        store,
        { src_id: a.id, dst_id: b.id, relation: "made-up-relation" },
        ACTOR,
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("UNKNOWN_RELATION");
  });

  test("disallowed pair is rejected (BAD_PAIR)", () => {
    const goal = store.createEntity(
      { type: "goal", title: "G", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const place = store.createEntity(
      { type: "place", title: "Cafe", attrs: { kind: "physical" } },
      ACTOR,
    );
    let err: unknown;
    try {
      linkEntities(
        store,
        { src_id: goal.id, dst_id: place.id, relation: "subgoal-of" },
        ACTOR,
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("BAD_PAIR");
  });

  test("symmetric relations accept reversed pair direction", () => {
    const goal = store.createEntity(
      { type: "goal", title: "Ship", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const wife = store.createEntity(
      { type: "person", title: "Wife", attrs: { relation: "wife", importance: "high" } },
      ACTOR,
    );
    // Spec lists (person, goal) — try (goal, person) which should still pass
    // because collaborates-with is symmetric.
    const link = linkEntities(
      store,
      { src_id: goal.id, dst_id: wife.id, relation: "collaborates-with" },
      ACTOR,
    );
    expect(link.relation).toBe("collaborates-with");
  });

  test("acyclic relation refuses a would-be cycle (WOULD_CYCLE)", () => {
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const c = store.createEntity(
      { type: "goal", title: "C", attrs: { timeframe: "short" } },
      ACTOR,
    );
    linkEntities(store, { src_id: a.id, dst_id: b.id, relation: "subgoal-of" }, ACTOR);
    linkEntities(store, { src_id: b.id, dst_id: c.id, relation: "subgoal-of" }, ACTOR);
    let err: unknown;
    try {
      linkEntities(
        store,
        { src_id: c.id, dst_id: a.id, relation: "subgoal-of" },
        ACTOR,
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("WOULD_CYCLE");
  });

  test("`related-to` accepts any pair (fallback)", () => {
    const goal = store.createEntity(
      { type: "goal", title: "G", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const place = store.createEntity(
      { type: "place", title: "Hospital", attrs: { kind: "physical" } },
      ACTOR,
    );
    const link = linkEntities(
      store,
      { src_id: goal.id, dst_id: place.id, relation: "related-to" },
      ACTOR,
    );
    expect(link.relation).toBe("related-to");
  });

  test("authority + weight are passed through", () => {
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = store.createEntity(
      { type: "person", title: "Wife", attrs: { relation: "wife", importance: "high" } },
      ACTOR,
    );
    const link = linkEntities(
      store,
      {
        src_id: a.id,
        dst_id: b.id,
        relation: "collaborates-with",
        weight: 0.5,
        authority: "self-declared",
      },
      ACTOR,
    );
    expect(link.weight).toBe(0.5);
    expect(link.authority).toBe("self-declared");
  });
});

// ────────────────────────────────────────────────────────────────────────────
// get_neighbors
// ────────────────────────────────────────────────────────────────────────────

describe("get_neighbors", () => {
  test("returns role='out' for outgoing and 'in' for incoming", () => {
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const c = store.createEntity(
      { type: "goal", title: "C", attrs: { timeframe: "short" } },
      ACTOR,
    );
    linkEntities(store, { src_id: a.id, dst_id: b.id, relation: "subgoal-of" }, ACTOR);
    linkEntities(store, { src_id: c.id, dst_id: a.id, relation: "subgoal-of" }, ACTOR);

    const r = getNeighbors(store, { entity_id: a.id });
    expect(r.center.id).toBe(a.id);
    expect(r.neighbors).toHaveLength(2);

    const out = r.neighbors.find((n) => n.entity.id === b.id);
    const inn = r.neighbors.find((n) => n.entity.id === c.id);
    expect(out?.role).toBe("out");
    expect(inn?.role).toBe("in");
  });

  test("direction='out' filters to outgoing only", () => {
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const c = store.createEntity(
      { type: "goal", title: "C", attrs: { timeframe: "short" } },
      ACTOR,
    );
    linkEntities(store, { src_id: a.id, dst_id: b.id, relation: "subgoal-of" }, ACTOR);
    linkEntities(store, { src_id: c.id, dst_id: a.id, relation: "subgoal-of" }, ACTOR);

    const r = getNeighbors(store, { entity_id: a.id, direction: "out" });
    expect(r.neighbors).toHaveLength(1);
    expect(r.neighbors[0]!.entity.id).toBe(b.id);
    expect(r.neighbors[0]!.role).toBe("out");
  });

  test("types filter narrows neighbor entity types", () => {
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const goalB = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const person = store.createEntity(
      { type: "person", title: "P", attrs: { relation: "friend", importance: "med" } },
      ACTOR,
    );
    linkEntities(store, { src_id: a.id, dst_id: goalB.id, relation: "subgoal-of" }, ACTOR);
    linkEntities(
      store,
      { src_id: a.id, dst_id: person.id, relation: "collaborates-with" },
      ACTOR,
    );

    const r = getNeighbors(store, { entity_id: a.id, types: ["person"] });
    expect(r.neighbors).toHaveLength(1);
    expect(r.neighbors[0]!.entity.type).toBe("person");
  });

  test("excludes invalidated neighbor entities", () => {
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    linkEntities(store, { src_id: a.id, dst_id: b.id, relation: "subgoal-of" }, ACTOR);
    store.invalidateEntity(b.id, ACTOR);

    const r = getNeighbors(store, { entity_id: a.id });
    expect(r.neighbors).toEqual([]);
  });

  test("NOT_FOUND on missing center entity", () => {
    let err: unknown;
    try {
      getNeighbors(store, { entity_id: "missing" });
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("NOT_FOUND");
  });
});

// ────────────────────────────────────────────────────────────────────────────
// invalidate_link
// ────────────────────────────────────────────────────────────────────────────

describe("invalidate_link", () => {
  test("happy path: sets invalidated_at and logs link-invalidate event", () => {
    const a = store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const link = linkEntities(
      store,
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      ACTOR,
    );

    const r = invalidateLink(store, { link_id: link.id, note: "no longer true" }, ACTOR);
    expect(r.id).toBe(link.id);
    expect(typeof r.invalidated_at).toBe("string");

    const after = store.listLinks({ entityId: a.id, includeInvalidated: true });
    const target = after.find((l) => l.id === link.id);
    expect(target?.invalidated_at).not.toBeNull();

    const events = store.listEvents();
    const invalidateEvents = events.filter((e) => e.operation === "link-invalidate");
    expect(invalidateEvents.length).toBeGreaterThan(0);
    expect(invalidateEvents.at(-1)?.link_id).toBe(link.id);
  });

  test("NOT_FOUND on missing link id", () => {
    let err: unknown;
    try {
      invalidateLink(store, { link_id: "missing" }, ACTOR);
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("NOT_FOUND");
  });
});
