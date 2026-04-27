---
title: "Skillify — Every Agent Failure Becomes Permanent Infrastructure"
type: concept
category: technical-playbook
sources: [skillify-agents-same-mistakes, skill-graphs-2-heinrich]
entities: [garry-tan, gbrain, hermes-agent, openclaw, langchain, heinrich]
related: [thin-harness-fat-skills, latent-vs-deterministic, encoded-judgment, skill-era, compounding-games, performance-data-loop, executable-wiki, atoms-molecules-compounds, skill-graphs, brain-ram-leverage]
maturity: developing
confidence: high
contradictions: []
applications: []
---

# Skillify — Every Agent Failure Becomes Permanent Infrastructure

A 10-step promotion ritual authored by [[garry-tan]] that turns any agent failure (or any working prototype) into durable, test-backed infrastructure. Named as a verb. One word — *"skillify it"* — is the trigger phrase that moves a conversation-level fix into permanent structural shape.

## The Core Claim

> "In a healthy software engineering team, every bug gets a test. That test lives forever. The bug becomes structurally impossible to recur. AI agents should work the same way."

Most AI-agent reliability today is vibes-based: prompt tweaks, bigger system messages, "please don't hallucinate" incantations. That decays the moment the conversation gets complex. Skillify replaces that with software-engineering discipline: every failure → a skill; every skill → tests; every test → runs daily.

## The 10-Step Checklist

A feature that doesn't pass all ten is not a skill. It's just code that happens to work today.

| # | Step | What It Guarantees |
|---|------|---------------------|
| 1 | **SKILL.md** | The contract: name, triggers, rules. Markdown procedure the agent reads before acting. |
| 2 | **Deterministic code** | `scripts/*.mjs` for work that doesn't need a model. No LLM for what code can do. |
| 3 | **Unit tests** | Pure-function tests (vitest) against fixtures. Catches small/boring/critical bugs. |
| 4 | **Integration tests** | Live endpoints, real data. Catches what fixture data is too clean to expose. |
| 5 | **LLM evals** | LLM-as-judge for quality. Catches the *wrong process*, not just wrong output. |
| 6 | **Resolver trigger** | Entry in `AGENTS.md` routing intent → this skill. |
| 7 | **Resolver eval** | Tests that the trigger actually routes. Catches both false negatives and overlaps. |
| 8 | **Check-resolvable + DRY audit** | Meta-test: every SKILL.md has a resolver entry; no two skills overlap. |
| 9 | **E2E smoke test** | End-to-end pipeline check. Last line of defense when pieces don't connect. |
| 10 | **Brain filing rules** | Where does this skill write? people/, companies/, civic/? Consult a resolver, don't hardcode paths. |

Garry's concrete scale: 179 unit tests across 5 suites, under 2 seconds. 35 daily evals for `context-now` alone. 50+ resolver eval cases.

## The Two Failure Modes Skillify Prevents

