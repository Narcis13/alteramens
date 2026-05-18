---
purpose: Regression of 10 dry-run inputs against v3 SKILL.md (274 lines)
date: 2026-05-18
mode: dry-run (no writes to PCA store)
skill_version: SKILL.md @ 274 lines (post-v3-diff)
baselines: learnings.md (v1), learnings-v2-regression.md (v2)
---

# /ctx-add v3 regression

Same 10 inputs. For each iteration: what closed since v2, what's still open, what (if anything) v3 broke.

---

## Iter 1 — `Vreau să ajung la 1K MRR cu Alteramens până la finalul lui 2027`

- **No v3 changes apply.** Status carried from v2: 3 resolved, 1 open (MEMORY.md anti-pattern detection — hook job, out of skill scope).

## Iter 2 — `Miercurea seara între 18 și 20 sunt voluntar la centrul de bătrâni din Pitești`

- ✅ **NEW in v3:** Step 2 Split triggers list "Named location/institution in a role, event, or state → propose a companion `place` entity" with this exact input as the example. Companion place is now mandatory.
- **Closes the last open item from v2.** 3/3 resolved.

## Iter 3 — `Mihai (fiul meu, 18 ani) se pregătește pentru admitere la UMF Carol Davila iulie 2027`

- ✅ **NEW in v3:** The Step 2 worked example now includes `place: "UMF Carol Davila"` as item #3 and an `event → place (located-at)` link as item #5. Institution no longer buried in event title.
- **Closes the last open item from v2.** 4/4 resolved.

## Iter 4 — `azi sunt epuizat după gardă, abia mai funcționez`

- No v3 changes apply. Status carried from v2: 3/3 resolved.

## Iter 5 — `Cred că software-ul critic ar trebui să ruleze pe hardware deținut de utilizator, nu în cloud-uri proprietare`

- ✅ **NEW in v3:** Step 0.5 #4 now triggers `get_self_summary` for `stance` candidates and offers `add stance / promote to pillar / abort` if it duplicates or contradicts a pillar.
- ⚠️ `stance.strength` field still missing — needs server-side schema change. Carried open.
- v2: 2/4 resolved → v3: 3/4 resolved.

## Iter 6 — `Publicăm pe Substack-ul Alteramens săptămânal, joi dimineața`

- ✅ **NEW in v3:** Step 2 Split triggers explicitly covers "Destination + cadence" → place + preference. This exact input is the worked example. Skill will now propose two entities and a preference titled "Weekly Thursday AM publishing cadence".
- ⚠️ Dedicated `place.cadence` / `preference.cadence` fields still missing. Schema ask. But the workaround (preference entity carrying cadence in title) is functionally adequate for query/recall.
- v2: 1/3 resolved → v3: 2/3 resolved (the third is cosmetic at this point).

## Iter 7 — `Sunt un developer pragmatic care construiește SaaS-uri B2B nișate pentru piața românească`

- ✅ **NEW in v3:** Step 0.5 #1 now pins the UX format — side-by-side diff block with `[r]eplace narrative / [m]erge arrays / [a]bort` prompt and an explicit array-merge note.
- **Closes the last open item from v2.** 3/3 resolved.

## Iter 8 — `abia mă descurc cu React Native, mai ales cu navigation și state persistence`

- ✅ **NEW in v3:** Step 3 knowledge attrs now has an explicit Romanian calibration table. "abia mă descurc" → `novice`, confidence flagged `medium`.
- **Closes the last open item from v2.** 2/2 resolved.

## Iter 9 — `Am abonament Cursor Pro la $20/lună și folosesc Claude Code Max prin Anthropic`

- No new fixes — was already 3/3 in v2. v3's Split triggers now explicitly lists "Two resources/tools in one input → one `resource` entity per item, with shared tags" as a mechanical trigger, reinforcing the existing correct behavior.

## Iter 10 — `Săptămâna trecută am ieșit cu Andrei Pop la cafea în centru și am discutat despre cum integrăm PCA în workflow-ul lui de consultanță`

- ✅ **NEW in v3:** Step 0.5 #5 adds the vague-place canonicalization prompt: when input names a non-canonical place ("în centru"), ask once for the canonical name and cache it for the session.
- **Closes the last open item from v2.** 3/3 resolved.

---

## Score progression

| Source | ✅ resolved | ⚠️ open |
|---|---|---|
| v1 baseline (learnings.md) | 0 / 32 | 32 |
| v2 (post first diff) | 22 / 32 | 10 |
| **v3 (post second diff)** | **29 / 32** | **3** |

29 of 32 documented failure modes resolved (≈91%). The 3 remaining all require server-side schema changes.

---

## Still open after v3 (won't fix without schema)

1. `stance.strength` field — iter 5
2. `place.cadence` / `preference.cadence` fields — iter 6 (workaround in place, but no first-class queryable cadence)
3. MEMORY.md anti-pattern surfacing — iter 1 (out of scope, hook responsibility)

---

## v2-introduced issues — status after v3

| # | Issue | Status |
|---|---|---|
| 1 | Latency creep (+1–3 MCP calls in Step 0.5) | ⚠️ worse in v3 — Step 0.5 now has 6 items including new stance-triggered `get_self_summary` |
| 2 | Two-question chattiness (Step 0.5 + Step 3.5) | ⚠️ worse — stance candidates can now hit Step 0.5 #4 prompt AND Step 3.5 clarify |
| 3 | Always-on proposal lines | ✅ CLOSED (now conditional) |
| 4 | English coverage gap in stance rule | ✅ CLOSED |
| 5 | Step 0.5 doesn't cover stance | ✅ CLOSED |

**3 of 5 closed. 2 got worse.** Tradeoff is explicit: more correctness, more round trips and more user prompts.

---

## 🆕 New issues v3 may introduce

1. **Over-splitting risk.** "Apply mechanically, even when input reads as 'one fact'" is a strong instruction. A short input like "lucrez la spital" *could* trigger a 2-entity split (role + place) when the user just wanted one role entity. Worth watching.
2. **Session cache for vague-place canonicalization is undefined.** Step 0.5 #5 says "cache the answer for the rest of the session" — but the skill has no defined cache primitive. In practice, the LLM has to remember within its context window, which fails across compactions.
3. **Multi-prompt chain for stance.** A stance with implicit reason + pillar duplication = (a) Step 3.5 asks for reason, (b) Step 0.5 #4 asks add/promote/abort, (c) Step 4 confirms. Three prompts before persistence. Designed correctness, real chattiness.
4. **Side-by-side diff format is described, not enforced.** Step 0.5 #1 shows a code-block template but the LLM has to render it correctly. Could degrade to a bullet list under prompt drift.

---

## Diminishing returns reached

v1 → v2: 22 fixes (high signal, low effort).
v2 → v3: 7 fixes (medium signal, low effort).
v3 → v4 (hypothetical, pure prose): probably 1–2 fixes left (over-splitting guard rails, cache primitive doc). Most remaining wins now require server-side schema changes.

Recommendation: **stop iterating prose**. Take the 3 schema asks (`stance.strength`, `*.cadence`, `cause`) to whoever owns the PCA server. Re-run regression after schema lands.
