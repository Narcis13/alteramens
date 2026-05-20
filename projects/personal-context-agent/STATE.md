---
title: Personal Context Agent — Current State & Path to SaaS
date: 2026-05-19
status: synthesis
generated_by: Claude Code (Opus 4.7, fan-out subagent analysis)
machine: laptop (post-pull from GitHub)
local_db: ~/.pca/store.db — schema present, 0 rows (fresh start)
---

# Personal Context Agent — State of the Union (2026-05-19)

> **One-line:** A local-first, agent-native context store for a single human. 12 typed entity layers + 12 canonical relations, persisted to SQLite, queried through 9 MCP tools, captured via a `/ctx-add` Claude Code skill. **Linking phases 1–3 just shipped.** Foundation is solid; the next step is *seeding* (validate the demo loop with real data) before any SaaS conversation.

---

## 1. TL;DR — What this is, today

PCA is **infrastructure that lets agents (Claude Code, future MCP clients) maintain a canonical, structural record of who you are, what you want, what blocks you, and who/what you depend on** — without you re-explaining it every session.

Three primitives compose the system:

| Primitive | What it does | Where it lives |
|---|---|---|
| **Entities** | 12 typed layers (self, place, goal, knowledge, person, resource, constraint, state, event, preference, stance, role) with TTL, authority, confidence, maturity | `~/.pca/store.db` |
| **Links** | 12 canonical typed relations between entities (`subgoal-of`, `motivated-by`, `requires`, `counters`, …), directed, validated, append-only invalidation | same DB |
| **Events** | Append-only audit log of every create/update/invalidate/confirm/link | same DB |

Three surfaces expose them:

| Surface | Purpose | Who calls it |
|---|---|---|
| **MCP server (9 tools)** | Programmatic read/write for agents | Claude Code via `mcp__pca__*` |
| **`/ctx-add` skill** | Free-text capture → 12-layer classification → persist | You, in Claude Code |
| **`pca` + `ctx` CLIs** | Setup, doctor, link hygiene review | You, in shell |

**Status of local store on this machine:** Schema migrated, 0 entities. Ready to seed.

---

## 2. Architecture Map (compact)

```
code/packages/
├── core/             — engine: SQLite schema, entity registry, link relations, store API
│   ├── src/schema/migrations/   0001_initial.sql, 0002_link_invalidate_op.sql
│   ├── src/types.ts             Entity, Link, EventRow, etc.
│   ├── src/entities/registry.ts 12 zod-validated attrs schemas + per-type TTL
│   ├── src/links/relations.ts   12 canonical relations, pair validation, cycle detection
│   └── src/store.ts             ~830 LOC; openStore, CRUD, search, neighbors, invalidation cascade
├── mcp-server/       — stdio MCP server wrapping core
│   ├── src/tool-defs.ts         zod input schemas for 9 tools
│   ├── src/handlers.ts          handler logic + computeKeyLinks
│   ├── src/server.ts            registration + error envelope
│   └── src/index.ts             startup: PCA_DB env, PCA_ACTOR env, stdio transport
├── cli/              — two binaries: `pca` (admin) and `ctx` (runtime)
│   ├── src/pca.ts + pca-commands/   init, doctor, install-mcp, install-skill, migrate-links
│   └── src/ctx.ts + ctx-commands/   review (--links, --fix)
└── skill-ctx-add/    — the SKILL.md that Claude Code loads on `/ctx-add`
    └── SKILL.md                 ~396-line behavioral contract (12-layer classifier)
```

**Runtime:** Bun + TypeScript. SQLite via `bun:sqlite`. MCP via `@modelcontextprotocol/sdk`. WAL mode, foreign keys ON, busy_timeout=5000.

**Persistence path:** `$PCA_DB` env or `~/.pca/store.db` (single file).

---

## 3. The 12-Layer Model — what's captured

All 12 layers are **implemented and live**. Each is a row in the `entities` table with a `type` enum and per-type `attrs` JSON validated by zod. Each has a `v_active_<layer>` SQL view that filters status='active' + unexpired.

