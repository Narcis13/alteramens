// Canonical relations registry — plan-linking.md §2 D1 + §4 Step 2.1.
//
// Phase 2 hardens what Phase 1 only warned about: link_entities now rejects
// unknown relations, disallowed (srcType, dstType) pairs, and would-be cycles
// for acyclic relations. Skill SKILL.md must use exactly these names.

import type { Store } from "../store.ts";
import type { EntityType } from "../types.ts";

export type RelationPairToken = EntityType | "*";

export type RelationName =
  | "subgoal-of"
  | "motivated-by"
  | "collaborates-with"
  | "subject-of"
  | "located-at"
  | "caused-by"
  | "reinforces"
  | "competes-with"
  | "addresses"
  | "counters"
  | "requires"
  | "related-to";

export type RelationSpec = {
  name: RelationName;
  acyclic: boolean;
  symmetric: boolean;
  // Empty array = no pairs allowed (sanity bomb).
  // A pair containing "*" on either side matches any entity type on that side.
  allowedPairs: Array<[RelationPairToken, RelationPairToken]>;
  description: string;
  // True for `related-to` only — query-side ranking deprioritizes it and
  // get_self_summary may filter it out when the result set is large.
  lowInformation?: boolean;
};

export const RELATIONS: Record<RelationName, RelationSpec> = {
  "subgoal-of": {
    name: "subgoal-of",
    acyclic: true,
    symmetric: false,
    allowedPairs: [["goal", "goal"]],
    description: "A is part of B (A advances achievement of B).",
  },
  "motivated-by": {
    name: "motivated-by",
    acyclic: false,
    symmetric: false,
    allowedPairs: [
      ["goal", "stance"],
      ["goal", "constraint"],
      ["goal", "knowledge"],
      ["event", "stance"],
      ["event", "constraint"],
      ["event", "knowledge"],
      ["state", "stance"],
      ["state", "constraint"],
      ["state", "knowledge"],
      ["role", "stance"],
      ["role", "constraint"],
      ["role", "knowledge"],
    ],
    description: "A exists because of B (B explains why A happens).",
  },
  "collaborates-with": {
    name: "collaborates-with",
    acyclic: false,
    symmetric: true,
    allowedPairs: [
      ["person", "person"],
      ["self", "person"],
      ["person", "goal"],
      ["self", "goal"],
    ],
    description: "A and B work together (symmetric — stored one direction).",
  },
  "subject-of": {
    name: "subject-of",
    acyclic: false,
    symmetric: false,
    allowedPairs: [
      ["person", "event"],
      ["person", "goal"],
    ],
    description: "A is who/what B is about.",
  },
  "located-at": {
    name: "located-at",
    acyclic: false,
    symmetric: false,
    allowedPairs: [
      ["event", "place"],
      ["role", "place"],
      ["state", "place"],
    ],
    description: "A happens / lives at place B.",
  },
  "caused-by": {
    name: "caused-by",
    acyclic: false,
    symmetric: false,
    allowedPairs: [
      ["state", "event"],
      ["state", "role"],
      ["state", "place"],
      ["state", "person"],
      ["event", "event"],
      ["event", "role"],
      ["event", "place"],
      ["event", "person"],
    ],
    description: "A arises from B.",
  },
  reinforces: {
    name: "reinforces",
    acyclic: false,
    symmetric: false,
    allowedPairs: [
      ["stance", "stance"],
      ["stance", "self"],
      ["preference", "stance"],
      ["preference", "self"],
      ["role", "stance"],
      ["role", "self"],
    ],
    description: "A strengthens B.",
  },
  "competes-with": {
    name: "competes-with",
    acyclic: false,
    symmetric: true,
    allowedPairs: [
      ["goal", "goal"],
      ["stance", "stance"],
      ["role", "role"],
      ["goal", "stance"],
      ["goal", "role"],
      ["stance", "role"],
    ],
    description: "Tension between A and B (symmetric — stored one direction).",
  },
  addresses: {
    name: "addresses",
    acyclic: false,
    symmetric: false,
    allowedPairs: [
      ["goal", "constraint"],
      ["goal", "knowledge"],
      ["goal", "event"],
      ["role", "constraint"],
      ["role", "knowledge"],
      ["role", "event"],
    ],
    description: "A tries to resolve / engage with B.",
  },
  counters: {
    name: "counters",
    acyclic: false,
    symmetric: false,
    allowedPairs: [
      ["stance", "constraint"],
      ["preference", "constraint"],
    ],
    description:
      "A is a counter-force against B (held opposition, not a problem-solving process — for that use 'addresses').",
  },
  requires: {
    name: "requires",
    acyclic: false,
    symmetric: false,
    allowedPairs: [
      ["goal", "resource"],
      ["goal", "knowledge"],
      ["goal", "person"],
      ["goal", "place"],
      ["role", "resource"],
      ["role", "knowledge"],
      ["role", "person"],
      ["role", "place"],
    ],
    description: "A depends on B to be possible.",
  },
  "related-to": {
    name: "related-to",
    acyclic: false,
    symmetric: true,
    allowedPairs: [["*", "*"]],
    description:
      "Fallback when no canonical relation fits. Query-side ranking deprioritizes this.",
    lowInformation: true,
  },
};

