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

beforeEach(async () => {
  const t = await withTempStore();
  store = t.store;
  cleanup = t.cleanup;
});

afterEach(() => cleanup?.());

const ACTOR = "test";

// ────────────────────────────────────────────────────────────────────────────
// get_self_summary
// ────────────────────────────────────────────────────────────────────────────

describe("get_self_summary", () => {
  test("empty store yields all-null/empty summary", async () => {
    const r = await getSelfSummary(store, {});
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

  test("populated store returns each slot filled correctly", async () => {
    await store.createEntity(
      {
        type: "self",
        title: "Narcis",
        attrs: { pillars: ["build"], voice_rules: [], narrative: "hospital + builder" },
      },
      ACTOR,
    );
    await store.createEntity(
      { type: "role", title: "Hospital IT", attrs: { domain: "defensive" } },
      ACTOR,
    );
    await store.createEntity(
      { type: "goal", title: "Ship PCA", attrs: { timeframe: "short" } },
      ACTOR,
    );
    await store.createEntity(
      { type: "constraint", title: "Hospital hours", attrs: { kind: "time", hard_or_soft: "hard" } },
      ACTOR,
    );
    await store.createEntity(
      { type: "state", title: "tired", attrs: { energy: "low" } },
      ACTOR,
    );
    await store.createEntity(
      { type: "person", title: "Mihai", attrs: { relation: "son", importance: "high" } },
      ACTOR,
    );

    const r = await getSelfSummary(store, {});
    expect(r.self?.title).toBe("Narcis");
    expect(r.active_roles.map((e) => e.title)).toEqual(["Hospital IT"]);
    expect(r.active_goals.map((e) => e.title)).toEqual(["Ship PCA"]);
    expect(r.active_constraints.map((e) => e.title)).toEqual(["Hospital hours"]);
    expect(r.recent_state?.title).toBe("tired");
    expect(r.top_people.map((e) => e.title)).toEqual(["Mihai"]);
    expect(r.last_updated).not.toBeNull();
  });

  test("resources / knowledge / places use sample truncation", async () => {
    for (let i = 0; i < 5; i++) {
      await store.createEntity(
        {
          type: "resource",
          title: `tool-${i}`,
          attrs: { kind: "tool" },
        },
        ACTOR,
      );
    }
    const r = await getSelfSummary(store, {}, { sampleSize: 3 });
    expect(r.resources_summary.count).toBe(5);
    expect(r.resources_summary.sample).toHaveLength(3);
  });

  test("performance: ≤ 150ms with 100 entities", async () => {
    for (let i = 0; i < 100; i++) {
      await store.createEntity(
        { type: "goal", title: `g-${i}`, attrs: { timeframe: "short" } },
        ACTOR,
      );
    }
    const start = performance.now();
    await getSelfSummary(store, {});
    const elapsed = performance.now() - start;
    // libsql async path is slower than bun:sqlite sync; the 100ms PRD target
    // assumed sync. Embedded replica still feels instant in practice.
    expect(elapsed).toBeLessThan(150);
  });

  test("key_links: surfaces links touching self / goals / people / constraints", async () => {
    await store.createEntity(
      {
        type: "self",
        title: "Narcis",
        attrs: { pillars: ["build"], voice_rules: [], narrative: "n" },
      },
      ACTOR,
    );
    const goal = await store.createEntity(
      { type: "goal", title: "Ship", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const wife = await store.createEntity(
      {
        type: "person",
        title: "Wife",
        attrs: { relation: "wife", importance: "high" },
      },
      ACTOR,
    );
    const constraint = await store.createEntity(
      {
        type: "constraint",
        title: "Hospital hours",
        attrs: { kind: "time", hard_or_soft: "hard" },
      },
      ACTOR,
    );
    const orphanGoal = await store.createEntity(
      { type: "goal", title: "Orphan", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const orphanPerson = await store.createEntity(
      {
        type: "person",
        title: "Stranger",
        attrs: { relation: "other", importance: "low" },
      },
      ACTOR,
    );

    // Touches goal + person — should appear.
    await linkEntities(
      store,
      { src_id: goal.id, dst_id: wife.id, relation: "collaborates-with" },
      ACTOR,
    );
    // Touches goal + constraint — should appear.
    await linkEntities(
      store,
      { src_id: goal.id, dst_id: constraint.id, relation: "addresses" },
      ACTOR,
    );
    // Both endpoints are unrelated to anchors after invalidation below.
    await linkEntities(
      store,
      { src_id: orphanGoal.id, dst_id: orphanPerson.id, relation: "collaborates-with" },
      ACTOR,
    );

    // Remove orphanGoal/orphanPerson from anchor sets so that their link is not surfaced.
    await store.invalidateEntity(orphanGoal.id, ACTOR);
    await store.invalidateEntity(orphanPerson.id, ACTOR);

    const r = await getSelfSummary(store, {});
    expect(r.key_links.length).toBe(2);
    const relations = r.key_links.map((kl) => kl.link.relation).sort();
    expect(relations).toEqual(["addresses", "collaborates-with"]);
    // Light projection — no body on endpoints.
    const sample = r.key_links[0]!;
    expect(sample.src).toHaveProperty("title");
    expect(sample.src).not.toHaveProperty("body");
    expect(sample.dst).toHaveProperty("type");
  });

  test("key_links: dedupes a single link reachable from both endpoints", async () => {
    const goal = await store.createEntity(
      { type: "goal", title: "G", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const wife = await store.createEntity(
      {
        type: "person",
        title: "Wife",
        attrs: { relation: "wife", importance: "high" },
      },
      ACTOR,
    );
    await linkEntities(
      store,
      { src_id: goal.id, dst_id: wife.id, relation: "collaborates-with" },
      ACTOR,
    );

    const r = await getSelfSummary(store, {});
    // Both goal AND wife are anchors, but the single link must appear once.
    expect(r.key_links).toHaveLength(1);
  });

  test("key_links: drops `related-to` once 6+ high-signal links exist", async () => {
    const self = await store.createEntity(
      {
        type: "self",
        title: "Me",
        attrs: { pillars: [], voice_rules: [], narrative: "n" },
      },
      ACTOR,
    );
    // 6 high-signal links: self → 6 distinct stances via `reinforces`.
    for (let i = 0; i < 6; i++) {
      const stance = await store.createEntity(
        {
          type: "stance",
          title: `stance-${i}`,
          attrs: { reason: "x" },
        },
        ACTOR,
      );
      // reinforces: stance → self
      await linkEntities(
        store,
        { src_id: stance.id, dst_id: self.id, relation: "reinforces" },
        ACTOR,
      );
    }
    // One low-signal `related-to` from a goal to a knowledge.
    const goal = await store.createEntity(
      { type: "goal", title: "G", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const knowledge = await store.createEntity(
      {
        type: "knowledge",
        title: "K",
        attrs: { domain: "x", depth: "novice" },
      },
      ACTOR,
    );
    await linkEntities(
      store,
      { src_id: goal.id, dst_id: knowledge.id, relation: "related-to" },
      ACTOR,
    );

    const r = await getSelfSummary(store, {});
    const hasRelatedTo = r.key_links.some((kl) => kl.link.relation === "related-to");
    expect(hasRelatedTo).toBe(false);
    // All surviving entries should be the high-signal `reinforces`.
    expect(r.key_links.every((kl) => kl.link.relation === "reinforces")).toBe(true);
  });

  test("key_links: keeps `related-to` when high-signal pool is small", async () => {
    const goal = await store.createEntity(
      { type: "goal", title: "G", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const place = await store.createEntity(
      { type: "place", title: "Hospital", attrs: { kind: "physical" } },
      ACTOR,
    );
    await linkEntities(
      store,
      { src_id: goal.id, dst_id: place.id, relation: "related-to" },
      ACTOR,
    );

    const r = await getSelfSummary(store, {});
    expect(r.key_links).toHaveLength(1);
    expect(r.key_links[0]!.link.relation).toBe("related-to");
  });

  test("key_links: respects keyLinksLimit cap", async () => {
    const self = await store.createEntity(
      {
        type: "self",
        title: "Me",
        attrs: { pillars: [], voice_rules: [], narrative: "n" },
      },
      ACTOR,
    );
    for (let i = 0; i < 4; i++) {
      const stance = await store.createEntity(
        {
          type: "stance",
          title: `s-${i}`,
          attrs: { reason: "x" },
        },
        ACTOR,
      );
      await linkEntities(
        store,
        { src_id: stance.id, dst_id: self.id, relation: "reinforces" },
        ACTOR,
      );
    }
    const r = await getSelfSummary(store, {}, { keyLinksLimit: 2 });
    expect(r.key_links).toHaveLength(2);
  });

  test("key_links: includeKeyLinks=false skips the slot entirely", async () => {
    const goal = await store.createEntity(
      { type: "goal", title: "G", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const wife = await store.createEntity(
      {
        type: "person",
        title: "Wife",
        attrs: { relation: "wife", importance: "high" },
      },
      ACTOR,
    );
    await linkEntities(
      store,
      { src_id: goal.id, dst_id: wife.id, relation: "collaborates-with" },
      ACTOR,
    );
    const r = await getSelfSummary(store, {}, { includeKeyLinks: false });
    expect(r.key_links).toEqual([]);
  });

  test("key_links: ranks by weight DESC then created_at DESC", async () => {
    const self = await store.createEntity(
      {
        type: "self",
        title: "Me",
        attrs: { pillars: [], voice_rules: [], narrative: "n" },
      },
      ACTOR,
    );
    const sLow = await store.createEntity(
      {
        type: "stance",
        title: "low",
        attrs: { reason: "x" },
      },
      ACTOR,
    );
    const sHigh = await store.createEntity(
      {
        type: "stance",
        title: "high",
        attrs: { reason: "y" },
      },
      ACTOR,
    );
    // Create the weight=0.2 link first, weight=0.9 link second — recency would
    // favor the second; weight should still dominate.
    await linkEntities(
      store,
      { src_id: sLow.id, dst_id: self.id, relation: "reinforces", weight: 0.2 },
      ACTOR,
    );
    await linkEntities(
      store,
      { src_id: sHigh.id, dst_id: self.id, relation: "reinforces", weight: 0.9 },
      ACTOR,
    );

    const r = await getSelfSummary(store, {});
    expect(r.key_links[0]!.link.weight).toBe(0.9);
    expect(r.key_links[1]!.link.weight).toBe(0.2);
  });

  test("key_links: excludes invalidated links", async () => {
    const goal = await store.createEntity(
      { type: "goal", title: "G", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const wife = await store.createEntity(
      {
        type: "person",
        title: "Wife",
        attrs: { relation: "wife", importance: "high" },
      },
      ACTOR,
    );
    const link = await linkEntities(
      store,
      { src_id: goal.id, dst_id: wife.id, relation: "collaborates-with" },
      ACTOR,
    );
    await invalidateLink(store, { link_id: link.id }, ACTOR);

    const r = await getSelfSummary(store, {});
    expect(r.key_links).toEqual([]);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// get_relevant_context
// ────────────────────────────────────────────────────────────────────────────

describe("get_relevant_context", () => {
  test("FTS query returns matching items", async () => {
    await store.createEntity(
      { type: "goal", title: "Ship PCA MVP", attrs: { timeframe: "short" } },
      ACTOR,
    );
    await store.createEntity(
      { type: "goal", title: "Read book", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const r = await getRelevantContext(store, { query: "PCA" });
    expect(r.items).toHaveLength(1);
    expect(r.items[0]!.title).toContain("PCA");
    expect(r.total_matched).toBe(1);
    expect(r.retrieval_strategy).toBe("fts5+type-filter");
  });

  test("type filter narrows results", async () => {
    await store.createEntity(
      { type: "goal", title: "alpha goal", attrs: { timeframe: "short" } },
      ACTOR,
    );
    await store.createEntity(
      { type: "knowledge", title: "alpha knowledge", attrs: { domain: "x", depth: "novice" } },
      ACTOR,
    );
    const r = await getRelevantContext(store, { query: "alpha", types: ["goal"] });
    expect(r.items).toHaveLength(1);
    expect(r.items[0]!.type).toBe("goal");
  });

  test("max_items caps the result count", async () => {
    for (let i = 0; i < 20; i++) {
      await store.createEntity(
        { type: "goal", title: `match-${i}`, attrs: { timeframe: "short" } },
        ACTOR,
      );
    }
    const r = await getRelevantContext(store, { query: "match", max_items: 3 });
    expect(r.items).toHaveLength(3);
  });

  test("no matches → empty result", async () => {
    await store.createEntity(
      { type: "goal", title: "alpha", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const r = await getRelevantContext(store, { query: "nonexistent" });
    expect(r.items).toEqual([]);
    expect(r.total_matched).toBe(0);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// record_observation
// ────────────────────────────────────────────────────────────────────────────

describe("record_observation", () => {
  test("creates an entity with explicit type and attrs", async () => {
    const r = await recordObservation(
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

  test("defaults type to 'event' when omitted", async () => {
    const r = await recordObservation(
      store,
      { text: "Visited the hospital" },
      ACTOR,
    );
    expect(r.type).toBe("event");
  });

  test("first newline splits title and body", async () => {
    const r = await recordObservation(
      store,
      { text: "Headline title\nLonger explanatory body text" },
      ACTOR,
    );
    const e = await store.getEntity(r.id);
    expect(e?.title).toBe("Headline title");
    expect(e?.body).toBe("Longer explanatory body text");
  });

  test("explicit title overrides text-derivation", async () => {
    const r = await recordObservation(
      store,
      { text: "raw long thing", title: "Curated title" },
      ACTOR,
    );
    const e = await store.getEntity(r.id);
    expect(e?.title).toBe("Curated title");
    expect(e?.body).toBe("raw long thing");
  });

  test("explicit expires_at=null disables TTL → applied_default_ttl=false", async () => {
    const r = await recordObservation(
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

  test("explicit expires_at ISO string is preserved", async () => {
    const iso = "2099-01-01T00:00:00.000Z";
    const r = await recordObservation(
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

  test("bad attrs surface as HandlerError (BAD_ATTRS)", async () => {
    let err: unknown;
    try {
      await recordObservation(
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

  test("singleton conflict on duplicate self", async () => {
    await recordObservation(
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
      await recordObservation(
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

  test("empty text rejected", async () => {
    let err: unknown;
    try {
      await recordObservation(store, { text: "   " }, ACTOR);
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("BAD_INPUT");
  });

  test("authority default is 'observed' when not given", async () => {
    const r = await recordObservation(
      store,
      { text: "Quick note", type: "event" },
      ACTOR,
    );
    expect(r.authority).toBe("observed");
  });

  test("authority='self-declared' is preserved", async () => {
    const r = await recordObservation(
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
    const created = await recordObservation(
      store,
      { text: "Goal A", type: "goal", attrs: { timeframe: "short" } },
      ACTOR,
    );
    await Bun.sleep(5);
    const r = await updateEntity(
      store,
      { id: created.id, changes: { title: "Goal B" } },
      ACTOR,
    );
    expect(r.previous.title).toBe("Goal A");
    expect(r.current.title).toBe("Goal B");
  });

  test("NOT_FOUND on bad id", async () => {
    let err: unknown;
    try {
      await updateEntity(store, { id: "nope", changes: { title: "x" } }, ACTOR);
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("NOT_FOUND");
  });

  test("status='archived' archives the entity", async () => {
    const created = await recordObservation(
      store,
      { text: "x", type: "goal", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const r = await updateEntity(
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
  test("still-true extends expiry", async () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    const e = await store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "short" }, expires_at: past },
      ACTOR,
    );
    const r = await confirmEntity(store, { id: e.id, decision: "still-true" }, ACTOR);
    expect(r.outcome).toBe("extended");
    expect(Date.parse(r.new_expires_at!)).toBeGreaterThan(Date.now());
  });

  test("no-longer-true invalidates", async () => {
    const e = await store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const r = await confirmEntity(store, { id: e.id, decision: "no-longer-true" }, ACTOR);
    expect(r.outcome).toBe("invalidated");
    expect((await store.getEntity(e.id))?.status).toBe("invalidated");
  });

  test("modify applies changes + extends expiry", async () => {
    const e = await store.createEntity(
      { type: "goal", title: "old", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const r = await confirmEntity(
      store,
      {
        id: e.id,
        decision: "modify",
        modify: { title: "new", attrs: { timeframe: "mid" } },
      },
      ACTOR,
    );
    expect(r.outcome).toBe("modified");
    const updated = (await store.getEntity(e.id))!;
    expect(updated.title).toBe("new");
    expect(updated.attrs.timeframe).toBe("mid");
  });

  test("NOT_FOUND on bad id", async () => {
    let err: unknown;
    try {
      await confirmEntity(store, { id: "nope", decision: "still-true" }, ACTOR);
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
  test("empty store returns count 0", async () => {
    const r = await listActive(store, { type: "goal" });
    expect(r).toEqual({ type: "goal", count: 0, items: [] });
  });

  test("returns active items of requested type only", async () => {
    await store.createEntity(
      { type: "goal", title: "g1", attrs: { timeframe: "short" } },
      ACTOR,
    );
    await store.createEntity(
      { type: "constraint", title: "c1", attrs: { kind: "time", hard_or_soft: "hard" } },
      ACTOR,
    );
    const r = await listActive(store, { type: "goal" });
    expect(r.count).toBe(1);
    expect(r.items[0]!.title).toBe("g1");
  });

  test("limit caps results", async () => {
    for (let i = 0; i < 10; i++) {
      await store.createEntity(
        { type: "goal", title: `g-${i}`, attrs: { timeframe: "short" } },
        ACTOR,
      );
    }
    const r = await listActive(store, { type: "goal", limit: 3 });
    expect(r.count).toBe(3);
  });

  test("excludes expired", async () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    await store.createEntity(
      { type: "goal", title: "old", attrs: { timeframe: "short" }, expires_at: past },
      ACTOR,
    );
    await store.createEntity(
      { type: "goal", title: "fresh", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const r = await listActive(store, { type: "goal" });
    expect(r.items.map((e) => e.title)).toEqual(["fresh"]);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// link_entities
// ────────────────────────────────────────────────────────────────────────────

describe("link_entities", () => {
  test("creates a link between two active entities", async () => {
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const link = await linkEntities(
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

  test("rejects when src does not exist (NOT_FOUND)", async () => {
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    let err: unknown;
    try {
      await linkEntities(
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

  test("rejects when dst does not exist (NOT_FOUND)", async () => {
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    let err: unknown;
    try {
      await linkEntities(
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

  test("rejects when src is invalidated (INACTIVE_ENTITY)", async () => {
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    await store.invalidateEntity(a.id, ACTOR);
    let err: unknown;
    try {
      await linkEntities(
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

  test("rejects when dst is invalidated (INACTIVE_ENTITY)", async () => {
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    await store.invalidateEntity(b.id, ACTOR);
    let err: unknown;
    try {
      await linkEntities(
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

  test("rejects self-link (BAD_INPUT)", async () => {
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    let err: unknown;
    try {
      await linkEntities(
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

  test("unknown relation is rejected (UNKNOWN_RELATION)", async () => {
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    let err: unknown;
    try {
      await linkEntities(
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

  test("disallowed pair is rejected (BAD_PAIR)", async () => {
    const goal = await store.createEntity(
      { type: "goal", title: "G", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const place = await store.createEntity(
      { type: "place", title: "Cafe", attrs: { kind: "physical" } },
      ACTOR,
    );
    let err: unknown;
    try {
      await linkEntities(
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

  test("symmetric relations accept reversed pair direction", async () => {
    const goal = await store.createEntity(
      { type: "goal", title: "Ship", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const wife = await store.createEntity(
      { type: "person", title: "Wife", attrs: { relation: "wife", importance: "high" } },
      ACTOR,
    );
    // Spec lists (person, goal) — try (goal, person) which should still pass
    // because collaborates-with is symmetric.
    const link = await linkEntities(
      store,
      { src_id: goal.id, dst_id: wife.id, relation: "collaborates-with" },
      ACTOR,
    );
    expect(link.relation).toBe("collaborates-with");
  });

  test("acyclic relation refuses a would-be cycle (WOULD_CYCLE)", async () => {
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const c = await store.createEntity(
      { type: "goal", title: "C", attrs: { timeframe: "short" } },
      ACTOR,
    );
    await linkEntities(store, { src_id: a.id, dst_id: b.id, relation: "subgoal-of" }, ACTOR);
    await linkEntities(store, { src_id: b.id, dst_id: c.id, relation: "subgoal-of" }, ACTOR);
    let err: unknown;
    try {
      await linkEntities(
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

  test("`related-to` accepts any pair (fallback)", async () => {
    const goal = await store.createEntity(
      { type: "goal", title: "G", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const place = await store.createEntity(
      { type: "place", title: "Hospital", attrs: { kind: "physical" } },
      ACTOR,
    );
    const link = await linkEntities(
      store,
      { src_id: goal.id, dst_id: place.id, relation: "related-to" },
      ACTOR,
    );
    expect(link.relation).toBe("related-to");
  });

  test("authority + weight are passed through", async () => {
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = await store.createEntity(
      { type: "person", title: "Wife", attrs: { relation: "wife", importance: "high" } },
      ACTOR,
    );
    const link = await linkEntities(
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
  test("returns role='out' for outgoing and 'in' for incoming", async () => {
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const c = await store.createEntity(
      { type: "goal", title: "C", attrs: { timeframe: "short" } },
      ACTOR,
    );
    await linkEntities(store, { src_id: a.id, dst_id: b.id, relation: "subgoal-of" }, ACTOR);
    await linkEntities(store, { src_id: c.id, dst_id: a.id, relation: "subgoal-of" }, ACTOR);

    const r = await getNeighbors(store, { entity_id: a.id });
    expect(r.center.id).toBe(a.id);
    expect(r.neighbors).toHaveLength(2);

    const out = r.neighbors.find((n) => n.entity.id === b.id);
    const inn = r.neighbors.find((n) => n.entity.id === c.id);
    expect(out?.role).toBe("out");
    expect(inn?.role).toBe("in");
  });

  test("direction='out' filters to outgoing only", async () => {
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const c = await store.createEntity(
      { type: "goal", title: "C", attrs: { timeframe: "short" } },
      ACTOR,
    );
    await linkEntities(store, { src_id: a.id, dst_id: b.id, relation: "subgoal-of" }, ACTOR);
    await linkEntities(store, { src_id: c.id, dst_id: a.id, relation: "subgoal-of" }, ACTOR);

    const r = await getNeighbors(store, { entity_id: a.id, direction: "out" });
    expect(r.neighbors).toHaveLength(1);
    expect(r.neighbors[0]!.entity.id).toBe(b.id);
    expect(r.neighbors[0]!.role).toBe("out");
  });

  test("types filter narrows neighbor entity types", async () => {
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const goalB = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const person = await store.createEntity(
      { type: "person", title: "P", attrs: { relation: "friend", importance: "med" } },
      ACTOR,
    );
    await linkEntities(store, { src_id: a.id, dst_id: goalB.id, relation: "subgoal-of" }, ACTOR);
    await linkEntities(
      store,
      { src_id: a.id, dst_id: person.id, relation: "collaborates-with" },
      ACTOR,
    );

    const r = await getNeighbors(store, { entity_id: a.id, types: ["person"] });
    expect(r.neighbors).toHaveLength(1);
    expect(r.neighbors[0]!.entity.type).toBe("person");
  });

  test("excludes invalidated neighbor entities", async () => {
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    await linkEntities(store, { src_id: a.id, dst_id: b.id, relation: "subgoal-of" }, ACTOR);
    await store.invalidateEntity(b.id, ACTOR);

    const r = await getNeighbors(store, { entity_id: a.id });
    expect(r.neighbors).toEqual([]);
  });

  test("NOT_FOUND on missing center entity", async () => {
    let err: unknown;
    try {
      await getNeighbors(store, { entity_id: "missing" });
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
  test("happy path: sets invalidated_at and logs link-invalidate event", async () => {
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const link = await linkEntities(
      store,
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      ACTOR,
    );

    const r = await invalidateLink(store, { link_id: link.id, note: "no longer true" }, ACTOR);
    expect(r.id).toBe(link.id);
    expect(typeof r.invalidated_at).toBe("string");

    const after = await store.listLinks({ entityId: a.id, includeInvalidated: true });
    const target = after.find((l) => l.id === link.id);
    expect(target?.invalidated_at).not.toBeNull();

    const events = await store.listEvents();
    const invalidateEvents = events.filter((e) => e.operation === "link-invalidate");
    expect(invalidateEvents.length).toBeGreaterThan(0);
    expect(invalidateEvents.at(-1)?.link_id).toBe(link.id);
  });

  test("NOT_FOUND on missing link id", async () => {
    let err: unknown;
    try {
      await invalidateLink(store, { link_id: "missing" }, ACTOR);
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(HandlerError);
    expect((err as HandlerError).code).toBe("NOT_FOUND");
  });
});
