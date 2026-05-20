#!/usr/bin/env bun
// `ctx` runtime CLI.
//
// Subcommands:
//   ctx review --links [--fix]    Health check: dangling, redundant, orphan
//   ctx log [filters]             Browse the raw capture journal
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
import {
  runLog,
  type CaptureWithProvenance,
  type LogResult,
} from "./ctx-commands/log.ts";
import type { CaptureStatus } from "@pca/core";
import { parseDateToken, DateParseError } from "./util/dates.ts";

const VERSION = "0.0.1";

const USAGE = `ctx — Personal Context Agent runtime CLI (v${VERSION})

Usage:
  ctx review --links [--fix]     Health-check link graph
  ctx log [flags]                Browse the raw capture journal
  ctx version
  ctx help

ctx log flags:
  --since TOKEN                  Relative (7d/2h/30m) or ISO date
  --until TOKEN                  Same format as --since
  --status STATUS                pending | processed | aborted | reprocess
  --source STRING                Filter by capture source
  --search QUERY                 FTS5 query over raw_text
  --capture PREFIX               Expand a single capture by id prefix
  --export markdown              Markdown journal to stdout
  --limit N                      Cap results (default 20, max 500)

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
        await runReview(rest);
        break;
      case "log":
        await runLogCommand(rest);
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

async function runReview(args: string[]): Promise<void> {
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
  const result = await reviewLinks({ dbPath, fix: values.fix ?? false });
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

// ── ctx log ──────────────────────────────────────────────────────────────────

const VALID_STATUS = new Set<CaptureStatus>([
  "pending",
  "processed",
  "aborted",
  "reprocess",
]);
const VALID_EXPORT = new Set(["markdown"]);

async function runLogCommand(args: string[]): Promise<void> {
  const { values } = parseArgs({
    args,
    options: {
      since: { type: "string" },
      until: { type: "string" },
      status: { type: "string" },
      source: { type: "string" },
      search: { type: "string" },
      capture: { type: "string" },
      export: { type: "string" },
      limit: { type: "string" },
      db: { type: "string" },
    },
    strict: true,
  });

  let status: CaptureStatus | undefined;
  if (values.status !== undefined) {
    if (!VALID_STATUS.has(values.status as CaptureStatus)) {
      process.stderr.write(
        `ctx log: --status must be one of ${[...VALID_STATUS].join("|")}\n`,
      );
      process.exit(1);
    }
    status = values.status as CaptureStatus;
  }

  let exportFmt: string | undefined;
  if (values.export !== undefined) {
    if (!VALID_EXPORT.has(values.export)) {
      process.stderr.write(
        `ctx log: --export must be one of ${[...VALID_EXPORT].join("|")}\n`,
      );
      process.exit(1);
    }
    exportFmt = values.export;
  }

  let limit: number | undefined;
  if (values.limit !== undefined) {
    const n = Number(values.limit);
    if (!Number.isFinite(n) || n <= 0) {
      process.stderr.write("ctx log: --limit must be a positive number\n");
      process.exit(1);
    }
    limit = n;
  }

  let since: string | undefined;
  let until: string | undefined;
  try {
    if (values.since !== undefined) since = parseDateToken(values.since);
    if (values.until !== undefined) until = parseDateToken(values.until);
  } catch (e) {
    if (e instanceof DateParseError) {
      process.stderr.write(`ctx log: ${e.message}\n`);
      process.exit(1);
    }
    throw e;
  }

  const dbPath = values.db ?? defaultPaths().dbPath;
  const result = await runLog({
    dbPath,
    since,
    until,
    status,
    source: values.source,
    fts: values.search,
    capture: values.capture,
    limit,
  });

  if (exportFmt === "markdown") {
    process.stdout.write(formatLogMarkdown(result));
    process.exit(0);
  }

  process.stdout.write(formatLog(result));
  process.exit(0);
}

function formatLog(r: LogResult): string {
  if (r.mode === "ambiguous") {
    const out: string[] = [];
    out.push(
      `Capture prefix "${r.prefix ?? ""}" is ambiguous — matches ${r.items.length} captures:`,
    );
    for (const it of r.items) {
      out.push(`  ${shortId(it.capture.id)}  ${formatTs(it.capture.occurred_at)}  [${it.capture.status}]`);
    }
    out.push("Use a longer prefix.");
    return `${out.join("\n")}\n`;
  }
  if (r.mode === "expanded") {
    const it = r.items[0];
    return it ? formatExpanded(it) : "No capture matched.\n";
  }

  // mode === "list"
  if (r.items.length === 0) {
    if (r.prefix !== undefined) {
      return `No capture matched prefix "${r.prefix}".\n`;
    }
    return "No captures yet.\n";
  }
  const lines: string[] = [];
  for (const it of r.items) {
    lines.push(formatListItem(it));
  }
  return `${lines.join("\n\n")}\n`;
}

function formatListItem(it: CaptureWithProvenance): string {
  const ts = formatTs(it.capture.occurred_at);
  const id = shortId(it.capture.id);
  const tag = statusTag(it);
  const head = `${ts}  ${id}  ${tag}`;
  const body = quoteRaw(it.capture.raw_text);
  return `${head}\n${body}`;
}

function statusTag(it: CaptureWithProvenance): string {
  const s = it.capture.status;
  if (s === "processed") {
    const eCount = it.entities.length;
    const lCount = it.links.length;
    const parts: string[] = [];
    parts.push(`${eCount} ent`);
    if (lCount > 0) parts.push(`${lCount} link`);
    return `[processed → ${parts.join(", ")}]`;
  }
  if (s === "aborted") {
    const reason = it.capture.classification_summary?.aborted_reason;
    return reason ? `[aborted: ${reason}]` : "[aborted]";
  }
  return `[${s}]`;
}

function formatExpanded(it: CaptureWithProvenance): string {
  const c = it.capture;
  const out: string[] = [];
  out.push(`Capture #${c.id} [${c.status}]`);
  out.push(`  When:    ${formatTsFull(c.occurred_at)}`);
  out.push(`  Source:  ${c.source}`);
  out.push(`  Scope:   ${c.scope}`);
  if (c.session_id) out.push(`  Session: ${c.session_id}`);
  if (c.raw_lang) out.push(`  Lang:    ${c.raw_lang}`);
  if (c.processed_at) out.push(`  Closed:  ${formatTsFull(c.processed_at)}`);
  out.push("");
  out.push("Raw input:");
  for (const line of c.raw_text.split("\n")) {
    out.push(`  ${line}`);
  }

  if (it.entities.length > 0 || it.links.length > 0) {
    out.push("");
    out.push("Produced:");
    for (const e of it.entities) {
      out.push(`  - ${padRight(e.type, 12)} #${e.id} "${e.title}"`);
    }
    for (const l of it.links) {
      const src = l.src_title ?? "[missing]";
      const dst = l.dst_title ?? "[missing]";
      out.push(`  - link         ${l.relation}: "${src}" → "${dst}"`);
    }
  } else if (c.status === "processed") {
    out.push("");
    out.push("Produced: (nothing — capture closed without entities)");
  }

  const reason = c.classification_summary?.aborted_reason;
  if (c.status === "aborted" && reason) {
    out.push("");
    out.push(`Aborted: ${reason}`);
  }
  return `${out.join("\n")}\n`;
}

