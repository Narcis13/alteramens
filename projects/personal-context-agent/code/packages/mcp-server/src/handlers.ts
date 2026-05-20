// Pure tool handler functions. Take (store, input), return structured output.
// Kept SDK-free so tests can call them directly without spinning up stdio.
//
// Source-of-truth for behavior: PRD §7 (MCP Layer 1 — 6 tools).
import {
  ENTITY_TYPES,
  StoreError,
  getRelationSpec,
  isCyclic,
  validateLinkPair,
  type Capture,
  type CaptureStatus,
  type ClassificationSummary,
  type Entity,
  type EntityType,
  type Link,
  type Store,
} from "@pca/core";

// key_links projection: skip body to keep summary payload small.
export type KeyLinkEndpoint = { id: string; type: EntityType; title: string };
export type KeyLink = {
  link: Link;
  src: KeyLinkEndpoint;
  dst: KeyLinkEndpoint;
};

// ── Input shapes (validated upstream by SDK via zod) ───────────────────────────

export type GetSelfSummaryInput = { scope?: string };

export type GetRelevantContextInput = {
  query: string;
  max_items?: number;
  types?: EntityType[];
  scope?: string;
};

export type RecordObservationInput = {
  text: string;
  type?: EntityType;
  title?: string;
  attrs?: Record<string, unknown>;
  source?: string;
  scope?: string;
  expires_at?: string | null;
  authority?: "self-declared" | "observed" | "inferred";
  capture_id?: string;
};

export type UpdateEntityInput = {
  id: string;
  changes: {
    title?: string;
    body?: string | null;
    attrs?: Record<string, unknown>;
    status?: "active" | "archived" | "invalidated";
    expires_at?: string | null;
    scope?: string;
  };
};

export type ConfirmEntityInput = {
  id: string;
  decision: "still-true" | "no-longer-true" | "modify";
  modify?: {
    title?: string;
    body?: string;
    attrs?: Record<string, unknown>;
  };
  note?: string;
};

export type ListActiveInput = {
  type: EntityType;
  scope?: string;
  limit?: number;
};

export type LinkEntitiesInput = {
  src_id: string;
  dst_id: string;
  relation: string;
  weight?: number;
  authority?: "self-declared" | "observed" | "inferred";
  capture_id?: string;
};

export type GetNeighborsInput = {
  entity_id: string;
  relation?: string;
  direction?: "out" | "in" | "both";
  types?: EntityType[];
  limit?: number;
};

export type InvalidateLinkInput = {
  link_id: string;
  note?: string;
};

// ── Output shapes ─────────────────────────────────────────────────────────────

export type SelfSummary = {
  self: Entity | null;
  active_roles: Entity[];
  active_goals: Entity[];
  active_constraints: Entity[];
  recent_state: Entity | null;
  top_people: Entity[];
  active_stances: Entity[];
  active_preferences: Entity[];
  resources_summary: { count: number; sample: Entity[] };
  knowledge_summary: { count: number; sample: Entity[] };
  places_summary: { count: number; sample: Entity[] };
  key_links: KeyLink[];
  last_updated: string | null;
};

export type RelevantContextResult = {
  items: Entity[];
  total_matched: number;
  retrieval_strategy: "fts5+type-filter";
};

export type RecordObservationResult = {
  id: string;
  type: EntityType;
  status: "created";
  authority: string;
  expires_at: string | null;
  applied_default_ttl: boolean;
};

export type UpdateEntityResult = {
  id: string;
  previous: Entity;
  current: Entity;
};

export type ConfirmEntityResult = {
  id: string;
  outcome: "extended" | "invalidated" | "modified";
  new_expires_at: string | null;
};

export type ListActiveResult = {
  type: EntityType;
  count: number;
  items: Entity[];
};

export type LinkEntitiesResult = Link;

export type GetNeighborsResult = {
  center: Entity;
  neighbors: Array<{ entity: Entity; link: Link; role: "out" | "in" }>;
};

export type InvalidateLinkResult = {
  id: string;
  invalidated_at: string;
};

// ── Error helpers ──────────────────────────────────────────────────────────────

export class HandlerError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = "HandlerError";
  }
}

