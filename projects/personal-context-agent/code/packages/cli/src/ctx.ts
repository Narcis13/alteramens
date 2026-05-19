#!/usr/bin/env bun
// `ctx` runtime CLI — Phase 3 of plan-linking.md.
//
// Subcommands:
//   ctx review --links            Health check: dangling, redundant, orphan
//   ctx review --links --fix      Auto-fix dangling + dedupe redundant
//
// Pure command functions live in ./ctx-commands/; this entry handles argv
// parsing, formatting, and exit codes only.

import { parseArgs } from "node:util";
import { defaultPaths } from "./pca-commands/util.ts";
import {
  reviewLinks,
  type DanglingLink,
  type OrphanEntity,
  type RedundantGroup,
  type ReviewResult,
} from "./ctx-commands/review.ts";

const VERSION = "0.0.1";

const USAGE = `ctx — Personal Context Agent runtime CLI (v${VERSION})

Usage:
  ctx review --links [--fix]     Health-check link graph
  ctx version
  ctx help

Common flags:
  --db PATH                      Store path (default ~/.pca/store.db)
`;

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const [cmd, ...rest] = argv;

  if (!cmd || cmd === "help" || cmd === "--help" || cmd === "-h") {
    process.stdout.write(USAGE);
    process.exit(cmd ? 0 : 1);
  }

  if (cmd === "version" || cmd === "--version" || cmd === "-v") {
    process.stdout.write(`ctx ${VERSION}\n`);
    process.exit(0);
  }

  try {
    switch (cmd) {
      case "review":
        runReview(rest);
        break;
      default:
        process.stderr.write(`Unknown command: ${cmd}\n\n${USAGE}`);
        process.exit(1);
    }
  } catch (e) {
    process.stderr.write(
      `ctx: ${e instanceof Error ? e.message : String(e)}\n`,
    );
    process.exit(1);
  }
}

function runReview(args: string[]): void {
  const { values } = parseArgs({
    args,
    options: {
      links: { type: "boolean" },
      fix: { type: "boolean" },
      db: { type: "string" },
    },
    strict: true,
  });

  if (!values.links) {
    process.stderr.write(
      "ctx review: pass --links (only link health-check is implemented).\n",
    );
    process.exit(1);
  }

  const dbPath = values.db ?? defaultPaths().dbPath;
  const result = reviewLinks({ dbPath, fix: values.fix ?? false });
  process.stdout.write(formatReview(result, values.fix ?? false));
  process.exit(0);
}

function formatReview(r: ReviewResult, fix: boolean): string {
  const out: string[] = [];

  out.push("Dangling links (point to invalidated/missing entities):");
  if (r.dangling.length === 0) {
    out.push("  (none)");
  } else {
    for (const d of r.dangling) {
      out.push(`  ${formatDangling(d)}`);
    }
  }
  out.push("");

  out.push("Redundant links (same src+dst+relation, multiple active):");
  if (r.redundant.length === 0) {
    out.push("  (none)");
  } else {
    for (const g of r.redundant) {
      out.push(`  ${formatRedundant(g)}`);
    }
  }
  out.push("");

  out.push("Orphan entities (no in/out links, type ≠ event/state):");
  if (r.orphans.length === 0) {
    out.push("  (none)");
  } else {
    for (const o of r.orphans) {
      out.push(`  ${formatOrphan(o)}`);
    }
  }
  out.push("");

  const summary = `Health: ${r.dangling.length} dangling, ${r.redundant.length} redundant, ${r.orphans.length} orphan.`;
  if (fix && r.fixed) {
    out.push(
      `${summary} Fixed: invalidated ${r.fixed.dangling} dangling, deduped ${r.fixed.redundant} redundant links.`,
    );
  } else if (r.dangling.length + r.redundant.length > 0) {
    out.push(`${summary} Run with --fix to invalidate.`);
  } else {
    out.push(summary);
  }
  return `${out.join("\n")}\n`;
}

function formatDangling(d: DanglingLink): string {
  const src = d.src.title ?? "[MISSING]";
  const dst = d.dst.title ?? "[MISSING]";
  const reasonsLabel = reasonLabel(d);
  return `${d.link_id} :: "${src}" --${d.relation}--> "${dst}" [${reasonsLabel}]`;
}

function reasonLabel(d: DanglingLink): string {
  // Collapse src/dst reason flags into compact tags.
  const srcSide = d.reasons.filter((r) => r.startsWith("src-"));
  const dstSide = d.reasons.filter((r) => r.startsWith("dst-"));
  const parts: string[] = [];
  if (srcSide.length > 0)
    parts.push(`src=${srcSide.map((r) => r.slice(4)).join("+")}`);
  if (dstSide.length > 0)
    parts.push(`dst=${dstSide.map((r) => r.slice(4)).join("+")}`);
  return parts.join(", ");
}

function formatRedundant(g: RedundantGroup): string {
  const head = `"${g.src_title}" --${g.relation}--> "${g.dst_title}": ${g.link_ids.length} active links`;
  if (g.kept_link_id && g.invalidated_link_ids) {
    return `${head} → kept ${g.kept_link_id}, invalidated ${g.invalidated_link_ids.length}`;
  }
  return head;
}

function formatOrphan(o: OrphanEntity): string {
  return `${o.type} "${o.title}" (${o.age_days}d old, ${o.id})`;
}

await main();
