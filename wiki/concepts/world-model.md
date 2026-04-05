---
title: "World Model — Company Memory as Competitive Advantage"
type: concept
category: technical-playbook
sources: [eric-siu-world-intelligence]
entities: [single-brain, single-grain, block-inc]
related: [data-compounding-moat, ai-native-org-design, agent-fleet-architecture, compounding-games]
maturity: developing
confidence: high
contradictions: []
applications: []
---

# World Model — Company Memory as Competitive Advantage

The data structure that lets AI understand your specific business. Not the model — the context layer. Layer 2 of the [[ai-native-org-design]] framework.

## What It Is

A unified, continuously updated representation of everything the company knows. All agents query the same world model. No department silos, no information that lives only in someone's head.

## Implementation Spectrum

| Approach | Example | Complexity | Compounding Speed |
|----------|---------|------------|-------------------|
| Vector DB (real-time) | [[single-brain]] — ingests every 15 min | High | Fast |
| Structured wiki | Faber — markdown pages, cross-referenced | Medium | Moderate |
| RAG pipeline | Ad-hoc retrieval from document store | Low | Slow |

All approaches work. The key is continuous ingestion and cross-referencing. A world model that isn't fed regularly doesn't compound.

## Why It's Hard

- Takes months to accumulate useful data
- Data quality matters more than quantity
- Cross-referencing is where the value lives (connections, not just storage)
- Security/permissioning gets complex fast (who sees what)

## Why It Matters

The world model is what turns generic AI into YOUR AI. Without it, every agent conversation starts from zero. With it, every agent already knows your business context, past decisions, and current state.

This is why [[data-compounding-moat]] works — the world model can't be fast-forwarded. A competitor can copy your tech but not your months of accumulated context.

## Faber as World Model

Faber wiki is Alteramens' world model. Different implementation (structured markdown vs vector DB) but same principle:
- Sources ingested once, cross-referenced permanently
- Knowledge compounds with every addition
- Agents can query accumulated knowledge
- Contradictions are flagged, not hidden

The wiki approach trades real-time freshness for better structure and human readability. For a small operation, this is the right tradeoff.
