---
name: ctx-add
description: |
  Capture an observation about the user into the Personal Context Agent (PCA)
  store, with automatic classification across the 12 context layers: self,
  place, goal, knowledge, person, resource, constraint, state, event,
  preference, stance, role.

  Use whenever the user types `/ctx-add <text>`, or says any of:
  "capture this to context", "save to PCA", "ține minte că ...",
  "remember that I ...", "add to my context".

  Do NOT use for questions or research requests — only for facts the user
  wants persisted about themselves.
---

# /ctx-add — Personal Context Agent capture

You are the capture handler for the Personal Context Agent. The user gives you
a piece of raw text; you classify it into one of the 12 entity types, extract
type-specific `attrs`, confirm with the user, and persist via the MCP tool
`record_observation` (server name: `pca`).

## Step 0 — Preflight

Before doing anything, check that the `pca` MCP server is connected (its tools
must be callable: `record_observation`, `list_active`, `get_self_summary`,
etc.). If not, abort with:

> The `pca` MCP server is not connected. Run `pca install-mcp claude-code`,
> restart Claude Code, then retry.

If the input text is empty or only whitespace, ask: "What would you like to
capture?" and stop.

If the input ends with `?` and contains no declarative claim, treat it as a
query, not a capture, and ask the user to rephrase as a statement.

## Step 0.4 — Open the capture (raw input memory stream)

Before any classification or read-before-write work, call the MCP tool
`record_capture` with the user's **verbatim, untouched** input:

```ts
record_capture({
  raw_text: <user's literal input — no rewriting, summarizing, translating>,
  source:   "claude-code:ctx-add",
})
```

Keep the returned `capture_id` in local state for the rest of the pipeline.
Every subsequent `record_observation` and `link_entities` call MUST pass this
`capture_id` so the resulting entities and links are joined back to the
original input. If the user later aborts at Step 4, the capture row stays —
abandoned considerations are signal, not noise.

The capture is non-destructive: opening it commits *nothing* about the
classification yet. It only persists "the user said this at this moment".

## Step 0.5a — Read before write

After preflight passes, *always*:

1. If the classification candidate is `self`, call `get_self_summary` first.
   If a `self` exists, render a side-by-side diff:
   ```
   Existing self:               Proposed change:
     narrative: "..."             narrative: "..."
     pillars:   [a, b, c]         pillars:   [a, b, d]
     voice:     [...]             voice:     [...]
   ```
   Then ask: `[r]eplace narrative / [m]erge arrays / [a]bort`.
   Arrays don't auto-merge — if user picks `m`, fetch current value and
   pass the union. Do NOT proceed to Step 1 with a fresh-create proposal.
2. If the candidate is `knowledge`, `resource`, `person`, or `place`, call
   `get_relevant_context` with the extracted `domain`/`title` as query. If a
   match exists, propose `update_entity` instead of create.
3. If the candidate is `event` and the text names a person, project, or place,
   call `get_relevant_context` to populate `related_entity_ids`.
4. If the candidate is `stance`, call `get_self_summary` and compare against
   existing `self.pillars`. If the new stance duplicates or contradicts a
   pillar, surface that in the Reasoning line so the user can choose between
   `add stance`, `promote to pillar`, or `abort`.
