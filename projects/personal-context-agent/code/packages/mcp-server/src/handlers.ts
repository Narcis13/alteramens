// Pure tool handler functions. Take (store, input), return structured output.
// Kept SDK-free so tests can call them directly without spinning up stdio.
//
// Source-of-truth for behavior: PRD §7 (MCP Layer 1 — 6 tools).
import {
  ENTITY_TYPES,
  StoreError,
  type Entity,
  type EntityType,
  type Store,
} from "@pca/core";

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
export function getSelfSummary(
  store: Store,
  _input: GetSelfSummaryInput,
  opts?: { sampleSize?: number; topPeopleLimit?: number },
): SelfSummary {
  const sampleSize = opts?.sampleSize ?? 3;
  const topPeopleLimit = opts?.topPeopleLimit ?? 5;

  const self = store.getCurrentSelf();
  const active_roles = store.listActive("role");
  const active_goals = store.listActive("goal");
  const active_constraints = store.listActive("constraint");
  const states = store.listActive("state", { limit: 1 });
  const recent_state = states[0] ?? null;
  const top_people = store.listActive("person", { limit: topPeopleLimit });
  const active_stances = store.listActive("stance");
  const active_preferences = store.listActive("preference");

  const resources = store.listActive("resource");
  const knowledge = store.listActive("knowledge");
  const places = store.listActive("place");

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
    last_updated,
  };
}

/**
 * get_relevant_context — FTS5 search with optional type filter.
 */
export function getRelevantContext(
  store: Store,
  input: GetRelevantContextInput,
): RelevantContextResult {
  const max_items = input.max_items ?? 10;
  const items = store.searchFts(input.query, {
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
export function recordObservation(
  store: Store,
  input: RecordObservationInput,
  actor: string,
): RecordObservationResult {
  if (!input.text || input.text.trim().length === 0) {
    throw new HandlerError("text is required and must be non-empty", "BAD_INPUT");
  }

  const type: EntityType = input.type ?? "event";
  const { title, body } = splitTitleBody(input.text, input.title);

  try {
    const e = store.createEntity(
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
export function updateEntity(
  store: Store,
  input: UpdateEntityInput,
  actor: string,
): UpdateEntityResult {
  try {
    const { previous, current } = store.updateEntity(input.id, input.changes, actor);
    return { id: input.id, previous, current };
  } catch (e) {
    rethrow(e);
  }
}

/**
 * confirm_entity — still-true / no-longer-true / modify.
 */
export function confirmEntity(
  store: Store,
  input: ConfirmEntityInput,
  actor: string,
): ConfirmEntityResult {
  try {
    const { outcome, entity } = store.confirmEntity(
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
export function listActive(
  store: Store,
  input: ListActiveInput,
): ListActiveResult {
  if (!ENTITY_TYPES.includes(input.type)) {
    throw new HandlerError(`Unknown entity type: ${input.type}`, "BAD_TYPE");
  }
  const items = store.listActive(input.type, {
    scope: input.scope,
    limit: input.limit,
  });
  return { type: input.type, count: items.length, items };
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
