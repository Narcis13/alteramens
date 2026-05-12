---
title: "Kanwas"
type: entity
category: company
aliases: [Kanwas, kanwas.ai, kanwas-ai/kanwas, "@kanwas/cli"]
first_seen: kanwas-competitive-teardown
sources: [kanwas-competitive-teardown]
related_entities: [alteramens]
related_concepts: [context-graph-as-meme, open-core-day-one-distribution, agent-eventful-runtime, crdt-shared-execution-substrate, encoded-judgment, data-compounding-moat, distribution-over-product, executable-wiki]
vault_refs:
  - wiki/syntheses/kanwas-vs-faber-analysis.md
  - workshop/drafts/kanwas-juxtapunere.md
status: active
---

# Kanwas

**Kanwas** (kanwas.ai) is a multiplayer canvas + agent runtime for product teams, marketed as *"your team's context brain."* Open-source under Apache 2.0 at [github.com/kanwas-ai/kanwas](https://github.com/kanwas-ai/kanwas). Hosted SaaS at kanwas.ai. Public repo opened **2026-04-22**.

## Why It Matters Here

Kanwas is the **closest external manifestation of the Alteramens/Faber thesis** found to date. They market *"sharing context is the future"* as the same operating principle Faber operates under ([[encoded-judgment]] + [[data-compounding-moat]]). Where Faber targets the individual builder with strict typed schema and self-confrontation, Kanwas targets product teams with a free-form canvas and CRDT collaboration.

Strategic role: **simultaneously a thesis validator (their traction proves the meta-thesis sells) and a distribution-discipline benchmark (their public-repo + hosted-SaaS day-one playbook is what Faber declined when locking framework-vision in workshop/drafts on 2026-04-23)**.

## Tracțiune publică (2026-05-08 snapshot)

- Stars: 543
- Forks: 75
- Subscribers (watchers): 49
- Open issues: 4
- Created: 2026-04-22 (16 days ago)
- License: Apache 2.0
- Topics: `agents, canvas, collaboration, context-management`
- Default branch: `master`

## Stack & Components

| Layer | Tech |
|---|---|
| Language | TypeScript (98.8%) |
| Frontend | BlockNote (collaborative editor) |
| Backend | AdonisJS |
| Real-time sync | Yjs (CRDT) |
| Agent sandbox | `execenv/` (shell + files + subagents) |
| CLI | `@kanwas/cli` on npm — login/pull/push/import |
| Infra | Docker / docker-compose, pnpm monorepo workspace |

Repo layout: `frontend/`, `backend/`, `cli/`, `yjs-server/`, `execenv/`, `shared/`, `docs/SYSTEM_OVERVIEW.md`.

## Customers Showcased

Veed · Wix · Softpay · TheFork · Grammarly · Quanos. Highest-profile testimonial: **Samuel Beek (Schematik)** — closed **€4.6M pre-seed** using a pitch deck built collaboratively in Kanwas.

## Positioning Triangle

Kanwas explicitly positions against three product categories:

1. **vs Whiteboards** (FigJam, Miro): "Sessions die, context lives"
2. **vs Chat AI** (Claude, ChatGPT, Gemini): "Good for answers, bad for shared reasoning"
3. **vs Knowledge tools** (Obsidian, Cognee): "Storage but not thinking spaces"

Notably absent from their positioning: any reference to *individual* knowledge management or *self-confrontation*. This gap is the structural protection for Faber's wedge.

## Where Kanwas Is the Mirror Image of Faber

| Axis | Kanwas | Faber |
|---|---|---|
| User unit | Team | Individual |
| Identity layer | OAuth + permissions | Typed self schema (pillars/stances/commitments/constraints/voice) |
| Agent surface | Live timeline streamed into shared UI | `log.md` + temporal SQL views |
| Schema | Free-form BlockNote canvas | Strict types (source/entity/concept/synthesis + maturity) |
| Multiplayer | Native (Yjs CRDT) | Single-user |
| Distribution | Open repo + hosted SaaS day-one | Open repo planned, hosted optional, framework-vision in drafts |
| License | Apache 2.0 | TBD (MIT vs AGPL still open) |

## See Also

- [[kanwas-competitive-teardown]] — full source teardown
- [[wiki/syntheses/kanwas-vs-faber-analysis|Kanwas vs Faber synthesis]]
- [[alteramens]] — host project being measured against Kanwas
