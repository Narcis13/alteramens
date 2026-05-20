// End-to-end SDK test: drive the McpServer over InMemoryTransport with a real
// MCP Client, verify tool registration + happy path + error envelope.
import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { withTempStore } from "../../core/tests/helpers.ts";
import { type Store } from "@pca/core";
import { buildServer } from "../src/server.ts";

let store: Store;
let cleanup: () => void;
let client: Client;
let disconnect: () => Promise<void>;

beforeEach(async () => {
  const t = withTempStore();
  store = t.store;
  cleanup = t.cleanup;

  const server = buildServer({ store, actor: "test" });
  const [clientTr, serverTr] = InMemoryTransport.createLinkedPair();

  client = new Client({ name: "test-client", version: "0.0.0" });
  await Promise.all([client.connect(clientTr), server.connect(serverTr)]);

  disconnect = async () => {
    await client.close();
    await server.close();
  };
});

afterEach(async () => {
  await disconnect();
  cleanup();
});

describe("MCP server (via InMemoryTransport)", () => {
  test("listTools advertises all 12 PCA tools with descriptions", async () => {
    const result = await client.listTools();
    const names = result.tools.map((t) => t.name).sort();
    expect(names).toEqual(
      [
        "confirm_entity",
        "get_neighbors",
        "get_relevant_context",
        "get_self_summary",
        "invalidate_link",
        "link_entities",
        "list_active",
        "list_captures",
        "record_capture",
        "record_observation",
        "update_capture_status",
        "update_entity",
      ].sort(),
    );
    for (const t of result.tools) {
      expect(t.description).toBeString();
      expect(t.description!.length).toBeGreaterThan(40);
    }
  });

  test("record_observation → get_self_summary round-trip", async () => {
    const recordRes = await client.callTool({
      name: "record_observation",
      arguments: {
        text: "Ship PCA MVP",
        type: "goal",
        attrs: { timeframe: "short" },
      },
    });
    expect(recordRes.isError).toBeFalsy();
    const recordStructured = recordRes.structuredContent as {
      id: string;
      type: string;
      status: string;
    };
    expect(recordStructured.status).toBe("created");
    expect(recordStructured.type).toBe("goal");

    const summaryRes = await client.callTool({
      name: "get_self_summary",
      arguments: {},
    });
    expect(summaryRes.isError).toBeFalsy();
    const summary = summaryRes.structuredContent as {
      active_goals: Array<{ title: string }>;
    };
    expect(summary.active_goals.map((g) => g.title)).toEqual(["Ship PCA MVP"]);
  });

  test("invalid attrs returns tool error (isError=true), not transport error", async () => {
    const res = await client.callTool({
      name: "record_observation",
      arguments: {
        text: "x",
        type: "goal",
        attrs: { timeframe: "WRONG" },
      },
    });
    expect(res.isError).toBe(true);
    const content = res.content as Array<{ text: string }>;
    expect(content[0]!.text).toContain("BAD_ATTRS");
  });

  test("list_active over the wire", async () => {
    await client.callTool({
      name: "record_observation",
      arguments: {
        text: "Mihai",
        type: "person",
        attrs: { relation: "son", importance: "high" },
      },
    });
    const res = await client.callTool({
      name: "list_active",
      arguments: { type: "person" },
    });
    expect(res.isError).toBeFalsy();
    const r = res.structuredContent as {
      type: string;
      count: number;
      items: Array<{ title: string }>;
    };
    expect(r.type).toBe("person");
    expect(r.count).toBe(1);
    expect(r.items[0]!.title).toBe("Mihai");
  });

  test("confirm_entity flow over the wire", async () => {
    const c = await client.callTool({
      name: "record_observation",
      arguments: {
        text: "Quick goal",
        type: "goal",
        attrs: { timeframe: "short" },
      },
    });
    const id = (c.structuredContent as { id: string }).id;
    const inv = await client.callTool({
      name: "confirm_entity",
      arguments: { id, decision: "no-longer-true" },
    });
    expect(inv.isError).toBeFalsy();
    expect((inv.structuredContent as { outcome: string }).outcome).toBe(
      "invalidated",
    );
  });

  test("capture → record_observation(capture_id) → join visible in capture_entities", async () => {
    const cap = await client.callTool({
      name: "record_capture",
      arguments: { raw_text: "Ship PCA MVP" },
    });
    expect(cap.isError).toBeFalsy();
    const capture_id = (cap.structuredContent as { capture_id: string }).capture_id;

    const obs = await client.callTool({
      name: "record_observation",
      arguments: {
        text: "Ship PCA MVP",
        type: "goal",
        attrs: { timeframe: "short" },
        capture_id,
      },
    });
    expect(obs.isError).toBeFalsy();
    const entity_id = (obs.structuredContent as { id: string }).id;

    const rows = store.db
      .prepare(
        "SELECT capture_id, entity_id FROM capture_entities WHERE capture_id = ?",
      )
      .all(capture_id) as Array<{ capture_id: string; entity_id: string }>;
    expect(rows).toEqual([{ capture_id, entity_id }]);
  });

  test("record_observation rejects bogus capture_id with INVALID_CAPTURE", async () => {
    const res = await client.callTool({
      name: "record_observation",
      arguments: {
        text: "x",
        type: "goal",
        attrs: { timeframe: "short" },
        capture_id: "01ZZZZZZZZZZZZZZZZZZZZZZZZ",
      },
    });
    expect(res.isError).toBe(true);
    const content = res.content as Array<{ text: string }>;
    expect(content[0]!.text).toContain("INVALID_CAPTURE");
  });
});