function rethrow(e: unknown): never {
  if (e instanceof StoreError)
    throw new HandlerError(e.message, e.code);
  throw e;
}

// ── Handlers ───────────────────────────────────────────────────────────────────

/**
 * get_self_summary — aggregates identity + active context across types.
 * Cheap, idempotent, designed to be called at start of any conversation.
 */
export async function getSelfSummary(
  store: Store,
  _input: GetSelfSummaryInput,
  opts?: {
    sampleSize?: number;
    topPeopleLimit?: number;
    keyLinksLimit?: number;
    includeKeyLinks?: boolean;
  },
): Promise<SelfSummary> {
  const sampleSize = opts?.sampleSize ?? 3;
  const topPeopleLimit = opts?.topPeopleLimit ?? 5;
  const keyLinksLimit = opts?.keyLinksLimit ?? 10;
  const includeKeyLinks = opts?.includeKeyLinks ?? true;

  const [
    self,
    active_roles,
    active_goals,
    active_constraints,
    states,
    top_people,
    active_stances,
    active_preferences,
    resources,
    knowledge,
    places,
  ] = await Promise.all([
    store.getCurrentSelf(),
    store.listActive("role"),
    store.listActive("goal"),
    store.listActive("constraint"),
    store.listActive("state", { limit: 1 }),
    store.listActive("person", { limit: topPeopleLimit }),
    store.listActive("stance"),
    store.listActive("preference"),
    store.listActive("resource"),
    store.listActive("knowledge"),
    store.listActive("place"),
  ]);
  const recent_state = states[0] ?? null;

  const key_links = includeKeyLinks
    ? await computeKeyLinks(store, {
        self,
        active_goals,
        top_people,
        active_constraints,
        limit: keyLinksLimit,
      })
    : [];

  const lastUpdatedCandidates = [
    self?.updated_at,
    ...active_roles.map((r) => r.updated_at),
    ...active_goals.map((g) => g.updated_at),
    recent_state?.updated_at,
  ].filter((s): s is string => typeof s === "string");

  const last_updated =
    lastUpdatedCandidates.length === 0
      ? null
      : lastUpdatedCandidates.sort().at(-1) ?? null;

  return {
    self,
    active_roles,
    active_goals,
    active_constraints,
    recent_state,
    top_people,
    active_stances,
    active_preferences,
    resources_summary: { count: resources.length, sample: resources.slice(0, sampleSize) },
    knowledge_summary: { count: knowledge.length, sample: knowledge.slice(0, sampleSize) },
    places_summary: { count: places.length, sample: places.slice(0, sampleSize) },
    key_links,
    last_updated,
  };
}

/**
 * Compute the `key_links` slot for get_self_summary (plan-linking.md §4 Step 2.2).
 *
 * Collects links touching identity-anchor entities (self, active goals, top
 * people, active constraints), deduplicates by link id, drops `related-to` /
 * other `lowInformation` relations when at least 5 higher-signal links exist,
 * ranks by weight DESC then created_at DESC, caps at `limit`, and projects
 * src+dst to {id, type, title} so the payload stays small.
 */
