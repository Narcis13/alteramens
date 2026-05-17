// Public type surface for @pca/core

export const ENTITY_TYPES = [
  "self",
  "place",
  "goal",
  "knowledge",
  "person",
  "resource",
  "constraint",
  "state",
  "event",
  "preference",
  "stance",
  "role",
] as const;

export type EntityType = (typeof ENTITY_TYPES)[number];

export type Status = "active" | "archived" | "invalidated";
export type Authority = "self-declared" | "observed" | "inferred";
export type Confidence = "low" | "medium" | "high";
export type Maturity = "provisional" | "working" | "load-bearing";

export type Entity = {
  id: string;
  type: EntityType;
  title: string;
  body: string | null;
  status: Status;
  authority: Authority;
  confidence: Confidence;
  maturity: Maturity;
  scope: string;
  source_ref: string | null;
  attrs: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  invalidated_at: string | null;
};

export type CreateEntityInput = {
  type: EntityType;
  title: string;
  body?: string;
  attrs?: Record<string, unknown>;
  authority?: Authority;
  confidence?: Confidence;
  maturity?: Maturity;
  scope?: string;
  source_ref?: string;
  expires_at?: string | null; // explicit null means "no expiry, override TTL default"
};

export type UpdateEntityChanges = {
  title?: string;
  body?: string | null;
  attrs?: Record<string, unknown>;
  status?: Status;
  expires_at?: string | null;
  scope?: string;
  confidence?: Confidence;
  maturity?: Maturity;
};

export type ConfirmDecision = "still-true" | "no-longer-true" | "modify";

export type Link = {
  id: string;
  src_id: string;
  dst_id: string;
  relation: string;
  weight: number;
  authority: Authority;
  created_at: string;
  invalidated_at: string | null;
};

export type Annotation = {
  id: string;
  entity_id: string;
  body: string;
  authority: Authority;
  created_at: string;
};

export type Source = {
  id: string;
  kind: "conversation" | "url" | "file" | "other";
  identifier: string;
  excerpt: string | null;
  created_at: string;
};

export type Project = {
  slug: string;
  title: string;
  description: string | null;
  status: "active" | "archived";
  created_at: string;
};

export type EventRow = {
  id: number;
  occurred_at: string;
  actor: string;
  operation:
    | "create"
    | "update"
    | "observe"
    | "invalidate"
    | "confirm"
    | "confirm-modify"
    | "expire"
    | "link"
    | "annotate"
    | "tag"
    | "source";
  entity_id: string | null;
  link_id: string | null;
  annotation_id: string | null;
  payload: Record<string, unknown> | null;
  source_ref: string | null;
};
