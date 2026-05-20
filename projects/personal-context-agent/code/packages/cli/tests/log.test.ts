// Phase C — `ctx log` read surface.
// Seeds a temp store with captures + provenance and exercises runLog() across
// the supported filter combinations and display modes.

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { join } from "node:path";
import { openStore } from "@pca/core";
import { withTempHome } from "./helpers.ts";
import { runLog } from "../src/ctx-commands/log.ts";

let home: string;
let cleanup: () => void;
let dbPath: string;

beforeEach(() => {
  const t = withTempHome();
  home = t.home;
  cleanup = t.cleanup;
  dbPath = join(home, "store.db");
});

afterEach(() => cleanup?.());

const ACTOR = "test";

type SeedRow = {
  id: string;
  iso: string;
  text: string;
  status: "pending" | "processed" | "aborted";
  source: string;
};

async function seedCaptures(rows: SeedRow[]): Promise<void> {
  const store = await openStore({ url: `file:${dbPath}` });
  for (const r of rows) {
    await store.client.execute({
      sql: `INSERT INTO captures (id, occurred_at, raw_text, source, actor, scope, status)
            VALUES (?, ?, ?, ?, ?, 'general', ?)`,
      args: [r.id, r.iso, r.text, r.source, ACTOR, r.status],
    });
  }
  store.close();
}

function defaultSeed(): SeedRow[] {
  return [
    {
      id: "01CAPALPHA0000000000000000",
      iso: "2026-05-10T10:00:00.000Z",
      text: "alpha first capture",
      status: "processed",
      source: "claude-code:ctx-add",
    },
    {
      id: "01CAPBETA00000000000000000",
      iso: "2026-05-15T11:00:00.000Z",
      text: "beta middle Razvan",
      status: "aborted",
      source: "claude-code:ctx-add",
    },
    {
      id: "01CAPGAMMA0000000000000000",
      iso: "2026-05-20T12:00:00.000Z",
      text: "gamma latest mihai",
      status: "pending",
      source: "claude-code:ctx-mirror",
    },
  ];
}

describe("runLog — list mode", () => {
  test("returns empty list when no captures exist", async () => {
    const r = await runLog({ dbPath });
    expect(r.mode).toBe("list");
    expect(r.items).toEqual([]);
  });

  test("returns all captures newest-first", async () => {
    await seedCaptures(defaultSeed());
    const r = await runLog({ dbPath });
    expect(r.mode).toBe("list");
    expect(r.items.map((it) => it.capture.raw_text)).toEqual([
      "gamma latest mihai",
      "beta middle Razvan",
      "alpha first capture",
    ]);
  });

  test("--limit caps the listing", async () => {
    await seedCaptures(defaultSeed());
    const r = await runLog({ dbPath, limit: 2 });
    expect(r.items).toHaveLength(2);
  });

  test("filters by status", async () => {
    await seedCaptures(defaultSeed());
    const r = await runLog({ dbPath, status: "aborted" });
    expect(r.items.map((it) => it.capture.status)).toEqual(["aborted"]);
  });

  test("filters by source", async () => {
    await seedCaptures(defaultSeed());
    const r = await runLog({ dbPath, source: "claude-code:ctx-mirror" });
    expect(r.items.map((it) => it.capture.raw_text)).toEqual([
      "gamma latest mihai",
    ]);
  });

  test("filters by since/until window", async () => {
    await seedCaptures(defaultSeed());
    const r = await runLog({
      dbPath,
      since: "2026-05-12T00:00:00.000Z",
      until: "2026-05-18T00:00:00.000Z",
    });
    expect(r.items.map((it) => it.capture.raw_text)).toEqual([
      "beta middle Razvan",
    ]);
  });

  test("--search runs FTS5 over raw_text", async () => {
    await seedCaptures(defaultSeed());
    const r = await runLog({ dbPath, fts: "razvan" });
    expect(r.items.map((it) => it.capture.raw_text)).toEqual([
      "beta middle Razvan",
    ]);
  });
});

describe("runLog — provenance hydration", () => {
  test("processed capture surfaces its entities and links", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const cap = await store.recordCapture(
      { raw_text: "Mihai a luat 9.50 la simulare" },
      ACTOR,
    );
    const person = await store.createEntity(
      {
        type: "person",
        title: "Mihai",
        attrs: { relation: "son", importance: "high" },
      },
      ACTOR,
    );
    const event = await store.createEntity(
      { type: "event", title: "9.50 simulare", attrs: {} },
      ACTOR,
    );
    const link = await store.createLink(
      { src_id: person.id, dst_id: event.id, relation: "subject-of" },
      ACTOR,
    );
    await store.linkCaptureToEntity(cap.id, person.id);
    await store.linkCaptureToEntity(cap.id, event.id);
    await store.linkCaptureToLink(cap.id, link.id);
    await store.updateCaptureStatus(cap.id, "processed", ACTOR, {
      entity_count: 2,
      link_count: 1,
    });
    store.close();

    const r = await runLog({ dbPath });
    expect(r.items).toHaveLength(1);
    const it = r.items[0]!;
    expect(it.entities.map((e) => e.title).sort()).toEqual([
      "9.50 simulare",
      "Mihai",
    ]);
    expect(it.links).toHaveLength(1);
    expect(it.links[0]!.relation).toBe("subject-of");
    expect(it.links[0]!.src_title).toBe("Mihai");
    expect(it.links[0]!.dst_title).toBe("9.50 simulare");
  });
});

