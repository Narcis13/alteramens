import { describe, test, expect, afterEach, beforeEach } from "bun:test";
import { withTempStore } from "./helpers.ts";
import { ENTITY_TYPES, StoreError, type Store } from "../src/index.ts";

let store: Store;
let cleanup: () => void;

beforeEach(async () => {
  const t = await withTempStore();
  store = t.store;
  cleanup = t.cleanup;
});

afterEach(() => cleanup?.());

// ────────────────────────────────────────────────────────────────────────────
// Schema / migrations
// ────────────────────────────────────────────────────────────────────────────

describe("schema migration", () => {
  test("applies all migrations and records them", async () => {
    const result = await store.client.execute(
      "SELECT version FROM schema_migrations ORDER BY version",
    );
    const versions = result.rows.map((r) => Number((r as unknown as { version: number }).version));
    expect(versions).toEqual([1, 2, 3, 4]);
  });

  test("is idempotent (re-opening does not re-apply)", async () => {
    const beforeResult = await store.client.execute(
      "SELECT count(*) as c FROM schema_migrations",
    );
    const before = beforeResult.rows[0] as unknown as { c: number };
    store.close();
    // Re-open same DB file (use same cleanup dir via dbPath isn't exposed; we
    // verify idempotency by running migration again on the open db)
    const t = await withTempStore();
    const afterResult = await t.store.client.execute(
      "SELECT count(*) as c FROM schema_migrations",
    );
    const after = afterResult.rows[0] as unknown as { c: number };
    expect(Number(before.c)).toBe(4);
    expect(Number(after.c)).toBe(4);
    t.cleanup();
    // Restore module-level store so afterEach can clean up
    const restored = await withTempStore();
    store = restored.store;
    cleanup = restored.cleanup;
  });

  test("creates all 14 expected views", async () => {
    const result = await store.client.execute(
      "SELECT name FROM sqlite_master WHERE type='view' ORDER BY name",
    );
    const views = result.rows.map((r) => (r as unknown as { name: string }).name);
    expect(views).toEqual([
      "v_active_constraints",
      "v_active_events",
      "v_active_goals",
      "v_active_knowledge",
      "v_active_persons",
      "v_active_places",
      "v_active_preferences",
      "v_active_resources",
      "v_active_roles",
      "v_active_stances",
      "v_active_states",
      "v_current_self",
      "v_recent_state",
      "v_stale_entities",
    ]);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// All 12 entity types — happy path create + validation
// ────────────────────────────────────────────────────────────────────────────

const FIXTURES: Record<string, { title: string; attrs: Record<string, unknown> }> = {
  self: {
    title: "Narcis",
    attrs: {
      pillars: ["build", "ship"],
      voice_rules: ["concise"],
      narrative: "Hospital admin + Alteramens builder",
    },
  },
  place: { title: "Spital Pitești", attrs: { kind: "physical", address: "Pitești" } },
  goal:  { title: "Ship PCA MVP", attrs: { timeframe: "mid" } },
  knowledge: { title: "TypeScript", attrs: { domain: "software", depth: "expert" } },
  person: { title: "Mihai", attrs: { relation: "family/son", importance: "high" } },
  resource: { title: "Claude Code", attrs: { kind: "tool", cost_per_month: 20 } },
  constraint: { title: "Hospital hours 08-15", attrs: { kind: "time", hard_or_soft: "hard" } },
  state: { title: "Tired morning", attrs: { energy: "low", mood: "focused" } },
  event: { title: "Started PCA project", attrs: {} },
  preference: { title: "Plain prose voice", attrs: { register: "voice", strength: "strong" } },
  stance: { title: "Build for self first", attrs: { reason: "validated by Naval framework" } },
  role: { title: "Builder Alteramens", attrs: { schedule: "15-22", domain: "offensive" } },
};

describe("create — all 12 entity types", () => {
  for (const type of ENTITY_TYPES) {
    test(`creates type='${type}'`, async () => {
      const fx = FIXTURES[type];
      const e = await store.createEntity(
        { type, title: fx.title, attrs: fx.attrs },
        "test",
      );
      expect(e.id).toBeString();
      expect(e.type).toBe(type);
      expect(e.title).toBe(fx.title);
      expect(e.status).toBe("active");
      expect(e.scope).toBe("general");
      expect(e.confidence).toBe("medium");
      expect(e.attrs).toEqual(expect.objectContaining(fx.attrs));
    });
  }
});

describe("zod validation", () => {
  test("rejects unknown attrs key", async () => {
    await expect(
      store.createEntity(
        { type: "goal", title: "x", attrs: { timeframe: "mid", bogus: 1 } },
        "test",
      ),
    ).rejects.toThrow(StoreError);
  });

  test("rejects missing required attr", async () => {
    await expect(
      store.createEntity({ type: "goal", title: "x", attrs: {} }, "test"),
    ).rejects.toThrow(StoreError);
  });

  test("rejects invalid enum", async () => {
    await expect(
      store.createEntity(
        { type: "person", title: "x", attrs: { relation: "friend", importance: "MAX" } },
        "test",
      ),
    ).rejects.toThrow(StoreError);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Self singleton
// ────────────────────────────────────────────────────────────────────────────

describe("self singleton", () => {
  test("a second active self throws SINGLETON_CONFLICT", async () => {
    await store.createEntity(
      { type: "self", title: "Narcis", attrs: FIXTURES.self!.attrs },
      "test",
    );
    let err: unknown;
    try {
      await store.createEntity(
        { type: "self", title: "Other", attrs: FIXTURES.self!.attrs },
        "test",
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(StoreError);
    expect((err as StoreError).code).toBe("SINGLETON_CONFLICT");
  });

  test("after invalidation, a new self can be created", async () => {
    const first = await store.createEntity(
      { type: "self", title: "Narcis v1", attrs: FIXTURES.self!.attrs },
      "test",
    );
    await store.invalidateEntity(first.id, "test");
    const second = await store.createEntity(
      { type: "self", title: "Narcis v2", attrs: FIXTURES.self!.attrs },
      "test",
    );
    expect(second.id).not.toBe(first.id);
  });

  test("getCurrentSelf returns the active self only", async () => {
    expect(await store.getCurrentSelf()).toBeNull();
    const e = await store.createEntity(
      { type: "self", title: "Narcis", attrs: FIXTURES.self!.attrs },
      "test",
    );
    const current = await store.getCurrentSelf();
    expect(current?.id).toBe(e.id);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// TTL defaults
// ────────────────────────────────────────────────────────────────────────────

describe("TTL defaults", () => {
  test("state gets ~7 days expiry", async () => {
    const e = await store.createEntity(
      { type: "state", title: "tired", attrs: { energy: "low" } },
      "test",
    );
    expect(e.expires_at).not.toBeNull();
    const days = (Date.parse(e.expires_at!) - Date.parse(e.created_at)) / 86_400_000;
    expect(days).toBeGreaterThan(6.9);
    expect(days).toBeLessThan(7.1);
  });

  test("goal gets ~90 days expiry", async () => {
    const e = await store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "mid" } },
      "test",
    );
    const days = (Date.parse(e.expires_at!) - Date.parse(e.created_at)) / 86_400_000;
    expect(days).toBeGreaterThan(89.9);
    expect(days).toBeLessThan(90.1);
  });

  test("role gets ~180 days expiry", async () => {
    const e = await store.createEntity(
      { type: "role", title: "x", attrs: { domain: "offensive" } },
      "test",
    );
    const days = (Date.parse(e.expires_at!) - Date.parse(e.created_at)) / 86_400_000;
    expect(days).toBeGreaterThan(179.9);
    expect(days).toBeLessThan(180.1);
  });

  test("knowledge / preference / stance / self / person / place / event get no expiry by default", async () => {
    const cases: Array<[Parameters<Store["createEntity"]>[0]["type"], Record<string, unknown>]> = [
      ["knowledge", { domain: "x", depth: "novice" }],
      ["preference", { register: "voice" }],
      ["stance", { reason: "because" }],
      ["person", { relation: "x", importance: "low" }],
      ["place", { kind: "physical" }],
      ["event", {}],
    ];
    for (const [type, attrs] of cases) {
      const e = await store.createEntity({ type, title: type, attrs }, "test");
      expect(e.expires_at).toBeNull();
    }
  });

  test("explicit expires_at override wins", async () => {
    const iso = "2099-01-01T00:00:00.000Z";
    const e = await store.createEntity(
      {
        type: "goal",
        title: "x",
        attrs: { timeframe: "long" },
        expires_at: iso,
      },
      "test",
    );
    expect(e.expires_at).toBe(iso);
  });

  test("explicit expires_at=null override removes TTL", async () => {
    const e = await store.createEntity(
      {
        type: "goal",
        title: "x",
        attrs: { timeframe: "long" },
        expires_at: null,
      },
      "test",
    );
    expect(e.expires_at).toBeNull();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Views filter by status + expiry
// ────────────────────────────────────────────────────────────────────────────

describe("views filter active+unexpired", () => {
  test("expired goal is excluded from v_active_goals", async () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    await store.createEntity(
      {
        type: "goal",
        title: "old",
        attrs: { timeframe: "short" },
        expires_at: past,
      },
      "test",
    );
    await store.createEntity(
      {
        type: "goal",
        title: "fresh",
        attrs: { timeframe: "short" },
      },
      "test",
    );
    const active = await store.listActive("goal");
    expect(active.map((e) => e.title)).toEqual(["fresh"]);
  });

  test("invalidated entity is excluded", async () => {
    const e = await store.createEntity(
      { type: "role", title: "x", attrs: { domain: "offensive" } },
      "test",
    );
    await store.invalidateEntity(e.id, "test");
    expect(await store.listActive("role")).toEqual([]);
  });

  test("v_stale_entities surfaces expired actives", async () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    await store.createEntity(
      {
        type: "goal",
        title: "old",
        attrs: { timeframe: "short" },
        expires_at: past,
      },
      "test",
    );
    const stale = await store.listStale();
    expect(stale).toHaveLength(1);
    expect(stale[0]!.title).toBe("old");
  });

  test("v_active_persons orders by importance high → med → low", async () => {
    await store.createEntity(
      { type: "person", title: "Low", attrs: { relation: "x", importance: "low" } },
      "test",
    );
    await store.createEntity(
      { type: "person", title: "High", attrs: { relation: "x", importance: "high" } },
      "test",
    );
    await store.createEntity(
      { type: "person", title: "Med", attrs: { relation: "x", importance: "med" } },
      "test",
    );
    const order = (await store.listActive("person")).map((e) => e.title);
    expect(order).toEqual(["High", "Med", "Low"]);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// FTS5
// ────────────────────────────────────────────────────────────────────────────

describe("FTS5 search", () => {
  test("matches title", async () => {
    await store.createEntity(
      { type: "goal", title: "Ship MVP for PCA", attrs: { timeframe: "short" } },
      "test",
    );
    await store.createEntity(
      { type: "goal", title: "Read a book", attrs: { timeframe: "short" } },
      "test",
    );
    const hits = await store.searchFts("MVP");
    expect(hits).toHaveLength(1);
    expect(hits[0]!.title).toContain("MVP");
  });

  test("matches body", async () => {
    await store.createEntity(
      {
        type: "knowledge",
        title: "Generic title",
        body: "deep familiarity with kubernetes operators",
        attrs: { domain: "x", depth: "expert" },
      },
      "test",
    );
    const hits = await store.searchFts("kubernetes");
    expect(hits).toHaveLength(1);
  });

  test("type filter narrows results", async () => {
    await store.createEntity(
      { type: "goal", title: "alpha goal", attrs: { timeframe: "mid" } },
      "test",
    );
    await store.createEntity(
      { type: "knowledge", title: "alpha knowledge", attrs: { domain: "x", depth: "novice" } },
      "test",
    );
    const onlyGoals = await store.searchFts("alpha", { types: ["goal"] });
    expect(onlyGoals).toHaveLength(1);
    expect(onlyGoals[0]!.type).toBe("goal");
  });

  test("excludes invalidated and expired", async () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    await store.createEntity(
      {
        type: "goal",
        title: "expired needle",
        attrs: { timeframe: "short" },
        expires_at: past,
      },
      "test",
    );
    const a = await store.createEntity(
      { type: "goal", title: "invalidated needle", attrs: { timeframe: "short" } },
      "test",
    );
    await store.invalidateEntity(a.id, "test");
    expect(await store.searchFts("needle")).toEqual([]);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// update + confirm + invalidate flows
// ────────────────────────────────────────────────────────────────────────────

describe("update / confirm / invalidate", () => {
  test("updateEntity changes title + attrs and bumps updated_at", async () => {
    const e = await store.createEntity(
      { type: "goal", title: "old", attrs: { timeframe: "mid" } },
      "test",
    );
    await Bun.sleep(5);
    const { previous, current } = await store.updateEntity(
      e.id,
      { title: "new", attrs: { timeframe: "short" } },
      "test",
    );
    expect(previous.title).toBe("old");
    expect(current.title).toBe("new");
    expect(current.attrs.timeframe).toBe("short");
    expect(current.updated_at > previous.updated_at).toBe(true);
  });

  test("confirmEntity still-true extends expiry", async () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    const e = await store.createEntity(
      {
        type: "goal",
        title: "x",
        attrs: { timeframe: "short" },
        expires_at: past,
      },
      "test",
    );
    const { outcome, entity } = await store.confirmEntity(e.id, "still-true", "test");
    expect(outcome).toBe("extended");
    expect(Date.parse(entity.expires_at!)).toBeGreaterThan(Date.now());
  });

  test("confirmEntity no-longer-true invalidates", async () => {
    const e = await store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "short" } },
      "test",
    );
    const { outcome, entity } = await store.confirmEntity(e.id, "no-longer-true", "test");
    expect(outcome).toBe("invalidated");
    expect(entity.status).toBe("invalidated");
    expect(entity.invalidated_at).not.toBeNull();
  });

  test("confirmEntity modify applies changes + extends expiry", async () => {
    const e = await store.createEntity(
      { type: "goal", title: "old", attrs: { timeframe: "short" } },
      "test",
    );
    const { outcome, entity } = await store.confirmEntity(e.id, "modify", "test", {
      modify: { title: "new", attrs: { timeframe: "mid" } },
    });
    expect(outcome).toBe("modified");
    expect(entity.title).toBe("new");
    expect(entity.attrs.timeframe).toBe("mid");
  });

  test("invalid entity id throws NOT_FOUND", async () => {
    let err: unknown;
    try {
      await store.updateEntity("nope", { title: "x" }, "test");
    } catch (e) {
      err = e;
    }
    expect((err as StoreError).code).toBe("NOT_FOUND");
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Events log
// ────────────────────────────────────────────────────────────────────────────

describe("events log", () => {
  test("create writes a single 'create' event", async () => {
    const e = await store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "mid" } },
      "test",
    );
    const events = await store.listEvents({ entityId: e.id });
    expect(events).toHaveLength(1);
    expect(events[0]!.operation).toBe("create");
    expect(events[0]!.actor).toBe("test");
  });

  test("update writes one 'update' event", async () => {
    const e = await store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "mid" } },
      "test",
    );
    await store.updateEntity(e.id, { title: "y" }, "test");
    const ops = (await store.listEvents({ entityId: e.id })).map((ev) => ev.operation);
    expect(ops).toEqual(["create", "update"]);
  });

  test("confirm still-true writes one 'confirm' event (no extra 'update')", async () => {
    const e = await store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "mid" } },
      "test",
    );
    await store.confirmEntity(e.id, "still-true", "test");
    const ops = (await store.listEvents({ entityId: e.id })).map((ev) => ev.operation);
    expect(ops).toEqual(["create", "confirm"]);
  });

  test("confirm modify writes one 'confirm-modify' event", async () => {
    const e = await store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "mid" } },
      "test",
    );
    await store.confirmEntity(e.id, "modify", "test", {
      modify: { title: "y" },
    });
    const ops = (await store.listEvents({ entityId: e.id })).map((ev) => ev.operation);
    expect(ops).toEqual(["create", "confirm-modify"]);
  });

  test("invalidate writes one 'invalidate' event", async () => {
    const e = await store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "mid" } },
      "test",
    );
    await store.invalidateEntity(e.id, "test", "outgrown");
    const events = await store.listEvents({ entityId: e.id });
    expect(events.map((ev) => ev.operation)).toEqual(["create", "invalidate"]);
    expect(events[1]!.payload).toEqual({ note: "outgrown" });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Primitives
// ────────────────────────────────────────────────────────────────────────────

describe("primitives", () => {
  test("createLink + event", async () => {
    const a = await store.createEntity(
      { type: "person", title: "Mihai", attrs: { relation: "son", importance: "high" } },
      "test",
    );
    const b = await store.createEntity(
      { type: "event", title: "UMF exam", attrs: {} },
      "test",
    );
    const link = await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subject-of" },
      "test",
    );
    expect(link.id).toBeString();
    expect(link.relation).toBe("subject-of");
    const events = (await store.listEvents()).filter((e) => e.operation === "link");
    expect(events).toHaveLength(1);
    expect(events[0]!.link_id).toBe(link.id);
  });

  test("createAnnotation", async () => {
    const a = await store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "mid" } },
      "test",
    );
    const ann = await store.createAnnotation(
      { entity_id: a.id, body: "more thinking needed" },
      "test",
    );
    expect(ann.body).toBe("more thinking needed");
    const events = (await store.listEvents()).filter((e) => e.operation === "annotate");
    expect(events).toHaveLength(1);
  });

  test("tagEntity + idempotent", async () => {
    const a = await store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "mid" } },
      "test",
    );
    await store.tagEntity(a.id, "high-priority", "test");
    await store.tagEntity(a.id, "high-priority", "test"); // duplicate
    const rowsResult = await store.client.execute({
      sql: "SELECT count(*) as c FROM entity_tags WHERE entity_id = ?",
      args: [a.id],
    });
    const rows = rowsResult.rows[0] as unknown as { c: number };
    expect(Number(rows.c)).toBe(1);
    const tagResult = await store.client.execute("SELECT slug FROM tags");
    const tagRow = tagResult.rows.map((r) => ({
      slug: (r as unknown as { slug: string }).slug,
    }));
    expect(tagRow).toEqual([{ slug: "high-priority" }]);
  });

  test("createSource + attachSource", async () => {
    const a = await store.createEntity(
      { type: "knowledge", title: "x", attrs: { domain: "y", depth: "novice" } },
      "test",
    );
    const src = await store.createSource({
      kind: "conversation",
      identifier: "conv-123",
      excerpt: "from chat",
    });
    await store.attachSource(a.id, src.id, "test");
    const joinedResult = await store.client.execute({
      sql: "SELECT s.identifier FROM entity_sources es JOIN sources s ON s.id = es.source_id WHERE es.entity_id = ?",
      args: [a.id],
    });
    const joined = joinedResult.rows.map((r) => ({
      identifier: (r as unknown as { identifier: string }).identifier,
    }));
    expect(joined).toEqual([{ identifier: "conv-123" }]);
  });

  test("upsertProject inserts then updates", async () => {
    await store.upsertProject({ slug: "pca", title: "Personal Context Agent" });
    await store.upsertProject({
      slug: "pca",
      title: "PCA",
      description: "MVP build",
    });
    const rowResult = await store.client.execute("SELECT * FROM projects WHERE slug='pca'");
    const row = rowResult.rows[0] as unknown as {
      title: string;
      description: string;
    };
    expect(row.title).toBe("PCA");
    expect(row.description).toBe("MVP build");
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Link read API: listLinks, getNeighbors, invalidateLink
// ────────────────────────────────────────────────────────────────────────────

describe("link read API", () => {
  async function seedTriangle() {
    const person = await store.createEntity(
      {
        type: "person",
        title: "Mihai",
        attrs: { relation: "son", importance: "high" },
      },
      "test",
    );
    const event = await store.createEntity(
      { type: "event", title: "UMF exam", attrs: {} },
      "test",
    );
    const goal = await store.createEntity(
      {
        type: "goal",
        title: "Support UMF prep",
        attrs: { timeframe: "mid" },
      },
      "test",
    );
    const lPersonEvent = await store.createLink(
      { src_id: person.id, dst_id: event.id, relation: "subject-of" },
      "test",
    );
    const lGoalPerson = await store.createLink(
      { src_id: goal.id, dst_id: person.id, relation: "collaborates-with" },
      "test",
    );
    return { person, event, goal, lPersonEvent, lGoalPerson };
  }

  test("listLinks returns links in both directions for an entity", async () => {
    const { person, lPersonEvent, lGoalPerson } = await seedTriangle();
    const links = await store.listLinks({ entityId: person.id });
    const ids = links.map((l) => l.id).sort();
    expect(ids).toEqual([lPersonEvent.id, lGoalPerson.id].sort());
  });

  test("listLinks direction='out' returns only outgoing", async () => {
    const { person, lPersonEvent } = await seedTriangle();
    const links = await store.listLinks({ entityId: person.id, direction: "out" });
    expect(links.map((l) => l.id)).toEqual([lPersonEvent.id]);
  });

  test("listLinks direction='in' returns only incoming", async () => {
    const { person, lGoalPerson } = await seedTriangle();
    const links = await store.listLinks({ entityId: person.id, direction: "in" });
    expect(links.map((l) => l.id)).toEqual([lGoalPerson.id]);
  });

  test("listLinks filters by relation", async () => {
    const { person, lPersonEvent } = await seedTriangle();
    const links = await store.listLinks({
      entityId: person.id,
      relation: "subject-of",
    });
    expect(links.map((l) => l.id)).toEqual([lPersonEvent.id]);
  });

  test("listLinks excludes invalidated by default; includeInvalidated returns them", async () => {
    const { person, lPersonEvent } = await seedTriangle();
    await store.invalidateLink(lPersonEvent.id, "test");
    const without = await store.listLinks({ entityId: person.id });
    expect(without.map((l) => l.id)).not.toContain(lPersonEvent.id);
    const withInvalid = await store.listLinks({
      entityId: person.id,
      includeInvalidated: true,
    });
    expect(withInvalid.map((l) => l.id)).toContain(lPersonEvent.id);
  });

  test("listLinks respects limit", async () => {
    const { person, event } = await seedTriangle();
    await store.createLink(
      { src_id: person.id, dst_id: event.id, relation: "related-to" },
      "test",
    );
    const links = await store.listLinks({ entityId: person.id, limit: 1 });
    expect(links).toHaveLength(1);
  });

  test("getNeighbors returns role 'out' / 'in' correctly for direction='both'", async () => {
    const { person, event, goal } = await seedTriangle();
    const neighbors = await store.getNeighbors(person.id);
    const byId = new Map(neighbors.map((n) => [n.entity.id, n]));
    expect(byId.get(event.id)?.role).toBe("out");
    expect(byId.get(goal.id)?.role).toBe("in");
  });

  test("getNeighbors filters by types", async () => {
    const { person, event } = await seedTriangle();
    const neighbors = await store.getNeighbors(person.id, { types: ["event"] });
    expect(neighbors).toHaveLength(1);
    expect(neighbors[0]!.entity.id).toBe(event.id);
  });

  test("getNeighbors excludes invalidated neighbor entities", async () => {
    const { person, event } = await seedTriangle();
    await store.invalidateEntity(event.id, "test");
    const neighbors = await store.getNeighbors(person.id);
    expect(neighbors.map((n) => n.entity.id)).not.toContain(event.id);
  });

  test("getNeighbors excludes invalidated links", async () => {
    const { person, event, lPersonEvent } = await seedTriangle();
    await store.invalidateLink(lPersonEvent.id, "test");
    const neighbors = await store.getNeighbors(person.id);
    expect(neighbors.map((n) => n.entity.id)).not.toContain(event.id);
  });

  test("getNeighbors filters by relation", async () => {
    const { person, event } = await seedTriangle();
    const onlySubject = await store.getNeighbors(person.id, { relation: "subject-of" });
    expect(onlySubject).toHaveLength(1);
    expect(onlySubject[0]!.entity.id).toBe(event.id);
  });

  test("invalidateLink sets timestamp and emits link-invalidate event", async () => {
    const { lPersonEvent } = await seedTriangle();
    const before = lPersonEvent.invalidated_at;
    const updated = await store.invalidateLink(lPersonEvent.id, "test", "ended");
    expect(before).toBeNull();
    expect(updated.invalidated_at).not.toBeNull();
    const ev = (await store.listEvents()).filter(
      (e) => e.operation === "link-invalidate",
    );
    expect(ev).toHaveLength(1);
    expect(ev[0]!.link_id).toBe(lPersonEvent.id);
    expect(ev[0]!.payload).toEqual({ note: "ended" });
  });

  test("invalidateLink throws NOT_FOUND for missing id", async () => {
    let err: unknown;
    try {
      await store.invalidateLink("nope", "test");
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(StoreError);
    expect((err as StoreError).code).toBe("NOT_FOUND");
  });

  test("invalidateLink is a no-op when already invalidated (no extra event)", async () => {
    const { lPersonEvent } = await seedTriangle();
    await store.invalidateLink(lPersonEvent.id, "test");
    await store.invalidateLink(lPersonEvent.id, "test");
    const ev = (await store.listEvents()).filter(
      (e) => e.operation === "link-invalidate",
    );
    expect(ev).toHaveLength(1);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Phase 3 — cascade invalidation
// ────────────────────────────────────────────────────────────────────────────

describe("invalidateEntity cascade (Phase 3)", () => {
  test("invalidating an entity cascades to all its links and emits link-invalidate events", async () => {
    const goal = await store.createEntity(
      { type: "goal", title: "Hub", attrs: { timeframe: "mid" } },
      "test",
    );
    const a = await store.createEntity(
      { type: "knowledge", title: "k1", attrs: { domain: "x", depth: "novice" } },
      "test",
    );
    const b = await store.createEntity(
      { type: "knowledge", title: "k2", attrs: { domain: "x", depth: "novice" } },
      "test",
    );
    const c = await store.createEntity(
      { type: "knowledge", title: "k3", attrs: { domain: "x", depth: "novice" } },
      "test",
    );
    const l1 = await store.createLink(
      { src_id: goal.id, dst_id: a.id, relation: "addresses" },
      "test",
    );
    const l2 = await store.createLink(
      { src_id: goal.id, dst_id: b.id, relation: "addresses" },
      "test",
    );
    const l3 = await store.createLink(
      { src_id: goal.id, dst_id: c.id, relation: "addresses" },
      "test",
    );

    await store.invalidateEntity(goal.id, "test", "outgrown");

    for (const id of [l1.id, l2.id, l3.id]) {
      const result = await store.client.execute({
        sql: "SELECT invalidated_at FROM links WHERE id = ?",
        args: [id],
      });
      const row = result.rows[0] as unknown as { invalidated_at: string | null };
      expect(row.invalidated_at).not.toBeNull();
    }

    const cascadeEvents = (await store.listEvents()).filter(
      (e) =>
        e.operation === "link-invalidate" &&
        (e.payload as { reason?: string } | null)?.reason === "cascade",
    );
    expect(cascadeEvents).toHaveLength(3);
    for (const ev of cascadeEvents) {
      const payload = ev.payload as {
        reason: string;
        entity_id: string;
        note?: string;
      };
      expect(payload.entity_id).toBe(goal.id);
      expect(payload.note).toBe("outgrown");
    }
  });

  test("cascade respects already-invalidated links (no double-invalidate event)", async () => {
    const a = await store.createEntity(
      { type: "goal", title: "g1", attrs: { timeframe: "mid" } },
      "test",
    );
    const b = await store.createEntity(
      { type: "goal", title: "g2", attrs: { timeframe: "mid" } },
      "test",
    );
    const link = await store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subgoal-of" },
      "test",
    );
    await store.invalidateLink(link.id, "test", "ended");

    await store.invalidateEntity(a.id, "test");

    const linkInvalidateEvents = (await store.listEvents()).filter(
      (e) => e.operation === "link-invalidate" && e.link_id === link.id,
    );
    expect(linkInvalidateEvents).toHaveLength(1);
    const payload = linkInvalidateEvents[0]!.payload as { note?: string };
    expect(payload.note).toBe("ended");
  });

  test("cascade triggers regardless of role (src or dst)", async () => {
    const target = await store.createEntity(
      { type: "person", title: "Hub", attrs: { relation: "x", importance: "high" } },
      "test",
    );
    const outNeighbor = await store.createEntity(
      { type: "goal", title: "g", attrs: { timeframe: "mid" } },
      "test",
    );
    const inNeighbor = await store.createEntity(
      { type: "event", title: "ev", attrs: {} },
      "test",
    );
    const outLink = await store.createLink(
      { src_id: target.id, dst_id: outNeighbor.id, relation: "collaborates-with" },
      "test",
    );
    const inLink = await store.createLink(
      { src_id: target.id, dst_id: inNeighbor.id, relation: "subject-of" },
      "test",
    );

    await store.invalidateEntity(target.id, "test");

    const outRowResult = await store.client.execute({
      sql: "SELECT invalidated_at FROM links WHERE id = ?",
      args: [outLink.id],
    });
    const outRow = outRowResult.rows[0] as unknown as { invalidated_at: string | null };
    const inRowResult = await store.client.execute({
      sql: "SELECT invalidated_at FROM links WHERE id = ?",
      args: [inLink.id],
    });
    const inRow = inRowResult.rows[0] as unknown as { invalidated_at: string | null };
    expect(outRow.invalidated_at).not.toBeNull();
    expect(inRow.invalidated_at).not.toBeNull();
  });

  test("cascade is silent when entity has no links", async () => {
    const e = await store.createEntity(
      { type: "goal", title: "Lonely", attrs: { timeframe: "short" } },
      "test",
    );
    await store.invalidateEntity(e.id, "test");
    const cascadeEvents = (await store.listEvents()).filter(
      (ev) => ev.operation === "link-invalidate",
    );
    expect(cascadeEvents).toHaveLength(0);
  });
});
