---
purpose: Regression of the 10 dry-run inputs from learnings.md against the patched SKILL.md
date: 2026-05-18
mode: dry-run (no writes to PCA store)
skill_version: SKILL.md @ 228 lines (post-diff)
baseline: learnings.md (same 10 inputs, pre-diff)
---

# /ctx-add v2 regression

Same inputs. New skill. For each iteration: ✅ failure modes resolved, ⚠️ still open, 🆕 newly introduced.

---

## Iter 1 — `Vreau să ajung la 1K MRR cu Alteramens până la finalul lui 2027`

- ✅ Timeframe boundary fixed: 19.5 months > 18mo → `long`. Deterministic.
- ✅ Step 3.5 fires on missing currency → asks "USD / EUR / RON?" before proposal.
- ✅ Step 0.5 resolves "finalul lui 2027" → `2027-12-31` and surfaces it in `Resolved-dates`.
- ⚠️ MEMORY.md anti-pattern (user rejected "1K MRR" framing) — still out of skill scope. Hook job.

## Iter 2 — `Miercurea seara între 18 și 20 sunt voluntar la centrul de bătrâni din Pitești`

- ✅ Decision rule disambiguates: "voluntar" = identity-while-doing-X → `role`. No more flip-flopping.
- ✅ `role.domain` now accepts `care` — clean mapping, no semantic-blank `mixed`.
- ⚠️ Companion `place` entity ("centrul de bătrâni din Pitești") **still not auto-proposed**. The Step 2.5 rule from learnings.md ("any role/event with a named location should auto-propose a place") didn't make it into the diff. Re-open if you want it.

## Iter 3 — `Mihai (fiul meu, 18 ani) se pregătește pentru admitere la UMF Carol Davila iulie 2027`

- ✅ `Link-warnings` line in proposal block surfaces "person→event link will NOT persist" **before** user accepts.
- ✅ `Resolved-dates` shows "iulie 2027" → `2027-07-31` (still picks end-of-month by convention; flag if user wants start).
- ✅ Step 0.5 #3 forces `get_relevant_context` lookup — if a Mihai entity exists, it's surfaced as `Existing-match`.
- ⚠️ UMF Carol Davila as a third `place`/institution entity — still not split out. Same gap as iter 2.

## Iter 4 — `azi sunt epuizat după gardă, abia mai funcționez`

- ✅ "azi" triggers 36h TTL (new edge-case rule).
- ✅ Step 3 instruction "fill every applicable key" → mood + energy + focus + stress all populated. No more single-key collapse.
- ✅ "după gardă" cause encoded in title parens as documented workaround.

## Iter 5 — `Cred că software-ul critic ar trebui să ruleze pe hardware deținut de utilizator, nu în cloud-uri proprietare`

- ✅ Decision rule "cred că → stance" anchors classification.
- ✅ Step 3.5 catches implicit `reason` → asks for it before showing proposal. No fabrication.
- ⚠️ `stance.strength` ("casual" vs "load-bearing") — proposed in learnings, **not added** to schema or skill. Still no signal for foundational beliefs vs throwaway opinions.
- ⚠️ Step 0.5 does NOT trigger `get_self_summary` for `stance` candidates → no cross-check against existing `self.pillars`. Still risk of pillar duplication.

## Iter 6 — `Publicăm pe Substack-ul Alteramens săptămânal, joi dimineața`

- ✅ Step 0.5 #2 dedupes against an existing Substack `place` entity if any.
- ⚠️ Cadence-as-preference split rule from learnings ("destination + cadence → propose place + preference") **not added** to Step 2. Skill will still classify this as a single `place` and drop the cadence info.
- ⚠️ `place.cadence` / `preference.cadence` field — not added (server-side schema ask).

## Iter 7 — `Sunt un developer pragmatic care construiește SaaS-uri B2B nișate pentru piața românească`

- ✅ Step 0.5 #1 short-circuits to update-vs-replace prompt **before** Step 1. No more 30-second wasted turn ending in SINGLETON_CONFLICT.
- ✅ Array-attr replace-vs-merge semantics now documented in edge cases — user knows arrays don't merge.
- ⚠️ The update-vs-replace prompt is specified but **UX format isn't pinned**. Diff says "switch to update-vs-replace prompt" without mandating side-by-side display of existing vs proposed `narrative`. LLM run will improvise.

## Iter 8 — `abia mă descurc cu React Native, mai ales cu navigation și state persistence`

- ✅ Step 0.5 #2 queries existing `knowledge` for "React Native" → if present, propose `update_entity` (merge gaps after fetching current value, per array-attr rule).
- ⚠️ Romanian colloquial calibration ("abia" = novice vs practitioner) — not added. Skill still defaults to novice without the suggested confidence downgrade to medium.