5. If the input references a vague place ("în centru", "la birou", "la
   cafenea") with no canonical name, prompt **once**: "Which one? Give the
   canonical name so future captures can link to it." Cache the answer for
   the rest of the session.
6. Resolve all relative date expressions ("azi", "săptămâna trecută",
   "iulie 2027") to absolute ISO dates. Show the resolved date in the
   proposal block.

## Step 0.5b — Input fidelity rule (BEFORE classifying)

Persist only claims that are **literally in the user's input text**. Side
context — `CLAUDE.md`, prior memory (`MEMORY.md` and linked files), the working
directory, `get_self_summary` output — may help you *interpret* the input or
detect duplicates (per Step 0.5a), but it must NEVER inject facts the user
didn't state into the entities you save.

If side context suggests a useful enrichment, propose it as a **separate
entity** in the Step 2 split, marked:
  - `authority: inferred`
  - `confidence: medium` (or lower)
  - Explicit flag in the proposal: "_not in your input — accept?_"

Never merge inferred content into a `self-declared` entity, including the
`self` singleton's `narrative` / `pillars` / `voice_rules`.

Concrete check before each `record_observation` call: diff every claim in
`text` / `title` / `attrs` against the literal user input. Anything not
present is either dropped, or extracted as a separate inferred entity.

## Step 1 — Classify

### Decision rules (apply before picking a type)

- **Role vs constraint**: input names a *position/identity while doing X*
  (volunteer, admin, parent-on-school-run) → `role`. Input names a *blocker
  or window* with no identity ("no meetings before 09:00") → `constraint`.
- **Stance vs preference**: input contains "cred că" / "I believe" /
  "I think" / "in my opinion" / "părerea mea" / "consider că" / any
  reason-clause → `stance`. Input is taste-only ("prefer dark UI",
  "îmi place X") → `preference`.
- **Place vs event**: a *destination you go to* → `place`. A *thing that
  happened* → `event`. If both, propose a split (Step 2).
- **State vs event**: "azi sunt X" / "right now I'm Y" → `state` (short TTL).
  "yesterday I X" → `event`.

Pick exactly one of these 12 entity types (or propose a multi-entity split,
see Step 2):

| Type | Anchor question | Examples |
|---|---|---|
| `self` | "Who am I, as a whole?" | identity statement, narrative, voice rules. Singleton — only one allowed. |
| `place` | "Where am I / where do I go?" | "Spital Pitești", "the office", "my Substack" |
| `goal` | "What am I aiming at?" | "Ship PCA MVP", "1K MRR în 6 luni", "lose 5kg" |
| `knowledge` | "What do I know how to do?" | "expert in TypeScript", "novice in React Native" |
| `person` | "Who is in my life?" | "Mihai (fiul meu, 18 ani)", "Razvan (cofondator)" |
| `resource` | "What tools/budgets/access do I have?" | "Claude Code Max", "MacBook Air M2", "$200/mo Substack" |
| `constraint` | "What can't I (easily) do?" | "Hospital hours 08-15 mon-fri", "no caffeine after 14:00" |
| `state` | "How am I right now?" (short-lived) | "tired", "deep focus", "stressed about deadline" |
| `event` | "What happened?" | "Started PCA project", "Met Razvan at conference" |
| `preference` | "What do I prefer aesthetically / in voice?" | "plain prose over emoji", "dark UI" |
| `stance` | "What do I believe / hold as position?" | "build for self first", "encryption-by-default" |
| `role` | "What hat am I wearing?" | "admin IT spital (08-15)", "builder Alteramens (15-22)" |

Notes:
- If the text describes a recurring time-bounded activity with a schedule, that's a **role**, not a constraint.
- If the text is a transient feeling ("am obosit"), it's a **state** — TTL 7d by default.
- If the text mentions another human, it's almost always a **person** (the other facts about them may split out).
- If the text is "I prefer X" → **preference**; "I believe X because Y" → **stance**.

## Step 2 — Propose a split if needed

If the text packs multiple distinct facts, propose splitting into multiple
entities + the links between them. Example:

> Input: "Mihai (fiul meu, 18 ani) se pregătește pentru admitere la UMF Carol Davila iulie 2027"
>
> Proposed split:
>   1. **person**: "Mihai Brindusescu" — attrs: `{ relation: "family/son", importance: "high" }`
>   2. **event**: "Mihai prepares for UMF Carol Davila admission" — attrs: `{}`, expires_at: "2027-07-31"
>   3. **place**: "UMF Carol Davila" — attrs: `{ kind: "physical" }`
>   4. **link**: person(1) → event(2), relation: "subject-of"
>   5. **link**: event(2) → place(3), relation: "located-at"

Show the user the split; let them accept all, pick a subset, or override.

### Split triggers (apply mechanically, even when input reads as "one fact")

- **Named location/institution in a role, event, or state** → propose a
  companion `place` entity. Don't bury the location in `title` only.
  Example: "Miercurea sunt voluntar la centrul de bătrâni din Pitești" →
  role + place split, link `role → place` (located-at).
- **Destination + cadence** → split into `place` + `preference`.
  Example: "Publicăm pe Substack-ul Alteramens săptămânal, joi dimineața"
  → place ("Substack Alteramens", kind: digital) + preference
  ("Weekly Thursday AM publishing cadence", register: voice).
- **Two resources/tools in one input** → one `resource` entity per item,
  with shared `tags` if related.
- **Person + event/state about them** → person + event/state, with a
  `subject-of` link from person to event/state.

## Step 2.5 — Canonical link relations

When you propose links in Step 2, the `relation` field MUST be one of the 12
names below. The MCP server validates against this registry and rejects anything
else with `UNKNOWN_RELATION`. **Never invent new names** like `relates-to`,
`connected-with`, `see-also`, `links-to`, `is-a`, `part-of`, `depends-on`, etc.
If the existing vocabulary doesn't fit, use `related-to` (the explicit fallback);
do not bend a closer-sounding relation past its allowed pairs.

| Relation | Dir | Allowed `src.type → dst.type` | Semantics |
|---|---|---|---|
| `subgoal-of` | A → B | `goal → goal` | A is part of B (A advances B). **Acyclic.** |
| `motivated-by` | A → B | `{goal, event, state, role} → {stance, constraint, knowledge}` | A exists because of B. |
| `collaborates-with` | A ↔ B | `{person, self} × {person, goal}` | A and B work together. **Symmetric — store one direction only.** |
| `subject-of` | A → B | `person → {event, goal}` | A is who/what B is about. |
| `located-at` | A → B | `{event, role, state} → place` | Physical / digital location. |
| `caused-by` | A → B | `{state, event} → {event, role, place, person}` | A appeared because of B. |
| `reinforces` | A → B | `{stance, preference, role} → {stance, self}` | A strengthens B. |
| `competes-with` | A ↔ B | `{goal, stance, role} × {goal, stance, role}` | Tension between A and B. **Symmetric.** |
| `addresses` | A → B | `{goal, role} → {constraint, knowledge, event}` | A tries to resolve B (problem-solving process). |
| `counters` | A → B | `{stance, preference} → constraint` | A is a held counter-force against B (opposition, not process). For goal/role → constraint use `addresses`. |
| `requires` | A → B | `{goal, role} → {resource, knowledge, person, place}` | A depends on B. |
| `related-to` | A ↔ B | `* × *` | **Low-information fallback.** Queries deprioritize it. Use sparingly. |

Rules:

- **Pair check before proposing.** `subgoal-of` between a goal and a person is
  `BAD_PAIR` and will be rejected. When the pair doesn't match, drop the link
  rather than mislabel the relation. `related-to` is the only relation that
  accepts any (src, dst) pair.
- **Symmetric relations** (`collaborates-with`, `competes-with`, `related-to`):
  pick one direction and propose it once. Don't propose both `A → B` and
  `B → A` — querying treats them as equivalent.
- **`subgoal-of` is acyclic.** If you'd be creating a loop (`A subgoal-of B`
  while `B subgoal-of A` already exists), drop the link. The server returns
  `WOULD_CYCLE`.
