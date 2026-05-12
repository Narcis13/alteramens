---
title: "Kanwas — Competitive Teardown (landing + repo + SYSTEM_OVERVIEW)"
type: source
format: article
origin: web
source_ref: "https://kanwas.ai/ + https://github.com/kanwas-ai/kanwas + docs/SYSTEM_OVERVIEW.md"
ingested: 2026-05-08
guided: true
entities: [kanwas, alteramens]
concepts: [context-graph-as-meme, open-core-day-one-distribution, agent-eventful-runtime, crdt-shared-execution-substrate, encoded-judgment, data-compounding-moat, distribution-over-product, executable-wiki]
key_claims:
  - "Kanwas markets 'sharing context is the future' as the same thesis Faber/Alteramens operates under (context = moat, not the model)"
  - "Public repo opened 2026-04-22 with substantial code; 543 stars + 75 forks + 49 subscribers in 16 days"
  - "Stack: TypeScript monorepo, BlockNote, AdonisJS, Yjs CRDT, Docker, pnpm. Components: frontend/, backend/, cli/ (@kanwas/cli on npm), yjs-server/, execenv/ (sandbox), shared/, docs/"
  - "Architecture explicitly described as 'collaborative execution substrate' with 3 layers: CRDT canonical state + UI projections + isolated agent execenv"
  - "4 state classes: collaborative / operational / navigation / identity — evolving independently and connected via event streams"
  - "Agent runs as 'eventful runtime, not a single API call' — tool calls stream into the same workspace timeline everyone sees"
  - "CLI (kanwas pull/push/import) provides bi-directional filesystem sync between local files and cloud workspace"
  - "Distribution: open repo + hosted SaaS at kanwas.ai, both day-one. Apache 2.0 license."
  - "Customer logos visible: Veed, Wix, Softpay, TheFork, Grammarly, Quanos. Testimonial: Schematik closed €4.6M pre-seed using Kanwas-built pitch deck."
  - "Identity layer = OAuth user record + org/team permissions. NO equivalent of Faber's wiki/self/ typed schema. NO equivalent of /faber-mirror confrontation loop."
  - "Canvas is BlockNote rich free-form (context emerges from layout). NO equivalent of Faber's strict typed source/entity/concept/synthesis schema with maturity states."
  - "Framework-vision for Faber was locked 2026-04-23 — one day after Kanwas opened public repo. Kanwas has 543 stars; Faber has zero public artifacts."
confidence: high
alignment:
  - pillar: skill-era-craftsmanship
    relation: reinforces
    source_event: "2026-05-08 ingest | Kanwas Competitive Teardown"
  - pillar: building-as-51yo-from-ro-public-hospital
    relation: reinforces
    source_event: "2026-05-08 ingest | Kanwas Competitive Teardown"
---

# Kanwas — Competitive Teardown (landing + repo + SYSTEM_OVERVIEW)

Consolidated source covering [[kanwas]] across three surfaces inspected on 2026-05-08:

1. **Landing page** — kanwas.ai (marketing positioning, target audience, taglines, customer logos, testimonial)
2. **GitHub repo** — github.com/kanwas-ai/kanwas (Apache 2.0, public 2026-04-22, 543⭐ in 16d, monorepo structure)
3. **docs/SYSTEM_OVERVIEW.md** — internal architecture document on master branch (state model, agent runtime, CRDT layer, execenv design)

This is a *competitive teardown*, not a Kanwas-authored source. Treat key_claims as observed product facts, not endorsed positions.

## What Kanwas Is

A multiplayer canvas + agent runtime targeting product teams (founders, PMs, devs, marketers, sales). Tagline: *"Your team's context brain — sharing context is the future."* Positioned against three categories simultaneously:

- **vs Whiteboards (FigJam, Miro)**: "Sessions die, context lives" — turns sessions into living shared context
- **vs Chat AI (Claude, ChatGPT)**: "Good for answers, bad for shared reasoning" — enables teams to "work the question through together"
- **vs Knowledge tools (Obsidian, Cognee)**: "Storage but not thinking spaces" — turns stored context into living boards

Core thesis (paraphrased from copy): models reason; context is the moat. Compound team context → "superhuman reasoning that reflects actual taste and judgment, not generic averages."

Customers showcased: Veed, Wix, Softpay, TheFork, Grammarly, Quanos. Highest-profile testimonial: Schematik founder Samuel Beek closed €4.6M pre-seed using a pitch deck built collaboratively in Kanwas.

## Stack & Architecture

TypeScript-dominant monorepo (pnpm workspace, 98.8% TS):

```
kanwas/
├── frontend/      # BlockNote-based collaborative editor
├── backend/       # AdonisJS API server
├── cli/           # @kanwas/cli on npm — `kanwas login/pull/push/import`
├── yjs-server/    # CRDT real-time collaboration
├── execenv/       # Sandboxed agent execution environment
├── shared/        # Common utilities
├── docs/          # SYSTEM_OVERVIEW.md + images
└── (Docker / .husky / .vscode / .github)
```