async function computeKeyLinks(
  store: Store,
  args: {
    self: Entity | null;
    active_goals: Entity[];
    top_people: Entity[];
    active_constraints: Entity[];
    limit: number;
  },
): Promise<KeyLink[]> {
  const anchorIds: string[] = [];
  if (args.self) anchorIds.push(args.self.id);
  for (const g of args.active_goals) anchorIds.push(g.id);
  for (const p of args.top_people) anchorIds.push(p.id);
  for (const c of args.active_constraints) anchorIds.push(c.id);
  if (anchorIds.length === 0) return [];

  const linkBatches = await Promise.all(
    anchorIds.map((id) => store.listLinks({ entityId: id, limit: 200 })),
  );
  const seen = new Map<string, Link>();
  for (const batch of linkBatches) {
    for (const link of batch) {
      if (!seen.has(link.id)) seen.set(link.id, link);
    }
  }
  if (seen.size === 0) return [];

  const all = [...seen.values()];
  const highSignal = all.filter((l) => !getRelationSpec(l.relation)?.lowInformation);
  const lowSignal = all.filter((l) => getRelationSpec(l.relation)?.lowInformation);
  const pool = highSignal.length > 5 ? highSignal : [...highSignal, ...lowSignal];

  pool.sort((a, b) => {
    if (b.weight !== a.weight) return b.weight - a.weight;
    return b.created_at.localeCompare(a.created_at);
  });

  const top = pool.slice(0, args.limit);

  // Hydrate endpoint titles. Cache reads — same entity may appear on both
  // sides of multiple links.
  const entityCache = new Map<string, Entity | null>();
  const getCached = async (id: string): Promise<Entity | null> => {
    if (!entityCache.has(id)) entityCache.set(id, await store.getEntity(id));
    return entityCache.get(id) ?? null;
  };

  const hydrated: KeyLink[] = [];
  for (const link of top) {
    const src = await getCached(link.src_id);
    const dst = await getCached(link.dst_id);
    if (!src || !dst) continue; // dangling — skip rather than 500
    hydrated.push({
      link,
      src: { id: src.id, type: src.type, title: src.title },
      dst: { id: dst.id, type: dst.type, title: dst.title },
    });
  }
  return hydrated;
}

/**
 * get_relevant_context — FTS5 search with optional type filter.
 */
export async function getRelevantContext(
  store: Store,
  input: GetRelevantContextInput,
): Promise<RelevantContextResult> {
  const max_items = input.max_items ?? 10;
  const items = await store.searchFts(input.query, {
    types: input.types,
    limit: max_items,
  });
  return {
    items,
    total_matched: items.length,
    retrieval_strategy: "fts5+type-filter",
  };
}

/**
 * record_observation — single-entity insert with default TTL + zod attrs check.
 *
 * Mapping: `text` becomes title (truncated to 200 chars) + body. `type` defaults
 * to "event" when missing (per PRD §7.3).
 */
export async function recordObservation(
  store: Store,
  input: RecordObservationInput,
  actor: string,
): Promise<RecordObservationResult> {
  if (!input.text || input.text.trim().length === 0) {
    throw new HandlerError("text is required and must be non-empty", "BAD_INPUT");
  }

  // Validate capture_id up front so we don't create an orphaned entity if the
  // join would fail. INVALID_CAPTURE is distinct from NOT_FOUND on entity ids
  // because it lets the skill differentiate "user typo on a capture id" from
  // "stale entity reference" in its error path.
  if (input.capture_id !== undefined && !(await store.getCapture(input.capture_id))) {
    throw new HandlerError(
      `capture_id not found: ${input.capture_id}`,
      "INVALID_CAPTURE",
    );
  }

  const type: EntityType = input.type ?? "event";
  const { title, body } = splitTitleBody(input.text, input.title);

  try {
    const e = await store.createEntity(
      {
        type,
        title,
        body,
        attrs: input.attrs ?? {},
        scope: input.scope ?? "general",
        authority: input.authority ?? "observed",
        source_ref: input.source,
        expires_at: input.expires_at,
      },
      actor,
    );
    if (input.capture_id !== undefined) {
      await store.linkCaptureToEntity(input.capture_id, e.id);
    }
    return {
      id: e.id,
      type: e.type,
      status: "created",
      authority: e.authority,
      expires_at: e.expires_at,
      applied_default_ttl: input.expires_at === undefined && e.expires_at !== null,
    };
  } catch (e) {
    rethrow(e);
  }
}

/**
 * update_entity — partial update + event log.
 */
export async function updateEntity(
  store: Store,
  input: UpdateEntityInput,
  actor: string,
): Promise<UpdateEntityResult> {
  try {
    const { previous, current } = await store.updateEntity(
      input.id,
      input.changes,
      actor,
    );
    return { id: input.id, previous, current };
  } catch (e) {
    rethrow(e);
  }
}

/**
 * confirm_entity — still-true / no-longer-true / modify.
 */
export async function confirmEntity(
  store: Store,
  input: ConfirmEntityInput,
  actor: string,
): Promise<ConfirmEntityResult> {
  try {
    const { outcome, entity } = await store.confirmEntity(
      input.id,
      input.decision,
      actor,
      { modify: input.modify, note: input.note },
    );
    return {
      id: entity.id,
      outcome,
      new_expires_at: entity.expires_at,
    };
  } catch (e) {
    rethrow(e);
  }
}

