// Step 2.3 runner — convert legacy goal.attrs.parent_id into subgoal-of links.
//
// Run with: bun run scripts/migrate-links.ts
// Idempotent: safe to re-run; second invocation reports 0 new links.

import { homedir } from "node:os";
import { join } from "node:path";
import { migrateLinks } from "../packages/cli/src/pca-commands/migrate-links.ts";

const dbPath = process.env.PCA_DB ?? join(homedir(), ".pca", "store.db");
const result = migrateLinks({ dbPath });

console.log(result.message);
if (result.missingParents.length > 0) {
  console.log("\nSkipped goals (parent missing or invalidated):");
  for (const m of result.missingParents) {
    console.log(`  - ${m.goalId}  parent=${m.parentId}  "${m.goalTitle}"`);
  }
}

process.exit(result.ok ? 0 : 1);
