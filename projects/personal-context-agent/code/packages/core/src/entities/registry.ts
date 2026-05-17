// Per-type attrs schemas + TTL defaults + singleton flag.
// Source of truth: PRD §8.1.
import { z } from "zod";
import type { EntityType } from "../types.ts";

const selfAttrs = z
  .object({
    pillars: z.array(z.string()).default([]),
    voice_rules: z.array(z.string()).default([]),
    narrative: z.string().default(""),
  })
  .strict();

const placeAttrs = z
  .object({
    kind: z.enum(["physical", "digital", "social"]),
    address: z.string().optional(),
    recurring: z.boolean().optional(),
  })
  .strict();

const goalAttrs = z
  .object({
    timeframe: z.enum(["long", "mid", "short"]),
    parent_id: z.string().optional(),
    success_criteria: z.string().optional(),
  })
  .strict();

const knowledgeAttrs = z
  .object({
    domain: z.string().min(1),
    depth: z.enum(["novice", "practitioner", "expert"]),
    gaps: z.array(z.string()).optional(),
  })
  .strict();

const personAttrs = z
  .object({
    relation: z.string().min(1),
    importance: z.enum(["high", "med", "low"]),
    tags: z.array(z.string()).optional(),
  })
  .strict();

const resourceAttrs = z
  .object({
    kind: z.enum(["tool", "subscription", "asset", "access", "budget"]),
    cost_per_month: z.number().nonnegative().optional(),
  })
  .strict();

const constraintAttrs = z
  .object({
    kind: z.enum(["time", "ethical", "legal", "cognitive", "capacity"]),
    hard_or_soft: z.enum(["hard", "soft"]),
  })
  .strict();

const stateAttrs = z
  .object({
    mood: z.string().optional(),
    energy: z.enum(["low", "med", "high"]).optional(),
    focus: z.string().optional(),
    stress: z.string().optional(),
    place_id: z.string().optional(),
  })
  .strict();

const eventAttrs = z
  .object({
    related_entity_ids: z.array(z.string()).optional(),
  })
  .strict();

const preferenceAttrs = z
  .object({
    register: z.enum(["voice", "aesthetic", "taste"]),
    strength: z.enum(["mild", "strong"]).optional(),
  })
  .strict();

const stanceAttrs = z
  .object({
    reason: z.string().min(1),
    evidence_sources: z.array(z.string()).optional(),
  })
  .strict();

const roleAttrs = z
  .object({
    schedule: z.string().optional(),
    domain: z.enum(["defensive", "offensive", "mixed"]).optional(),
    priority: z.number().optional(),
  })
  .strict();

export type EntitySpec = {
  attrs: z.ZodTypeAny;
  defaultTtlDays: number | null; // null = ∞
  isSingleton: boolean;
};

export const REGISTRY: Record<EntityType, EntitySpec> = {
  self:        { attrs: selfAttrs,       defaultTtlDays: null, isSingleton: true  },
  place:       { attrs: placeAttrs,      defaultTtlDays: null, isSingleton: false },
  goal:        { attrs: goalAttrs,       defaultTtlDays: 90,   isSingleton: false },
  knowledge:   { attrs: knowledgeAttrs,  defaultTtlDays: null, isSingleton: false },
  person:      { attrs: personAttrs,     defaultTtlDays: null, isSingleton: false },
  resource:    { attrs: resourceAttrs,   defaultTtlDays: 180,  isSingleton: false },
  constraint:  { attrs: constraintAttrs, defaultTtlDays: 180,  isSingleton: false },
  state:       { attrs: stateAttrs,      defaultTtlDays: 7,    isSingleton: false },
  event:       { attrs: eventAttrs,      defaultTtlDays: null, isSingleton: false },
  preference:  { attrs: preferenceAttrs, defaultTtlDays: null, isSingleton: false },
  stance:      { attrs: stanceAttrs,     defaultTtlDays: null, isSingleton: false },
  role:        { attrs: roleAttrs,       defaultTtlDays: 180,  isSingleton: false },
};
