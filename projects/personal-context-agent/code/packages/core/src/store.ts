import { Database } from "bun:sqlite";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ulid } from "ulidx";
import type { z } from "zod";
import { REGISTRY } from "./entities/registry.ts";
import type {
  Annotation,
  Authority,
  ConfirmDecision,
  CreateEntityInput,
  Entity,
  EntityType,
  EventRow,
  Link,
  Project,
  Source,
  UpdateEntityChanges,
} from "./types.ts";

const MIGRATIONS_DIR = join(import.meta.dir, "schema", "migrations");

const VIEW_FOR: Record<EntityType, string> = {
  self: "v_current_self",
  place: "v_active_places",
  goal: "v_active_goals",
  knowledge: "v_active_knowledge",
  person: "v_active_persons",
  resource: "v_active_resources",
  constraint: "v_active_constraints",
  state: "v_active_states",
  event: "v_active_events",
  preference: "v_active_preferences",
  stance: "v_active_stances",
  role: "v_active_roles",
};

export class StoreError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = "StoreError";
  }
}

type EntityRow = {
  id: string;
  type: EntityType;
  title: string;
  body: string | null;
  status: string;
  authority: string;
  confidence: string;
  maturity: string;
  scope: string;
  source_ref: string | null;
  attrs: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  invalidated_at: string | null;
};

type RawEventRow = Omit<EventRow, "payload"> & { payload: string | null };

export type Store = ReturnType<typeof openStore>;