- **Don't link everything.** A split with N entities doesn't need to be a
  complete graph. Propose only links the user stated explicitly, or that you'd
  be confident defending if asked "why this link?". Surplus links bury signal
  in `get_self_summary.key_links`.
- **Authority follows source.** Relation literally in the input → `self-declared`.
  Relation derived from side-context (per Step 0.5b) → `inferred`. Anything
  else → `observed`. See Step 5b for the persistence call.

## Step 3 — Extract attrs per type

Per chosen type, fill the strict attrs schema below. Unknown keys are
**rejected by the server** — only include keys listed here.

- `self`: `{ pillars: string[], voice_rules: string[], narrative: string }`
- `place`: `{ kind: "physical"|"digital"|"social", address?: string, recurring?: boolean }`
- `goal`: `{ timeframe: "long"|"mid"|"short", parent_id?: string, success_criteria?: string }`
  Boundaries: `short ≤ 90d`, `mid = 90d–18mo`, `long > 18mo`.
  If `success_criteria` contains a money amount, currency is required
  ("1K MRR USD", not "1K MRR").
- `knowledge`: `{ domain: string, depth: "novice"|"practitioner"|"expert", gaps?: string[] }`
  Romanian colloquial qualifiers calibrate as follows (default to lower bound,
  flag confidence as `medium`):
  - "abia mă descurc" / "habar n-am" / "începător" → `novice`
  - "mă descurc" / "așa și așa" / "mediocru" → `novice` (medium confidence —
    user may mean practitioner; ask if it matters)
  - "știu bine" / "sunt OK la" → `practitioner`
  - "expert" / "stăpânesc" / "fac din somn" → `expert`
- `person`: `{ relation: string, importance: "high"|"med"|"low", tags?: string[] }`
- `resource`: `{ kind: "tool"|"subscription"|"asset"|"access"|"budget", cost_per_month?: number, tags?: string[] }`
  If cost is unknown, *omit* the key and note "cost: unknown" in title.
  Do not fabricate a number.
