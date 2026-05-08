---
title: "CRDT-First Shared Execution Substrate"
type: concept
category: technical-playbook
sources: [kanwas-competitive-teardown]
entities: [kanwas, alteramens]
related: [agent-eventful-runtime, executable-wiki]
maturity: seed
confidence: high
contradictions: []
applications:
  - "[[wiki/syntheses/kanwas-vs-faber-analysis|Kanwas vs Faber analysis]]"
---

# CRDT-First Shared Execution Substrate

The architectural pattern where a multi-actor system (humans + agents) treats a **CRDT-backed shared graph as canonical state**, with all other layers (UI views, agent execenv, filesystem mirror) as projections or consumers of that canonical state.

## Source

[[kanwas]]' `docs/SYSTEM_OVERVIEW.md` describes a *"CRDT-first + filesystem mirror"* design with three layers:

1. **CRDT canonical state** — workspace graph using Yjs for conflict-free merges; this is authoritative
2. **Real-time UI projections** — live views derived from canonical state
3. **Isolated agent execenv** — sandboxed shell/file/subagent runtime, reads from and writes back to CRDT

Four state classes evolve independently and connect through event streams:

- **Collaborative** — workspace graph, document content, board structure
- **Operational** — agent invocation lifecycle, tool execution metadata
- **Navigation** — UI context (active canvas, selections)
- **Identity / access** — org / team / user / permission boundaries

## The Pattern

CRDT-first means **conflict resolution is built into the data model**, not bolted on by application logic. Two consequences:

1. **Concurrent editing is the default**, not an edge case. Two humans editing the same doc, or a human + agent operating on the same board, merge automatically without a central coordinator.
2. **Optimistic local mutations** — every actor (UI client, CLI, agent) can write locally and rely on the CRDT to reconcile.

Filesystem mirror means **markdown files are a derived projection**, not the source of truth. The CRDT graph generates the files; edits to files re-enter the CRDT via sync. This is *opposite* of Faber's design (markdown-is-truth, SQLite-is-derived).

## The Tradeoff Faber Explicitly Made

Faber's current architecture chooses **markdown source-of-truth + SQLite derived index**. Pros:
- Files are diffable in git (CRDT state isn't human-readable)
- No CRDT runtime dependency (no Yjs server, no operational complexity)
- Portable: delete the DB, regenerate; or fork the markdown into another tool entirely
- Single-actor optimization (the most common Faber use case)

Cons (revealed by comparison with Kanwas):
- No native multiplayer — concurrent edits would race
- Agent edits and human edits conflict if both are in flight
- Cannot easily sync across devices in real time
- Cannot stream agent operations into a shared live view

## When CRDT Substrate Becomes Necessary

The current Faber design holds for **single-actor + asynchronous-collaboration** use cases. It breaks for:

- Two devices with the same vault open simultaneously
- A user + a remote coach watching the same wiki live
- Multi-agent operations where two skills run concurrently against the same pages

If Faber adds any of these (especially as part of the hosted Faber.app v2 plan), a CRDT layer becomes necessary. The pragmatic path:

1. **Keep markdown as the durable / portable layer** — Faber's distinguishing feature
2. **Add a CRDT layer for the *active editing window*** — live changes flow through the CRDT; on quiescence, snapshot back to markdown
3. **Markdown becomes the "rest state"; CRDT is the "active state"**

This is similar to how Notion handles its block tree (CRDT-like internally, exportable to markdown), or how Tana / Logseq handle live edits.

## Connection to Other Concepts

- [[agent-eventful-runtime]] — the runtime layer that typically rides on a CRDT substrate
- [[executable-wiki]] — Faber's current substrate (markdown-first); the CRDT pattern is what would be added for live multi-actor
