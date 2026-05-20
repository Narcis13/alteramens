// `ctx log` — Phase C of plan-captures.md. Read surface over the capture
// stream. Three display modes:
//
//   • list      — compact one-line summaries, newest first.
//   • expanded  — single capture with raw input + provenance (entities/links).
//   • ambiguous — when --capture <prefix> matches >1 capture, return the
//                 candidates so the CLI can ask for a longer prefix.
//
// Pure command: opens the store, returns a structured LogResult. Formatting
// (both human and markdown) lives in ctx.ts.

import { openStore, type Capture, type CaptureStatus } from "@pca/core";

export type CaptureProvenanceEntity = {
  id: string;
  type: string;
  title: string;
};

export type CaptureProvenanceLink = {
  id: string;
  src_id: string;
  dst_id: string;
  src_title: string | null;
  dst_title: string | null;
  relation: string;
};

export type CaptureWithProvenance = {
  capture: Capture;
  entities: CaptureProvenanceEntity[];
  links: CaptureProvenanceLink[];
};

export type LogMode = "list" | "expanded" | "ambiguous";

export type LogOptions = {
  dbPath: string;
  since?: string;
  until?: string;
  status?: CaptureStatus;
  source?: string;
  fts?: string;
  capture?: string;
  limit?: number;
};

export type LogResult = {
  mode: LogMode;
  items: CaptureWithProvenance[];
  prefix?: string; // echoed when mode === "ambiguous"
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 500;

export function runLog(opts: LogOptions): LogResult {
  const store = openStore(opts.dbPath);
  try {
    // --capture short-circuits all other filters: it's an explicit lookup, not
    // a list query. Multi-match returns "ambiguous" so the CLI can prompt.
    if (opts.capture && opts.capture.length > 0) {
      return resolveCapturePrefix(store, opts.capture);
    }

    const limit = clampLimit(opts.limit);
    const captures = store.listCaptures({
      since: opts.since,
      until: opts.until,
      status: opts.status,
      source: opts.source,
      fts: opts.fts,
      limit,
    });

    const items: CaptureWithProvenance[] = captures.map((c) => ({
      capture: c,
      entities: fetchEntitiesFor(store, c.id),
      links: fetchLinksFor(store, c.id),
    }));
    return { mode: "list", items };
  } finally {
    store.close();
  }
}

function clampLimit(limit: number | undefined): number {
  if (limit === undefined) return DEFAULT_LIMIT;
  if (!Number.isFinite(limit) || limit <= 0) return DEFAULT_LIMIT;
  return Math.min(limit, MAX_LIMIT);
}

function resolveCapturePrefix(
  store: ReturnType<typeof openStore>,
  prefix: string,
): LogResult {
  const matches = store.db
    .prepare(
      "SELECT id FROM captures WHERE id LIKE ? || '%' ORDER BY occurred_at DESC LIMIT 10",
    )
    .all(prefix) as Array<{ id: string }>;

  if (matches.length === 0) {
    return { mode: "list", items: [], prefix };
  }
  if (matches.length > 1) {
    const items = matches.map((m) => {
      const cap = store.getCapture(m.id);
      return {
        capture: cap!,
        entities: [] as CaptureProvenanceEntity[],
        links: [] as CaptureProvenanceLink[],
      };
    });
    return { mode: "ambiguous", items, prefix };
  }

  const cap = store.getCapture(matches[0]!.id);
  const item: CaptureWithProvenance = {
    capture: cap!,
    entities: fetchEntitiesFor(store, cap!.id),
    links: fetchLinksFor(store, cap!.id),
  };
  return { mode: "expanded", items: [item] };
}

function fetchEntitiesFor(
  store: ReturnType<typeof openStore>,
  captureId: string,
): CaptureProvenanceEntity[] {
  return store.db
    .prepare(
      `SELECT e.id, e.type, e.title
         FROM capture_entities ce
         JOIN entities e ON e.id = ce.entity_id
        WHERE ce.capture_id = ?
        ORDER BY e.created_at ASC`,
    )
    .all(captureId) as CaptureProvenanceEntity[];
}

function fetchLinksFor(
  store: ReturnType<typeof openStore>,
  captureId: string,
): CaptureProvenanceLink[] {
  return store.db
    .prepare(
      `SELECT l.id, l.src_id, l.dst_id, l.relation,
              es.title AS src_title, ed.title AS dst_title
         FROM capture_links cl
         JOIN links l ON l.id = cl.link_id
         LEFT JOIN entities es ON es.id = l.src_id
         LEFT JOIN entities ed ON ed.id = l.dst_id
        WHERE cl.capture_id = ?
        ORDER BY l.created_at ASC`,
    )
    .all(captureId) as CaptureProvenanceLink[];
}