| # | Layer | TTL default | Singleton? | Key attrs |
|---|-------|-------------|------------|-----------|
| 1 | `self` | never | **yes** (UNIQUE) | narrative, pillars[], voice_rules[] |
| 2 | `place` | never | no | kind (physical/digital/social) |
| 3 | `goal` | 90 days | no | timeframe (short/mid/long), parent_id (legacy), success_criteria |
| 4 | `knowledge` | never | no | domain, depth (novice/practitioner/expert) |
| 5 | `person` | never | no | relation, importance (high/med/low), tags |
| 6 | `resource` | 180 days | no | kind (tool/subscription/asset/access/budget), cost |
| 7 | `constraint` | 180 days | no | kind (time/ethical/legal/cognitive/capacity), hard/soft |
| 8 | `state` | 7 days | no | mood, energy, focus, stress, place_id |
| 9 | `event` | never | no | related_entity_ids[] |
| 10 | `preference` | never | no | register (voice/aesthetic/taste), strength (mild/strong) |
| 11 | `stance` | never | no | reason, evidence_sources[] |
| 12 | `role` | 180 days | no | schedule, domain (defensive/offensive/mixed/...), priority |

**Cross-cutting fields on every entity:** `status` (active/archived/invalidated), `authority` (self-declared/observed/inferred), `confidence` (low/med/high), `maturity` (provisional/working/load-bearing), `scope` (default 'general'), `expires_at`, `invalidated_at`, FTS5-indexed title+body.

This is the secret weapon: **PCA distinguishes between what you said about yourself, what was observed, and what was inferred.** Agents that read this can calibrate trust per-fact. Generic memory tools can't.

---

## 4. The 11 Canonical Relations — how links compose

Shipped in `relations.ts` with pair validation + acyclic checks:

| Relation | Acyclic | Symmetric | Allowed pairs (sample) |
|---|---|---|---|
| `subgoal-of` | ✓ | – | goal → goal |
| `motivated-by` | – | – | goal/event/state/role → stance/constraint/knowledge |
| `collaborates-with` | – | ✓ | person↔person, person↔goal, self↔* |
| `subject-of` | – | – | person → event/goal |
| `located-at` | – | – | event/role/state → place |
| `caused-by` | – | – | state/event → event/role/place/person |
| `reinforces` | – | – | stance/preference/role → stance/self |
| `competes-with` | – | ✓ | goal/stance/role ↔ goal/stance/role |
| `addresses` | – | – | goal/role → constraint/knowledge/event |
| `requires` | – | – | goal/role → resource/knowledge/person/place |
| `related-to` | – | – | * → * (fallback, flagged `lowInformation`) |

**Invalidation is append-only** (link gets `invalidated_at` timestamp, never deleted). **Cascade rule:** invalidating an entity automatically invalidates every link touching it, with an event row `operation='link-invalidate'`, `payload.reason='cascade'`. This is what migration `0002` enables in the events log constraint.

---

## 5. The 9 MCP Tools — what agents can do

| # | Tool | Purpose | Notable |
|---|------|---------|---------|
| 1 | `record_observation` | Create entity (any of 12 layers, autodetects `event` if no type) | Returns id + applied TTL |
| 2 | `update_entity` | Partial update by id | Returns `{previous, current}` for diffing |
| 3 | `confirm_entity` | Resolve stale entities: still-true / no-longer-true / modify | Drives the weekly review loop |
| 4 | `link_entities` | Create typed link between two active entities | Validates vocab, pair, cycles |
| 5 | `invalidate_link` | Append-only revocation | Event-logged |
| 6 | `get_self_summary` | Identity snapshot: self + active roles/goals/constraints + recent state + top people + stances + preferences + `key_links[]` | **The marquee read** — designed to be called at conversation start |
| 7 | `get_relevant_context` | FTS5 search over title+body, optional type filter | Default 10 items |
| 8 | `list_active` | All active+unexpired entities of a given type | Ordered by recency (persons by importance) |
| 9 | `get_neighbors` | Direct link graph traversal from a center entity | Returns `{entity, link, role:"out"|"in"}` |

**`get_self_summary.key_links`** is the highest-leverage feature: it ranks links touching identity anchors (self, top goals, top people, hard constraints) by weight then recency, drops `related-to` noise once 5+ higher-signal links exist, projects to `{id,type,title}` for token budget. *This is what makes the store agent-readable rather than just agent-writable.*