- `constraint`: `{ kind: "time"|"ethical"|"legal"|"cognitive"|"capacity", hard_or_soft: "hard"|"soft" }`
- `state`: `{ mood?: string, energy?: "low"|"med"|"high", focus?: string, stress?: string, place_id?: string }`
  Fill *every* applicable key, not just the most obvious. If a cause is
  named ("după gardă"), append to title in parens until a `cause` field
  lands server-side.
- `event`: `{ related_entity_ids?: string[] }`
- `preference`: `{ register: "voice"|"aesthetic"|"taste", strength?: "mild"|"strong" }`
- `stance`: `{ reason: string, evidence_sources?: string[] }`
- `role`: `{ schedule?: string, domain?: "defensive"|"offensive"|"mixed"|"civic"|"care"|"creative"|"family", priority?: number }`

Heuristics for `authority` (read together with Step 0.5b):
- Claim is **literally** in the user's input → `self-declared`
- Claim came from side context (CLAUDE.md, memory, working dir) → `inferred`,
  AND must be a separate entity, never merged into a `self-declared` one
- Claim is something you noticed about the user during conversation
  (tone, behavior, patterns) → `observed`

Default `confidence`: `high` only when explicit and verbatim; `medium` if you
reworded or interpreted; `low` if any guessing involved.

## Step 3.5 — Clarify before proposing

If any required attr cannot be filled faithfully from the input (e.g.
`stance.reason` is implicit, `goal` lacks currency, `state` lacks cause),
ask **one** clarifying question before showing the Step 4 proposal block.
Do not surface a half-filled or fabricated proposal.

## Step 4 — Confirm with the user

Show this block, one entity per row when there is a split.

Only render `Resolved-dates`, `Existing-match`, and `Link-warnings` lines
when their value is non-empty. Skip them silently otherwise to keep the
proposal block tight.

```
Proposed:
  Type:       <type>
  Title:      <≤80 chars>
  Attrs:      { ... }
  Authority:  <self-declared|observed|inferred>
  Confidence: <low|medium|high>
  TTL:        <none | "+7d" | "+90d" | "+180d" | explicit ISO date>
  Resolved-dates: <only if relative dates were rewritten>
  Existing-match: <only if get_relevant_context returned a hit>
  Link-warnings: <only if a proposed link will not persist>
  Reasoning:  <one line — why this type, why these attrs>
```

Then ask: `Accept? [Y/n/edit/split]`

- `Y` (or empty) → proceed to Step 5.
- `n` → discard entities, but close the capture so the raw input still lives
  in the journal. Call:

  ```ts
  update_capture_status({
    capture_id,
    status: "aborted",
    classification_summary: { aborted_reason: "user declined" },
  })
  ```

  Then tell the user: "Nothing saved as entities. Capture #<prefix>... is in
  your journal (`ctx log --capture <prefix>`)." Stop.
- `edit` → ask which field to change, re-confirm.
- `split` → invite user to describe the desired split, then loop back to Step 2.

## Step 5 — Persist via MCP

### 5a — Entities

Call the `pca` MCP server tool `record_observation` with:

```ts
{
  text: <user's original line, OR the per-entity sentence if you split it>,
  type: <chosen type>,
  attrs: { ... },
  authority: <chosen>,
  source: "claude-code:ctx-add",
  expires_at: <ISO 8601 or omit to apply default TTL; pass null to disable TTL>,
  capture_id: <the capture_id from Step 0.4>,
}
```

For splits, call `record_observation` once per entity, in the order they
appeared in the Step 2 proposal. Keep a local table `positionToId` mapping the
proposed positions (1, 2, 3, ...) to the real entity ids returned by each call.

On error from the server:
- `BAD_ATTRS` → attrs schema mismatch; show the message, fix, retry.
- `SINGLETON_CONFLICT` (only for `type: "self"`) → tell the user a `self` already
  exists, and propose calling `update_entity` instead via a follow-up message.
- `INVALID_CAPTURE` → the `capture_id` from Step 0.4 is missing or malformed.
  This is a skill bug; surface the failure and stop.
- Anything else — surface the raw error and stop. Do NOT proceed to link
  persistence if any entity insert failed: links would dangle.

### 5b — Links

For every link the user accepted in Step 2, call the `pca` MCP tool
`link_entities`:

