// Build an McpServer wired to a given Store. Exported as a factory so tests
// can construct it with a temp store and (optionally) drive it via the SDK's
// in-memory transport.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { Store } from "@pca/core";
import {
  HandlerError,
  confirmEntity,
  getNeighbors,
  getRelevantContext,
  getSelfSummary,
  invalidateLink,
  linkEntities,
  listActive,
  listCaptures,
  recordCapture,
  recordObservation,
  updateCaptureStatus,
  updateEntity,
} from "./handlers.ts";
import {
  TOOL_DESCRIPTIONS,
  confirmEntityShape,
  getNeighborsShape,
  getRelevantContextShape,
  getSelfSummaryShape,
  invalidateLinkShape,
  linkEntitiesShape,
  listActiveShape,
  listCapturesShape,
  recordCaptureShape,
  recordObservationShape,
  updateCaptureStatusShape,
  updateEntityShape,
} from "./tool-defs.ts";

const SERVER_NAME = "pca";
const SERVER_VERSION = "0.0.1";

export type BuildServerOptions = {
  store: Store;
  actor?: string;
};

export function buildServer({ store, actor }: BuildServerOptions): McpServer {
  const writer = actor ?? "mcp:unknown";
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });

  server.registerTool(
    "get_self_summary",
    {
      description: TOOL_DESCRIPTIONS.get_self_summary,
      inputSchema: getSelfSummaryShape,
    },
    (input) => wrap(() => getSelfSummary(store, input)),
  );

  server.registerTool(
    "get_relevant_context",
    {
      description: TOOL_DESCRIPTIONS.get_relevant_context,
      inputSchema: getRelevantContextShape,
    },
    (input) => wrap(() => getRelevantContext(store, input)),
  );

  server.registerTool(
    "record_observation",
    {
      description: TOOL_DESCRIPTIONS.record_observation,
      inputSchema: recordObservationShape,
    },
    (input) => wrap(() => recordObservation(store, input, writer)),
  );

  server.registerTool(
    "update_entity",
    {
      description: TOOL_DESCRIPTIONS.update_entity,
      inputSchema: updateEntityShape,
    },
    (input) => wrap(() => updateEntity(store, input, writer)),
  );

  server.registerTool(
    "confirm_entity",
    {
      description: TOOL_DESCRIPTIONS.confirm_entity,
      inputSchema: confirmEntityShape,
    },
    (input) => wrap(() => confirmEntity(store, input, writer)),
  );

  server.registerTool(
    "list_active",
    {
      description: TOOL_DESCRIPTIONS.list_active,
      inputSchema: listActiveShape,
    },
    (input) => wrap(() => listActive(store, input)),
  );

  server.registerTool(
    "link_entities",
    {
      description: TOOL_DESCRIPTIONS.link_entities,
      inputSchema: linkEntitiesShape,
    },
    (input) => wrap(() => linkEntities(store, input, writer)),
  );

  server.registerTool(
    "get_neighbors",
    {
      description: TOOL_DESCRIPTIONS.get_neighbors,
      inputSchema: getNeighborsShape,
    },
    (input) => wrap(() => getNeighbors(store, input)),
  );

  server.registerTool(
    "invalidate_link",
    {
      description: TOOL_DESCRIPTIONS.invalidate_link,
      inputSchema: invalidateLinkShape,
    },
    (input) => wrap(() => invalidateLink(store, input, writer)),
  );

  server.registerTool(
    "record_capture",
    {
      description: TOOL_DESCRIPTIONS.record_capture,
      inputSchema: recordCaptureShape,
    },
    (input) => wrap(() => recordCapture(store, input, writer)),
  );

  server.registerTool(
    "update_capture_status",
    {
      description: TOOL_DESCRIPTIONS.update_capture_status,
      inputSchema: updateCaptureStatusShape,
    },
    (input) =>
      wrap(() =>
        updateCaptureStatus(
          store,
          input as Parameters<typeof updateCaptureStatus>[1],
          writer,
        ),
      ),
  );

  server.registerTool(
    "list_captures",
    {
      description: TOOL_DESCRIPTIONS.list_captures,
      inputSchema: listCapturesShape,
    },
    (input) =>
      wrap(() =>
        listCaptures(store, input as Parameters<typeof listCaptures>[1]),
      ),
  );

  return server;
}

// Envelope all handler results into MCP's { content, structuredContent, isError? }
// shape. Errors caught here so the client sees a tool error rather than a
// transport error.
function wrap<T>(fn: () => T): {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
} {
  try {
    const result = fn();
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  } catch (e) {
    const message =
      e instanceof HandlerError
        ? `${e.code}: ${e.message}`
        : e instanceof Error
          ? e.message
          : String(e);
    return {
      content: [{ type: "text", text: message }],
      isError: true,
    };
  }
}
