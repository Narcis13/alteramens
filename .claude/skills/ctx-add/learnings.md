---
purpose: Failure-mode log from 10 dry-run iterations of /ctx-add against synthetic inputs
date: 2026-05-18
mode: dry-run (no writes to PCA store)
evaluator: claude (opus-4-7)
skill_version: SKILL.md as of 2026-05-18 (~178 lines, no learnings file yet)
---

# /ctx-add — Iteration Learnings

Each iteration: synthetic input → what the current SKILL.md *would* do → failure mode(s) → fix. Inputs were designed to span the 12 layers and deliberately probe ambiguous boundaries (role/constraint, stance/preference, place/event), schema edges (cost when unknown, multi-attr states), and lifecycle traps (self singleton, link persistence gap).

A consolidated SKILL.md diff is at the bottom.

---

## Iteration 1 — clean goal, ambiguous timeframe

**Input:** `Vreau să ajung la 1K MRR cu Alteramens până la finalul lui 2027`

**Current behavior:** Classifies as `goal`. Title ≈ "1K MRR Alteramens până la finalul lui 2027". Attrs: `{ timeframe: ?, success_criteria: "1K MRR by 2027-12-31" }`.

**Failure modes:**
1. The `timeframe` enum is `long | mid | short` with **no boundary definitions**. End-of-2027 from 2026-05-18 ≈ 19 months. Is that `long` or `mid`? Two consecutive runs may classify differently → store becomes incoherent.
2. `success_criteria` is free text; "1K MRR" is currency-ambiguous (RON vs USD vs EUR). Skill doesn't prompt.
3. MEMORY.md notes the user has *explicitly rejected* "1K MRR" framing in the past. Skill has no mechanism to surface a memory-level red flag before persisting.

**Fix:**
- Add timeframe boundaries to Step 3: `short = ≤90d, mid = 90d–18mo, long = >18mo`.
- For any goal containing a money unit, require currency in `success_criteria` ("1K MRR USD").
- *(Optional)* Cross-check the auto-memory file once per session for known anti-patterns. Out of scope for SKILL.md; flag for hooks instead.

---

## Iteration 2 — role vs constraint ambiguity

**Input:** `Miercurea seara între 18 și 20 sunt voluntar la centrul de bătrâni din Pitești`

**Current behavior:** The "recurring time-bounded activity with a schedule → role" note (lines 60) *should* steer this to `role`. But the phrasing leads with "voluntar" (a role-noun) and embeds a time-window that smells like a `constraint` ("Hospital hours 08-15 mon-fri" is the canonical example).

**Failure modes:**
1. Without an explicit decision rule, an LLM run will flip between `role` and `constraint` based on which example anchors hardest in the prompt.
2. `role.attrs.domain` enum is `defensive | offensive | mixed` — none of those map cleanly to "voluntary care work". User has to pick `mixed` by elimination, which is meaningless.
3. The place ("centrul de bătrâni din Pitești") is a distinct entity but the skill's split logic (Step 2) only fires on "multiple distinct facts" — and this reads as one fact.

**Fix:**
- Promote the role/constraint heuristic from a footnote (line 60) to a **decision flowchart** at the top of Step 1: "If the input names a *position/identity-while-doing-X* (volunteer, admin, builder, parent-on-school-run) → role. If it names a *blocker/window* with no identity ('no meetings before 09:00') → constraint."
- Broaden `role.attrs.domain` to include `civic | care | creative | family` (or drop the enum and make it free-text).
- Add a Step 2.5 rule: any role/event with a named location should auto-propose a `place` companion entity unless the place is already in the store.

---

## Iteration 3 — multi-fact pack, link persistence gap

**Input:** `Mihai (fiul meu, 18 ani) se pregătește pentru admitere la UMF Carol Davila iulie 2027`

**Current behavior:** Matches the canonical Step 2 example almost verbatim. Proposes person + event + link. Then on persist: **"link creation is not yet exposed as an MCP tool"** (line 142).

