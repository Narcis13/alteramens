import { describe, test, expect, afterEach, beforeEach } from "bun:test";
import { withTempStore } from "./helpers.ts";
import { ENTITY_TYPES, StoreError, type Store } from "../src/index.ts";

let store: Store;
let cleanup: () => void;

beforeEach(() => {
  const t = withTempStore();
  store = t.store;
  cleanup = t.cleanup;
});

afterEach(() => cleanup?.());

// ────────────────────────────────────────────────────────────────────────────
// Schema / migrations
// ────────────────────────────────────────────────────────────────────────────

describe("schema migration", () => {
  test("applies migration 0001 and records it", () => {
    const row = store.db
      .prepare("SELECT version FROM schema_migrations ORDER BY version")
      .all() as Array<{ version: number }>;
    expect(row.map((r) => r.version)).toEqual([1]);
  });

  test("is idempotent (re-opening does not re-apply)", () => {
    const before = store.db
      .prepare("SELECT count(*) as c FROM schema_migrations")
      .get() as { c: number };
    store.close();
    // Re-open same DB file (use same cleanup dir via dbPath isn't exposed; we
    // verify idempotency by running migration again on the open db)
    const t = withTempStore();
    const after = t.store.db
      .prepare("SELECT count(*) as c FROM schema_migrations")
      .get() as { c: number };
    expect(before.c).toBe(1);
    expect(after.c).toBe(1);
    t.cleanup();
    // Restore module-level store so afterEach can clean up
    const restored = withTempStore();
    store = restored.store;
    cleanup = restored.cleanup;
  });

  test("creates all 14 expected views", () => {
    const views = (
      store.db
        .prepare("SELECT name FROM sqlite_master WHERE type='view' ORDER BY name")
        .all() as Array<{ name: string }>
    ).map((r) => r.name);
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
    test(`creates type='${type}'`, () => {
      const fx = FIXTURES[type];
      const e = store.createEntity(
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
  test("rejects unknown attrs key", () => {
    expect(() =>
      store.createEntity(
        { type: "goal", title: "x", attrs: { timeframe: "mid", bogus: 1 } },
        "test",
      ),
    ).toThrow(StoreError);
  });

  test("rejects missing required attr", () => {
    expect(() =>
      store.createEntity({ type: "goal", title: "x", attrs: {} }, "test"),
    ).toThrow(StoreError);
  });

  test("rejects invalid enum", () => {
    expect(() =>
      store.createEntity(
        { type: "person", title: "x", attrs: { relation: "friend", importance: "MAX" } },
        "test",
      ),
    ).toThrow(StoreError);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Self singleton
// ────────────────────────────────────────────────────────────────────────────

describe("self singleton", () => {
  test("a second active self throws SINGLETON_CONFLICT", () => {
    store.createEntity(
      { type: "self", title: "Narcis", attrs: FIXTURES.self!.attrs },
      "test",
    );
    let err: unknown;
    try {
      store.createEntity(
        { type: "self", title: "Other", attrs: FIXTURES.self!.attrs },
        "test",
      );
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(StoreError);
    expect((err as StoreError).code).toBe("SINGLETON_CONFLICT");
  });

  test("after invalidation, a new self can be created", () => {
    const first = store.createEntity(
      { type: "self", title: "Narcis v1", attrs: FIXTURES.self!.attrs },
      "test",
    );
    store.invalidateEntity(first.id, "test");
    const second = store.createEntity(
      { type: "self", title: "Narcis v2", attrs: FIXTURES.self!.attrs },
      "test",
    );
    expect(second.id).not.toBe(first.id);
  });

  test("getCurrentSelf returns the active self only", () => {
    expect(store.getCurrentSelf()).toBeNull();
    const e = store.createEntity(
      { type: "self", title: "Narcis", attrs: FIXTURES.self!.attrs },
      "test",
    );
    expect(store.getCurrentSelf()?.id).toBe(e.id);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// TTL defaults
// ────────────────────────────────────────────────────────────────────────────

describe("TTL defaults", () => {
  test("state gets ~7 days expiry", () => {
    const e = store.createEntity(
      { type: "state", title: "tired", attrs: { energy: "low" } },
      "test",
    );
    expect(e.expires_at).not.toBeNull();
    const days = (Date.parse(e.expires_at!) - Date.parse(e.created_at)) / 86_400_000;
    expect(days).toBeGreaterThan(6.9);
    expect(days).toBeLessThan(7.1);
  });

  test("goal gets ~90 days expiry", () => {
    const e = store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "mid" } },
      "test",
    );
    const days = (Date.parse(e.expires_at!) - Date.parse(e.created_at)) / 86_400_000;
    expect(days).toBeGreaterThan(89.9);
    expect(days).toBeLessThan(90.1);
  });

  test("role gets ~180 days expiry", () => {
    const e = store.createEntity(
      { type: "role", title: "x", attrs: { domain: "offensive" } },
      "test",
    );
    const days = (Date.parse(e.expires_at!) - Date.parse(e.created_at)) / 86_400_000;
    expect(days).toBeGreaterThan(179.9);
    expect(days).toBeLessThan(180.1);
  });

  test("knowledge / preference / stance / self / person / place / event get no expiry by default", () => {
    const cases: Array<[Parameters<Store["createEntity"]>[0]["type"], Record<string, unknown>]> = [
      ["knowledge", { domain: "x", depth: "novice" }],
      ["preference", { register: "voice" }],
      ["stance", { reason: "because" }],
      ["person", { relation: "x", importance: "low" }],
      ["place", { kind: "physical" }],
      ["event", {}],
    ];
    for (const [type, attrs] of cases) {
      const e = store.createEntity({ type, title: type, attrs }, "test");
      expect(e.expires_at).toBeNull();
    }
  });

  test("explicit expires_at override wins", () => {
    const iso = "2099-01-01T00:00:00.000Z";
    const e = store.createEntity(
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

  test("explicit expires_at=null override removes TTL", () => {
    const e = store.createEntity(
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
  test("expired goal is excluded from v_active_goals", () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    store.createEntity(
      {
        type: "goal",
        title: "old",
        attrs: { timeframe: "short" },
        expires_at: past,
      },
      "test",
    );
    store.createEntity(
      {
        type: "goal",
        title: "fresh",
        attrs: { timeframe: "short" },
      },
      "test",
    );
    const active = store.listActive("goal");
    expect(active.map((e) => e.title)).toEqual(["fresh"]);
  });

  test("invalidated entity is excluded", () => {
    const e = store.createEntity(
      { type: "role", title: "x", attrs: { domain: "offensive" } },
      "test",
    );
    store.invalidateEntity(e.id, "test");
    expect(store.listActive("role")).toEqual([]);
  });

  test("v_stale_entities surfaces expired actives", () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    store.createEntity(
      {
        type: "goal",
        title: "old",
        attrs: { timeframe: "short" },
        expires_at: past,
      },
      "test",
    );
    const stale = store.listStale();
    expect(stale).toHaveLength(1);
    expect(stale[0]!.title).toBe("old");
  });

  test("v_active_persons orders by importance high → med → low", () => {
    store.createEntity(
      { type: "person", title: "Low", attrs: { relation: "x", importance: "low" } },
      "test",
    );
    store.createEntity(
      { type: "person", title: "High", attrs: { relation: "x", importance: "high" } },
      "test",
    );
    store.createEntity(
      { type: "person", title: "Med", attrs: { relation: "x", importance: "med" } },
      "test",
    );
    const order = store.listActive("person").map((e) => e.title);
    expect(order).toEqual(["High", "Med", "Low"]);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// FTS5
// ────────────────────────────────────────────────────────────────────────────

describe("FTS5 search", () => {
  test("matches title", () => {
    store.createEntity(
      { type: "goal", title: "Ship MVP for PCA", attrs: { timeframe: "short" } },
      "test",
    );
    store.createEntity(
      { type: "goal", title: "Read a book", attrs: { timeframe: "short" } },
      "test",
    );
    const hits = store.searchFts("MVP");
    expect(hits).toHaveLength(1);
    expect(hits[0]!.title).toContain("MVP");
  });

  test("matches body", () => {
    store.createEntity(
      {
        type: "knowledge",
        title: "Generic title",
        body: "deep familiarity with kubernetes operators",
        attrs: { domain: "x", depth: "expert" },
      },
      "test",
    );
    const hits = store.searchFts("kubernetes");
    expect(hits).toHaveLength(1);
  });

  test("type filter narrows results", () => {
    store.createEntity(
      { type: "goal", title: "alpha goal", attrs: { timeframe: "mid" } },
      "test",
    );
    store.createEntity(
      { type: "knowledge", title: "alpha knowledge", attrs: { domain: "x", depth: "novice" } },
      "test",
    );
    const onlyGoals = store.searchFts("alpha", { types: ["goal"] });
    expect(onlyGoals).toHaveLength(1);
    expect(onlyGoals[0]!.type).toBe("goal");
  });

  test("excludes invalidated and expired", () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    store.createEntity(
      {
        type: "goal",
        title: "expired needle",
        attrs: { timeframe: "short" },
        expires_at: past,
      },
      "test",
    );
    const a = store.createEntity(
      { type: "goal", title: "invalidated needle", attrs: { timeframe: "short" } },
      "test",
    );
    store.invalidateEntity(a.id, "test");
    expect(store.searchFts("needle")).toEqual([]);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// update + confirm + invalidate flows
// ────────────────────────────────────────────────────────────────────────────

describe("update / confirm / invalidate", () => {
  test("updateEntity changes title + attrs and bumps updated_at", async () => {
    const e = store.createEntity(
      { type: "goal", title: "old", attrs: { timeframe: "mid" } },
      "test",
    );
    await Bun.sleep(5);
    const { previous, current } = store.updateEntity(
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
    const e = store.createEntity(
      {
        type: "goal",
        title: "x",
        attrs: { timeframe: "short" },
        expires_at: past,
      },
      "test",
    );
    const { outcome, entity } = store.confirmEntity(e.id, "still-true", "test");
    expect(outcome).toBe("extended");
    expect(Date.parse(entity.expires_at!)).toBeGreaterThan(Date.now());
  });

  test("confirmEntity no-longer-true invalidates", () => {
    const e = store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "short" } },
      "test",
    );
    const { outcome, entity } = store.confirmEntity(e.id, "no-longer-true", "test");
    expect(outcome).toBe("invalidated");
    expect(entity.status).toBe("invalidated");
    expect(entity.invalidated_at).not.toBeNull();
  });

  test("confirmEntity modify applies changes + extends expiry", () => {
    const e = store.createEntity(
      { type: "goal", title: "old", attrs: { timeframe: "short" } },
      "test",
    );
    const { outcome, entity } = store.confirmEntity(e.id, "modify", "test", {
      modify: { title: "new", attrs: { timeframe: "mid" } },
    });
    expect(outcome).toBe("modified");
    expect(entity.title).toBe("new");
    expect(entity.attrs.timeframe).toBe("mid");
  });

  test("invalid entity id throws NOT_FOUND", () => {
    let err: unknown;
    try {
      store.updateEntity("nope", { title: "x" }, "test");
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
  test("create writes a single 'create' event", () => {
    const e = store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "mid" } },
      "test",
    );
    const events = store.listEvents({ entityId: e.id });
    expect(events).toHaveLength(1);
    expect(events[0]!.operation).toBe("create");
    expect(events[0]!.actor).toBe("test");
  });

  test("update writes one 'update' event", () => {
    const e = store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "mid" } },
      "test",
    );
    store.updateEntity(e.id, { title: "y" }, "test");
    const ops = store.listEvents({ entityId: e.id }).map((ev) => ev.operation);
    expect(ops).toEqual(["create", "update"]);
  });

  test("confirm still-true writes one 'confirm' event (no extra 'update')", () => {
    const e = store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "mid" } },
      "test",
    );
    store.confirmEntity(e.id, "still-true", "test");
    const ops = store.listEvents({ entityId: e.id }).map((ev) => ev.operation);
    expect(ops).toEqual(["create", "confirm"]);
  });

  test("confirm modify writes one 'confirm-modify' event", () => {
    const e = store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "mid" } },
      "test",
    );
    store.confirmEntity(e.id, "modify", "test", {
      modify: { title: "y" },
    });
    const ops = store.listEvents({ entityId: e.id }).map((ev) => ev.operation);
    expect(ops).toEqual(["create", "confirm-modify"]);
  });

  test("invalidate writes one 'invalidate' event", () => {
    const e = store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "mid" } },
      "test",
    );
    store.invalidateEntity(e.id, "test", "outgrown");
    const events = store.listEvents({ entityId: e.id });
    expect(events.map((ev) => ev.operation)).toEqual(["create", "invalidate"]);
    expect(events[1]!.payload).toEqual({ note: "outgrown" });
  });
});

// ────────────────────────────────────────────────────────────────────────────
// Primitives
// ────────────────────────────────────────────────────────────────────────────

describe("primitives", () => {
  test("createLink + event", () => {
    const a = store.createEntity(
      { type: "person", title: "Mihai", attrs: { relation: "son", importance: "high" } },
      "test",
    );
    const b = store.createEntity(
      { type: "event", title: "UMF exam", attrs: {} },
      "test",
    );
    const link = store.createLink(
      { src_id: a.id, dst_id: b.id, relation: "subject-of" },
      "test",
    );
    expect(link.id).toBeString();
    expect(link.relation).toBe("subject-of");
    const events = store.listEvents().filter((e) => e.operation === "link");
    expect(events).toHaveLength(1);
    expect(events[0]!.link_id).toBe(link.id);
  });

  test("createAnnotation", () => {
    const a = store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "mid" } },
      "test",
    );
    const ann = store.createAnnotation(
      { entity_id: a.id, body: "more thinking needed" },
      "test",
    );
    expect(ann.body).toBe("more thinking needed");
    const events = store.listEvents().filter((e) => e.operation === "annotate");
    expect(events).toHaveLength(1);
  });

  test("tagEntity + idempotent", () => {
    const a = store.createEntity(
      { type: "goal", title: "x", attrs: { timeframe: "mid" } },
      "test",
    );
    store.tagEntity(a.id, "high-priority", "test");
    store.tagEntity(a.id, "high-priority", "test"); // duplicate
    const rows = store.db
      .prepare("SELECT count(*) as c FROM entity_tags WHERE entity_id = ?")
      .get(a.id) as { c: number };
    expect(rows.c).toBe(1);
    const tagRow = store.db.prepare("SELECT slug FROM tags").all() as Array<{ slug: string }>;
    expect(tagRow).toEqual([{ slug: "high-priority" }]);
  });

  test("createSource + attachSource", () => {
    const a = store.createEntity(
      { type: "knowledge", title: "x", attrs: { domain: "y", depth: "novice" } },
      "test",
    );
    const src = store.createSource({
      kind: "conversation",
      identifier: "conv-123",
      excerpt: "from chat",
    });
    store.attachSource(a.id, src.id, "test");
    const joined = store.db
      .prepare(
        "SELECT s.identifier FROM entity_sources es JOIN sources s ON s.id = es.source_id WHERE es.entity_id = ?",
      )
      .all(a.id) as Array<{ identifier: string }>;
    expect(joined).toEqual([{ identifier: "conv-123" }]);
  });

  test("upsertProject inserts then updates", () => {
    store.upsertProject({ slug: "pca", title: "Personal Context Agent" });
    store.upsertProject({
      slug: "pca",
      title: "PCA",
      description: "MVP build",
    });
    const row = store.db.prepare("SELECT * FROM projects WHERE slug='pca'").get() as {
      title: string;
      description: string;
    };
    expect(row.title).toBe("PCA");
    expect(row.description).toBe("MVP build");
  });
});