**Transport today:** stdio only. **Auth today:** zero (single local actor, `$PCA_ACTOR` env, default `claude-code:mcp`). **Validation:** zod on every input; structured error envelope (`HandlerError` with `.code`); attrs revalidated against per-type registry.

---

## 6. The `/ctx-add` Skill — the capture contract

A ~396-line `SKILL.md` that Claude Code loads when the user types `/ctx-add <text>` (or natural-language triggers like "remember that I…", "ține minte că…", "save to PCA").

**Pipeline (Steps 0 → 6):**

```
0   Preflight: MCP connected? input non-empty? not a question?
0.5a READ before WRITE: get_self_summary + get_relevant_context to catch dups & resolve refs
0.5b INPUT FIDELITY rule  ← shipped recently (commit e0b8a0b)
1   Classify into exactly one of 12 layers (decision rules in skill)
2   Propose splits when text packs multiple facts (e.g. person + event + place + 2 links)
2.5 Canonical link relations only — skill knows the 11
3   Extract attrs (zod-shape per layer)
3.5 Clarify required attrs if missing (one question, no more)
4   Confirm proposal block to user: [Y/n/edit/split]
5a  Persist entities (record_observation, capture id map)
5b  Persist links (link_entities, with correct authority)
6   Print "✓ Saved <type> #<id> "<title>""
```

**The two recent tightening rules (commit `e0b8a0b: add input fidelity rule + tighten authority heuristics`):**

1. **Input fidelity:** Persist only what is literally in the user's input. Side context (CLAUDE.md, MEMORY.md, working dir, prior chat) may *interpret* but never *inject*. If the skill wants to enrich, the enrichment becomes a **separate `authority: "inferred"` entity**, not a quietly augmented `self-declared` one.

2. **Authority heuristic:**
   - `self-declared` — claim verbatim in user input
   - `inferred` — pulled from side context (must be a separate entity)
   - `observed` — noticed in conversation tone/behavior (default for relations)

This rule is **doing a lot of work**: it's what keeps the store from drifting into an LLM hallucination of you. It's also what makes the provenance signal trustworthy downstream.

---

## 7. The CLIs

### `pca` (admin)
| Command | What |
|---|---|
| `pca init` | Create `~/.pca/`, open DB, run migrations |
| `pca install-mcp claude-code` | Register `pca` in `~/.claude.json` `mcpServers`, atomic write + `.bak` |
| `pca install-skill ctx-add` | Copy `SKILL.md` → `~/.claude/skills/ctx-add/SKILL.md`, dedup with `.bak` |
| `pca doctor` | 4-check health: DB / schema version / MCP wired / skill installed (+ stale warning) |
| `pca version` / `pca help` | Trivia |

### `ctx` (runtime)
| Command | What |
|---|---|
| `ctx review --links [--fix]` | Surface **dangling** links (point to invalidated/missing entities), **redundant** links (same src+dst+relation, multiple active), **orphan** entities (active, type≠event/state, zero in/out links). `--fix` auto-invalidates dangling, dedupes redundant (keeps highest weight, tiebreak by recency). Never touches orphans (manual decision). |

**Onboarding path (clean machine):**
```bash
bun install
pca init && pca install-mcp claude-code && pca install-skill ctx-add
pca doctor   # all green?
# Restart Claude Code → /ctx-add is live
```

---

## 8. PRD vs Reality — what shipped, what pivoted

| PRD MVP item | Status | Note |
|---|---|---|
| 9 MCP tools (6 layer-1 + 3 linking) | **SHIPPED** | Linking promoted from Val 2 into MVP — see pivot below |
| `/ctx-add` skill with 12-layer classifier | **SHIPPED** | Plus the input-fidelity tightening (e0b8a0b) |
| All 12 entity types with TTL + zod attrs | **SHIPPED** | 14 `v_active_*` views, FTS5 |
| `pca` admin CLI | **SHIPPED** | Plus `migrate-links` (post-PRD scaffolding) |
| `ctx review --links [--fix]` | **SHIPPED** (Phase 3) | PRD had only `--stale`; got generalized |
| `get_self_summary.key_links` | **SHIPPED** (Phase 2) | The graph integration into identity snapshot |
| Demo loop (10+ captures, ≥6 layers, real query) | **NOT YET DONE** | `learnings.md` §10 is still a blank template — **this is the next action** |
| Bulk import (Obsidian/Apple Notes) | **DROPPED → Val 2** | No code |
| Embeddings / semantic search | **DROPPED → Val 3** | FTS5 only for now |
| `/ctx-mirror`, `/ctx-link` skills | **DROPPED → Val 2** | Sketched in `plan-linking.md` §10 |
| REST API / HTTP / multi-user | **NON-GOAL** (PRD §3.2) | Stdio-local only |

