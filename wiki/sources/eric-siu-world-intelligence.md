---
title: "How to Practically Deploy Jack Dorsey's 'World Intelligence' Today"
type: source
format: thread
origin: web
source_ref: "https://x.com/ericosiu/status/2040543007716553088"
ingested: 2026-04-05
guided: true
entities: [eric-siu, jack-dorsey, single-grain, block-inc, single-brain]
concepts: [ai-native-org-design, world-model, agent-fleet-architecture, data-compounding-moat, dri-with-agents, internal-to-product, skill-era, leverage, compounding-games, encoded-judgment]
key_claims:
  - "Single Grain has run an AI-native org for 4 months with 50+ daily automated workflows"
  - "Moving from cloud APIs to local inference cuts costs by roughly 70%"
  - "Month 1 was terrible; month 3 the flywheel started turning"
  - "Proprietary data accumulation is the real moat — it can't be fast-forwarded"
  - "Most companies will nod at the theory and do nothing — the gap is the business opportunity"
  - "One agent almost emailed a client's financial data to the wrong contact"
  - "Fewer, more capable agents replacing many specialized ones as models improve"
confidence: high
---

# How to Practically Deploy Jack Dorsey's 'World Intelligence' Today

Eric Siu's implementation report on running an AI-native company, mapping Jack Dorsey & Roelof Botha's "From Hierarchy to Intelligence" essay (April 1, 2026) to real operations at Single Grain over 4 months.

## Context

Dorsey and Botha published a framework for AI-native organizations that got 5M views in 48 hours. Eric Siu's agency had already been building a version since late December 2025. This post bridges theory and practice.

## The 4-Layer Framework (Dorsey/Botha)

1. **Capabilities** — Raw AI tools. Models crossed a threshold (late 2024) where they could hold enough context to understand a business.
2. **World Model** — Company's living memory. A unified data structure that lets AI understand the specific business.
3. **Intelligence Layer** — The decision-making system. Fleet of agents that compose actions dynamically.
4. **Surfaces** — Where humans interact. Agents meet you where you already work (Slack, dashboards), not separate platforms.

## Single Grain's Implementation

**Hardware stack:** Mac Mini M4 (CEO agent + crons), DGX Spark GB10 (local inference, team agents, vector DB), Mac Studio Ultra (client agent fleets, overflow). Local inference cuts costs ~70% vs cloud APIs.

**Single Brain:** Unified vector DB ingesting all company data every 15 minutes — Slack, CRM, Gong transcripts, GA4, GSC, docs, financials. Every agent queries the same brain.

**Agent fleet:** Alfred (CEO ops), Arrow (sales), Oracle (SEO), Flash (content), Cyborg (recruiting). World Agent coordinates across all. AutoResearch + AutoGrowth run continuously.

**Org structure shift:** Traditional hierarchy (CEO → C-suite → VPs → leads → ICs) replaced by CEO → World Agent → specialized agents + DRI teams + human specialists.

## Key Learnings

**Compounding curve:** Month 1 = terrible (hallucinations, broken automations, more time fixing than saving). Month 2 = slightly better (first useful pattern discoveries). Month 3 = flywheel starts (three months of data makes everything better). Month 4+ = different company entirely.

**Agent coordination is hard:** Agents conflict — sales promises timelines that SEO data says can't be hit. Content creates work from deprioritized keywords. Scheduling collisions. Required building conflict resolution, security (NemoClaw for kernel-level sandboxing), and multi-tier permissioning.

**Consolidation trend:** Moving from many specialized agents to fewer, more capable ones. Models good enough now that one agent with the right context replaces multiple specialists.

**The moat is boring:** Proprietary data accumulation can't be fast-forwarded. Competitors can copy the tech but not the months of compounded data and learnings.

## The Business Model Insight

The internal AI operating system becomes a product. Internal implementation → proven system → deploy for clients who want the same OS without months of building. The agency model transforms: sell the intelligence layer, services come with it. Mistakes and learnings ARE the differentiation.

## The Uncomfortable Truth

Most companies won't build this because: org change is too threatening, upfront investment is real, first months feel like going backwards, need someone willing to let agents make mistakes with real data, middle managers actively resist (the essay describes eliminating their role).

The companies that do will operate at fundamentally different speed — not 10% faster, but a different game entirely.

## Connections to Alteramens Thinking

- **[[skill-era]]**: Single Grain exemplifies the shift — small team, massive leverage through agent invocations, expertise as infrastructure
- **[[compounding-games]]**: Data compounding = don't interrupt the process. Month 1 pain is the cost of entry.
- **[[encoded-judgment]]**: Each agent encodes business judgment, not just functions. Oracle doesn't just fetch keywords — she knows what good SEO looks like for this company.
- **[[leverage]]**: Local hardware + AI agents = permissionless leverage at scale. No permission needed to deploy.
- **[[internal-to-product]]**: Direct parallel to Alteramens — build internally, prove it works, then sell the system.
