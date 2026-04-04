---
title: "WorkScript Decision Log — Strategic Choices"
type: source
format: article
origin: vault
source_ref: "projects/workscript/decisions.md"
ingested: 2026-04-05
guided: false
entities: [workscript, nbrain]
concepts: [validate-before-build, conversational-interface]
key_claims:
  - "All technical migrations delayed until after validation with real clients"
  - "Focus Romania, niche: accountant-entrepreneur collaboration for SMEs"
  - "Conversational AI interface is the primary differentiator"
  - "Building in a vacuum (0 conversations with potential clients) is a red flag"
  - "Migrations are 'comfortable code' vs 'uncomfortable selling'"
confidence: high
---

# WorkScript Decision Log

Three foundational decisions made on 2026-01-17. Source: [[projects/workscript/decisions|Decision log]].

## Decision 1: Validate Before Migrating

**Context:** Engine 75% ready, plans to migrate to PostgreSQL, NextJS, React Native.
**Decision:** Delay ALL technical migrations until after client validation.
**Why:** Building in a vacuum. Zero client conversations. Migrations = comfortable code vs uncomfortable selling. Current engine sufficient for Wizard of Oz demo.

## Decision 2: Romania, Accountant-Entrepreneur Niche

**Context:** Global vs Romania vs hybrid market choice.
**Decision:** Focus Romania. Niche: accountant-entrepreneur SME collaboration.
**Why:** Wife = accounting expert with 20 clients. 10yr accounting background. Deep understanding of both sides. Local trust factor.

## Decision 3: Conversational Interface as Differentiator

**Context:** Existing software = rigid forms, preset reports.
**Decision:** AI conversational interface is the primary differentiator.
**Why:** Paradigm shift with AI. SMEs don't want complex software. Natural language > forms. Anthropic Agent SDK available.
