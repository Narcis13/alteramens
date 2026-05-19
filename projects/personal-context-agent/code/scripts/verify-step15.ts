// Step 1.5 acceptance verification — simulates /ctx-add for the test input
// "Mihai (fiul meu) se pregătește pentru UMF iulie 2027".
//
// Goes through the same code path the MCP handlers use (record_observation +
// link_entities), so result is identical to what a /ctx-add session with the
// new MCP build would produce. Idempotent: skips entities already created by
// previous runs (matched by title + source).
//
// Run with: bun run scripts/verify-step15.ts
import { homedir } from "node:os";
import { join } from "node:path";
import { openStore } from "@pca/core";
import {
  linkEntities,
  recordObservation,
} from "../packages/mcp-server/src/handlers.ts";

const dbPath = join(homedir(), ".pca", "store.db");
const store = openStore(dbPath);
const actor = "script:verify-step15";
const source = "script:verify-step15";

function findExisting(title: string): string | undefined {
  const row = store.db
    .prepare(
      `SELECT id FROM entities WHERE title = ? AND source_ref = ? AND status = 'active' LIMIT 1`,
    )
    .get(title, source) as { id: string } | undefined;
  return row?.id;
}

function ensureEntity(args: {
  type: "person" | "goal" | "event";
  title: string;
  text: string;
  attrs?: Record<string, unknown>;
  authority?: "self-declared" | "observed" | "inferred";
}): string {
  const existing = findExisting(args.title);
  if (existing) {
    console.log(`= reused  ${args.type.padEnd(9)} ${existing}  ${args.title}`);
    return existing;
  }
  const res = recordObservation(
    store,
    {
      type: args.type,
      text: args.text,
      title: args.title,
      attrs: args.attrs,
      source,
      authority: args.authority ?? "self-declared",
    },
    actor,
  );
  console.log(`+ created ${args.type.padEnd(9)} ${res.id}  ${args.title}`);
  return res.id;
}

function ensureLink(args: {
  src_id: string;
  dst_id: string;
  relation: string;
  authority?: "self-declared" | "observed" | "inferred";
}): string {
  const existing = store.db
    .prepare(
      `SELECT id FROM links
       WHERE src_id = ? AND dst_id = ? AND relation = ? AND invalidated_at IS NULL
       LIMIT 1`,
    )
    .get(args.src_id, args.dst_id, args.relation) as { id: string } | undefined;
  if (existing) {
    console.log(
      `= reused  link        ${existing}  ${args.relation}  ${args.src_id} → ${args.dst_id}`,
    );
    return existing.id;
  }
  const link = linkEntities(
    store,
    {
      src_id: args.src_id,
      dst_id: args.dst_id,
      relation: args.relation,
      authority: args.authority ?? "self-declared",
    },
    actor,
  );
  console.log(
    `+ created link        ${link.id}  ${args.relation}  ${args.src_id} → ${args.dst_id}`,
  );
  return link.id;
}

console.log("──────────────────────────────────────────────────────────────");
console.log("Step 1.5 verification — simulating /ctx-add capture");
console.log(
  "Input: \"Mihai (fiul meu) se pregătește pentru UMF iulie 2027\"",
);
console.log("──────────────────────────────────────────────────────────────");

const mihaiId = ensureEntity({
  type: "person",
  title: "Mihai (fiul lui Narcis)",
  text: "Mihai — fiul lui Narcis.",
  attrs: { relation: "son", importance: "high" },
});

const examId = ensureEntity({
  type: "event",
  title: "UMF — admitere iulie 2027",
  text: "Examen admitere UMF, iulie 2027.",
});

const goalId = ensureEntity({
  type: "goal",
  title: "Mihai se pregătește pentru admitere la UMF",
  text: "Mihai se pregătește pentru admitere la UMF (iulie 2027).",
  attrs: { timeframe: "mid" },
});

console.log("");
const link1 = ensureLink({
  src_id: goalId,
  dst_id: mihaiId,
  relation: "subject-of",
});
const link2 = ensureLink({
  src_id: goalId,
  dst_id: examId,
  relation: "motivated-by",
});

console.log("");
console.log("──────────────────────────────────────────────────────────────");
const linkCounts = store.db
  .prepare(
    `SELECT
       (SELECT COUNT(*) FROM links) AS total,
       (SELECT COUNT(*) FROM links WHERE invalidated_at IS NULL) AS active`,
  )
  .get() as { total: number; active: number };

console.log(`Total links in store:  ${linkCounts.total}`);
console.log(`Active links:          ${linkCounts.active}`);

const neighbors = store.getNeighbors(mihaiId);
console.log(`\nNeighbors of Mihai (${mihaiId}):`);
for (const n of neighbors) {
  console.log(
    `  ${n.role.padEnd(3)}  --${n.link.relation}-->  ${n.entity.type}  "${n.entity.title}"`,
  );
}

store.close();
console.log("\n✓ Verification done.");