**Failure 1 — wrong side:** The agent does deterministic work in [[latent-vs-deterministic|latent space]]. (Calendar grep done as LLM reasoning instead of a script. Timezone math done in the model's head instead of `context-now.mjs`.) Skillify catches this by forcing deterministic work into scripts that the skill file then *forces the agent to run*.

**Failure 2 — silent rot:** Skill written, agent creates variants, autonomous creation produces duplicates, APIs change, triggers never match. Skillify catches this via resolver eval + `check-resolvable` + DRY audit, running daily.

## The Loop That Makes the Architecture Work

> "The latent space builds the deterministic tool, then the deterministic tool constrains the latent space. The model's intelligence created the constraint that prevents the model from being stupid."

The agent uses judgment (latent) to write the deterministic script. The skill file then forces the agent to run that script instead of reasoning about the same problem again. The old failure path becomes structurally unreachable.

## Skillify as a Verb — The Natural-Language-to-Infrastructure Pipeline

The defining pattern: **prototype in conversation → see it work → say "skillify" → permanent infrastructure.** No specs. No tickets. One word turns an ad-hoc session into a durable skill with:
- SKILL.md written
- Deterministic code extracted
- Tests generated
- Resolver entry added
- Brain filing rules consulted

Garry's examples from daily use:
- "can you remember this as a webhook skill and skillify it" → after a one-hour OAuth webhook integration
- "we should remember this as a skill whenever anything in openclaw needs a headless browser... skillify it!"
- "whenever you send me a link you have to curl it yourself to make sure the endpoint is open and the tunnel works. skillify it!"
- "make a skill, make it deterministic to check these kinds of things" → for calendar double-booking

## Check-Resolvable: The Dark-Skill Problem

After a month of building, 40+ skills. First run of `check-resolvable` found **6 unreachable skills — 15% of system capabilities were dark.** A flight tracker nobody could invoke by asking about flights. A content-ideas generator only triggered by cron. A citation fixer that lived in the skills directory but wasn't listed in the resolver at all.

This is the silent-failure mode: capability exists, but the LLM can't reach it. "Like having a surgeon on staff but not listing them in the hospital directory. Worse than not having the skill at all, because you think the system handles it."

## The Most Honest Eval Heuristic

> "Search your conversation history for when you said 'fucking shit' or 'wtf.' Those are the test cases you're missing."

The frustrations you voiced in past conversations are the canonical failure set. They should all be evals.

## Why LangChain's $160M Missed This

Per Garry: [[langchain]] + [[langsmith]] shipped great primitives — trajectory evals, trace-to-dataset, LLM-as-judge, regression suites. But primitives without an opinionated workflow = "a gym membership without a workout plan." Skillify is the workout plan: it names what to test, in what order, and when you're done.

This is [[encoded-judgment]] at the framework level. LangChain's bet: stay primitive-layer, let opinions emerge above. Garry's counter: opinions are the moat — without them, users build vibes-based reliability.

## Reference Implementation: GBrain

[[gbrain]] is where Skillify lives. `gbrain doctor` is the Skillify checklist made executable — it's what the binary actually runs. `gbrain doctor --fix` auto-repairs DRY violations.

[[hermes-agent]] (Nous Research) creates skills autonomously but doesn't test them. **Creation + verification = both needed.** GBrain supplies the verification half.

## Application to Alteramens

Narcis's `.claude/skills/` directory is a skill collection: `semnal-draft`, `semnal-reply`, `faber-ingest`, `faber-query`, `to-content`, `faber-lint`, etc. The 10-step checklist is a durability standard for them. Highest-leverage next steps:

1. **Resolver eval layer** — detect if two Alteramens skills could fire on the same intent (e.g., `/faber-ingest` vs `/faber-seed` vs `/faber-link` — do triggers overlap?)
2. **Dark-skill audit** — are there skill files in `.claude/skills/` with no path to invocation?
3. **Deterministic-code gate** — for skills that currently do work in-prompt that a script could do (e.g., date parsing, URL validation, slug generation), extract scripts
4. **Failure-to-skill pipeline** — when a skill misbehaves in a real Narcis session, make "skillify the fix" the default response

## Verification at Each Composition Level (Heinrich)

[[skill-graphs-2-heinrich|heinrich's atoms/molecules/compounds]] enunță explicit ce Skillify implică: **gradul de verification posibil scade pe măsură ce urci în nivel de compoziție**. Heinrich admite că reliability-testing la fiecare nivel e *the unsolved bottleneck* — singurul lucru pe care n-a rezolvat-o.

Maparea celor 10 pași Skillify pe niveluri:

| Skillify step | Atom | Molecule | Compound |
|---|---|---|---|
| 1. SKILL.md | ✓ | ✓ | ✓ |
| 2. Deterministic code | ✓ heavy | ✓ for sub-steps | ✓ for sub-steps |
| 3. Unit tests | ✓ exhaustive | ✓ on combinations | partial — can only test sub-pieces |
| 4. Integration tests | ✓ | ✓ | ✓ |
| 5. LLM evals | ✓ on output quality | ✓ on choice of atoms | ✓ on orchestration choices — but combinatorial explosion |
| 6. Resolver trigger | ✓ | ✓ | ✓ |
| 7. Resolver eval | ✓ | ✓ | ✓ — overlap testing critical |
| 8. Check-resolvable + DRY | ✓ | ✓ | ✓ |
| 9. E2E smoke | low priority | ✓ | ✓ critical — last line of defense |
| 10. Brain filing rules | ✓ | ✓ | ✓ |

**Observații:**
- **Atoms** beneficiază maxim de Skillify — sunt aproape deterministe, deci unit tests se aplică mecanic. Dark-skill check (step 8) e critic pentru atoms care nu apar singure în resolver dar sunt chemate de molecules.
- **Molecules** au combinatorial explosion la LLM evals (step 5) — fiecare combinație de atoms × inputs e o rută testabilă. Heinrich numește asta "molecules trebuie să cheme atoms-urile fiabil".
- **Compounds** ating ceiling-ul de testabilitate. Skillify livrează stuctura, dar **autonomia compound-ului face ca un test exhaustiv să nu mai fie posibil**. Singura mitigation: E2E smoke + human-in-loop.

> heinrich: "I imagine an autoresearch type solution might be able to solve this, but I haven't tried that yet."

Asta extinde claim-ul lui Garry Tan: dacă atoms și molecules nu sunt skillified, **toate compounds-urile de deasupra moștenesc fragility**. Reliability-ul compound = product al reliability-urilor de mai jos. Un atom 95% fiabil într-un compound de 5 niveluri = 0.95^5 = ~77% reliability total.

**Pentru Alteramens** — implicația practică: dacă vreodată se construiește un compound `/alteramens-weekly-loop`, tot ce e dedesubt (`/faber-ingest`, `/semnal-draft`, `/to-content`) trebuie skillified întâi. Nu se poate compune deasupra ne-verificat. Vezi [[brain-ram-leverage]] și [[faber-as-skill-graph]].

## Connections

- [[thin-harness-fat-skills]] — the architecture Skillify operates inside
- [[latent-vs-deterministic]] — the mental model that explains *which* step each failure belongs in
- [[encoded-judgment]] — Skillify is how encoded judgment gets enforced and kept honest
- [[compounding-games]] — every bug permanently prevented = compounding reliability
- [[performance-data-loop]] — adjacent pattern: Skillify prevents failure; performance-data-loop measures the system. Both compound.
- [[executable-wiki]] — same shape: knowledge as a callable, testable, auditable artifact
- [[atoms-molecules-compounds]] — modelul de stratificare unde Skillify se aplică diferențiat
- [[skill-graphs]] — topologia knowledge-network în care Skillify previne drift și dark-skills
- [[brain-ram-leverage]] — argumentul economic care motivează strict-ness-ul disciplinei
