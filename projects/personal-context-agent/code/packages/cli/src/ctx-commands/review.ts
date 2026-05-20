// `ctx review --links` — Phase 3 Step 3.2 / 3.3 of plan-linking.md.
//
// Scans the link graph for three health classes:
//   • dangling   — non-invalidated links touching missing / invalidated /
//                  expired entities (cascade should have caught these; this
//                  catches the gap when older entities were invalidated before
//                  cascade existed, or when an external writer touched the DB).
//   • redundant  — multiple non-invalidated links with identical (src, dst,
//                  relation). One survives; the rest become noise.
//   • orphan     — active entities of types we expect to be connected (i.e.
//                  not event/state — those are intrinsically short-lived
//                  and may legitimately stand alone) with zero non-invalidated
//                  in/out links. Reported only; never auto-modified — humans
//                  decide whether the isolation is meaningful.
//
// --fix only acts on dangling + redundant. Orphan handling stays manual.

import { openStore, type Store } from "@pca/core";

const ACTOR = "ctx:review";

export type DanglingReason =
  | "src-missing"
  | "src-invalidated"
  | "src-expired"
  | "dst-missing"
  | "dst-invalidated"
  | "dst-expired";

export type DanglingLink = {
  link_id: string;
  relation: string;
  src: { id: string; title: string | null; status: string | null };
  dst: { id: string; title: string | null; status: string | null };
  reasons: DanglingReason[];
};

export type RedundantGroup = {
  src_id: string;
  src_title: string;
  dst_id: string;
  dst_title: string;
  relation: string;
  link_ids: string[];
  kept_link_id?: string;
  invalidated_link_ids?: string[];
};

export type OrphanEntity = {
  id: string;
  type: string;
  title: string;
  age_days: number;
  created_at: string;
};

export type FixSummary = {
  dangling: number;
  redundant: number;
};

export type ReviewResult = {
  dangling: DanglingLink[];
  redundant: RedundantGroup[];
  orphans: OrphanEntity[];
  fixed?: FixSummary;
};

type DanglingRow = {
  link_id: string;
  src_id: string;
  dst_id: string;
  relation: string;
  src_title: string | null;
  src_status: string | null;
  src_expires: string | null;
  dst_title: string | null;
  dst_status: string | null;
  dst_expires: string | null;
};

type RedundantRow = {
  src_id: string;
  dst_id: string;
  relation: string;
  src_title: string | null;
  dst_title: string | null;
  link_ids: string;
  weights: string;
  created_ats: string;
};

type OrphanRow = {
  id: string;
  type: string;
  title: string;
  created_at: string;
  age_days: number;
};

// Types we don't flag as orphans — events and states are inherently transient
// observations, often standalone, and shouldn't pollute the report.
const ORPHAN_EXEMPT_TYPES = new Set(["event", "state"]);

export async function reviewLinks(opts: {
  dbPath: string;
  fix?: boolean;
  actor?: string;
}): Promise<ReviewResult> {
  const store = await openStore({ url: `file:${opts.dbPath}` });
  try {
    const result = await computeReview(store);
    if (opts.fix) {
      result.fixed = await applyFix(store, result, opts.actor ?? ACTOR);
    }
    return result;
  } finally {
    store.close();
  }
}

async function computeReview(store: Store): Promise<ReviewResult> {
  const dangling = await findDangling(store);
  const redundant = await findRedundant(store);
  const orphans = await findOrphans(store);
  return { dangling, redundant, orphans };
}

async function findDangling(store: Store): Promise<DanglingLink[]> {
  // Archived entities are intentionally NOT flagged — plan-linking.md §3 D3:
  // archived = out-of-rotation, links remain valid; only invalidated cascades.
  const result = await store.client.execute(`
      SELECT
        l.id AS link_id,
        l.src_id, l.dst_id, l.relation,
        es.title  AS src_title,
        es.status AS src_status,
        es.expires_at AS src_expires,
        ed.title  AS dst_title,
        ed.status AS dst_status,
        ed.expires_at AS dst_expires
      FROM links l
      LEFT JOIN entities es ON es.id = l.src_id
      LEFT JOIN entities ed ON ed.id = l.dst_id
      WHERE l.invalidated_at IS NULL
        AND (
             es.id IS NULL
          OR es.status = 'invalidated'
          OR (es.expires_at IS NOT NULL AND es.expires_at <= datetime('now'))
          OR ed.id IS NULL
          OR ed.status = 'invalidated'
          OR (ed.expires_at IS NOT NULL AND ed.expires_at <= datetime('now'))
        )
      ORDER BY l.created_at ASC
    `);
  const rows = result.rows as unknown as DanglingRow[];

  const now = nowIso();
  return rows.map((r) => {
    const reasons: DanglingReason[] = [];
    if (r.src_status === null) reasons.push("src-missing");
    else if (r.src_status === "invalidated") reasons.push("src-invalidated");
    if (r.src_expires !== null && r.src_expires <= now) {
      reasons.push("src-expired");
    }
    if (r.dst_status === null) reasons.push("dst-missing");
    else if (r.dst_status === "invalidated") reasons.push("dst-invalidated");
    if (r.dst_expires !== null && r.dst_expires <= now) {
      reasons.push("dst-expired");
    }
    return {
      link_id: r.link_id,
      relation: r.relation,
      src: { id: r.src_id, title: r.src_title, status: r.src_status },
      dst: { id: r.dst_id, title: r.dst_title, status: r.dst_status },
      reasons,
    };
  });
}