export function isKnownRelation(name: string): name is RelationName {
  return Object.prototype.hasOwnProperty.call(RELATIONS, name);
}

export function getRelationSpec(name: string): RelationSpec | null {
  return isKnownRelation(name) ? RELATIONS[name] : null;
}

export type ValidatePairResult =
  | { ok: true }
  | { ok: false; reason: string };

export function validateLinkPair(
  relation: string,
  srcType: EntityType,
  dstType: EntityType,
): ValidatePairResult {
  const spec = getRelationSpec(relation);
  if (!spec) {
    return { ok: false, reason: `Unknown relation '${relation}'` };
  }
  const matches = spec.allowedPairs.some(
    ([s, d]) =>
      (s === "*" || s === srcType) && (d === "*" || d === dstType),
  );
  if (matches) return { ok: true };

  // For symmetric relations, accept the reversed pair too — caller may have
  // chosen either direction; storage normalizes elsewhere if desired.
  if (spec.symmetric) {
    const reversed = spec.allowedPairs.some(
      ([s, d]) =>
        (s === "*" || s === dstType) && (d === "*" || d === srcType),
    );
    if (reversed) return { ok: true };
  }

  const pairs = spec.allowedPairs
    .map(([s, d]) => `(${s}, ${d})`)
    .join(", ");
  return {
    ok: false,
    reason: `Relation '${relation}' does not allow pair (${srcType}, ${dstType}). Allowed: ${pairs}`,
  };
}

// BFS over outgoing same-relation edges, capped at depth 10.
//
// Question we answer: "if we add src → dst with `relation` (acyclic), would
// that introduce a cycle?" That's true iff dst can already reach src by
// walking the same relation outward.
const CYCLE_MAX_DEPTH = 10;

export async function isCyclic(
  store: Store,
  srcId: string,
  dstId: string,
  relation: string,
): Promise<boolean> {
  const spec = getRelationSpec(relation);
  if (!spec || !spec.acyclic) return false;
  if (srcId === dstId) return true;

  const seen = new Set<string>([dstId]);
  let frontier: string[] = [dstId];
  for (let depth = 0; depth < CYCLE_MAX_DEPTH && frontier.length > 0; depth++) {
    const next: string[] = [];
    for (const node of frontier) {
      const outs = await store.listLinks({
        entityId: node,
        relation,
        direction: "out",
        limit: 200,
      });
      for (const link of outs) {
        if (link.dst_id === srcId) return true;
        if (!seen.has(link.dst_id)) {
          seen.add(link.dst_id);
          next.push(link.dst_id);
        }
      }
    }
    frontier = next;
  }
  return false;
}

export const RELATION_NAMES = Object.keys(RELATIONS) as RelationName[];