export function openStore(dbPath: string) {
  const db = new Database(dbPath, { create: true });
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec("PRAGMA synchronous = NORMAL");
  db.exec("PRAGMA busy_timeout = 5000");

  runMigrations(db);

  function logEvent(args: {
    actor: string;
    operation: EventRow["operation"];
    entity_id?: string | null;
    link_id?: string | null;
    annotation_id?: string | null;
    payload?: unknown;
    source_ref?: string | null;
  }): void {
    db.prepare(
      `INSERT INTO events
         (occurred_at, actor, operation, entity_id, link_id, annotation_id, payload, source_ref)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      nowIso(),
      args.actor,
      args.operation,
      args.entity_id ?? null,
      args.link_id ?? null,
      args.annotation_id ?? null,
      args.payload === undefined ? null : JSON.stringify(args.payload),
      args.source_ref ?? null,
    );
  }

  function createEntity(input: CreateEntityInput, actor: string): Entity {
    const spec = REGISTRY[input.type];
    if (!spec) throw new StoreError(`Unknown entity type: ${input.type}`, "BAD_TYPE");

    const parsedAttrs = parseAttrs(spec.attrs, input.type, input.attrs ?? {});
    const id = ulid();
    const now = nowIso();
    const expiresAt = computeExpiresAt(input.expires_at, spec.defaultTtlDays, now);
    const authority =
      input.authority ?? (input.type === "self" ? "self-declared" : "observed");

    try {
      db.prepare(
        `INSERT INTO entities
           (id, type, title, body, status, authority, confidence, maturity,
            scope, source_ref, attrs, created_at, updated_at, expires_at)
         VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ).run(
        id,
        input.type,
        input.title,
        input.body ?? null,
        authority,
        input.confidence ?? "medium",
        input.maturity ?? "provisional",
        input.scope ?? "general",
        input.source_ref ?? null,
        JSON.stringify(parsedAttrs),
        now,
        now,
        expiresAt,
      );
    } catch (e: unknown) {
      if (
        spec.isSingleton &&
        e instanceof Error &&
        e.message.includes("UNIQUE constraint failed")
      ) {
        throw new StoreError(
          `${input.type} already exists. Use updateEntity to modify.`,
          "SINGLETON_CONFLICT",
        );
      }
      throw e;
    }

    logEvent({
      actor,
      operation: "create",
      entity_id: id,
      payload: { type: input.type, authority },
    });
    return getEntity(id)!;
  }

  function getEntity(id: string): Entity | null {
    const row = db.prepare("SELECT * FROM entities WHERE id = ?").get(id) as
      | EntityRow
      | null;
    return row ? rowToEntity(row) : null;
  }

  function updateEntity(
    id: string,
    changes: UpdateEntityChanges,
    actor: string,
  ): { previous: Entity; current: Entity } {
    const previous = getEntity(id);
    if (!previous) throw new StoreError(`Entity not found: ${id}`, "NOT_FOUND");

    const nextAttrs =
      changes.attrs !== undefined
        ? parseAttrs(REGISTRY[previous.type].attrs, previous.type, changes.attrs)
        : previous.attrs;

    applyEntityUpdate(db, id, previous, changes, nextAttrs);
    const current = getEntity(id)!;
    logEvent({
      actor,
      operation: "update",
      entity_id: id,
      payload: { changes },
    });
    return { previous, current };
  }

  function invalidateEntity(id: string, actor: string, note?: string): Entity {
    const previous = getEntity(id);
    if (!previous) throw new StoreError(`Entity not found: ${id}`, "NOT_FOUND");
    const now = nowIso();
    db.prepare(
      `UPDATE entities SET status='invalidated', invalidated_at=?, updated_at=? WHERE id=?`,
    ).run(now, now, id);
    logEvent({ actor, operation: "invalidate", entity_id: id, payload: { note } });
    return getEntity(id)!;
  }

  function confirmEntity(
    id: string,
    decision: ConfirmDecision,
    actor: string,
    opts?: { modify?: UpdateEntityChanges; note?: string },
  ): { outcome: "extended" | "invalidated" | "modified"; entity: Entity } {
    const previous = getEntity(id);
    if (!previous) throw new StoreError(`Entity not found: ${id}`, "NOT_FOUND");

    if (decision === "no-longer-true") {
      const entity = invalidateEntity(id, actor, opts?.note);
      return { outcome: "invalidated", entity };
    }

    const spec = REGISTRY[previous.type];
    const now = nowIso();
    const newExpires =
      spec.defaultTtlDays === null ? null : addDays(now, spec.defaultTtlDays);

    if (decision === "still-true") {
      applyEntityUpdate(
        db,
        id,
        previous,
        { expires_at: newExpires },
        previous.attrs,
      );
      logEvent({
        actor,
        operation: "confirm",
        entity_id: id,
        payload: { note: opts?.note },
      });
      return { outcome: "extended", entity: getEntity(id)! };
    }

    // decision === "modify"
    const changes: UpdateEntityChanges = {
      ...(opts?.modify ?? {}),
      expires_at: newExpires,
    };
    const nextAttrs =
      changes.attrs !== undefined
        ? parseAttrs(spec.attrs, previous.type, changes.attrs)
        : previous.attrs;
    applyEntityUpdate(db, id, previous, changes, nextAttrs);
    logEvent({
      actor,
      operation: "confirm-modify",
      entity_id: id,
      payload: { note: opts?.note, modify: opts?.modify },
    });
    return { outcome: "modified", entity: getEntity(id)! };
  }

  function listActive(
    type: EntityType,
    opts?: { scope?: string; limit?: number },
  ): Entity[] {
    const view = VIEW_FOR[type];
    const limit = opts?.limit ?? 50;
    const where = opts?.scope ? " WHERE scope = ?" : "";
    const sql = `SELECT * FROM ${view}${where} LIMIT ?`;
    const params: unknown[] = opts?.scope ? [opts.scope, limit] : [limit];
    const rows = db.prepare(sql).all(...(params as never[])) as EntityRow[];
    return rows.map(rowToEntity);
  }

  function searchFts(
    query: string,
    opts?: { types?: EntityType[]; limit?: number },
  ): Entity[] {
    const limit = opts?.limit ?? 10;
    const params: unknown[] = [query];
    let typeFilter = "";
    if (opts?.types && opts.types.length > 0) {
      typeFilter = ` AND e.type IN (${opts.types.map(() => "?").join(",")})`;
      params.push(...opts.types);
    }
    params.push(limit);
    const sql = `
      SELECT e.*
      FROM fts_entities f
      JOIN entities e ON e.rowid = f.rowid
      WHERE fts_entities MATCH ?
        AND e.status = 'active'
        AND (e.expires_at IS NULL OR e.expires_at > datetime('now'))
        ${typeFilter}
      ORDER BY rank
      LIMIT ?`;
    const rows = db.prepare(sql).all(...(params as never[])) as EntityRow[];
    return rows.map(rowToEntity);
  }

  function getCurrentSelf(): Entity | null {
    const row = db.prepare("SELECT * FROM v_current_self").get() as EntityRow | null;
    return row ? rowToEntity(row) : null;
  }

  function listEvents(opts?: {
    entityId?: string;
    limit?: number;
  }): EventRow[] {
    const limit = opts?.limit ?? 100;
    const where = opts?.entityId ? " WHERE entity_id = ?" : "";
    const sql = `SELECT * FROM events${where} ORDER BY occurred_at ASC, id ASC LIMIT ?`;
    const params: unknown[] = opts?.entityId ? [opts.entityId, limit] : [limit];
    const rows = db.prepare(sql).all(...(params as never[])) as RawEventRow[];
    return rows.map((r) => ({
      ...r,
      payload: r.payload ? JSON.parse(r.payload) : null,
    }));
  }

  function listStale(): Entity[] {
    const rows = db
      .prepare("SELECT * FROM v_stale_entities ORDER BY updated_at ASC")
      .all() as EntityRow[];
    return rows.map(rowToEntity);
  }

  // ── Primitives ─────────────────────────────────────────────────────────────

  function createLink(
    args: {
      src_id: string;
      dst_id: string;
      relation: string;
      weight?: number;
      authority?: Authority;
    },
    actor: string,
  ): Link {
    const id = ulid();
    const created_at = nowIso();
    const authority = args.authority ?? "observed";
    db.prepare(
      `INSERT INTO links (id, src_id, dst_id, relation, weight, authority, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      id,
      args.src_id,
      args.dst_id,
      args.relation,
      args.weight ?? 1.0,
      authority,
      created_at,
    );
    logEvent({ actor, operation: "link", link_id: id, payload: args });
    return {
      id,
      src_id: args.src_id,
      dst_id: args.dst_id,
      relation: args.relation,
      weight: args.weight ?? 1.0,
      authority,
      created_at,
      invalidated_at: null,
    };
  }

  function createAnnotation(
    args: { entity_id: string; body: string; authority?: Authority },
    actor: string,
  ): Annotation {
    const id = ulid();
    const created_at = nowIso();
    const authority = args.authority ?? "observed";
    db.prepare(
      `INSERT INTO annotations (id, entity_id, body, authority, created_at) VALUES (?, ?, ?, ?, ?)`,
    ).run(id, args.entity_id, args.body, authority, created_at);
    logEvent({
      actor,
      operation: "annotate",
      entity_id: args.entity_id,
      annotation_id: id,
    });
    return { id, entity_id: args.entity_id, body: args.body, authority, created_at };
  }

  function tagEntity(entity_id: string, slug: string, actor: string): void {
    db.prepare(
      `INSERT INTO tags (slug, description) VALUES (?, NULL)
         ON CONFLICT(slug) DO NOTHING`,
    ).run(slug);
    db.prepare(
      `INSERT OR IGNORE INTO entity_tags (entity_id, tag_slug) VALUES (?, ?)`,
    ).run(entity_id, slug);
    logEvent({ actor, operation: "tag", entity_id, payload: { slug } });
  }

  function createSource(args: {
    kind: Source["kind"];
    identifier: string;
    excerpt?: string;
  }): Source {
    const id = ulid();
    const created_at = nowIso();
    db.prepare(
      `INSERT INTO sources (id, kind, identifier, excerpt, created_at) VALUES (?, ?, ?, ?, ?)`,
    ).run(id, args.kind, args.identifier, args.excerpt ?? null, created_at);
    return {
      id,
      kind: args.kind,
      identifier: args.identifier,
      excerpt: args.excerpt ?? null,
      created_at,
    };
  }

  function attachSource(entity_id: string, source_id: string, actor: string): void {
    db.prepare(
      `INSERT OR IGNORE INTO entity_sources (entity_id, source_id) VALUES (?, ?)`,
    ).run(entity_id, source_id);
    logEvent({
      actor,
      operation: "source",
      entity_id,
      payload: { source_id },
    });
  }

  function upsertProject(args: {
    slug: string;
    title: string;
    description?: string;
  }): Project {
    const created_at = nowIso();
    db.prepare(
      `INSERT INTO projects (slug, title, description, status, created_at)
         VALUES (?, ?, ?, 'active', ?)
       ON CONFLICT(slug) DO UPDATE SET
         title = excluded.title,
         description = COALESCE(excluded.description, projects.description)`,
    ).run(args.slug, args.title, args.description ?? null, created_at);
    return {
      slug: args.slug,
      title: args.title,
      description: args.description ?? null,
      status: "active",
      created_at,
    };
  }

  function close(): void {
    db.close();
  }

  return {
    db,
    createEntity,
    getEntity,
    updateEntity,
    invalidateEntity,
    confirmEntity,
    listActive,
    searchFts,
    getCurrentSelf,
    listEvents,
    listStale,
    createLink,
    createAnnotation,
    tagEntity,
    createSource,
    attachSource,
    upsertProject,
    close,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function nowIso(): string {
  return new Date().toISOString();
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function rowToEntity(r: EntityRow): Entity {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    body: r.body,
    status: r.status as Entity["status"],
    authority: r.authority as Authority,
    confidence: r.confidence as Entity["confidence"],
    maturity: r.maturity as Entity["maturity"],
    scope: r.scope,
    source_ref: r.source_ref,
    attrs: r.attrs ? (JSON.parse(r.attrs) as Record<string, unknown>) : {},
    created_at: r.created_at,
    updated_at: r.updated_at,
    expires_at: r.expires_at,
    invalidated_at: r.invalidated_at,
  };
}

function applyEntityUpdate(
  db: Database,
  id: string,
  previous: Entity,
  changes: UpdateEntityChanges,
  nextAttrs: Record<string, unknown>,
): void {
  const expiresAt =
    changes.expires_at === undefined ? previous.expires_at : changes.expires_at;
  db.prepare(
    `UPDATE entities
       SET title = ?, body = ?, attrs = ?, status = ?, scope = ?,
           expires_at = ?, confidence = ?, maturity = ?, updated_at = ?
     WHERE id = ?`,
  ).run(
    changes.title ?? previous.title,
    changes.body === undefined ? previous.body : changes.body,
    JSON.stringify(nextAttrs),
    changes.status ?? previous.status,
    changes.scope ?? previous.scope,
    expiresAt,
    changes.confidence ?? previous.confidence,
    changes.maturity ?? previous.maturity,
    nowIso(),
    id,
  );
}

function runMigrations(db: Database): void {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version    INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL
  )`);
  const applied = new Set<number>(
    (
      db.prepare("SELECT version FROM schema_migrations").all() as Array<{
        version: number;
      }>
    ).map((r) => r.version),
  );
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  for (const file of files) {
    const version = Number(file.split("_")[0]);
    if (Number.isNaN(version)) {
      throw new StoreError(`Bad migration filename: ${file}`, "BAD_MIGRATION");
    }
    if (applied.has(version)) continue;
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf-8");
    db.transaction(() => {
      db.exec(sql);
      db.prepare(
        `INSERT OR REPLACE INTO schema_migrations (version, applied_at) VALUES (?, ?)`,
      ).run(version, nowIso());
    })();
  }
}

function parseAttrs(
  schema: z.ZodTypeAny,
  type: EntityType,
  raw: Record<string, unknown>,
): Record<string, unknown> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new StoreError(
      `Invalid attrs for type '${type}': ${result.error.message}`,
      "BAD_ATTRS",
    );
  }
  return result.data as Record<string, unknown>;
}

function computeExpiresAt(
  override: string | null | undefined,
  defaultTtlDays: number | null,
  now: string,
): string | null {
  if (override === null) return null;
  if (override !== undefined) return override;
  if (defaultTtlDays === null) return null;
  return addDays(now, defaultTtlDays);
}
