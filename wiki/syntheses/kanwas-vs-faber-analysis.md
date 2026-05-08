---
title: "Kanwas vs Faber — Parallel Theses, Different Wedges, Shared Distribution Playbook"
type: synthesis
trigger: comparison
question: "Kanwas (just open-sourced, 543⭐ in 16 days) operates on the same context-as-moat thesis as Faber. Where does Faber's strategy already differentiate, where is it operationally behind, and what concretely should we copy versus protect?"
sources_consulted: [kanwas-competitive-teardown]
concepts_involved: [encoded-judgment, data-compounding-moat, distribution-over-product, executable-wiki, bounded-problem-wedge, skill-era, productize-yourself, leverage, context-graph-as-meme, open-core-day-one-distribution, agent-eventful-runtime, crdt-shared-execution-substrate]
entities_involved: [alteramens, kanwas]
created: 2026-05-08
updated: 2026-05-08
maturity: developing
alignment:
  - pillar: ai-agents-for-solo-builders
    relation: reinforces
    source_event: "2026-05-08 query → synthesis | Kanwas vs Faber"
  - pillar: skill-era-craftsmanship
    relation: reinforces
    source_event: "2026-05-08 query → synthesis | Kanwas vs Faber"
---

# Kanwas vs Faber — Parallel Theses, Different Wedges, Shared Distribution Playbook

## The Question