**Strategic pivot worth naming:** Linking moved from "future risk" to **load-bearing MVP feature**. `key_links` is in `get_self_summary` — the most-called read tool. This is the right call: a list of facts without relations is just a JSON dump; a graph with typed edges is something an agent can reason over.

**Implicit product vision drifting clearer than the PRD states it:**
PCA is becoming **"Memory for Agents, with Structural Reasoning and Provenance"** — not a personal CRM. The differentiation isn't the schema (SQLite), it's the **mental model**: context as a constitution agents consult, jointly maintained by operator (self-declared) and agent (observed/inferred), with continuous alignment via confirmation loops.

---

## 9. Strengths Worth Naming

1. **Schema is principled.** 12 layers aren't accidental — they're a deliberate decomposition of personhood (identity, intention, capability, relationship, situation, taste, belief). The TTLs differ per layer because the *epistemic decay rates differ per layer*.
2. **Provenance is first-class.** Authority + confidence + maturity + temporal validity on every entity. Few personal-memory systems take this seriously.
3. **Linking is validated, not free-text.** Canonical vocab + pair checks + acyclic guard. This is what keeps the graph queryable and prevents long-term rot.
4. **Append-only events log.** Audit trail enables temporal reconstruction, debugging "why does the agent think X about me", and future undo/replay.
5. **Skill-native UX.** The capture surface lives *inside the agent*, not in a separate app. Zero context switch.
6. **Test coverage is real.** ~2,300 LOC of tests on core + handlers. Happy paths and edge cases (cycles, singletons, invalidation cascade, attrs validation). This isn't a sketch — it's a foundation.
7. **The `input fidelity` rule.** Subtle but load-bearing. Without it, the store would drift into LLM-hallucinated identity. With it, the store stays *yours*.

---

## 10. Honest Gaps & Smells

These are *not* failures — they're the next iteration's work:

| Area | Smell | Severity |
|---|---|---|
| Demo loop never actually exercised | `learnings.md` §10 still a blank template; 0 entities locally; no proof yet that the round-trip (`/ctx-add` → store → `get_self_summary` → Claude uses it in prompt → user notices change) actually creates daylight | **HIGH** — this is *the* validation |
| `link_entities.relation` param is free string | Should be a zod enum so the LLM gets autocomplete; today the canonical vocab lives inline in description text | medium |
| `get_neighbors` defaults hidden | `direction`/`types` defaults not documented; LLM must call-and-see | medium |
| `get_self_summary.key_links` sparse projection | Strips body; agent often needs a follow-up `get_neighbors` to hydrate | medium |
| `record_observation` title/body split is magic | First-line-becomes-title heuristic; pushes the explicit `title` param into shadow | low |
| `scope` filter half-implemented | `projects` table exists, `scope` column exists, but no view defaults to current scope; no protection against cross-scope leaks | medium |
| No "needs confirmation" flag on low-authority entities | Inferred entities silently mingle with self-declared ones in views | low |
| Stale rule hard-coded `> 90 days` in SQL | No per-type or config override | low |
| FTS ranking is default SQLite | No recency/maturity/authority boost | low — only matters at scale |
| Pillars are inside `self.attrs`, not first-class entities | Blocks `reinforces → <specific pillar>` links | **deliberate** (PRD Open Q-L1: reevaluate after 30 days live) |
| `pca doctor` advertises `ctx review --stale` which doesn't exist | Tiny UX bug — needs either the command or the message removed | low |
| No "promote / archive with comment" UX | Can invalidate, can't easily explain why in a user-visible way | medium |
| No export (JSON / CSV / markdown) | Vendor-lock-in risk; also blocks `/faber-ingest`-style integration with the Alteramens wiki | medium |
| No bulk import | Seeding 50 goals at once is tedious | medium |