`docs/SYSTEM_OVERVIEW.md` describes the system as a *"collaborative execution substrate"* with three layers:

1. **CRDT canonical state** — workspace graph using Yjs for conflict-free merges; collaborative state is authoritative
2. **Real-time UI projections** — live views derived from canonical state
3. **Isolated agent execenv** — sandboxed shell + file + subagent runtime

Four state classes evolve independently and connect through event streams:

| State class | What it tracks |
|---|---|
| Collaborative | Workspace graph, document content, board structure |
| Operational | Agent invocation lifecycle, tool execution metadata |
| Navigation | UI context (active canvas, selections) |
| Identity / access | Org / team / user / permission boundaries |

Agent runtime is explicitly framed as an *"eventful runtime, not a single API call"*. Stages: intake → context loading → tool-capable reasoning → streaming event publication → finalization. Crucial design choice — *"agent actions are streamed as user-visible events and merged into the same workspace graph"* — no hidden background execution. This is the core observability claim.

CLI design: `kanwas init / login / pull / push / import` with browser-based OAuth. `pull` downloads workspace files to a local directory; user edits in their preferred editor; `push` syncs back. Bi-directional sync — *"filesystem changes map to workspace structures automatically, while workspace updates materialize back to files."*

Storage: markdown, git-backed, "your files are yours." Snapshots and version history form the persistent knowledge layer.

## Distribution Pattern

Open Apache 2.0 repo went public on **2026-04-22** with full code already present (frontend, backend, CLI, yjs-server, execenv, shared) — not a "vision README" pattern. In 16 days reached **543 stars / 75 forks / 49 subscribers / 4 open issues** with topics tagged `agents, canvas, collaboration, context-management`.

Hosted SaaS at kanwas.ai available day-one, free signup. Self-host via `docker-compose --profile app up`. Browser frontend at localhost:5173.

The pattern: **open-source day-one + hosted SaaS day-one + customer logos day-one**. No "build in public for 6 months before showing anything" — the public artifact and the commercial offering ship together.

## Where Kanwas and Faber Diverge

Compared against [[wiki/FABER]] schema and [[workshop/drafts/faber-framework-vision|Faber framework-vision]]:

**Kanwas does NOT have:**
- Self-as-data layer (`wiki/self/pillars.md`, stances, commitments, constraints, voice). Identity = OAuth user + permissions.
- Confrontation loop (no `/faber-mirror`, `/faber-meet` equivalent). No "AI confronts you with your declared stances vs evidence" pattern.
- Strict typed schema (BlockNote canvas is rich free-form; no source/entity/concept/synthesis taxonomy with maturity states).
- Skills as portable invocable units (Claude Code's SKILL.md format).

**Kanwas HAS, Faber does NOT:**
- Real-time multiplayer (Yjs CRDT)
- Visual canvas as primary navigation surface
- Web UI (browser-first; Faber is terminal + Obsidian only)
- Hosted version (kanwas.ai click-and-go vs "install Claude Code + Python")
- Sandboxed agent execenv
- Live agent timeline streaming into UI
- Org/team/user permission model
- Bi-directional CLI sync

## Strategic Implications for Faber

The full strategic synthesis is at [[wiki/syntheses/kanwas-vs-faber-analysis|Kanwas vs Faber synthesis]]. Headline points relevant to this source:

1. **Thesis validation, not threat** — 543⭐ in 16 days is empirical evidence the [[encoded-judgment]] + [[data-compounding-moat]] thesis has commercial pull *now*
2. **Faber's wedge holds** — self-as-data + confrontation is structurally hard for team-mode products to add (topology violation). Window estimate: 6-12 months of clear differentiation
3. **Faber's distribution is empirically behind** — Kanwas opened public repo on 2026-04-22, Faber locked vision on 2026-04-23 with zero public artifacts since. The `postpone-publishing` weakness is now confirmed in production
4. **P7 tension** — Kanwas evidence pushes "local-first, cloud-optional" toward "local-first, cloud-as-first-class" for any non-builder audience. Hosted Faber.app becomes inevitable v2 if soția-test demographic is in scope

## Cross-References

- [[kanwas]] — entity page (company / tool)
- [[wiki/syntheses/kanwas-vs-faber-analysis|Kanwas vs Faber synthesis]] — strategic analysis
- [[workshop/drafts/kanwas-juxtapunere|Workshop draft (RO)]] — raw exploratory notes
- [[workshop/drafts/faber-framework-vision|Faber framework-vision]] — locked SaaS plan being measured against Kanwas
- [[wiki/FABER|FABER schema]] — what Kanwas is being compared against
- [[encoded-judgment]], [[data-compounding-moat]], [[distribution-over-product]], [[executable-wiki]] — concepts this source reinforces
- New concepts: [[context-graph-as-meme]], [[open-core-day-one-distribution]], [[agent-eventful-runtime]], [[crdt-shared-execution-substrate]]
