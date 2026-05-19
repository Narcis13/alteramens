// One-shot migration: goal.attrs.parent_id → `subgoal-of` link.
//
// Phase 2 Step 2.3 of plan-linking.md. Earlier code stored goal→goal "is a
// subgoal of" relationships inside `attrs.parent_id`. With the canonical
// relations registry live, those relationships belong in the `links` table
// where they can be queried, validated, and surfaced by get_self_summary.
//
// Why TS instead of pure SQL: we want ULID-conformant link ids, the same
// authority/event-log flow as runtime createLink, and graceful skipping when
// the parent entity has since been invalidated. Pure SQL couldn't do any of
// those cleanly.
//
// Idempotent: re-running calls listLinks for each goal and skips when a
// non-invalidated subgoal-of link already exists.
//
// The legacy attrs.parent_id is intentionally left in place for one release
// so older consumers stay readable. A follow-up migration can drop it.
//
// Not wired into pca.ts USAGE — a thin script in packages/.../scripts/
// invokes this directly.

import { openStore } from "@pca/core";
import type { CommandResult } from "./util.ts";

const ACTOR = "script:migrate-links";

export type MigrateLinksResult = CommandResult & {
  scanned: number;
  created: number;
  alreadyLinked: number;
  missingParents: Array<{ goalId: string; parentId: string; goalTitle: string }>;
};

export function migrateLinks(opts: {
  dbPath: string;
  actor?: string;
}): MigrateLinksResult {
  const actor = opts.actor ?? ACTOR;
  const store = openStore(opts.dbPath);
  try {
    const goals = store.listActive("goal", { limit: 10_000 });

    let created = 0;
    let alreadyLinked = 0;
    const missingParents: MigrateLinksResult["missingParents"] = [];

    for (const goal of goals) {
      const parentId = goal.attrs?.parent_id;
      if (typeof parentId !== "string" || parentId.length === 0) continue;

      const parent = store.getEntity(parentId);
      if (!parent || parent.status !== "active") {
        missingParents.push({
          goalId: goal.id,
          parentId,
          goalTitle: goal.title,
        });
        continue;
      }

      const existing = store
        .listLinks({
          entityId: goal.id,
          relation: "subgoal-of",
          direction: "out",
          includeInvalidated: false,
          limit: 200,
        })
        .find((l) => l.dst_id === parentId);

      if (existing) {
        alreadyLinked++;
        continue;
      }

      store.createLink(
        {
          src_id: goal.id,
          dst_id: parentId,
          relation: "subgoal-of",
          authority: goal.authority,
        },
        actor,
      );
      created++;
    }

    const messageParts = [
      `Scanned ${goals.length} active goals`,
      `created ${created} subgoal-of link${created === 1 ? "" : "s"}`,
      `${alreadyLinked} already linked`,
    ];
    if (missingParents.length > 0) {
      messageParts.push(
        `${missingParents.length} skipped (parent missing or invalidated)`,
      );
    }

    return {
      ok: true,
      message: messageParts.join(", ") + ".",
      scanned: goals.length,
      created,
      alreadyLinked,
      missingParents,
    };
  } finally {
    store.close();
  }
}