**Failure modes:**
1. The skill warns about the missing link **after** the user has already accepted the proposal. The user thinks the relationship is captured; in fact only two orphan entities land in the store.
2. UMF Carol Davila is an entity itself (place / institution). The example only splits into person+event, leaving the institution embedded in event.title — un-queryable later.
3. The event's `expires_at: "2027-07-31"` is sensible but the skill never tells the user *why* that date was picked. If the exam moves, there's no anchor to update.

**Fix:**
- Surface the link-persistence gap **before** confirmation, in the proposal block itself: `Link: person → event (will be PROPOSED ONLY — not persisted; tracker: #link-mcp).`
- Bump split granularity: if input names a recognizable institution, propose a third `place` entity (kind: "physical" or "social").
- Always show the user *which token* in the input drove `expires_at`, so they can correct it.

---

## Iteration 4 — transient state, multi-attr collapse

**Input:** `azi sunt epuizat după gardă, abia mai funcționez`

**Current behavior:** Classifies as `state`, TTL 7d (per line 91 + 177). Attrs candidates: `mood: "epuizat"`, `energy: "low"`, `focus: "low/none"`, plus an implicit cause ("după gardă").

**Failure modes:**
1. The `state` attrs schema allows multiple keys (`mood`, `energy`, `focus`, `stress`, `place_id`) but the skill doesn't say *how many* to fill. A minimal extractor fills only `mood`; a maximal one fills four; both validate. Inconsistent over time.
2. "după gardă" (after a hospital shift) is causal context — nowhere to put it. The schema has no `cause` or `trigger` field. It gets dropped or smuggled into title.
3. 7d TTL is too long for "azi sunt epuizat". Realistic decay: 1-2 days.

**Fix:**
- Add a Step 3 rule: for `state`, fill *every applicable* attr key, not just the most obvious one.
- Extend the `state` schema (server-side) with optional `cause: string` and `trigger_event_id?: string`. Until then, document that cause text must be appended to title in parens.
- Allow per-input TTL override for `state`: if the text starts with "azi" / "today" / "right now" → TTL 36h, not 7d. Add to the *State with no expiry hint* edge case (line 176).

---

## Iteration 5 — stance with implicit reason

**Input:** `Cred că software-ul critic ar trebui să ruleze pe hardware deținut de utilizator, nu în cloud-uri proprietare`

**Current behavior:** Classifies as `stance`. Attrs: `{ reason: ?, evidence_sources?: [] }`. The schema **requires** `reason`, but the input's reason is *implicit* in the contrast ("nu în cloud-uri proprietare" = vendor lock-in / sovereignty concern).

**Failure modes:**
1. Skill will either (a) hallucinate a `reason` to satisfy the schema, (b) leave it blank and hit `BAD_ATTRS`, or (c) ask the user — but Step 4's confirm block doesn't have a slot for "I need more info before proposing".
2. There's no way to mark a stance as load-bearing vs. casual opinion. A throwaway opinion and a foundational belief both land with the same shape.
3. No link to existing `self.pillars` — stances often *are* pillars, but the skill never cross-checks `get_self_summary` to see if this duplicates an existing pillar.

**Fix:**
- Add a Step 3.5 (between Extract and Confirm): if any required attr cannot be filled from the input, **ask one clarifying question before showing the proposal block.** Don't surface a half-filled proposal.
- Extend `stance.attrs` with `strength: "casual" | "load-bearing"` (mirrors `preference.strength`).
- For `stance`, call `get_self_summary` first; if the new stance duplicates or contradicts a `self.pillars` entry, surface that in the Reasoning line.

---

## Iteration 6 — publishing cadence: place or preference?

**Input:** `Publicăm pe Substack-ul Alteramens săptămânal, joi dimineața`

**Current behavior:** Most likely `place` (kind: digital, recurring: true). But "săptămânal, joi dimineața" is a *cadence/preference*, not a property of the place. The example "my Substack" on line 49 anchors hard toward `place`.

**Failure modes:**
1. The skill has no `cadence` or `frequency` field on any type. Recurring publishing schedules are first-class facts for a builder/creator and have no home.
2. `place.attrs.recurring: boolean` is a weak signal — true for "I go to the gym Tuesdays" and true for "I publish Thursdays", erasing the distinction between *I visit* and *I emit content*.
3. A correct split here would be (a) place: Substack Alteramens, (b) preference: weekly Thursday publishing cadence — but the skill won't propose this split because "one fact" reading dominates.

