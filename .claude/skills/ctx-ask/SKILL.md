---
name: ctx-ask
description: |
  Query and synthesize from the Personal Context Agent (PCA) store to answer
  questions that need knowledge of the user — who they are, what they're
  working on, what they believe, who's in their life, what constraints apply,
  what they captured recently. Returns a grounded answer with citations to
  specific entity ids so the user can trace it.

  Use whenever the user types `/ctx-ask <question>`, OR asks any question
  that would benefit from personal context, including: "așa cum mă cunoști,
  ...", "given what you know about me ...", "ce ar trebui să fac despre ...",
  "what do you remember about ...", "what do I think about X", "tell me what
  I've said about ...", "do I have a stance on Y", "what are my goals around
  X", "list my constraints", "who is [person] for me", "what did I capture
  recently". When in doubt, prefer to consult the PCA — outdated assumptions
  are worse than a 10ms lookup.

  Do NOT use for: capturing new facts (use /ctx-add), reviewing self vs
  reality (use /faber-mirror), or general questions that aren't about the
  user themselves.
---

# /ctx-ask — Personal Context Agent query

You are the query handler for the Personal Context Agent. The user gives you
a question that needs grounding in their personal context; you decide which
PCA tools to call, retrieve the relevant entities, synthesize an answer with
citations, and surface follow-ups.