function formatLogMarkdown(r: LogResult): string {
  if (r.items.length === 0) {
    return "# Capture journal\n\n_(empty)_\n";
  }
  const out: string[] = ["# Capture journal", ""];
  for (const it of r.items) {
    const c = it.capture;
    out.push(`## ${formatTsFull(c.occurred_at)} — #${c.id}`);
    out.push("");
    out.push(`- **Status:** ${c.status}`);
    out.push(`- **Source:** ${c.source}`);
    out.push(`- **Scope:** ${c.scope}`);
    if (c.raw_lang) out.push(`- **Lang:** ${c.raw_lang}`);
    out.push("");
    for (const line of c.raw_text.split("\n")) {
      out.push(`> ${line}`);
    }
    if (it.entities.length > 0 || it.links.length > 0) {
      out.push("");
      out.push("**Produced:**");
      out.push("");
      for (const e of it.entities) {
        out.push(`- \`${e.type}\` #${e.id} — "${e.title}"`);
      }
      for (const l of it.links) {
        const src = l.src_title ?? "[missing]";
        const dst = l.dst_title ?? "[missing]";
        out.push(`- \`link\` ${l.relation}: "${src}" → "${dst}"`);
      }
    }
    out.push("");
  }
  return out.join("\n");
}

function quoteRaw(text: string): string {
  const lines = text.split("\n");
  return lines.map((l, i) => (i === 0 ? `  > ${l}` : `    ${l}`)).join("\n");
}

function shortId(id: string): string {
  return `#${id.slice(0, 10)}...`;
}

function formatTs(iso: string): string {
  // YYYY-MM-DD HH:MM in UTC — predictable across machines, no TZ surprises in
  // tests.
  return iso.replace("T", " ").slice(0, 16);
}

function formatTsFull(iso: string): string {
  return iso.replace("T", " ").replace("Z", " UTC");
}

function padRight(s: string, n: number): string {
  return s.length >= n ? s : s + " ".repeat(n - s.length);
}

await main();