/**
 * list_active — all active+unexpired entities of a given type.
 */
export async function listActive(
  store: Store,
  input: ListActiveInput,
): Promise<ListActiveResult> {
  if (!ENTITY_TYPES.includes(input.type)) {
    throw new HandlerError(`Unknown entity type: ${input.type}`, "BAD_TYPE");
  }
  const items = await store.listActive(input.type, {
    scope: input.scope,
    limit: input.limit,
  });
  return { type: input.type, count: items.length, items };
}

/**
 * link_entities — create a typed link between two entities.
 *
 * Phase 2 validation (plan-linking.md §4 Step 2.1):
 *   • both entities exist + active
 *   • relation present in canonical registry → UNKNOWN_RELATION
 *   • (src.type, dst.type) allowed by relation spec → BAD_PAIR
 *   • acyclic relations refuse cycles → WOULD_CYCLE
 */
export async function linkEntities(
  store: Store,
  input: LinkEntitiesInput,
  actor: string,
): Promise<LinkEntitiesResult> {
  if (input.src_id === input.dst_id) {
    throw new HandlerError(
      "src_id and dst_id must be different",
      "BAD_INPUT",
    );
  }

  if (input.capture_id !== undefined && !(await store.getCapture(input.capture_id))) {
    throw new HandlerError(
      `capture_id not found: ${input.capture_id}`,
      "INVALID_CAPTURE",
    );
  }

  const spec = getRelationSpec(input.relation);
  if (!spec) {
    throw new HandlerError(
      `Unknown relation '${input.relation}'. Use the canonical vocabulary (see RELATIONS registry).`,
      "UNKNOWN_RELATION",
    );
  }

  const src = await store.getEntity(input.src_id);
  if (!src) throw new HandlerError(`Source entity not found: ${input.src_id}`, "NOT_FOUND");
  if (src.status !== "active")
    throw new HandlerError(
      `Source entity is not active: ${input.src_id} (status=${src.status})`,
      "INACTIVE_ENTITY",
    );

  const dst = await store.getEntity(input.dst_id);
  if (!dst) throw new HandlerError(`Destination entity not found: ${input.dst_id}`, "NOT_FOUND");
  if (dst.status !== "active")
    throw new HandlerError(
      `Destination entity is not active: ${input.dst_id} (status=${dst.status})`,
      "INACTIVE_ENTITY",
    );

  const pair = validateLinkPair(input.relation, src.type, dst.type);
  if (!pair.ok) {
    throw new HandlerError(pair.reason, "BAD_PAIR");
  }

  if (
    spec.acyclic &&
    (await isCyclic(store, input.src_id, input.dst_id, input.relation))
  ) {
    throw new HandlerError(
      `Creating ${input.relation} ${input.src_id} → ${input.dst_id} would introduce a cycle.`,
      "WOULD_CYCLE",
    );
  }

  try {
    const link = await store.createLink(
      {
        src_id: input.src_id,
        dst_id: input.dst_id,
        relation: input.relation,
        weight: input.weight,
        authority: input.authority,
      },
      actor,
    );
    if (input.capture_id !== undefined) {
      await store.linkCaptureToLink(input.capture_id, link.id);
    }
    return link;
  } catch (e) {
    rethrow(e);
  }
}

/**
 * get_neighbors — directly-linked entities for a given id, with link metadata.
 */
export async function getNeighbors(
  store: Store,
  input: GetNeighborsInput,
): Promise<GetNeighborsResult> {
  const center = await store.getEntity(input.entity_id);
  if (!center)
    throw new HandlerError(`Entity not found: ${input.entity_id}`, "NOT_FOUND");

  const neighbors = await store.getNeighbors(input.entity_id, {
    relation: input.relation,
    direction: input.direction,
    types: input.types,
    limit: input.limit,
  });
  return { center, neighbors };
}

/**
 * invalidate_link — mark a link as no-longer-true (append-only).
 */