**The single most important gap is the first one.** Until you log even one full demo loop where context captured on Monday changes Claude's answer on Friday, every other improvement is premature.

---

## 11. Roadmap — Local → Hosted → SaaS

A three-arc roadmap. **Do not skip arc 1.**

### Arc 1 — Validate (next 2–4 weeks)
**Goal:** Prove the system creates daylight in real use, with the operator (you) as the only user.

| # | Action | Outcome |
|---|---|---|
| 1.1 | **Seed-and-use loop.** Run the original PRD demo: 10+ `/ctx-add` captures across ≥6 layers (incl. ≥1 self, ≥3 goals, ≥3 persons, ≥2 stances). Then ask Claude a real planning question and verify the answer cites ≥5 entities from ≥3 types. | `learnings.md` §10 filled in with screenshots/quotes |
| 1.2 | **Daily/weekly rhythm.** Run `ctx review --links --fix` weekly. Run a (yet-to-build) `ctx review --stale` weekly to confirm stale entities. | Habit established; review surface validated |
| 1.3 | **Patch the doctor lie.** Either implement `ctx review --stale` or remove the message from `doctor.ts`. | Small UX correctness |
| 1.4 | **Convert `link_entities.relation` to zod enum.** Plus document defaults on `get_neighbors`. Plus add a `body_preview` (first 120 chars) to `key_links` so agents don't need a follow-up call. | Better LLM ergonomics, fewer wasted tool calls |
| 1.5 | **`/ctx-recall` (or augment `/ctx-add`).** A skill that, given a vague reference ("the Razvan goal", "that decision last week"), surfaces the matching entity and asks "is this what you mean?" before related operations. | Closes the read-side capture loop |
| 1.6 | **Export.** `ctx export --format=json|markdown`. Trivial to write; huge for trust + `/faber-link` integration with the Alteramens wiki. | Vendor lock-in eliminated |
| 1.7 | **Decide Open Q-L1.** After 30 days: promote pillars to entities? Decision recorded in `decisions.md`. | Schema clarity for arc 2 |

**Arc 1 exit criteria:** You honestly use PCA for ≥3 weeks. You can describe one moment where context-aware Claude was clearly better than no-context Claude. *Then* arc 2 starts.

### Arc 2 — Open to a Second User (4–8 weeks)
**Goal:** Make PCA installable + usable by someone other than you, without code changes.