**Fix:**
- Add `cadence?: string` to `place` and `preference` attrs (free-text, e.g., "weekly Thu AM"). Server-side schema change required.
- Update Step 2 split heuristic: if input contains both a *destination* and a *cadence*, propose splitting into (place + preference) even if the surface looks like one fact.
- Rename the `place` examples list to distinguish "places I go" vs "places I emit from".

---

## Iteration 7 — self singleton conflict, discovered too late

**Input:** `Sunt un developer pragmatic care construiește SaaS-uri B2B nișate pentru piața românească`

**Current behavior:** Classifies as `self`. Proposes attrs `{ pillars: [...], voice_rules: [...], narrative: "..." }`. On persist → `SINGLETON_CONFLICT` (line 148) → skill tells the user to use `update_entity`.

**Failure modes:**
1. The user goes through Steps 1-4 (~30 seconds of confirmation), only to be told at Step 5 that nothing was saved. **Wasted turn.**
2. The skill never reads the existing `self` to *show the diff*. The user has to mentally compare "what I wrote" vs "what's already there" — and the existing `self` isn't even surfaced.
3. `pillars` and `voice_rules` arrays are silently appended? Replaced? Merged? Not specified anywhere.

**Fix:**
- **Preflight (Step 0.5):** if classification points to `self`, call `get_self_summary` immediately and short-circuit to an "update vs replace vs append" prompt **before** Step 1 confirmation. Show the existing `self.narrative` side-by-side with the proposed one.
- Document explicitly in Step 5 that `update_entity` on `self` *replaces* the named keys, does not merge arrays. (Verify against `mcp__pca__update_entity` behavior — outside dry-run scope.)
- Add a one-line preflight to Step 0 listing the singleton-typed entities to always check first.

---

## Iteration 8 — knowledge with explicit gaps (cleanest case)

**Input:** `abia mă descurc cu React Native, mai ales cu navigation și state persistence`

**Current behavior:** Classifies as `knowledge`. Attrs: `{ domain: "React Native", depth: "novice", gaps: ["navigation", "state persistence"] }`. Clean.

**Failure modes:**
1. None classification-wise. *But*: the skill doesn't cross-check whether a `knowledge` entry for "React Native" already exists. Calling `record_observation` will create a duplicate.
2. Romanian self-deprecation ("abia mă descurc") is correctly mapped to `novice`, but there's no calibration: "abia" could also mean "with effort but competently" (≈ practitioner). No rule for disambiguation.
3. `gaps` array is fine, but neither the schema nor the skill says whether it's *cumulative* (next /ctx-add merges gaps) or *replacing*.

**Fix:**
- Step 0 should also call `mcp__pca__get_relevant_context` with the extracted `domain` as query and surface any existing entity of the same type+domain → propose `update_entity` instead of create.
- For Romanian colloquial qualifiers ("abia", "așa și așa", "mă descurc"), default to `novice` but flag confidence as `medium`, not `high`.
- Document cumulative-vs-replace semantics for array attrs (gaps, pillars, voice_rules, tags) in one place — currently silent.

---

## Iteration 9 — two resources in one input, one with unknown cost

**Input:** `Am abonament Cursor Pro la $20/lună și folosesc Claude Code Max prin Anthropic`

**Current behavior:** Step 2's split should trigger — two distinct subscriptions. Proposed: (a) resource: Cursor Pro, attrs `{ kind: "subscription", cost_per_month: 20 }`, (b) resource: Claude Code Max, attrs `{ kind: "subscription", cost_per_month: ? }`.

**Failure modes:**
1. `cost_per_month?: number` is optional but **typed as number** — there's no way to mark "unknown" vs "free" vs "varies". An LLM will either omit it (collapses unknown and free) or fabricate a number.
2. "Anthropic" is a vendor/entity (`person` of type org? `place`?). The skill has no vendor concept. The provenance fact gets lost.
3. The two resources are related (same purchaser, overlapping function: AI coding). No `tags` on `resource` to group them.