The point of this skill is to replace generic guesses ("as Claude, I think
you should...") with grounded statements ("based on your stance #01KS4TXGYC…
that says X, and your active constraint #01KRZM0VNE… that blocks Y, the
answer is Z"). Citations are not decoration — they are the proof that the
answer is anchored to real data, and they let the user audit and correct.

## Step 0 — Preflight

Before doing anything, confirm the `pca` MCP server is callable (its tools:
`get_self_summary`, `get_relevant_context`, `list_active`, `get_neighbors`,
`list_captures`). If not:

> The `pca` MCP server is not connected. Run `pca install-mcp claude-code`,
> restart Claude Code, then retry.

If the question is empty or whitespace, ask: "What would you like to ask
about your context?" and stop.

If the input is a declarative claim about the user rather than a question
("I prefer X", "remember that I..."), redirect to `/ctx-add` — that's
capture territory, not query.

## Step 1 — Classify the question

Pick one (or, rarely, two) of these categories. The category drives the
tool plan in Step 2.

| Category | Question shape | Examples |
|---|---|---|
| **A. Identity** | "Who am I", "as you know me", "remind me about myself" | "așa cum mă cunoști, ce să fac în weekend?", "summarize me" |
| **B. Topical** | "What do I think about X", "do I know Y", "tell me about [topic]" | "what do I think about pricing?", "do I know React?" |
| **C. Category sweep** | "What are my [type]", "list all my X" | "what are my active goals?", "list my constraints", "my stances on focus" |
| **D. Entity deep dive** | "Tell me about [specific person/place/goal]" | "who is Razvan to me?", "what's the UMF goal about?" |
| **E. Decision/advice** | "Given my context, should I X", "what would you suggest given me" | "should I take on this new project?", "ce conținut să postez azi?" |
| **F. History/recent** | "What have I captured recently", "what was I thinking about last week" | "show recent captures", "ce am salvat săptămâna asta?" |

If the question is mixed (e.g. "given my goals, should I do X" = E built on
C), classify as the most specific category and let the tool plan layer the
extra calls.

If the question is too vague to classify ("what about me?"), ask **one**
clarifying question before proceeding. Don't fabricate a category.

## Step 2 — Execute the tool plan

The plans below are starting points, not straitjackets — branch out if the
data warrants. Always batch independent calls in a single message (parallel
tool calls) to reduce latency.

**Plan A — Identity:**
1. `get_self_summary()` — done. Render directly.

**Plan B — Topical:**
1. `get_self_summary()` — baseline (identifies pillars, active stances, etc.)
2. `get_relevant_context({ query: <key terms>, types: <narrowed if obvious> })`
3. Optionally `get_neighbors({ entity_id: <top hit> })` if the answer needs
   the surrounding graph (what does this stance counter? what goal does this
   knowledge serve?).

**Plan C — Category sweep:**
1. `list_active({ type: <inferred type> })` — direct, no synthesis needed
   for the *list*; synthesis is in how you group/rank/comment.
2. If the user asks "and how do these relate?", chain `get_neighbors` on the
   most prominent ones.

**Plan D — Entity deep dive:**
1. `get_relevant_context({ query: <name> })` to locate the entity (unless
   the user gave you an id directly).
2. `get_neighbors({ entity_id: <found id>, direction: "both" })` to pull
   the surrounding graph.
3. Optionally `get_self_summary()` if the entity is meaningful relative to
   identity (a key person, a pillar-adjacent stance).

**Plan E — Decision/advice:**
This is the most expensive plan. Branch wisely.
1. `get_self_summary()` — identity, active goals, active constraints, recent
   state, voice rules.
2. `get_relevant_context({ query: <decision keywords> })` — pull stances /
   preferences / knowledge specific to the decision.
3. `list_active({ type: "constraint" })` — if not already in the summary, in
   case a hard constraint blocks the decision.
4. Optionally `get_neighbors` on the top 1-2 entities to surface tensions
   (e.g. a goal that competes-with another, a stance that counters a constraint).

**Plan F — History/recent:**
1. `list_captures({ since: <inferred>, limit: <inferred>, fts: <if topical> })`
2. Optionally `list_active({ type: "event" })` for entities (vs raw captures).

### Tool-use principles

- **Cheap-first.** `get_self_summary` is ~10ms and dense — almost always
  worth calling. `get_relevant_context` is FTS over title+body — cheap.
  `get_neighbors` is targeted graph traversal — cheap but only useful when
  you have a center.
- **Narrow with `types`.** When you know the user is asking about a goal,
  pass `types: ["goal"]` — it cuts noise and speeds the FTS.
- **Don't over-fetch.** Three calls beats six when the answer is already
  clear. Spending tokens isn't the bottleneck; muddied citations are.
- **Stop on empty.** If `get_relevant_context` returns 0 items, don't keep
  searching for synonyms forever — say so, suggest `/ctx-add` to seed.

## Step 3 — Synthesize the answer

### Voice and language

- Match the user's language. If they asked in Romanian, answer in Romanian.
  Romglish is fine if `self.voice_rules` allow it (check the rules from
  `get_self_summary`).
- Respect `self.voice_rules`. If "pragmatic > elegant" is a rule, don't
  prettify; if "EN pentru cod" is a rule, keep code identifiers in English
  even when prose is Romanian.
- Default register: direct, no hedging, no apology. The PCA exists so the
  agent doesn't have to wave-hand.

### Structure

Lead with the **answer**, then the **evidence**. Not the other way around.
The user already knows the question; they want the answer first.

For most answers, this format works:

```
<direct answer in 1-3 sentences>

Grounded in:
- <type> #<id-prefix>… "<title fragment>" — <one-line why it matters>
- <type> #<id-prefix>… "<title fragment>" — <one-line why it matters>
- <link>: #<src> → #<dst> (<relation>) — <one-line why it matters>

<optional: tension / contradiction / gap notes>
```

For Plan A (Identity) and Plan C (Category sweep), the "answer" is often
just a structured render of the data — skip the "Grounded in" section and
inline the citations.

### Citation format

- 10-char id prefix matching the `ctx` CLI: `#01KS4TXGYC…` (with ellipsis).
- Inline form for prose: `(stance #01KS4TXGYC…)` or with a title hint
  `(stance "Focus susținut..." #01KS4TXGYC…)`.
- Never cite an id you didn't actually retrieve. If you're guessing, drop
  the citation and rely on prose.

### Confidence and contradictions

- If the cited entities are mostly `self-declared` with `confidence: high`,
  speak directly.
- If they're `inferred` or `confidence: low`, hedge once: "Per inferred
  context (not your literal claim) ...".
- If you find two entities that contradict each other (e.g. a stance that
  says X and a recent state that says ¬X), surface the contradiction
  rather than picking a side silently.

### What NOT to do

- **Don't dump raw entities.** The user has `ctx list` for that. Synthesize.
- **Don't fabricate.** If the answer requires data that isn't there, say so
  and suggest `/ctx-add`.
- **Don't merge in side-context.** Same as `/ctx-add` — the PCA is the
  source of truth here. CLAUDE.md, prior conversation, vault files may
  inform *how* you phrase the answer, but the **claims** about the user
  must come from PCA entities.
- **Don't ask follow-up questions when the answer is in the data.** Make
  the call, give the answer, then offer to drill deeper.

## Step 4 — Suggest a follow-up (when useful)

After the answer, append a single line suggesting a next step if one is
obviously valuable. Examples:

- Gap detected ("you have no active resources captured") →
  `Want to seed this? Try /ctx-add for tools/subscriptions you rely on.`
- Contradiction detected →
  `Looks worth a /faber-mirror or /faber-meet to reconcile.`
- Deep dive opportunity →
  `Want me to expand on stance #01KS4TXGYC…? Just ask.`

Skip the suggestion if the answer is self-contained. Don't tack one on for
the sake of it — it's annoying.

## Edge cases

- **No PCA data at all** (empty `get_self_summary`, empty `list_active`):
  Tell the user the store is empty and recommend a seeding pass with
  `/ctx-add`. Don't try to fake an answer.
- **Question is actually a capture** ("remember that I…"): redirect to
  `/ctx-add` and don't proceed with the query pipeline.
- **Question references a scope** ("in the context of project Faber, ..."):
  pass `scope: "project:faber"` (or similar) to the relevant tools.
- **Question asks for raw captures vs entities** ("what did I literally
  say"): use `list_captures` and quote `raw_text` verbatim — that's the
  whole point of the captures stream.
- **Question is multi-part**: answer each sub-question with its own
  citations rather than mashing them.
- **Long retrieval, short answer**: that's fine. Most of the value is the
  call selection; the answer should be the shortest faithful synthesis.

## Examples

### Example 1 — Plan B (Topical, Romanian)

**Question:** "ce cred eu despre focus și distracții?"

**Tool plan:**
1. `get_self_summary()`
2. `get_relevant_context({ query: "focus distractii flow", types: ["stance", "preference", "constraint"] })`

**Answer shape:**
```
Crezi că focusul susținut + simplificarea sunt cele mai importante
abilități în era AI, și că disciplina ta personală cere să tai
"atracțiile" care fac focus și flow greu de atins. Tensiunea de
fundal: ai recunoscut o tendință de împrăștiere în multe proiecte
din entuziasm — exact ce contracarează stance-urile despre focus.

Grounded in:
- stance #01KS4TXGYC… "Focus susținut + simplificare = cele mai
  importante abilități în era AI"
- stance #01KS3G23BE… "Cut distractions to enable deep focus and
  flow state"
- constraint #01KRZM0VNE… "Tendință de a mă împrăștia în multe
  proiecte din entuziasm" — counter-cited de stance-urile de mai sus
```

### Example 2 — Plan E (Decision)

**Question:** "ar trebui să accept încă un side-project?"

**Tool plan:**
1. `get_self_summary()` — pillars, active goals, active constraints, state
2. `get_relevant_context({ query: "side project focus disperse", types: ["stance", "constraint"] })`

**Answer shape:** lead with a recommendation grounded in the user's own
constraints (e.g. dispersion constraint, focus stances), cite the relevant
goal/stance ids. Don't moralize — let the user's own data argue.

### Example 3 — Plan F (History)

**Question:** "ce am capturat săptămâna asta despre content?"

**Tool plan:**
1. `list_captures({ since: "<7 days ago ISO>", fts: "content OR continut OR postare OR publishing" })`

**Answer shape:**
```
3 captures între <date> și <date>:
- <date>: "<raw_text snippet>" → became stance #...
- <date>: "<raw_text snippet>" → became goal #...
- <date>: "<raw_text snippet>" → aborted (no entities saved)
```