export async function invalidateLink(
  store: Store,
  input: InvalidateLinkInput,
  actor: string,
): Promise<InvalidateLinkResult> {
  try {
    const link = await store.invalidateLink(input.link_id, actor, input.note);
    return {
      id: link.id,
      invalidated_at: link.invalidated_at!,
    };
  } catch (e) {
    rethrow(e);
  }
}

// ── Captures ──────────────────────────────────────────────────────────────────

export type RecordCaptureInputT = {
  raw_text: string;
  source?: string;
  session_id?: string | null;
  scope?: string;
  raw_lang?: string | null;
  meta?: Record<string, unknown>;
};

export type RecordCaptureResult = {
  capture_id: string;
  occurred_at: string;
};

export type UpdateCaptureStatusInput = {
  capture_id: string;
  status: "processed" | "aborted";
  classification_summary?: ClassificationSummary;
};

export type UpdateCaptureStatusResult = {
  capture_id: string;
  status: CaptureStatus;
  processed_at: string;
};

export type ListCapturesInput = {
  since?: string;
  until?: string;
  status?: CaptureStatus;
  source?: string;
  fts?: string;
  limit?: number;
};

export type ListCapturesResult = {
  count: number;
  items: Capture[];
};

/**
 * record_capture — persist the user's verbatim input. See plan-captures.md §4.3.
 */
export async function recordCapture(
  store: Store,
  input: RecordCaptureInputT,
  actor: string,
): Promise<RecordCaptureResult> {
  if (!input.raw_text || input.raw_text.length === 0) {
    throw new HandlerError("raw_text is required and must be non-empty", "BAD_INPUT");
  }
  try {
    const cap = await store.recordCapture(
      {
        raw_text: input.raw_text,
        source: input.source,
        session_id: input.session_id ?? null,
        scope: input.scope,
        raw_lang: input.raw_lang ?? null,
        meta: input.meta ?? null,
      },
      actor,
    );
    return { capture_id: cap.id, occurred_at: cap.occurred_at };
  } catch (e) {
    rethrow(e);
  }
}

/**
 * update_capture_status — close a pending capture as processed or aborted.
 */
export async function updateCaptureStatus(
  store: Store,
  input: UpdateCaptureStatusInput,
  actor: string,
): Promise<UpdateCaptureStatusResult> {
  if (input.status !== "processed" && input.status !== "aborted") {
    throw new HandlerError(
      `status must be 'processed' or 'aborted', got '${input.status}'`,
      "BAD_INPUT",
    );
  }
  try {
    const cap = await store.updateCaptureStatus(
      input.capture_id,
      input.status,
      actor,
      input.classification_summary,
    );
    return {
      capture_id: cap.id,
      status: cap.status,
      processed_at: cap.processed_at!,
    };
  } catch (e) {
    rethrow(e);
  }
}

/**
 * list_captures — chronological journal read. Newest first.
 */
export async function listCaptures(
  store: Store,
  input: ListCapturesInput,
): Promise<ListCapturesResult> {
  try {
    const items = await store.listCaptures({
      since: input.since,
      until: input.until,
      status: input.status,
      source: input.source,
      fts: input.fts,
      limit: input.limit,
    });
    return { count: items.length, items };
  } catch (e) {
    rethrow(e);
  }
}

// ── Internal ──────────────────────────────────────────────────────────────────

const MAX_TITLE = 200;

function splitTitleBody(
  text: string,
  explicitTitle?: string,
): { title: string; body: string | undefined } {
  if (explicitTitle && explicitTitle.length > 0) {
    return { title: explicitTitle.slice(0, MAX_TITLE), body: text };
  }
  const trimmed = text.trim();
  // First line as title; remainder as body. Trim title to MAX_TITLE.
  const newlineIdx = trimmed.indexOf("\n");
  if (newlineIdx === -1 && trimmed.length <= MAX_TITLE) {
    return { title: trimmed, body: undefined };
  }
  if (newlineIdx === -1) {
    return { title: trimmed.slice(0, MAX_TITLE), body: trimmed };
  }
  const firstLine = trimmed.slice(0, newlineIdx).trim();
  const rest = trimmed.slice(newlineIdx + 1).trim();
  return {
    title: firstLine.slice(0, MAX_TITLE),
    body: rest.length > 0 ? rest : undefined,
  };
}