| # | Action | Outcome |
|---|---|---|
| 2.1 | **`npx pca init`** or homebrew tap. Single-command install with no Bun-from-source steps. | Distribution removes friction |
| 2.2 | **Onboarding tutorial baked into the skill.** First `/ctx-add` invocation on an empty store walks the user through 5 capture prompts (self → goal → constraint → person → stance). | Cold start → warm in 10 minutes |
| 2.3 | **Cookbook of canonical captures.** Markdown doc with 30 example phrasings ("I prefer X because Y" → preference; "I work at Z, M–F, 9–5" → constraint+role). Also serves as a skill-fixture corpus. | Discoverability of the 12 layers |
| 2.4 | **Recipe skills layered on PCA.** Build 1 or 2 of: `/ctx-mirror` (weekly tension report, uses `key_links` to find contradictions), `/ctx-plan` (given a goal, walks `requires`/`addresses` graph and proposes a week plan), `/ctx-status` (lists what's expiring this week). | Proves PCA is a substrate, not an app |
| 2.5 | **Privacy & deletion controls.** `ctx purge --type X --since Y`, full `ctx wipe`. Documented backup/restore (it's a single SQLite file — should be one command). | Trust for non-you users |
| 2.6 | **One outside user.** Anyone (Razvan? a friend?) uses it for 2 weeks. Capture the gaps in `learnings.md`. | First external signal |

**Arc 2 exit criteria:** One non-you human uses PCA continuously for ≥2 weeks and reports ≥1 unprompted "huh, that helped" moment. *Then* SaaS conversation starts — not before.

### Arc 3 — Hosted / SaaS (3–6 months after arc 2)
**Goal:** Multi-tenant cloud product with a defensible business model.

The five non-trivial architectural deltas, in order of difficulty:

#### 3.1 Tenancy in the data model
- Add `tenant_id` (or `user_id`) to every entity table: `entities`, `links`, `events`, `annotations`, `tags`, `sources`, `entity_sources`, `entity_tags`, `projects`.
- Every query gains `WHERE tenant_id = ?`. Views become parameterized or per-tenant.
- **FTS5 wrinkle:** virtual tables don't partition cleanly. Either (a) per-tenant FTS index, (b) include `tenant_id` in the index and filter post-rank, or (c) shard to per-tenant SQLite files. Option (c) keeps the elegant single-file model and is **probably correct** at small/mid scale.
- `getCurrentSelf()` and every other "the user's …" function must take a tenant.

#### 3.2 Identity binding to MCP
- MCP stdio is local-trust by construction. Going cloud means HTTP/WebSocket transport with auth.
- **Pattern A — Remote MCP:** server lives in cloud, client sends bearer token. Simple but every call pays network latency (problem for `get_self_summary` at session start).
- **Pattern B — Local sync agent (recommended):** keep MCP stdio + local SQLite. Run a background syncer that replicates the local DB ↔ cloud (libSQL/Turso embedded replicas are designed for exactly this). User stays offline-capable; cloud is durable backup + cross-device sync.
- Either way: each operator gets a token; MCP auth middleware validates and injects `tenant_id` into handlers.

#### 3.3 Sync semantics (the hardest problem)
- Links are typed, directed, acyclic-validated. Two devices offline create conflicting links. Resolution?
- **Minimum viable:** Last-Writer-Wins on entities; links are additive (concurrent creates → both kept, dedup at read); invalidation wins over creation.
- **Real solution:** CRDT-ish — events log is the source of truth, both devices replicate the event stream, derived state (entities, links, current status) is rebuilt from events. This is heavy but well-precedented (Automerge, Yjs patterns).
- **Pragmatic path:** Turso/libSQL embedded replica gives you most of this for free at the row level. CRDT-ish merge needed only for the few places where logical conflicts matter (entity status transitions, link invalidation).

#### 3.4 Usage primitives for billing
- Metering: entities created/month, events logged, MCP calls, storage GB.
- Pricing model candidates:
  - **Per-seat** ($10–20/mo): unlimited captures, fair-use cap. Simple.
  - **Per-entity-tier** (free <500, pro <5000, …): aligns price with value.
  - **Per-agent-call** (charge by MCP tool invocation): aligns with "you pay when you get value." Risky — chills usage.
- **Quota enforcement** at the MCP middleware: `record_observation` returns `QUOTA_EXCEEDED` if over.
- Audit trail (events log) already in place — billing reconciliation is mostly a reporting query.

#### 3.5 Operational surface
- Observability: per-tenant call count, error rate, p95 latency, storage growth. Structured stderr logs with tenant_id today, ship to Loki/Datadog tomorrow.
- Backups: per-tenant snapshot to S3 daily; restore tested monthly.
- Customer support: a way to inspect a tenant's events log (with consent) to debug "why did Claude think X about me".

**Arc 3 exit criteria:** 10 paying customers (any tier). After that, the question stops being "can we" and becomes "should we." Don't ship hosted before that bar.

---

## 12. Strategic Angles That Could Win

If/when arc 3 happens, these are PCA's unique angles against the generic memory/CRM/second-brain crowd (Mem, Reflect, Obsidian-with-AI, Pi, etc.):

1. **Agent-native, not user-native.** The interface is `/ctx-add` inside Claude Code, not a webapp the user must open. Captures happen *in the flow of work*. This compounds with the Alteramens "Skill Era" thesis: skills become the surface, and PCA is the canonical store every skill queries.

2. **Structural reasoning over typed graph.** "Find all goals that `require` resources I no longer have." "Which stances `compete-with` my newly captured goal?" Generic stores need an LLM to invent these queries every time. PCA can answer them with SQL.

3. **Provenance & temporal authority.** `self-declared` ≠ `observed` ≠ `inferred`. Agents calibrate trust per-fact. Users debug agent errors by reading the events log. Generic stores can't do this — they have no provenance.

4. **Multi-horizon scopes** (already in the schema, half-built). Hospital-Narcis vs Alteramens-Narcis vs father-Narcis are different default scopes; agent behavior shifts implicitly with context. Generic tools demand manual context-setting.

5. **Continuous alignment via decay + confirmation loops.** Context that's never re-confirmed silently expires. This is a *forcing function* for self-knowledge that no other tool imposes. It maps directly to the Alteramens "Productize Yourself" thesis: continuous introspection becomes the product, not a side-effect.

---

## 13. Killer Demos Today (no extra code needed)

Anchor every conversation about PCA — internal or external — to one of these:

1. **"Claude knows my schedule."** Seed: 1× self, 1× role (hospital admin, M–F 8–15), 1× role (Alteramens, after-hours), 2× constraint (hard time-windows), 3× goals with timeframes. Ask Claude in a fresh session: "plan my week for shipping PCA arc 1". The answer respects the time windows without being told.

2. **"Claude won't suggest things you've already ruled out."** Seed: a `stance` like "I refuse to build dashboards for retail SaaS — too crowded" with `evidence_sources`. Ask Claude for product ideas. The answer skips that whole space.

3. **"Weekly mirror."** Seed any 10 entities. Run a hand-rolled prompt that calls `get_self_summary` + `list_active goal` + `list_active stance`, asks Claude to find tensions. (When `/ctx-mirror` ships, it's automated.)

4. **"The graph speaks."** Capture: goal "Ship PCA MVP" → `requires` → resource "Claude Code Max" → `requires` → ... Then `ctx review --links` shows the whole dependency chain. Visualize manually with a Mermaid block.

---

## 14. What to do *this week* (concrete next step)

The system is past "spike" and into "needs real usage". Don't add features. **Use it.**

1. **Today/tomorrow:** Re-run `pca init && pca install-mcp claude-code && pca install-skill ctx-add && pca doctor`. Verify ✓ on all four.
2. **Days 1–7:** Capture ≥10 entities across ≥6 layers via `/ctx-add`. Don't curate — capture as things happen.
3. **Day 3-ish:** Open a real planning conversation in Claude Code that starts "given what you know about me, ..." and verify Claude calls `get_self_summary`. Screenshot the answer.
4. **Day 7:** Run `ctx review --links`. Fix anything dangling.
5. **Day 7:** Fill `learnings.md` §10 honestly: *what worked, what surprised, what frustrated*.

Only after that loop has closed once should the next code change ship. The biggest risk to PCA isn't a missing feature — it's shipping the next 5 features without the validating loop ever having run.

---

## Appendix — Key file references

| File | What |
|---|---|
| `code/packages/core/src/schema/migrations/0001_initial.sql` | Full schema: 12 entity types, links, events, FTS5, 14 `v_active_*` views |
| `code/packages/core/src/schema/migrations/0002_link_invalidate_op.sql` | Adds `'link-invalidate'` to events.operation enum (enables cascade audit) |
| `code/packages/core/src/types.ts` | All TS types: `Entity`, `Link`, `EventRow`, `EntityType`, `Authority`, etc. |
| `code/packages/core/src/entities/registry.ts` | 12 per-type zod schemas + TTL + singleton metadata |
| `code/packages/core/src/links/relations.ts` | 12 canonical relations + pair validation + BFS cycle check (depth 10) |
| `code/packages/core/src/store.ts` | ~830 LOC engine: openStore, CRUD, search, neighbors, cascade invalidation |
| `code/packages/mcp-server/src/tool-defs.ts` | zod input schemas for 9 MCP tools |
| `code/packages/mcp-server/src/handlers.ts` | Handler logic + `computeKeyLinks()` for `get_self_summary` |
| `code/packages/mcp-server/src/index.ts` | Startup: PCA_DB/PCA_ACTOR env, stdio transport |
| `code/packages/cli/src/pca-commands/doctor.ts` | 4-check health validator |
| `code/packages/cli/src/ctx-commands/review.ts` | Link hygiene: dangling / redundant / orphan + `--fix` |
| `code/packages/skill-ctx-add/SKILL.md` | The ~396-line classifier contract Claude Code loads on `/ctx-add` |
| `prd-mvp.md` | Original MVP spec (still mostly aligned with shipped reality) |
| `plan-linking.md` | Three-phase linking plan that just shipped + phase-4+ deferred items |
| `learnings.md` | §10 demo loop section is still blank — **fill it next** |

---

*This document is a snapshot. Re-run the fan-out analysis after arc 1 completes to refresh — the gap section and the strategic angles will look different once real usage data exists.*