async function findRedundant(store: Store): Promise<RedundantGroup[]> {
  const result = await store.client.execute(`
      SELECT
        l.src_id, l.dst_id, l.relation,
        es.title AS src_title,
        ed.title AS dst_title,
        GROUP_CONCAT(l.id, char(10))         AS link_ids,
        GROUP_CONCAT(l.weight, char(10))     AS weights,
        GROUP_CONCAT(l.created_at, char(10)) AS created_ats
      FROM links l
      LEFT JOIN entities es ON es.id = l.src_id
      LEFT JOIN entities ed ON ed.id = l.dst_id
      WHERE l.invalidated_at IS NULL
      GROUP BY l.src_id, l.dst_id, l.relation
      HAVING COUNT(*) > 1
      ORDER BY l.src_id, l.relation
    `);
  const rows = result.rows as unknown as RedundantRow[];

  return rows.map((r) => ({
    src_id: r.src_id,
    dst_id: r.dst_id,
    relation: r.relation,
    src_title: r.src_title ?? "[missing]",
    dst_title: r.dst_title ?? "[missing]",
    link_ids: r.link_ids.split("\n"),
  }));
}

async function findOrphans(store: Store): Promise<OrphanEntity[]> {
  const exempt = [...ORPHAN_EXEMPT_TYPES].map(() => "?").join(",");
  const params = [...ORPHAN_EXEMPT_TYPES];
  const result = await store.client.execute({
    sql: `
      SELECT
        e.id, e.type, e.title, e.created_at,
        CAST((julianday('now') - julianday(e.created_at)) AS INTEGER) AS age_days
      FROM entities e
      WHERE e.status = 'active'
        AND (e.expires_at IS NULL OR e.expires_at > datetime('now'))
        AND e.type NOT IN (${exempt})
        AND NOT EXISTS (
          SELECT 1 FROM links l
          WHERE (l.src_id = e.id OR l.dst_id = e.id)
            AND l.invalidated_at IS NULL
        )
      ORDER BY e.created_at ASC
    `,
    args: params,
  });
  const rows = result.rows as unknown as OrphanRow[];

  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    title: r.title,
    age_days: Number(r.age_days),
    created_at: r.created_at,
  }));
}

async function applyFix(
  store: Store,
  result: ReviewResult,
  actor: string,
): Promise<FixSummary> {
  let danglingFixed = 0;
  for (const d of result.dangling) {
    await store.invalidateLink(
      d.link_id,
      actor,
      `dangling: ${d.reasons.join(",")}`,
    );
    danglingFixed++;
  }

  let redundantFixed = 0;
  for (const group of result.redundant) {
    const links: Array<{ id: string; weight: number; created_at: string }> = [];
    for (const id of group.link_ids) {
      const rs = await store.client.execute({
        sql: "SELECT id, weight, created_at FROM links WHERE id = ? AND invalidated_at IS NULL",
        args: [id],
      });
      const row = rs.rows[0] as unknown as
        | { id: string; weight: number; created_at: string }
        | undefined;
      if (row) {
        links.push({
          id: row.id,
          weight: Number(row.weight),
          created_at: row.created_at,
        });
      }
    }

    if (links.length < 2) continue;

    // Keep the highest weight; tiebreak on most recent created_at.
    links.sort((a, b) => {
      if (a.weight !== b.weight) return b.weight - a.weight;
      return a.created_at < b.created_at ? 1 : -1;
    });
    const [keep, ...drop] = links;
    if (!keep) continue;
    group.kept_link_id = keep.id;
    group.invalidated_link_ids = [];
    for (const dropLink of drop) {
      await store.invalidateLink(
        dropLink.id,
        actor,
        `redundant: kept ${keep.id}`,
      );
      group.invalidated_link_ids.push(dropLink.id);
      redundantFixed++;
    }
  }

  return { dangling: danglingFixed, redundant: redundantFixed };
}

function nowIso(): string {
  return new Date().toISOString();
}