**Fix:**
- Add `cost_unknown?: boolean` or change schema to `cost_per_month?: number | "unknown" | "free" | "variable"`. Server-side change.
- Document in Step 3 that vendor/provider names should go into `title` (e.g., "Claude Code Max (Anthropic)") since there's no dedicated vendor field.
- Add `tags?: string[]` to `resource` (already exists on `person`). Pre-fill with `["ai-tooling"]` for clearly-grouped subs.

---

## Iteration 10 — past-tense event spanning person + place + project

**Input:** `Săptămâna trecută am ieșit cu Andrei Pop la cafea în centru și am discutat despre cum integrăm PCA în workflow-ul lui de consultanță`

**Current behavior:** Edge case "Past-tense narration" (line 173) says: event, attrs *may* reference related entities by id **if you've called `get_relevant_context`**. The skill won't auto-call.

**Failure modes:**
1. "If you've called" is passive — no obligation. A fresh run will not call, will not link, and the event lands as a content-less title with no `related_entity_ids`. The fact that the conversation was *about PCA* is lost.
2. "Andrei Pop" — person entity. New or existing? Skill won't check. Likely new → orphan person with no relation context.
3. "în centru" — vague place. Skill might propose a `place` entity for "centru Pitești" (good) or drop it (bad). No guidance.
4. "săptămâna trecută" → event date. Skill should resolve to an absolute date (today − 7d ≈ 2026-05-11) but doesn't say so.

**Fix:**
- Make `get_relevant_context` **mandatory** before persisting any `event` that names a person or project. Step 4 confirm block should list the matched ids.
- Add a global rule (Step 0 or Step 2): always resolve relative dates ("yesterday", "last week", "Thursday") to absolute ISO dates at extraction time, and show the resolved date in the proposal. Mirrors the memory rule from CLAUDE.md.
- For places mentioned without a name ("în centru", "la birou"), prompt the user *once* to canonicalize, then save the canonical form for future use.

---

## Cross-cutting findings (recurring across iterations)

1. **No preflight read** — 6 of 10 iterations would benefit from a Step 0.5 that reads existing context (singleton check, duplicate check, related-entity lookup) before showing a proposal. The skill is write-only by default.
2. **Schema rigidity hides intent** — `cost_per_month: number`, `stance.reason: required string`, `role.domain: enum`, `state` with no `cause` field — each forces the LLM to either fabricate or drop information. Server-side schema needs widening *or* the skill needs an "I can't fill this faithfully" escape hatch (Step 3.5 clarifying question).
3. **Link gap is silent until too late** — splits propose links, then Step 5 reveals they won't be persisted. Move the warning to the proposal block.
4. **Relative dates and currencies are unresolved** — "1K MRR", "săptămâna trecută", "iulie 2027" all pass through as text. Should always resolve to absolute/canonical form at extraction.
5. **Heuristics buried as footnotes** — the role/constraint rule, state-TTL rule, and multi-fact split heuristic are scattered in notes. Promote to a single "Classification decision rules" block right inside Step 1.

---

## Proposed SKILL.md diff (consolidated)

Apply to `/Users/narcisbrindusescu/.claude/skills/ctx-add/SKILL.md`:

