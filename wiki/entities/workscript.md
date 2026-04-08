---
title: "WorkScript — JSON Workflow Engine"
type: entity
category: tool
aliases: [WorkScript, workscript]
first_seen: workscript-decisions
sources: [workscript-decisions, nbrain-concept]
related_entities: [nbrain, alteramens]
related_concepts: [validate-before-build]
vault_refs: ["projects/workscript/decisions.md", "workshop/drafts/agentic-business-platform.md"]
status: active
---

# WorkScript — JSON Workflow Engine

Foundation for the [[nbrain]] agentic business platform. A JSON workflow engine that executes automations.

## Current State

- Engine ~75% ready
- Demo UI functional
- Workflow execution and automation configuration work
- Tech: Bun, TypeScript (85%), monorepo, PM2 orchestration

## Strategic Decisions

Three key decisions (Jan 2026):
1. **No migrations until validation** — SQLite stays, frontend stays, mobile deferred
2. **Romania-first** — Niche: accountant-entrepreneur collaboration
3. **Conversational AI** — Primary differentiator over rigid forms

## Missing for Business MVP

- Plugin system (API-specific integrations)
- Invoice integration
- Account import
- Conversational interface (Anthropic Agent SDK)

## Principle

> "Don't migrate until the market says so. Migrations are comfortable code vs uncomfortable selling."
