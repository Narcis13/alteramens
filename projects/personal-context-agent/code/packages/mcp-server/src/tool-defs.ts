// Tool definitions — SDK-facing registry. Pair each handler with:
//   • a prescriptive description (PRD §11.4 — tells the LLM exactly when to call)
//   • a zod raw shape for input validation
//
// Each entry stays small so changes are local.
import { z } from "zod";
import { ENTITY_TYPES } from "@pca/core";

export const ENTITY_TYPE_ENUM = z.enum(ENTITY_TYPES);

const AUTHORITY = z.enum(["self-declared", "observed", "inferred"]);
const STATUS = z.enum(["active", "archived", "invalidated"]);
const DECISION = z.enum(["still-true", "no-longer-true", "modify"]);

// Each tool's "input shape" — a plain Record<string, ZodType> consumed by
// McpServer.registerTool's `inputSchema`. Exported so tests can re-validate.

export const getSelfSummaryShape = {
  scope: z
    .string()
    .optional()
    .describe("Optional scope filter, e.g. 'general' (default) or 'project:X'."),
};

export const getRelevantContextShape = {
  query: z.string().min(1).describe("Free-text query matched against title+body via FTS5."),
  max_items: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Max items to return (default 10)."),
  types: z
    .array(ENTITY_TYPE_ENUM)
    .optional()
    .describe("Restrict to these entity types."),
  scope: z.string().optional(),
};

export const recordObservationShape = {
  text: z.string().min(1).describe("Raw observation text. First line becomes title."),
  type: ENTITY_TYPE_ENUM.optional().describe(
    "Entity type. Defaults to 'event' if omitted.",
  ),
  title: z
    .string()
    .optional()
    .describe("Optional explicit title; otherwise derived from text."),
  attrs: z
    .record(z.string(), z.unknown())
    .optional()
    .describe("Type-specific attrs (see schema per type)."),
  source: z
    .string()
    .optional()
    .describe("Free-form provenance, e.g. 'claude-code:ctx-add'."),
  scope: z.string().optional().describe("Scope (default 'general')."),
  expires_at: z
    .union([z.string(), z.null()])
    .optional()
    .describe("ISO 8601 timestamp, or null to override default TTL."),
  authority: AUTHORITY.optional(),
  capture_id: z
    .string()
    .min(1)
    .optional()
    .describe(
      "Optional capture_id returned by record_capture. When present, the new entity is joined to that capture in capture_entities so provenance is traceable back to the user's verbatim input.",
    ),
};

export const updateEntityShape = {
  id: z.string().min(1),
  changes: z.object({
    title: z.string().optional(),
    body: z.union([z.string(), z.null()]).optional(),
    attrs: z.record(z.string(), z.unknown()).optional(),
    status: STATUS.optional(),
    expires_at: z.union([z.string(), z.null()]).optional(),
    scope: z.string().optional(),
  }),
};