[Kanwas](https://kanwas.ai/) ([repo](https://github.com/kanwas-ai/kanwas), Apache 2.0, 543⭐ / 75 forks in 16 days) markets itself as *"your team's context brain — sharing context is the future."* That is, almost word for word, the operating thesis behind [[wiki/FABER]] and [[workshop/drafts/faber-framework-vision|the Faber distribution vision]] locked on 2026-04-23.

The synthesis question is not whether the two systems compete head-to-head — they don't. The question is:

1. **Where is Faber's wedge already protected** by design choices Kanwas cannot copy without rewriting?
2. **Where is Faber operationally behind** in ways that will throttle adoption if not addressed?
3. **What concretely should we steal** from Kanwas's playbook?

Audience: Narcis. Register: load-bearing for the SaaS go/no-go decision implied by [[workshop/drafts/faber-framework-vision]].

## What Kanwas Actually Is

A multiplayer canvas + agent runtime for product teams. TypeScript monorepo (BlockNote frontend, AdonisJS backend, **Yjs** for CRDT real-time sync, Docker, pnpm workspace). Monorepo layout: `frontend/`, `backend/`, `cli/` (`npm i -g @kanwas/cli`), `yjs-server/`, `execenv/` (sandboxed agent execution), `shared/`, `docs/SYSTEM_OVERVIEW.md`.

Architecture explicitly described as a *"collaborative execution substrate"* with three layers: CRDT canonical state, real-time UI projections, and an isolated agent execenv. Four state classes — collaborative / operational / navigation / identity — evolving independently and connected via event streams. Agent runs as an *"eventful runtime, not a single API call"*: tool calls stream into the same workspace timeline everyone sees. CLI (`kanwas pull/push/import`) provides bi-directional filesystem sync. Storage is markdown, git-backed, *"your files are yours"*.

Distribution: open repo on 2026-04-22, hosted at kanwas.ai, customer logos already include Veed, Wix, Softpay, TheFork, Grammarly, Quanos. One public testimonial: Schematik closed €4.6M pre-seed using a Kanwas-built pitch deck.

## Six-Frame Comparison

| Frame | Kanwas | Faber | Aligned? | Gap |
|---|---|---|---|---|
| **Core thesis** | "Models reason; context is the moat. Compound team context → superhuman reasoning." | [[encoded-judgment]] + [[data-compounding-moat]]: skills encode judgment, knowledge compounds via [[executable-wiki]]. | ✅ Identical | None at thesis level — **this is validation**, not threat |
| **Storage layer** | Markdown + git, no lock-in | Markdown source-of-truth, `faber.db` derived | ✅ Identical | None |
| **Agent surface** | Tool calls streamed live into shared timeline; sandbox `execenv/` | `log.md` append-only + `log_events` SQL views; agent runs in user's local Claude Code | ⚠️ Same intent, different topology | **Faber has no live observability UI** — log is post-hoc text only |
| **Identity layer** | OAuth user record + org/team permissions | `wiki/self/` typed schema (pillars/stances/commitments/constraints/voice) + confrontation loops (`/faber-mirror`, `/faber-meet`) | ❌ **Faber unique** | None — this is **Faber's #1 moat** |
| **Multiplayer** | Yjs CRDT, real-time co-edit, permissions, team boards | Single-player implicit | ❌ **Kanwas has, Faber doesn't** | TAM throttle — cannot target teams |
| **Distribution** | Open repo + hosted SaaS, both day-one | Open-source local-only (Claude Code + Python required) | ⚠️ Partial | **Hosted version absent** — non-builder audience inaccessible |

## Where Faber's Wedge Holds

Two structural protections Kanwas cannot easily copy:

### 1. Self-as-data + confrontation
Kanwas's identity layer is OAuth + permissions. It has no equivalent of `wiki/self/pillars.md`, `narcis-stances.md`, or `/faber-mirror` weekly confrontation. They cannot bolt this on without violating their own product topology — their value prop is *team alignment*, not *individual congruence*. The pattern *"AI confronts you with your own declared stances against the log of your actual behavior"* is, as far as I can find, **uncategorized in the market**. Mel Robbins-style journals come closest but lack structured data and agent-driven confrontation.

This is the Faber-specific manifestation of [[productize-yourself]] applied to a tool, not a person: encode the user's identity-as-data, then make the AI hold them to it.

### 2. Strict typed schema vs free-form canvas
Kanwas's BlockNote canvas is rich but free-form — context emerges from layout. Faber forces source/entity/concept/synthesis taxonomy with maturity states (seed→developing→mature→challenged) and explicit cross-references. Less sexy at demo time; **vastly more agent-queryable** at scale. Kanwas's "context graph" is a marketing term for an emergent property; Faber's [[executable-wiki]] is an actually queryable graph (FTS + temporal SQL views in 4.5 MB SQLite).

## Where Faber Is Behind (Operational Gap)

| Capability | Kanwas | Faber | Cost if Unfixed |
|---|---|---|---|
| Real-time multiplayer | Yjs CRDT | Single-user | TAM cap; cannot target teams |
| Visual canvas | Hub of the product | Terminal + Obsidian read-only | Onboarding friction; demos lack "wow" |
| Web UI | Browser-first | Absent | Filters out non-builders entirely |
| Hosted version | kanwas.ai click-and-go | "Install Claude Code + Python locally" | Wife-of-Narcis test fails on day 0 |
| Agent execenv | Sandboxed shell + files + subagents | User's local machine | Cannot run skills server-side |
| Live agent timeline | Stream into UI | Post-hoc `log.md` text | No live "agent at work" effect |
| Permission model | Org/team/user/access | Implicit single-user | No public read-only sharing of vaults |
| Bi-directional CLI sync | `kanwas pull/push` | Local-only | No multi-device, no cloud backup |

**Note**: P7 in [[workshop/drafts/faber-framework-vision]] declares *"local-first, cloud-optional."* Kanwas's evidence pushes toward re-reading P7 as *"local-first, **cloud-as-first-class**"* for any non-builder audience. The wizard-zip-Claude-Code path remains the right v1; a hosted Faber.app is an unavoidable v2 if the goal is reaching the soția-test demographic.

## Ten Things to Steal — Prioritized by Leverage/Effort

### Tier 1 — high leverage, ship inside 2 weeks

1. **Reframe marketing copy around "personal context graph + built-in confrontation."** Kanwas owns "context graph" as a meme; Faber's graph is technically richer (typed nodes, temporal layer, alignment to declared pillars) but underplayed. Steal the framing, not the content.
2. **Public showcase / "made with Faber" gallery.** Kanwas's customer logos work because they pre-empt skepticism. Equivalent for Faber at v1 launch: 3-5 read-only public vaults (Narcis's + early users'). Validates the "compound over time" claim with concrete artifacts.
3. **Open the repo public *now*, before code is ready.** Kanwas opened a public repo on 2026-04-22 with substantial code already; Faber can open the public repo with [[workshop/drafts/faber-framework-vision]] as the README and *zero code*. Locks in [[distribution-over-product]] discipline and converts the declared weakness (publishing-procrastination) into structural pressure.

### Tier 2 — high leverage, 1-2 months

4. **Agent timeline / event stream UI.** `log.md` + `log_events` + `v_recent_activity` views are exactly the raw material. A minimal static-HTML page generated by `/faber-status` showing the live ingest/lint/mirror stream makes Faber observable in a way the current terminal-only UX hides.
5. **CLI bi-directional sync (`faber pull/push`).** Kanwas validates the pattern: `npm i -g @faber/cli` + auth + sync. For SaaS Faber, this replaces "install Claude Code + Python locally" as the on-ramp. Zip-and-go is the wizard path; CLI sync is the post-zip continuity path.
6. **Visual canvas as read-only navigation layer (NOT a BlockNote rewrite).** Don't build a competitor editor. Build a `react-flow` view that reads `faber.db`: pages = nodes, wikilinks = arrows, self-pillars = anchored cards, log events = particles over time. v0 is a static page generated by a skill; v1 is interactive web.

### Tier 3 — strategic, 3+ months (post-v1)

7. **Hosted Faber.app with BYO API key.** Resolves the P7 contradiction: hosted UI + sync + execenv runs on Faber's infrastructure, but Anthropic API charges hit the user's own key. Wedges open the non-builder audience without violating local-first principles.
8. **Sandboxed agent execution environment.** Container per active vault, markdown mounted as volume, headless Claude Code. Cost of admission for hosted SaaS. Kanwas's `execenv/` is the reference architecture.
9. **CRDT/Yjs for shared boards as a *secondary* primitive.** Self-as-data is intrinsically personal — multiplayer would dilute the moat. But `wiki/shared/` opt-in folders synchronizable with a coach/therapist/co-founder open a use-case Kanwas explicitly cannot serve: *AI confronts the user, third party observes the log*. Zero competitors.
10. **Use-case pre-built vault templates.** Kanwas ships boards for founders/PMs/devs/marketers/sales. Faber's wizard already personalizes self/; the next step is shipping 3-5 full vault templates (Solopreneurs / Researchers / Therapists / Coaches / Indie hackers) with skills bundles + concept seeds + voice rule presets. Wizard becomes "pick role + 5 personalization questions" instead of 30 cold-start questions.

## Strategic Implications

### 1. Thesis validation, not thesis threat
Kanwas's 543 stars in 16 days is empirical evidence that the [[data-compounding-moat]] + [[encoded-judgment]] thesis has commercial pull *right now*. This is the strongest external signal Faber's framework-vision is correctly oriented. Treat it as proof, not pressure.

### 2. The wedge is real but time-boxed
Self-as-data + confrontation is genuinely uncategorized in the market and structurally hard for team-mode products to add. But "structurally hard" is not "impossible" — Kanwas could ship a `self-board` template in two sprints if a customer asks. Window estimate: **6-12 months of clear differentiation** before a serious competitor copies the pattern.

### 3. Publishing weakness just received empirical confirmation
[[workshop/drafts/faber-framework-vision]] was locked on 2026-04-23. Kanwas opened their public repo on 2026-04-22. In 16 days they accumulated 543 stars; Faber accumulated zero public artifacts. The declared weakness (`postpone-publishing` in [[wiki/self/narcis-stances|narcis-stances]]) is now confirmed in production: the cost of delay is measured in social proof Kanwas now has and Faber does not.

### 4. Faber positioning vs Kanwas (use Kanwas as ladder)
Kanwas is now a free pitch asset. Future Faber landing copy: *"Kanwas does this for product teams. Faber does it for the individual builder — typed schema, identity-as-data, AI confrontation built in. Same thesis, opposite end of the team-size axis."* Do not compete; **slot in the gap they leave open**.

## Concrete Next Actions

| Window | Action |
|---|---|
| This week | Public repo `github.com/narcis13/faber` with framework-vision as README, no code. Tease post on X. |
| Next 2 weeks | Rewrite the framework-vision one-liner to lead with "personal context graph + built-in confrontation." Compile 3-5 vault excerpts as "made with Faber" preview. |
| 6-7 weeks (per existing Faza 1-3 in framework-vision) | Wizard + zip + 12 core skills, alpha launch (June 2026). |
| Q3 2026 | CLI sync v0, agent timeline static HTML, marketplace skills v0. |
| Q4 2026 | Hosted Faber.app with BYO key, visual canvas read-only, use-case templates. |

## Open Questions Surfaced by This Comparison

1. **Does going hosted violate the philosophy?** P7 says no — cloud-optional has always been allowed. But "first-class hosted" means investing in execenv + sandbox + observability that local-only doesn't need. Decide before Faza 4.
2. **Should Faber open-source from day-one or after wizard ships?** Kanwas evidence suggests day-one is optimal. Counter-argument: Narcis is solo, support load could become a sink. Mitigation: open repo with framework-vision only (no code) buys time and credibility simultaneously.
3. **Does multiplayer come later or never?** If never, declare it explicitly in positioning — "Faber is intentionally single-player; for teams use Kanwas." Honesty as differentiation. If later, the `wiki/shared/` opt-in path is the cleanest topology that doesn't dilute the self-layer.

## Cross-References

- [[wiki/FABER]] — schema and conventions
- [[workshop/drafts/faber-framework-vision]] — locked SaaS vision (2026-04-23)
- [[workshop/drafts/kanwas-juxtapunere]] — raw exploratory draft (Romanian)
- [[alteramens]] — host project
- [[encoded-judgment]] — core thesis concept
- [[data-compounding-moat]] — strategic moat concept
- [[distribution-over-product]] — why public repo > polished product
- [[executable-wiki]] — Faber's structural advantage over Kanwas's free-form canvas
- [[bounded-problem-wedge]] — applies to "individual builder" carve-out
