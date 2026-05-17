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
} as const;
