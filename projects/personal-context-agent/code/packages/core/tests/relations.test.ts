// Unit tests for the canonical relations registry (links/relations.ts).
import { describe, test, expect, afterEach, beforeEach } from "bun:test";
import { withTempStore } from "./helpers.ts";
import {
  RELATIONS,
  RELATION_NAMES,
  getRelationSpec,
  isCyclic,
  isKnownRelation,
  validateLinkPair,
  type Store,
} from "../src/index.ts";

let store: Store;
let cleanup: () => void;

beforeEach(async () => {
  const t = await withTempStore();
  store = t.store;
  cleanup = t.cleanup;
});

afterEach(() => cleanup?.());

const ACTOR = "test";

describe("relations registry", () => {
  test("contains all 11 canonical relations from plan-linking.md §2 D1", () => {
    const expected: typeof RELATION_NAMES = [
      "subgoal-of",
      "motivated-by",
      "collaborates-with",
      "subject-of",
      "located-at",
      "caused-by",
      "reinforces",
      "competes-with",
      "addresses",
      "requires",
      "related-to",
    ];
    expect([...RELATION_NAMES].sort()).toEqual([...expected].sort());
  });

  test("only `subgoal-of` is acyclic", () => {
    const acyclic = RELATION_NAMES.filter((n) => RELATIONS[n].acyclic);
    expect(acyclic).toEqual(["subgoal-of"]);
  });

  test("symmetric relations match plan: collaborates-with, competes-with, related-to", () => {
    const symmetric = RELATION_NAMES.filter((n) => RELATIONS[n].symmetric).sort();
    const expected: typeof RELATION_NAMES = [
      "collaborates-with",
      "competes-with",
      "related-to",
    ];
    expect(symmetric).toEqual([...expected].sort());
  });

  test("only `related-to` is lowInformation", () => {
    const lowInfo = RELATION_NAMES.filter((n) => RELATIONS[n].lowInformation);
    expect(lowInfo).toEqual(["related-to"]);
  });

  test("isKnownRelation returns true for canonical names, false otherwise", () => {
    expect(isKnownRelation("subgoal-of")).toBe(true);
    expect(isKnownRelation("made-up")).toBe(false);
  });

  test("getRelationSpec returns null for unknown", () => {
    expect(getRelationSpec("nope")).toBeNull();
    expect(getRelationSpec("subgoal-of")?.name).toBe("subgoal-of");
  });
});

describe("validateLinkPair", () => {
  test("rejects unknown relation", () => {
    const r = validateLinkPair("nope", "goal", "goal");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain("Unknown relation");
  });

  test("accepts canonical pair (goal, goal) for subgoal-of", () => {
    expect(validateLinkPair("subgoal-of", "goal", "goal").ok).toBe(true);
  });

  test("rejects (goal, place) for subgoal-of (BAD_PAIR)", () => {
    const r = validateLinkPair("subgoal-of", "goal", "place");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toContain("does not allow pair");
  });

  test("`related-to` accepts any pair (fallback)", () => {
    expect(validateLinkPair("related-to", "goal", "place").ok).toBe(true);
    expect(validateLinkPair("related-to", "self", "event").ok).toBe(true);
  });

  test("symmetric relation accepts reversed pair", () => {
    // collaborates-with spec lists (person, goal); reversed (goal, person)
    // should also pass because it's symmetric.
    expect(validateLinkPair("collaborates-with", "goal", "person").ok).toBe(true);
    expect(validateLinkPair("collaborates-with", "person", "goal").ok).toBe(true);
  });

  test("non-symmetric relation does NOT accept reversed pair", () => {
    // subgoal-of is acyclic but also strictly directional in spec terms —
    // its allowedPairs is (goal, goal) so reversed-or-not it's the same.
    // Test directionality via subject-of which lists (person, event) only.
    expect(validateLinkPair("subject-of", "person", "event").ok).toBe(true);
    expect(validateLinkPair("subject-of", "event", "person").ok).toBe(false);
  });
});

describe("isCyclic", () => {
  test("returns false for non-acyclic relations regardless of graph", async () => {
    const a = await store.createEntity(
      { type: "person", title: "A", attrs: { relation: "x", importance: "med" } },
      ACTOR,
    );
    const b = await store.createEntity(
      { type: "person", title: "B", attrs: { relation: "x", importance: "med" } },
      ACTOR,
    );
    await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "collaborates-with" },
      ACTOR,
    );
    // collaborates-with is symmetric / not acyclic — isCyclic always false.
    expect(await isCyclic(store, b.id, a.id, "collaborates-with")).toBe(false);
  });

  test("detects 2-cycle on subgoal-of (A→B then B→A)", async () => {
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    const b = await store.createEntity(
      { type: "goal", title: "B", attrs: { timeframe: "short" } },
      ACTOR,
    );
    await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      ACTOR,
    );
    // Adding B → A would cycle.
    expect(await isCyclic(store, b.id, a.id, "subgoal-of")).toBe(true);
    // Adding B → (a brand new C) is fine.
    const c = await store.createEntity(
      { type: "goal", title: "C", attrs: { timeframe: "short" } },
      ACTOR,
    );
    expect(await isCyclic(store, b.id, c.id, "subgoal-of")).toBe(false);
  });

  test("detects 3-cycle (A→B, B→C, then C→A)", async () => {
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
    await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      ACTOR,
    );
    await store.createLink(
      { src_id: b.id, dst_id: c.id, relation: "subgoal-of" },
      ACTOR,
    );
    expect(await isCyclic(store, c.id, a.id, "subgoal-of")).toBe(true);
  });

  test("treats src === dst as cyclic for acyclic relations", async () => {
    const a = await store.createEntity(
      { type: "goal", title: "A", attrs: { timeframe: "short" } },
      ACTOR,
    );
    expect(await isCyclic(store, a.id, a.id, "subgoal-of")).toBe(true);
  });
});