describe("runLog — capture prefix lookup", () => {
  test("unique prefix resolves to expanded mode", async () => {
    await seedCaptures(defaultSeed());
    const r = await runLog({ dbPath, capture: "01CAPALPHA" });
    expect(r.mode).toBe("expanded");
    expect(r.items).toHaveLength(1);
    expect(r.items[0]!.capture.raw_text).toBe("alpha first capture");
  });

  test("ambiguous prefix returns candidates", async () => {
    await seedCaptures(defaultSeed());
    const r = await runLog({ dbPath, capture: "01CAP" });
    expect(r.mode).toBe("ambiguous");
    expect(r.items.length).toBeGreaterThanOrEqual(2);
    expect(r.prefix).toBe("01CAP");
  });

  test("missing prefix returns empty list with prefix echoed", async () => {
    await seedCaptures(defaultSeed());
    const r = await runLog({ dbPath, capture: "01ZZZ" });
    expect(r.mode).toBe("list");
    expect(r.items).toEqual([]);
    expect(r.prefix).toBe("01ZZZ");
  });
});

describe("ctx log entry script", () => {
  const CTX = join(import.meta.dir, "..", "src", "ctx.ts");

  async function run(args: string[]): Promise<{
    exitCode: number;
    stdout: string;
    stderr: string;
  }> {
    const proc = Bun.spawn(["bun", "run", CTX, ...args, "--db", dbPath], {
      stdout: "pipe",
      stderr: "pipe",
    });
    const exitCode = await proc.exited;
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();
    return { exitCode, stdout, stderr };
  }

  test("`ctx log` on empty store prints empty notice", async () => {
    const r = await run(["log"]);
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain("No captures yet");
  });

  test("`ctx log` default formats raw_text per capture", async () => {
    await seedCaptures(defaultSeed());
    const r = await run(["log"]);
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain("gamma latest mihai");
    expect(r.stdout).toContain("alpha first capture");
    expect(r.stdout).toContain("[aborted]");
  });

  test("`ctx log --search` filters via FTS5", async () => {
    await seedCaptures(defaultSeed());
    const r = await run(["log", "--search", "razvan"]);
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain("beta middle Razvan");
    expect(r.stdout).not.toContain("alpha first");
  });

  test("`ctx log --capture <prefix>` expands with provenance", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const cap = await store.recordCapture(
      { raw_text: "Mihai 9.50 simulare" },
      ACTOR,
    );
    const person = await store.createEntity(
      {
        type: "person",
        title: "Mihai",
        attrs: { relation: "son", importance: "high" },
      },
      ACTOR,
    );
    await store.linkCaptureToEntity(cap.id, person.id);
    await store.updateCaptureStatus(cap.id, "processed", ACTOR, {
      entity_count: 1,
    });
    store.close();

    const r = await run(["log", "--capture", cap.id.slice(0, 12)]);
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain(`Capture #${cap.id}`);
    expect(r.stdout).toContain("Raw input:");
    expect(r.stdout).toContain("Mihai 9.50 simulare");
    expect(r.stdout).toContain("Produced:");
    expect(r.stdout).toContain('"Mihai"');
  });

  test("`ctx log --export markdown` emits a markdown journal", async () => {
    await seedCaptures(defaultSeed());
    const r = await run(["log", "--export", "markdown"]);
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain("# Capture journal");
    expect(r.stdout).toContain("## 2026-05-20");
    expect(r.stdout).toContain("> gamma latest mihai");
    expect(r.stdout).toContain("**Status:** processed");
  });

  test("`ctx log --since=7d` accepts relative tokens", async () => {
    const store = await openStore({ url: `file:${dbPath}` });
    const recent = new Date(Date.now() - 86_400_000).toISOString();
    const old = new Date(Date.now() - 30 * 86_400_000).toISOString();
    await store.client.execute({
      sql: `INSERT INTO captures (id, occurred_at, raw_text, source, actor, scope, status)
            VALUES (?, ?, ?, 'claude-code:ctx-add', ?, 'general', 'pending')`,
      args: ["01CAPRECENT000000000000000", recent, "fresh thought", ACTOR],
    });
    await store.client.execute({
      sql: `INSERT INTO captures (id, occurred_at, raw_text, source, actor, scope, status)
            VALUES (?, ?, ?, 'claude-code:ctx-add', ?, 'general', 'pending')`,
      args: [
        "01CAPOLD0000000000000000000".slice(0, 26),
        old,
        "ancient thought",
        ACTOR,
      ],
    });
    store.close();

    const r = await run(["log", "--since", "7d"]);
    expect(r.exitCode).toBe(0);
    expect(r.stdout).toContain("fresh thought");
    expect(r.stdout).not.toContain("ancient thought");
  });

  test("`ctx log --status invalid` exits 1", async () => {
    const r = await run(["log", "--status", "nope"]);
    expect(r.exitCode).toBe(1);
    expect(r.stderr).toContain("--status");
  });

  test("`ctx log --since garbage` exits 1", async () => {
    const r = await run(["log", "--since", "not-a-date"]);
    expect(r.exitCode).toBe(1);
    expect(r.stderr).toContain("cannot parse date");
  });
});
