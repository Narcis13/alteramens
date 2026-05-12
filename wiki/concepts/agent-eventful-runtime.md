---
title: "Agent as Eventful Runtime"
type: concept
category: technical-playbook
sources: [kanwas-competitive-teardown]
entities: [kanwas, alteramens]
related: [executable-wiki, encoded-judgment, context-aware-interrupt]
maturity: seed
confidence: high
contradictions: []
applications:
  - "[[wiki/syntheses/kanwas-vs-faber-analysis|Kanwas vs Faber analysis]]"
alignment:
  - pillar: ai-agents-for-solo-builders
    relation: reinforces
    source_event: "2026-05-08 ingest | Kanwas Competitive Teardown"
---

# Agent as Eventful Runtime

The architectural pattern where an AI agent is implemented **not as a single API call** (request → completion) but as a **lifecycle of streamed events** visible to all collaborators in real time: intake → context loading → tool-capable reasoning → streaming event publication → finalization.

## Source

Term lifted directly from [[kanwas]]' `docs/SYSTEM_OVERVIEW.md`: *"agent operates as an eventful runtime, not a single API call."* Crucial design choice — *"agent actions are streamed as user-visible events and merged into the same workspace graph."*

## The Pattern

| Stage | What happens | Why visible |
|---|---|---|
| **Intake** | Agent receives invocation, parses scope | User sees "agent is starting" |
| **Context loading** | Agent pulls relevant workspace structure before reasoning | User sees what the agent is reading |
| **Tool-capable reasoning** | Agent thinks + chooses tools | User sees thought tokens (optional) + tool selections |
| **Streaming event publication** | Each tool call emits an event into the shared timeline | User sees actions in real time, can interrupt |
| **Finalization** | Agent commits results back into workspace graph | User sees the diff |

Contrast with the **monolithic API call** pattern: user submits prompt, waits in a spinner, receives a single completion. Failure modes are opaque (no visibility into what went wrong); collaboration is impossible (no peer can intervene); trust is binary (either the output is good or it isn't).

## Why It Matters for Faber

Faber's current agent surface is `log.md` — append-only text generated *after* operations complete. Useful for retrospection, but **post-hoc, not live**. The eventful-runtime pattern would mean:

- Tool calls emit events into a stream as they execute, not summary lines after
- A web UI (or terminal TUI) renders the stream live
- Other observers (a coach, a future agent, a user on another device) can watch the agent work
- Interrupts become possible mid-execution rather than only after

Implementation path that's compatible with Faber's local-first philosophy:

1. v0 — Skills emit structured stdout markers (`[FABER:tool:start] ...` / `[FABER:tool:end] ...`) during execution; a local viewer tail-fs the markers
2. v1 — Stream goes into `log_events` *as it happens*, not just on completion; SQL queries can `SELECT WHERE status='running'`
3. v2 — Web UI renders the stream from `faber.db` live; remote observers (with permission) can watch

## Tension with Faber's Current Topology

Faber's `log.md` is **append-only and post-hoc by design** — it's the durable historical record. Live event streaming requires a *separate* layer: ephemeral by default, persisted by demand. This is closer to a CRDT (see [[crdt-shared-execution-substrate]]) than to a markdown log.

The pragmatic call: **don't conflate the layers**. Keep `log.md` as the durable historical layer. Add an `events.jsonl` (or SQLite event table with TTL) for the live runtime layer. The two are complementary, not competing.

## Connection to Other Concepts

- [[executable-wiki]] — Faber's existing observability layer (post-hoc); the eventful-runtime pattern extends it into live
- [[encoded-judgment]] — what the agent applies during reasoning; eventful runtime makes the application visible step by step
- [[context-aware-interrupt]] — intervention pattern enabled by streaming visibility
- [[crdt-shared-execution-substrate]] — the substrate eventful-runtime usually rides on (Kanwas uses Yjs); Faber would need an analogue