```diff
@@ Step 0 — Preflight @@
+## Step 0.5 — Read before write
+
+After preflight passes, *always*:
+1. If the classification candidate is `self`, call `get_self_summary` first.
+   If a `self` exists, switch to an update-vs-replace prompt — do NOT proceed
+   to Step 1 with a fresh-create proposal.
+2. If the candidate is `knowledge`, `resource`, `person`, or `place`, call
+   `get_relevant_context` with the extracted `domain`/`title` as query. If a
+   match exists, propose `update_entity` instead of create.
+3. If the candidate is `event` and the text names a person, project, or place,
+   call `get_relevant_context` to populate `related_entity_ids`.
+4. Resolve all relative date expressions ("azi", "săptămâna trecută",
+   "iulie 2027") to absolute ISO dates. Show the resolved date in the
+   proposal block.

@@ Step 1 — Classify @@
+### Decision rules (apply before picking a type)
+
+- **Role vs constraint**: input names a *position/identity while doing X*
+  (volunteer, admin, parent-on-school-run) → `role`. Input names a *blocker
+  or window* with no identity ("no meetings before 09:00") → `constraint`.
+- **Stance vs preference**: input contains "cred că" / "I believe" / a
+  reason → `stance`. Input is taste-only ("prefer dark UI") → `preference`.
+- **Place vs event**: a *destination you go to* → `place`. A *thing that
+  happened* → `event`. If both, propose a split (Step 2).
+- **State vs event**: "azi sunt X" / "right now I'm Y" → `state` (short TTL).
+  "yesterday I X" → `event`.

@@ Step 3 — Extract attrs per type @@
-- `goal`: `{ timeframe: "long"|"mid"|"short", parent_id?: string, success_criteria?: string }`
+- `goal`: `{ timeframe: "long"|"mid"|"short", parent_id?: string, success_criteria?: string }`
+  Boundaries: `short ≤ 90d`, `mid = 90d–18mo`, `long > 18mo`.
+  If `success_criteria` contains a money amount, currency is required
+  ("1K MRR USD", not "1K MRR").
-- `state`: `{ mood?: string, energy?: "low"|"med"|"high", focus?: string, stress?: string, place_id?: string }`
+- `state`: `{ mood?: string, energy?: "low"|"med"|"high", focus?: string, stress?: string, place_id?: string }`
+  Fill *every* applicable key, not just the most obvious. If a cause is
+  named ("după gardă"), append to title in parens until a `cause` field
+  lands server-side.
-- `resource`: `{ kind: "tool"|"subscription"|"asset"|"access"|"budget", cost_per_month?: number }`
+- `resource`: `{ kind: "tool"|"subscription"|"asset"|"access"|"budget", cost_per_month?: number, tags?: string[] }`
+  If cost is unknown, *omit* the key and note "cost: unknown" in title.
+  Do not fabricate a number.
-- `role`: `{ schedule?: string, domain?: "defensive"|"offensive"|"mixed", priority?: number }`
+- `role`: `{ schedule?: string, domain?: "defensive"|"offensive"|"mixed"|"civic"|"care"|"creative"|"family", priority?: number }`

+## Step 3.5 — Clarify before proposing
+
+If any required attr cannot be filled faithfully from the input (e.g.
+`stance.reason` is implicit, `goal` lacks currency, `state` lacks cause),
+ask **one** clarifying question before showing the Step 4 proposal block.
+Do not surface a half-filled or fabricated proposal.

@@ Step 4 — Confirm with the user @@
 ```
 Proposed:
   Type:       <type>
   Title:      <≤80 chars>
   Attrs:      { ... }
   Authority:  <self-declared|observed|inferred>
   Confidence: <low|medium|high>
   TTL:        <none | "+7d" | "+90d" | "+180d" | explicit ISO date>
+  Resolved-dates: <"săptămâna trecută" → "2026-05-11">
+  Existing-match: <none | entity-id "..." (will propose update)>
+  Link-warnings: <none | "person→event link will NOT persist (#link-mcp)">
   Reasoning:  <one line — why this type, why these attrs>
 ```

@@ Edge cases @@
-- **State with no expiry hint**: default TTL 7d applies; warn the user it'll
-  decay unless re-confirmed.
+- **State with no expiry hint**: default TTL 7d applies. But if the text
+  starts with "azi" / "today" / "right now", TTL drops to 36h.
+- **Array attrs (gaps, pillars, voice_rules, tags)**: `update_entity`
+  *replaces* the array, does not merge. To add to an array, fetch current
+  value first and pass the combined list.
+- **Vendor/provider names**: no dedicated field. Encode in title:
+  "Claude Code Max (Anthropic)".
```

---

## Next actions

1. Apply the diff above (or a refined version after you push back on any of the 10 calls).
2. Server-side schema asks captured here for a separate ticket: `state.cause`, `place.cadence`, `preference.cadence`, `resource.cost_unknown`, `stance.strength`, broader `role.domain` enum.
3. Re-run these 10 inputs after the diff lands and compare — keep this file as the regression set.
