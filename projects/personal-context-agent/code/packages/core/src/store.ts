import {
  createClient,
  type Client,
  type InValue,
  type Row,
} from "@libsql/client";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ulid } from "ulidx";
import type { z } from "zod";
import { REGISTRY } from "./entities/registry.ts";
import type {
  Annotation,
  Authority,
  Capture,
  CaptureStatus,
  ClassificationSummary,
  ConfirmDecision,
  CreateEntityInput,
  Entity,
  EntityType,
  EventRow,
  Link,
  ListCapturesOptions,
  Project,
  RecordCaptureInput,
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

export type OpenStoreOptions = {
  /** Local file URL ("file:..."), or remote URL ("libsql:..."). For embedded
   *  replica mode, this is the local file path and `syncUrl` is the remote. */
  url: string;
  /** Remote sync URL for embedded-replica mode. Omit for local-only. */
  syncUrl?: string;
  /** Turso auth token (required when syncUrl is set). */
  authToken?: string;
  /** Background sync interval in seconds. Defaults to 60 when syncUrl is set. */
  syncInterval?: number;
};

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

type LinkRow = {
  id: string;
  src_id: string;
  dst_id: string;
  relation: string;
  weight: number;
  authority: string;
  created_at: string;
  invalidated_at: string | null;
};

type CaptureRow = {
  id: string;
  occurred_at: string;
  raw_text: string;
  source: string;
  actor: string;
  session_id: string | null;
  scope: string;
  status: string;
  processed_at: string | null;
  classification_summary: string | null;
  raw_lang: string | null;
  meta: string | null;
};

type NeighborRow = {
  l_id: string;
  l_src_id: string;
  l_dst_id: string;
  l_relation: string;
  l_weight: number;
  l_authority: string;
  l_created_at: string;
  l_invalidated_at: string | null;
  e_id: string;
  e_type: EntityType;
  e_title: string;
  e_body: string | null;
  e_status: string;
  e_authority: string;
  e_confidence: string;
  e_maturity: string;
  e_scope: string;
  e_source_ref: string | null;
  e_attrs: string | null;
  e_created_at: string;
  e_updated_at: string;
  e_expires_at: string | null;
  e_invalidated_at: string | null;
};

export type Store = Awaited<ReturnType<typeof openStore>>;

export async function openStore(opts: OpenStoreOptions) {
  const isReplica = Boolean(opts.syncUrl);
  const client: Client = isReplica
    ? createClient({
        url: opts.url,
        syncUrl: opts.syncUrl,
        authToken: opts.authToken,
        syncInterval: opts.syncInterval ?? 60,
      })
    : createClient({ url: opts.url });

  // For embedded replicas, pull remote state before running migrations so we
  // don't redundantly bootstrap a schema that already lives on the server.
  if (isReplica) {
    await client.sync();
  }

  // libsql ignores PRAGMA journal_mode=WAL (replication-driven). Foreign keys
  // are on by default in libsql; we re-assert as defense-in-depth.
  await client.execute("PRAGMA foreign_keys = ON");

  await runMigrations(client);

  async function logEvent(args: {
    actor: string;
    operation: EventRow["operation"];
    entity_id?: string | null;
    link_id?: string | null;
    annotation_id?: string | null;
    payload?: unknown;
    source_ref?: string | null;
  }): Promise<void> {
    await client.execute({
      sql: `INSERT INTO events
         (occurred_at, actor, operation, entity_id, link_id, annotation_id, payload, source_ref)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        nowIso(),
        args.actor,
        args.operation,
        args.entity_id ?? null,
        args.link_id ?? null,
        args.annotation_id ?? null,
        args.payload === undefined ? null : JSON.stringify(args.payload),
        args.source_ref ?? null,
      ],
    });
  }

  async function createEntity(
    input: CreateEntityInput,
    actor: string,
  ): Promise<Entity> {
    const spec = REGISTRY[input.type];
    if (!spec) throw new StoreError(`Unknown entity type: ${input.type}`, "BAD_TYPE");

    const parsedAttrs = parseAttrs(spec.attrs, input.type, input.attrs ?? {});
    const id = ulid();
    const now = nowIso();
    const expiresAt = computeExpiresAt(input.expires_at, spec.defaultTtlDays, now);
    const authority =
      input.authority ?? (input.type === "self" ? "self-declared" : "observed");

    try {
      await client.execute({
        sql: `INSERT INTO entities
           (id, type, title, body, status, authority, confidence, maturity,
            scope, source_ref, attrs, created_at, updated_at, expires_at)
         VALUES (?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
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
        ],
      });
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

    await logEvent({
      actor,
      operation: "create",
      entity_id: id,
      payload: { type: input.type, authority },
    });
    return (await getEntity(id))!;
  }

  async function getEntity(id: string): Promise<Entity | null> {
    const result = await client.execute({
      sql: "SELECT * FROM entities WHERE id = ?",
      args: [id],
    });
    const row = result.rows[0] as unknown as EntityRow | undefined;
    return row ? rowToEntity(row) : null;
  }

  async function updateEntity(
    id: string,
    changes: UpdateEntityChanges,
    actor: string,
  ): Promise<{ previous: Entity; current: Entity }> {
    const previous = await getEntity(id);
    if (!previous) throw new StoreError(`Entity not found: ${id}`, "NOT_FOUND");

    const nextAttrs =
      changes.attrs !== undefined
        ? parseAttrs(REGISTRY[previous.type].attrs, previous.type, changes.attrs)
        : previous.attrs;

    await applyEntityUpdate(client, id, previous, changes, nextAttrs);
    const current = (await getEntity(id))!;
    await logEvent({
      actor,
      operation: "update",
      entity_id: id,
      payload: { changes },
    });
    return { previous, current };
  }

  async function invalidateEntity(
    id: string,
    actor: string,
    note?: string,
  ): Promise<Entity> {
    const previous = await getEntity(id);
    if (!previous) throw new StoreError(`Entity not found: ${id}`, "NOT_FOUND");
    const now = nowIso();
    await client.execute({
      sql: `UPDATE entities SET status='invalidated', invalidated_at=?, updated_at=? WHERE id=?`,
      args: [now, now, id],
    });
    await logEvent({ actor, operation: "invalidate", entity_id: id, payload: { note } });

    // Cascade: any non-invalidated link touching this entity becomes invalid too.
    // Phase 3 Step 3.1: only `invalidated` cascades. An `archived` transition
    // leaves links intact — archive is a soft "out of rotation" state, not a
    // truth-revocation.
    const affected = await client.execute({
      sql: `UPDATE links SET invalidated_at = ?
              WHERE (src_id = ? OR dst_id = ?) AND invalidated_at IS NULL
            RETURNING id`,
      args: [now, id, id],
    });
    for (const linkRow of affected.rows) {
      const link = linkRow as unknown as { id: string };
      await logEvent({
        actor,
        operation: "link-invalidate",
        link_id: link.id,
        payload: { reason: "cascade", entity_id: id, note },
      });
    }
    return (await getEntity(id))!;
  }

  async function confirmEntity(
    id: string,
    decision: ConfirmDecision,
    actor: string,
    opts?: { modify?: UpdateEntityChanges; note?: string },
  ): Promise<{ outcome: "extended" | "invalidated" | "modified"; entity: Entity }> {
    const previous = await getEntity(id);
    if (!previous) throw new StoreError(`Entity not found: ${id}`, "NOT_FOUND");

    if (decision === "no-longer-true") {
      const entity = await invalidateEntity(id, actor, opts?.note);
      return { outcome: "invalidated", entity };
    }

    const spec = REGISTRY[previous.type];
    const now = nowIso();
    const newExpires =
      spec.defaultTtlDays === null ? null : addDays(now, spec.defaultTtlDays);

    if (decision === "still-true") {
      await applyEntityUpdate(
        client,
        id,
        previous,
        { expires_at: newExpires },
        previous.attrs,
      );
      await logEvent({
        actor,
        operation: "confirm",
        entity_id: id,
        payload: { note: opts?.note },
      });
      return { outcome: "extended", entity: (await getEntity(id))! };
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
    await applyEntityUpdate(client, id, previous, changes, nextAttrs);
    await logEvent({
      actor,
      operation: "confirm-modify",
      entity_id: id,
      payload: { note: opts?.note, modify: opts?.modify },
    });
    return { outcome: "modified", entity: (await getEntity(id))! };
  }

  async function listActive(
    type: EntityType,
    opts?: { scope?: string; limit?: number },
  ): Promise<Entity[]> {
    const view = VIEW_FOR[type];
    const limit = opts?.limit ?? 50;
    const where = opts?.scope ? " WHERE scope = ?" : "";
    const sql = `SELECT * FROM ${view}${where} LIMIT ?`;
    const args: InValue[] = opts?.scope ? [opts.scope, limit] : [limit];
    const result = await client.execute({ sql, args });
    const rows = result.rows as unknown as EntityRow[];
    return rows.map(rowToEntity);
  }

  async function searchFts(
    query: string,
    opts?: { types?: EntityType[]; limit?: number },
  ): Promise<Entity[]> {
    const limit = opts?.limit ?? 10;
    const args: InValue[] = [query];
    let typeFilter = "";
    if (opts?.types && opts.types.length > 0) {
      typeFilter = ` AND e.type IN (${opts.types.map(() => "?").join(",")})`;
      args.push(...opts.types);
    }
    args.push(limit);
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
    const result = await client.execute({ sql, args });
    const rows = result.rows as unknown as EntityRow[];
    return rows.map(rowToEntity);
  }

  async function getCurrentSelf(): Promise<Entity | null> {
    const result = await client.execute("SELECT * FROM v_current_self");
    const row = result.rows[0] as unknown as EntityRow | undefined;
    return row ? rowToEntity(row) : null;
  }

  async function listEvents(opts?: {
    entityId?: string;
    limit?: number;
  }): Promise<EventRow[]> {
    const limit = opts?.limit ?? 100;
    const where = opts?.entityId ? " WHERE entity_id = ?" : "";
    const sql = `SELECT * FROM events${where} ORDER BY occurred_at ASC, id ASC LIMIT ?`;
    const args: InValue[] = opts?.entityId ? [opts.entityId, limit] : [limit];
    const result = await client.execute({ sql, args });
    const rows = result.rows as unknown as RawEventRow[];
    return rows.map((r) => ({
      ...r,
      payload: r.payload ? JSON.parse(r.payload) : null,
    }));
  }

  async function listStale(): Promise<Entity[]> {
    const result = await client.execute(
      "SELECT * FROM v_stale_entities ORDER BY updated_at ASC",
    );
    const rows = result.rows as unknown as EntityRow[];
    return rows.map(rowToEntity);
  }

  // ── Primitives ─────────────────────────────────────────────────────────────

  async function createLink(
    args: {
      src_id: string;
      dst_id: string;
      relation: string;
      weight?: number;
      authority?: Authority;
    },
    actor: string,
  ): Promise<Link> {
    const id = ulid();
    const created_at = nowIso();
    const authority = args.authority ?? "observed";
    await client.execute({
      sql: `INSERT INTO links (id, src_id, dst_id, relation, weight, authority, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        args.src_id,
        args.dst_id,
        args.relation,
        args.weight ?? 1.0,
        authority,
        created_at,
      ],
    });
    await logEvent({ actor, operation: "link", link_id: id, payload: args });
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

  async function listLinks(opts?: {
    entityId?: string;
    relation?: string;
    direction?: "out" | "in" | "both";
    includeInvalidated?: boolean;
    limit?: number;
  }): Promise<Link[]> {
    const limit = opts?.limit ?? 50;
    const includeInvalidated = opts?.includeInvalidated ?? false;
    const where: string[] = [];
    const args: InValue[] = [];

    if (opts?.entityId) {
      const direction = opts.direction ?? "both";
      if (direction === "out") {
        where.push("src_id = ?");
        args.push(opts.entityId);
      } else if (direction === "in") {
        where.push("dst_id = ?");
        args.push(opts.entityId);
      } else {
        where.push("(src_id = ? OR dst_id = ?)");
        args.push(opts.entityId, opts.entityId);
      }
    }
    if (!includeInvalidated) {
      where.push("invalidated_at IS NULL");
    }
    if (opts?.relation) {
      where.push("relation = ?");
      args.push(opts.relation);
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
    const sql = `SELECT * FROM links ${whereSql} ORDER BY created_at DESC LIMIT ?`;
    args.push(limit);
    const result = await client.execute({ sql, args });
    const rows = result.rows as unknown as LinkRow[];
    return rows.map(rowToLink);
  }

  async function getNeighbors(
    id: string,
    opts?: {
      relation?: string;
      direction?: "out" | "in" | "both";
      types?: EntityType[];
      limit?: number;
    },
  ): Promise<Array<{ entity: Entity; link: Link; role: "out" | "in" }>> {
    const limit = opts?.limit ?? 50;
    const direction = opts?.direction ?? "both";

    const linkCols = [
      "l.id AS l_id",
      "l.src_id AS l_src_id",
      "l.dst_id AS l_dst_id",
      "l.relation AS l_relation",
      "l.weight AS l_weight",
      "l.authority AS l_authority",
      "l.created_at AS l_created_at",
      "l.invalidated_at AS l_invalidated_at",
    ].join(", ");
    const entityCols = [
      "e.id AS e_id",
      "e.type AS e_type",
      "e.title AS e_title",
      "e.body AS e_body",
      "e.status AS e_status",
      "e.authority AS e_authority",
      "e.confidence AS e_confidence",
      "e.maturity AS e_maturity",
      "e.scope AS e_scope",
      "e.source_ref AS e_source_ref",
      "e.attrs AS e_attrs",
      "e.created_at AS e_created_at",
      "e.updated_at AS e_updated_at",
      "e.expires_at AS e_expires_at",
      "e.invalidated_at AS e_invalidated_at",
    ].join(", ");

    const where: string[] = ["l.invalidated_at IS NULL"];
    const args: InValue[] = [];
    let neighborExpr: string;
    let directionFilter: string;

    if (direction === "out") {
      neighborExpr = "l.dst_id";
      directionFilter = "l.src_id = ?";
      args.push(id);
    } else if (direction === "in") {
      neighborExpr = "l.src_id";
      directionFilter = "l.dst_id = ?";
      args.push(id);
    } else {
      neighborExpr = "CASE WHEN l.src_id = ? THEN l.dst_id ELSE l.src_id END";
      directionFilter = "(l.src_id = ? OR l.dst_id = ?)";
      args.push(id, id, id);
    }
    where.push(directionFilter);
    where.push("e.status = 'active'");
    where.push("(e.expires_at IS NULL OR e.expires_at > datetime('now'))");

    if (opts?.relation) {
      where.push("l.relation = ?");
      args.push(opts.relation);
    }
    if (opts?.types && opts.types.length > 0) {
      where.push(`e.type IN (${opts.types.map(() => "?").join(",")})`);
      args.push(...opts.types);
    }
    args.push(limit);

    const sql = `
      SELECT ${linkCols}, ${entityCols}
      FROM links l
      JOIN entities e ON e.id = ${neighborExpr}
      WHERE ${where.join(" AND ")}
      ORDER BY l.created_at DESC
      LIMIT ?
    `;
    const result = await client.execute({ sql, args });
    const rows = result.rows as unknown as NeighborRow[];
    return rows.map((r) => {
      const link = rowToLink({
        id: r.l_id,
        src_id: r.l_src_id,
        dst_id: r.l_dst_id,
        relation: r.l_relation,
        weight: r.l_weight,
        authority: r.l_authority,
        created_at: r.l_created_at,
        invalidated_at: r.l_invalidated_at,
      });
      const entity = rowToEntity({
        id: r.e_id,
        type: r.e_type,
        title: r.e_title,
        body: r.e_body,
        status: r.e_status,
        authority: r.e_authority,
        confidence: r.e_confidence,
        maturity: r.e_maturity,
        scope: r.e_scope,
        source_ref: r.e_source_ref,
        attrs: r.e_attrs,
        created_at: r.e_created_at,
        updated_at: r.e_updated_at,
        expires_at: r.e_expires_at,
        invalidated_at: r.e_invalidated_at,
      });
      const role: "out" | "in" = link.src_id === id ? "out" : "in";
      return { entity, link, role };
    });
  }

  async function invalidateLink(
    linkId: string,
    actor: string,
    note?: string,
  ): Promise<Link> {
    const existingResult = await client.execute({
      sql: "SELECT * FROM links WHERE id = ?",
      args: [linkId],
    });
    const existing = existingResult.rows[0] as unknown as LinkRow | undefined;
    if (!existing) throw new StoreError(`Link not found: ${linkId}`, "NOT_FOUND");
    if (existing.invalidated_at) return rowToLink(existing);

    const now = nowIso();
    await client.execute({
      sql: "UPDATE links SET invalidated_at = ? WHERE id = ?",
      args: [now, linkId],
    });
    await logEvent({
      actor,
      operation: "link-invalidate",
      link_id: linkId,
      payload: { note },
    });
    return rowToLink({ ...existing, invalidated_at: now });
  }

  async function createAnnotation(
    args: { entity_id: string; body: string; authority?: Authority },
    actor: string,
  ): Promise<Annotation> {
    const id = ulid();
    const created_at = nowIso();
    const authority = args.authority ?? "observed";
    await client.execute({
      sql: `INSERT INTO annotations (id, entity_id, body, authority, created_at) VALUES (?, ?, ?, ?, ?)`,
      args: [id, args.entity_id, args.body, authority, created_at],
    });
    await logEvent({
      actor,
      operation: "annotate",
      entity_id: args.entity_id,
      annotation_id: id,
    });
    return { id, entity_id: args.entity_id, body: args.body, authority, created_at };
  }

  async function tagEntity(
    entity_id: string,
    slug: string,
    actor: string,
  ): Promise<void> {
    await client.execute({
      sql: `INSERT INTO tags (slug, description) VALUES (?, NULL)
            ON CONFLICT(slug) DO NOTHING`,
      args: [slug],
    });
    await client.execute({
      sql: `INSERT OR IGNORE INTO entity_tags (entity_id, tag_slug) VALUES (?, ?)`,
      args: [entity_id, slug],
    });
    await logEvent({ actor, operation: "tag", entity_id, payload: { slug } });
  }

  async function createSource(args: {
    kind: Source["kind"];
    identifier: string;
    excerpt?: string;
  }): Promise<Source> {
    const id = ulid();
    const created_at = nowIso();
    await client.execute({
      sql: `INSERT INTO sources (id, kind, identifier, excerpt, created_at) VALUES (?, ?, ?, ?, ?)`,
      args: [id, args.kind, args.identifier, args.excerpt ?? null, created_at],
    });
    return {
      id,
      kind: args.kind,
      identifier: args.identifier,
      excerpt: args.excerpt ?? null,
      created_at,
    };
  }

  async function attachSource(
    entity_id: string,
    source_id: string,
    actor: string,
  ): Promise<void> {
    await client.execute({
      sql: `INSERT OR IGNORE INTO entity_sources (entity_id, source_id) VALUES (?, ?)`,
      args: [entity_id, source_id],
    });
    await logEvent({
      actor,
      operation: "source",
      entity_id,
      payload: { source_id },
    });
  }

  async function upsertProject(args: {
    slug: string;
    title: string;
    description?: string;
  }): Promise<Project> {
    const created_at = nowIso();
    await client.execute({
      sql: `INSERT INTO projects (slug, title, description, status, created_at)
              VALUES (?, ?, ?, 'active', ?)
            ON CONFLICT(slug) DO UPDATE SET
              title = excluded.title,
              description = COALESCE(excluded.description, projects.description)`,
      args: [args.slug, args.title, args.description ?? null, created_at],
    });
    return {
      slug: args.slug,
      title: args.title,
      description: args.description ?? null,
      status: "active",
      created_at,
    };
  }

  // ── Captures ───────────────────────────────────────────────────────────────

  async function recordCapture(
    input: RecordCaptureInput,
    actor: string,
  ): Promise<Capture> {
    if (!input.raw_text || input.raw_text.length === 0) {
      throw new StoreError("raw_text must be non-empty", "BAD_INPUT");
    }
    const id = ulid();
    const occurred_at = nowIso();
    const source = input.source ?? "claude-code:ctx-add";
    const scope = input.scope ?? "general";
    const session_id = input.session_id ?? null;
    const raw_lang = input.raw_lang ?? null;
    const meta = input.meta ?? null;

    await client.execute({
      sql: `INSERT INTO captures
         (id, occurred_at, raw_text, source, actor, session_id, scope,
          status, processed_at, classification_summary, raw_lang, meta)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', NULL, NULL, ?, ?)`,
      args: [
        id,
        occurred_at,
        input.raw_text,
        source,
        actor,
        session_id,
        scope,
        raw_lang,
        meta === null ? null : JSON.stringify(meta),
      ],
    });

    // Event payload deliberately omits the full text — captures table is the
    // source of truth. Only the metadata for debugging timeline replays.
    await logEvent({
      actor,
      operation: "capture",
      payload: {
        capture_id: id,
        raw_text_length: input.raw_text.length,
        source,
        session_id,
        scope,
      },
    });
    return (await getCapture(id))!;
  }

  async function getCapture(id: string): Promise<Capture | null> {
    const result = await client.execute({
      sql: "SELECT * FROM captures WHERE id = ?",
      args: [id],
    });
    const row = result.rows[0] as unknown as CaptureRow | undefined;
    return row ? rowToCapture(row) : null;
  }

  async function listCaptures(opts?: ListCapturesOptions): Promise<Capture[]> {
    const limit = Math.min(opts?.limit ?? 50, 500);
    const where: string[] = [];
    const args: InValue[] = [];

    // FTS branch: join through fts_captures.
    if (opts?.fts && opts.fts.length > 0) {
      where.push("c.rowid IN (SELECT rowid FROM fts_captures WHERE fts_captures MATCH ?)");
      args.push(opts.fts);
    }
    if (opts?.since) {
      where.push("c.occurred_at >= ?");
      args.push(opts.since);
    }
    if (opts?.until) {
      where.push("c.occurred_at <= ?");
      args.push(opts.until);
    }
    if (opts?.status) {
      where.push("c.status = ?");
      args.push(opts.status);
    }
    if (opts?.source) {
      where.push("c.source = ?");
      args.push(opts.source);
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
    const sql = `SELECT c.* FROM captures c ${whereSql} ORDER BY c.occurred_at DESC LIMIT ?`;
    args.push(limit);
    const result = await client.execute({ sql, args });
    const rows = result.rows as unknown as CaptureRow[];
    return rows.map(rowToCapture);
  }

  async function updateCaptureStatus(
    capture_id: string,
    status: "processed" | "aborted",
    actor: string,
    classification_summary?: ClassificationSummary,
  ): Promise<Capture> {
    const existing = await getCapture(capture_id);
    if (!existing) {
      throw new StoreError(`Capture not found: ${capture_id}`, "NOT_FOUND");
    }
    // Append-only: once a capture leaves 'pending', its terminal state is
    // frozen. Reprocess is a separate Phase E flow (plan-captures.md §2).
    if (existing.status !== "pending") {
      throw new StoreError(
        `Capture ${capture_id} is already ${existing.status}; cannot transition to ${status}`,
        "BAD_TRANSITION",
      );
    }

    const processed_at = nowIso();
    const summaryJson =
      classification_summary === undefined
        ? existing.classification_summary === null
          ? null
          : JSON.stringify(existing.classification_summary)
        : JSON.stringify(classification_summary);

    await client.execute({
      sql: `UPDATE captures
              SET status = ?, processed_at = ?, classification_summary = ?
            WHERE id = ?`,
      args: [status, processed_at, summaryJson, capture_id],
    });

    await logEvent({
      actor,
      operation: "capture-update",
      payload: {
        capture_id,
        status,
        classification_summary: classification_summary ?? null,
      },
    });
    return (await getCapture(capture_id))!;
  }

  async function linkCaptureToEntity(
    capture_id: string,
    entity_id: string,
  ): Promise<void> {
    // Validate both ends exist so callers get a clean error rather than a
    // dangling FK failure surface.
    const capResult = await client.execute({
      sql: "SELECT id FROM captures WHERE id = ?",
      args: [capture_id],
    });
    const cap = capResult.rows[0] as unknown as { id: string } | undefined;
    if (!cap) throw new StoreError(`Capture not found: ${capture_id}`, "NOT_FOUND");
    const entResult = await client.execute({
      sql: "SELECT id FROM entities WHERE id = ?",
      args: [entity_id],
    });
    const ent = entResult.rows[0] as unknown as { id: string } | undefined;
    if (!ent) throw new StoreError(`Entity not found: ${entity_id}`, "NOT_FOUND");

    await client.execute({
      sql: `INSERT OR IGNORE INTO capture_entities (capture_id, entity_id) VALUES (?, ?)`,
      args: [capture_id, entity_id],
    });
  }

  async function linkCaptureToLink(
    capture_id: string,
    link_id: string,
  ): Promise<void> {
    const capResult = await client.execute({
      sql: "SELECT id FROM captures WHERE id = ?",
      args: [capture_id],
    });
    const cap = capResult.rows[0] as unknown as { id: string } | undefined;
    if (!cap) throw new StoreError(`Capture not found: ${capture_id}`, "NOT_FOUND");
    const lnkResult = await client.execute({
      sql: "SELECT id FROM links WHERE id = ?",
      args: [link_id],
    });
    const lnk = lnkResult.rows[0] as unknown as { id: string } | undefined;
    if (!lnk) throw new StoreError(`Link not found: ${link_id}`, "NOT_FOUND");

    await client.execute({
      sql: `INSERT OR IGNORE INTO capture_links (capture_id, link_id) VALUES (?, ?)`,
      args: [capture_id, link_id],
    });
  }

  function close(): void {
    client.close();
  }

  /** Force a sync round-trip with the remote (embedded-replica only; no-op
   *  for local-only stores). */
  async function sync(): Promise<void> {
    if (isReplica) await client.sync();
  }

  return {
    client,
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
    listLinks,
    getNeighbors,
    invalidateLink,
    createAnnotation,
    tagEntity,
    createSource,
    attachSource,
    upsertProject,
    recordCapture,
    getCapture,
    listCaptures,
    updateCaptureStatus,
    linkCaptureToEntity,
    linkCaptureToLink,
    close,
    sync,
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

function rowToLink(r: LinkRow): Link {
  return {
    id: r.id,
    src_id: r.src_id,
    dst_id: r.dst_id,
    relation: r.relation,
    weight: r.weight,
    authority: r.authority as Authority,
    created_at: r.created_at,
    invalidated_at: r.invalidated_at,
  };
}

function rowToCapture(r: CaptureRow): Capture {
  return {
    id: r.id,
    occurred_at: r.occurred_at,
    raw_text: r.raw_text,
    source: r.source,
    actor: r.actor,
    session_id: r.session_id,
    scope: r.scope,
    status: r.status as CaptureStatus,
    processed_at: r.processed_at,
    classification_summary: r.classification_summary
      ? (JSON.parse(r.classification_summary) as ClassificationSummary)
      : null,
    raw_lang: r.raw_lang,
    meta: r.meta ? (JSON.parse(r.meta) as Record<string, unknown>) : null,
  };
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

async function applyEntityUpdate(
  client: Client,
  id: string,
  previous: Entity,
  changes: UpdateEntityChanges,
  nextAttrs: Record<string, unknown>,
): Promise<void> {
  const expiresAt =
    changes.expires_at === undefined ? previous.expires_at : changes.expires_at;
  await client.execute({
    sql: `UPDATE entities
            SET title = ?, body = ?, attrs = ?, status = ?, scope = ?,
                expires_at = ?, confidence = ?, maturity = ?, updated_at = ?
          WHERE id = ?`,
    args: [
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
    ],
  });
}

async function runMigrations(client: Client): Promise<void> {
  await client.execute(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version    INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL
  )`);
  const appliedResult = await client.execute(
    "SELECT version FROM schema_migrations",
  );
  const applied = new Set<number>(
    (appliedResult.rows as Row[]).map((r) => Number(r.version)),
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
    // Wrap each migration + its version-row insert in a single transaction.
    // executeMultiple doesn't auto-wrap, but it does allow explicit BEGIN/COMMIT.
    // nowIso() is a generated ISO string and `version` is a number — no
    // injection surface from external input.
    const txSql =
      `BEGIN;\n${sql}\n` +
      `INSERT OR REPLACE INTO schema_migrations (version, applied_at) ` +
      `VALUES (${version}, '${nowIso()}');\nCOMMIT;`;
    await client.executeMultiple(txSql);
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