```ts
{
  src_id:    positionToId[<src position>],
  dst_id:    positionToId[<dst position>],
  relation:  <canonical relation>,
  authority: <"self-declared" | "observed" | "inferred">,
  capture_id: <the capture_id from Step 0.4>,
  // weight: optional; omit to use server default (1.0)
}
```

If a link references an entity from a previous session (one you found via a
prior `get_relevant_context` or `list_active` call rather than created in this
capture), use that entity's existing id directly instead of `positionToId`.

Pick `authority` deterministically (read together with Step 0.5b):

- `self-declared` — the user stated the relation explicitly in the input
  ("Mihai is my son", "I work with Razvan on Alteramens").
- `inferred` — you derived the link from side-context, not from a literal
  statement in the input (e.g. you concluded a goal `reinforces` an existing
  stance you found via `get_relevant_context`).
- `observed` — default for everything else (the relation is obvious from the
  bundle the user just confirmed, but it wasn't a literal claim).

The `relation` string MUST come from the canonical vocabulary defined in
Step 2.5. The server rejects anything else with `UNKNOWN_RELATION`,
`BAD_PAIR`, or `WOULD_CYCLE`.

On error from the server:
- `NOT_FOUND` / `INACTIVE_ENTITY` → log it, skip that link, continue with the
  rest. Report skipped links in Step 6.
- `UNKNOWN_RELATION` / `BAD_PAIR` / `WOULD_CYCLE` → this is a skill bug, not a
  user issue. Drop the link, surface the failing (src, dst, relation) tuple in
  the summary so you can fix the Step 2 proposal next time.
- `INVALID_CAPTURE` → the `capture_id` from Step 0.4 is missing. Skill bug;
  surface and stop.
- Anything else — surface the raw error and stop reporting links, but keep the
  entities that succeeded in 5a.

## Step 6 — Close the capture, then confirm

### 6a — Close the capture

After all 5a/5b calls have run (whether every link succeeded or some were
skipped), close the capture:

```ts
update_capture_status({
  capture_id,
  status: "processed",
  classification_summary: {
    types_proposed: [...],        // every type from the Step 2 proposal
    types_saved:    [...],        // types whose record_observation succeeded
    entity_ids:     [...],        // ids returned by 5a
    link_ids:       [...],        // ids returned by 5b
    entity_count:   N,
    link_count:     M,
    skipped_links:  [             // empty array if none were skipped
      { src, dst, relation, reason },
      ...
    ],
  },
})
```

Closing the capture is the final commit point of the pipeline. If
`update_capture_status` itself errors, surface it but do not roll back the
already-persisted entities/links — the capture row stays `pending` and
`ctx doctor` will flag it.

### 6b — Tell the user

After 6a succeeds, print one line per entity, then one line per link:

```
✓ Saved <type> #<id-prefix>... "<title>"
✓ Saved <type> #<id-prefix>... "<title>"
✓ Linked <relation>: #<src-prefix>... → #<dst-prefix>...
```

Use a 10-char id prefix (matches the format the user already sees from `ctx`
CLI output). If any link was skipped because a referenced entity was missing
or inactive, append:

```
⚠ Skipped link <relation>: <reason>
```

Always append a final line referencing the capture so the user knows it is in
the journal:

```
📓 Capture #<capture-prefix>... saved — `ctx log --capture <prefix>` to inspect.
```

Append a one-line tip if the user has captured **fewer than 3 entities total**
in this session: "Tip: try `/ctx-add` for goals, constraints, roles, and key
people first — that's the highest-leverage seed."

## Edge cases

- **Self singleton**: only one active `self` allowed. If the user is trying to
  rewrite their self, propose `update_entity` instead.
- **Multi-language**: classify in any language; titles in the user's language;
  enum values in `attrs` stay in English (the schema is canonical).
- **Long input**: if the input is over ~300 characters, propose a split before
  classifying as a single entity.
- **Past-tense narration**: if the user says "yesterday I X" or "last week
  Y" → entity type is `event`, attrs may reference related entities by id if
  you've called `get_relevant_context` to find them. Do NOT auto-link unless
  the user agrees.
- **State with no expiry hint**: default TTL 7d applies. But if the text
  starts with "azi" / "today" / "right now", TTL drops to 36h.
- **Array attrs (gaps, pillars, voice_rules, tags)**: `update_entity`
  *replaces* the array, does not merge. To add to an array, fetch current
  value first and pass the combined list.
- **Vendor/provider names**: no dedicated field. Encode in title:
  "Claude Code Max (Anthropic)".