export const confirmEntityShape = {
  id: z.string().min(1),
  decision: DECISION,
  modify: z
    .object({
      title: z.string().optional(),
      body: z.string().optional(),
      attrs: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
  note: z.string().optional(),
};

export const listActiveShape = {
  type: ENTITY_TYPE_ENUM,
  scope: z.string().optional(),
  limit: z.number().int().positive().optional(),
};

const DIRECTION = z.enum(["out", "in", "both"]);

export const linkEntitiesShape = {
  src_id: z.string().min(1).describe("Source entity id."),
  dst_id: z.string().min(1).describe("Destination entity id."),
  relation: z
    .string()
    .min(1)
    .describe(
      "Relation type. Canonical vocab: subgoal-of, motivated-by, collaborates-with, subject-of, located-at, caused-by, reinforces, competes-with, addresses, requires, related-to. Phase 1 logs a warning for unknown relations; Phase 2 will reject them.",
    ),
  weight: z
    .number()
    .positive()
    .optional()
    .describe("Strength of the link (default 1.0)."),
  authority: AUTHORITY.optional().describe(
    "Provenance. Default 'observed'. Use 'self-declared' only when the user stated the link explicitly; 'inferred' when deduced from side-context.",
  ),
  capture_id: z
    .string()
    .min(1)
    .optional()
    .describe(
      "Optional capture_id returned by record_capture. When present, the new link is joined to that capture in capture_links for provenance.",
    ),
};

export const getNeighborsShape = {
  entity_id: z.string().min(1).describe("Center entity id."),
  relation: z
    .string()
    .optional()
    .describe("Optional: restrict to this relation type."),
  direction: DIRECTION.optional().describe(
    "out = outgoing links, in = incoming, both = either side (default).",
  ),
  types: z
    .array(ENTITY_TYPE_ENUM)
    .optional()
    .describe("Restrict neighbor entities to these types."),
  limit: z.number().int().positive().optional().describe("Max results (default 50)."),
};

export const invalidateLinkShape = {
  link_id: z.string().min(1).describe("Link id to invalidate."),
  note: z
    .string()
    .optional()
    .describe("Optional human-readable reason; stored in the link-invalidate event."),
};

// ── Captures (raw memory stream) ─────────────────────────────────────────────

const CAPTURE_STATUS = z.enum(["pending", "processed", "aborted", "reprocess"]);
const CAPTURE_TERMINAL = z.enum(["processed", "aborted"]);

export const recordCaptureShape = {
  raw_text: z
    .string()
    .min(1)
    .describe(
      "VERBATIM user input. Pass exactly what the user typed — no rewriting, summarizing, or translation. This is the literal source of truth before classification.",
    ),
  source: z
    .string()
    .optional()
    .describe(
      "Free-form provenance string, e.g. 'claude-code:ctx-add' (default), 'claude-code:ctx-mirror', or 'importer:obsidian'.",
    ),
  session_id: z
    .union([z.string(), z.null()])
    .optional()
    .describe("Optional conversation/session id when the surface exposes one."),
  scope: z.string().optional().describe("Scope (default 'general')."),
  raw_lang: z
    .union([z.string(), z.null()])
    .optional()
    .describe("Optional language hint: 'ro' | 'en' | 'mixed' | other."),
  meta: z
    .record(z.string(), z.unknown())
    .optional()
    .describe("Optional freeform metadata JSON (cwd, client version, etc)."),
};

export const updateCaptureStatusShape = {
  capture_id: z.string().min(1).describe("Capture id returned by record_capture."),
  status: CAPTURE_TERMINAL.describe(
    "'processed' (entities/links saved) or 'aborted' (user declined or pipeline gave up).",
  ),
  classification_summary: z
    .record(z.string(), z.unknown())
    .optional()
    .describe(
      "Optional JSON summary: types_proposed, types_saved, entity_ids, link_ids, entity_count, link_count, aborted_reason, skipped_links.",
    ),
};

export const listCapturesShape = {
  since: z
    .string()
    .optional()
    .describe("Inclusive ISO 8601 lower bound on occurred_at."),
  until: z
    .string()
    .optional()
    .describe("Inclusive ISO 8601 upper bound on occurred_at."),
  status: CAPTURE_STATUS.optional().describe(
    "Filter by status (pending|processed|aborted|reprocess).",
  ),
  source: z.string().optional().describe("Filter by source string."),
  fts: z
    .string()
    .optional()
    .describe("FTS5 query over raw_text (e.g. 'razvan' or 'turso OR sync')."),
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .describe("Max captures to return (default 50, capped at 500)."),
};

// Prescriptive descriptions: PRD §11.4 mandates these be opinionated so the
// LLM knows *when* to call each tool, not only *what* it does.

export const TOOL_DESCRIPTIONS = {
  get_self_summary: `Returns a structured summary of the user's identity, active roles, goals, constraints, recent state, top people, active stances and preferences, plus summaries of resources/knowledge/places.

IMPORTANT: Call this at the start of any conversation where you need to give the user personalized advice, recommendations, planning suggestions, or opinionated content about their work, schedule, or decisions. Cheap (~10ms), idempotent, safe to call once per session. The returned context replaces generic assumptions with grounded facts about the user.`,

  get_relevant_context: `Searches the user's personal context store via full-text search over title and body, with an optional filter by entity type. Use when you need specific entities that match a query — for example "what does the user know about kubernetes?" or "find goals related to MRR". Returns ranked Entity records (id, type, title, body, attrs, scope, expires_at). Excludes invalidated and expired entities.`,

  record_observation: `Persists a new observation about the user into the context store. Accepts free-text plus an optional explicit entity type and type-specific attrs. Defaults: type='event' if omitted, authority='observed'. Use when you have learned something new about the user during conversation that would be useful in future sessions — preferences, constraints, goals, people, places, etc. Returns the new entity's id.`,

  update_entity: `Updates an existing entity by id. Accepts partial changes to title/body/attrs/status/scope/expires_at. Use to correct a fact, refine a goal, archive a constraint that no longer applies, or change scope. The previous and current snapshots are returned for diffing.`,

  confirm_entity: `Confirms whether a possibly-stale entity is still true. Decisions: 'still-true' extends the TTL; 'no-longer-true' invalidates; 'modify' updates fields and extends TTL. Use when an entity's expiry is near or has passed and you want to refresh the user's record without re-creating it.`,

  list_active: `Returns all active+unexpired entities of a given type for the user. Cheaper and more targeted than get_self_summary when you only need one dimension (e.g., all current goals or all active constraints). Ordered by recency, except 'person' which is ordered by importance.`,

  link_entities: `Creates a typed link between two entities. Use to make explicit a relationship the user stated (or that you inferred with high confidence) — for example "goal X is a subgoal of Y", "person A collaborates on goal B", "stance C reinforces self". Always prefer over hiding relations in entity body text. Both entities must already exist and be active. Returns the new link id.`,

  get_neighbors: `Returns entities directly linked to a given entity, with the link metadata. Use when answering "who is involved in X?", "what does goal Y require?", "what reinforces stance Z?". Cheaper than FTS for known-id traversal. Output includes the role ("out" if the center is the src, "in" if it is the dst).`,

  invalidate_link: `Marks a link as no-longer-true. Use when a relationship explicitly ended ("Mihai is no longer collaborating on X"). Append-only: the row stays, only invalidated_at is set, and a 'link-invalidate' event is logged.`,

  record_capture: `Persists the user's raw, verbatim input into the capture stream before any classification. Call this at the START of /ctx-add (and any future memory-writing skill) with the user's literal text. The returned capture_id should then be passed to record_observation / link_entities so downstream entities and links are traceable back to the original input. Captures persist even if the user later aborts — abandoned considerations are signal. Cheap, idempotent, and required for input fidelity.`,

  update_capture_status: `Transitions a capture from 'pending' to a terminal status ('processed' if entities/links were saved, 'aborted' if the user declined or the pipeline gave up). Attach an optional classification_summary describing what the capture produced (types_proposed, types_saved, entity_ids, link_ids, etc.). Must be called once per capture at the end of the /ctx-add pipeline; pending captures older than 1h likely indicate a crashed flow.`,

  list_captures: `Returns captures from the raw memory stream, newest first. Filter by since/until (ISO 8601), status, source, or FTS5 query over raw_text. Use when the user asks "what did I capture this week?", "did I save anything about X?", or when you need the user's literal phrasing rather than the post-classification entity text. Pairs with the ctx log CLI surface.`,
} as const;