## Iter 9 — `Am abonament Cursor Pro la $20/lună și folosesc Claude Code Max prin Anthropic`

- ✅ Two-entity split unchanged (Step 2 already handled this) → Cursor Pro (cost: 20) + Claude Code Max (cost: omitted, title notes "cost: unknown").
- ✅ Vendor name encoded in title: "Claude Code Max (Anthropic)".
- ✅ `resource.tags` lets you group both under `["ai-tooling"]`.

## Iter 10 — `Săptămâna trecută am ieșit cu Andrei Pop la cafea în centru și am discutat despre cum integrăm PCA în workflow-ul lui de consultanță`

- ✅ Step 0.5 #3 forces `get_relevant_context` on Andrei + PCA → `related_entity_ids` populated, `Existing-match` line shows hits.
- ✅ Step 0.5 #4 resolves "săptămâna trecută" → `2026-05-11`, shown in `Resolved-dates`.
- ⚠️ Vague-place canonicalization ("în centru" → "centru Pitești") — not added. Skill will either drop the location or invent a label.

---

## Score

| Iter | ✅ resolved | ⚠️ open | 🆕 new |
|------|------------|---------|--------|
| 1    | 3          | 1       | 0      |
| 2    | 2          | 1       | 0      |
| 3    | 3          | 1       | 0      |
| 4    | 3          | 0       | 0      |
| 5    | 2          | 2       | 0      |
| 6    | 1          | 2       | 0      |
| 7    | 2          | 1       | 0      |
| 8    | 1          | 1       | 0      |
| 9    | 3          | 0       | 0      |
| 10   | 2          | 1       | 0      |
| **Σ** | **22**    | **10**  | **0**  |

22 of 32 documented failure modes resolved (≈69%). No regressions. 10 still-open items, all flagged in learnings.md but not included in the applied diff.

---

## 🆕 Cross-cutting issues *introduced* by the patch

These are real costs of the new skill that weren't issues before. Worth tracking:

1. **Latency creep.** Step 0.5 adds 1–3 MCP round trips per `/ctx-add` invocation (self check, dup check, event-context lookup). Felt as ~100–300ms extra per capture. Mostly invisible for one-shot use; noticeable in burst captures.
2. **Two-question chattiness.** Step 0.5 (update-vs-replace) + Step 3.5 (clarify-required-attr) can both fire on the same input → user answers two clarifying questions before seeing a proposal. Worst case: iter 7 with a missing currency in the new `self.narrative` would round-trip twice.
3. **Always-on proposal lines.** `Resolved-dates`, `Existing-match`, `Link-warnings` render every time, even when value is `none`. Minor noise; consider rendering only when non-empty.
4. **English/Romanian decision-rule coverage gap.** The "cred că → stance" rule catches Romanian; English "I think" / "I believe" / "in my opinion" not explicitly listed. LLM will likely generalize, but it's an unstated assumption.
5. **Step 0.5 doesn't cover `stance`.** Listed for self/knowledge/resource/person/place/event — not stance. Iter 5's `self.pillars` cross-check gap is partly a consequence.

---

## Outstanding (10 items the diff didn't address)

| # | Item | Touches |
|---|------|---------|
| 1 | Companion `place` auto-proposal for role/event with named location | iter 2, 3 |
| 2 | UMF / institution split as third entity | iter 3 |
| 3 | `stance.strength` field | iter 5 |
| 4 | `get_self_summary` cross-check for `stance` candidates | iter 5 |
| 5 | Destination + cadence → split into place + preference | iter 6 |
| 6 | `place.cadence` / `preference.cadence` field | iter 6 |
| 7 | Pinned UX format for self update-vs-replace prompt (side-by-side) | iter 7 |
| 8 | Romanian colloquial calibration ("abia" → novice with medium confidence) | iter 8 |
| 9 | Vague-place canonicalization prompt | iter 10 |
| 10 | English coverage in stance decision rule | cross-cutting |

Plus the **5 server-side schema asks** carried over from learnings.md: `state.cause`, `place.cadence`, `preference.cadence`, `resource.cost_unknown`, `stance.strength`.

---

## Recommendation

The patch is a net win — 22 fixes, 0 regressions. The 10 open items split into:
- **3 you can fix in SKILL.md right now** (#1, #5, #7, #10) — pure prose, no schema needed.
- **2 small skill additions** (#2 companion entities, #8 calibration) — also pure prose.
- **5 require schema work** (server-side, separate ticket).

Suggest a v3 pass that closes the 5 prose-only items. Want me to draft that diff?
