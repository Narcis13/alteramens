---
title: AI Tutor Admitere — Decision Log
project: ai-tutor-admitere
status: ideation
created: 2026-04-07
tags: [project, ed-tech, decisions]
---

# AI Tutor Admitere — Decision Log

Append-only log of major decisions for the AI tutor for Romanian medical school admission product. Born from the 2026-04-07 brainstorm session.

> **Wiki references:** strategic frame in [[wiki/syntheses/ai-tutor-admitere-strategic-frame|Strategic Frame]], origin source in [[wiki/sources/brainstorm-ai-tutor-medicina|Brainstorm Source]].

---

## 2026-04-07 — Project ideation session

Brainstorm with Claude reframed the project from "personalized AI learning platform" (vague) to "AI tutor for Carol Davila admission, biology, 2027 cohort" (bounded). See [[wiki/sources/brainstorm-ai-tutor-medicina|brainstorm source page]].

### Decision 1 — Wedge: Carol Davila biology 2027
**Decided:** the first market is UMF Carol Davila București, biology subject, 2027 cohort. Romanian language. Manual de Biologie XI-XII + barem Carol Davila as scope.

**Reasoning:** all the properties of a bounded problem (named buyer, real deadline, validated alternative, finite content, binary outcome) are present and identifiable. Vague alternatives ("AI personalized learning") fail every test.

**Reference:** [[wiki/concepts/bounded-problem-wedge|Bounded Problem Wedge]].

### Decision 2 — Identity: founder of an ed-tech startup
**Decided:** Narcis's role on this project is "founder of an ed-tech startup," not "father building a tool for his son." Product decisions optimize for product viability. Mihai is user zero, not raison d'être.

**Reasoning:** the frame determines every downstream decision. "Father building a tool" produces a hobby. "Founder building a product" produces a startup with brand, legal entity, pricing discipline, and a path to scale beyond the first user.

**Implication:** legal entity structure (SRL nou or sub-brand under existing structure) is a near-term decision. Brand is separate from Alteramens (or at least a clearly distinct sub-brand).

### Decision 3 — Mihai is user zero, with public stake at maximum
**Decided:** Mihai Brîndușescu is the named user-zero. Build-in-public stake is "very much" — Narcis is willing to bet publicly that Mihai uses the tool as primary preparation method for the actual 2027 admission.

**Reasoning:** [[wiki/concepts/authentic-creation|authenticity]] at maximum produces the strongest possible marketing moat. A father building publicly the instrument his own child uses for an irreversible exam outcome cannot be replicated by a competitor.

**Constraints:**
- Mihai's consent is explicit and revocable
- Public narrative cannot become surveillance
- Personal data shared in public is sanitized; parent dashboard data stays private
- The eventual exam result will be reported honestly regardless of outcome

**Reference:** [[wiki/concepts/building-in-public|Building in Public]].

### Decision 4 — Medical content validation: a UMF student
**Decided:** medical content quality (AI explanations of biology answers) will be validated by a UMF student reviewer. Likely paid arrangement (~500 lei/month order of magnitude, to be confirmed).

**Reasoning:** the founder is not a medical professional. Without subject-matter validation, the product risks shipping confidently wrong explanations — fatal for trust in an exam-prep product. A UMF student is cheap enough to recruit, qualified enough to catch errors, and brings credibility.

**Open:** specific recruitment, contract format (review checklist + SLA on response time), legal arrangement, scaling path as content volume grows.

---

## 2026-04-08 — Strategic decoupling session

Follow-up to the 2026-04-07 brainstorm. Closes the most important open question and registers competitive intel.

### Decision 5 — Decuplare de obiectivul 1K MRR / 6 luni
**Decided:** acest proiect este **decuplat** de obiectivul Alteramens "1K MRR în 6 luni". Se joacă pe orizont 18-24 luni (cohorta admitere 2027). Implementarea are flexibilitate completă (SaaS vs Electron, scope MVP, ritm content, channel mix) — niciuna dintre alegeri nu mai trebuie să optimizeze pentru "venit până în luna 6".

**Reasoning:** validarea reală a produsului vine la rezultatele admiterii din iulie 2027. Cohorta de plătitori se materializează abia în vara 2026. A forța pe acest proiect un timeline de 6 luni pentru MRR ar însemna fie:
- (a) să-l reduc la un chatbot generic care vinde acum dar abandonează moat-ul de calibrare și longitudinal model, fie
- (b) să creez presiune artificială care strică [[wiki/concepts/reverse-time-planning|reverse-time planning]] și [[wiki/concepts/bounded-problem-wedge|bounded scope]].

Ambele variante distrug exact ce face proiectul valoros. Decizia: **path A din [[wiki/sources/brainstorm-ai-tutor-medicina|brainstorm — Risk flagged]]** — accept orizontul lung, joc compounding, Mihai e proof point, MRR-ul vine din alte experimente Alteramens dacă e nevoie să curgă cash în 2026.

**Implication:**
- Layer 5 din [[wiki/syntheses/ai-tutor-admitere-strategic-frame|strategic frame]] (compounding game) devine scoreboard primar, nu "nice-to-have după ce hit MRR".
- Decizii downstream (legal entity, pricing experiments, content velocity, build-in-public cadence) pot fi optimizate pentru calitate și moat, nu pentru viteză de monetizare.
- Portofoliul Alteramens trebuie să găsească alt vehicul pentru obiectivul 1K MRR / 6 luni dacă acesta rămâne în picioare — sau să-l revizuiască explicit. Aceasta este o întrebare separată care nu se rezolvă în decision log-ul acestui proiect.
- Flexibilitatea pe implementare nu înseamnă lipsă de disciplină: [[wiki/concepts/validate-before-build|Validate Before Build]] și [[wiki/concepts/kill-fast|Kill Fast]] se aplică în continuare la nivel de feature și ipoteză, doar nu la nivel de "trebuie să încasez X EUR până în luna Y".

**Reference:** [[wiki/sources/brainstorm-ai-tutor-medicina|brainstorm source — Resolution section]], [[wiki/syntheses/ai-tutor-admitere-strategic-frame|strategic frame — Open Questions resolved]], [[wiki/concepts/compounding-games|Compounding Games]].

### Note 5a — Brand: AIDIDACT (proposal, not ratified)
**Status:** working proposal, not a final decision.

**Proposal:** **AIDIDACT** — portmanteau de la *autodidact* + *AI*. Capturează ideea că produsul nu înlocuiește profesorul, ci dezvoltă capacitatea elevului de a învăța singur cu un ghid AI inteligent.

**Pro:**
- Sonor românesc/internațional simultan
- Spune ce face produsul fără a fi descriptiv
- Decuplat de "Carol Davila" — permite extensii la layer 5 (compounding) fără rebrand

**Cons / verificat înainte de ratificare:**
- Domeniu disponibil (.ro, .com, .eu)
- Nu există marcă înregistrată conflictuală în RO sau EU
- Search results — "ididact" / "aididact" sunt curate?
- Pronunție: parinții români îl pot rosti fără ezitare?

**Open:** ratificarea brandului rămâne în lista de decizii deschise. Această notă doar înregistrează propunerea pentru a nu pierde firul.

### Note 5b — Competitive intel — competitor entities create
**Created in wiki:**
- [[wiki/entities/eduboom|Eduboom]] — content-library competitor (subscription, video lessons, brand RO)
- [[wiki/entities/centrul-excelenta-carol-davila|Centrul de Excelență Carol Davila]] — institutional / trust-anchor competitor

**Strategic implication captured pe paginile entităților:**
- Eduboom = competitor de altă categorie; nu competition pentru parintele care plătește 5-10k EUR meditații
- Centrul de Excelență = trust ceiling de respectat, nu de demolat; AI tutor servește segmentul subdeservit (non-București, daily accountability, personalizare)
- Wedge-ul rămâne intact: niciun competitor nu ocupă spațiul calibration + longitudinal + agentic + parent dashboard + founder authenticity

**Open:** verificare directă a pricing-ului, scope-ului și capacității ambilor competitori înainte de orice claim public competitiv. Vezi secțiunile "Open Verification" pe paginile de wiki.

---

## Open decisions

These were raised in the brainstorm but **not** decided. Listed here so they are not forgotten.

- **Product name and brand** — *working proposal: **AIDIDACT** (Note 5a, 2026-04-08). Not yet ratified — pending domain check, trademark check, search hygiene, pronunciation test.*
- **Legal entity:** new SRL? sub-brand of existing structure?
- **LLM cost model:** credit-based vs included in package, given heavy daily usage over 10 months
- **MVP scope:** smallest version that lets Mihai actually study by autumn 2026
- **Build-in-public channel mix:** newsletter (RO), LinkedIn RO, X RO, Facebook groups for parents, mix?
- **Pricing experiment plan:** test 700 EUR package with ≥5 real parents before building product
- **Local (Electron) vs web:** does offline access matter for parent trust? does it matter for Mihai's commute studying?
- ~~**Time allocation:** full-time on this (18-24 month horizon, conflicts with 1K MRR / 6 month goal) vs 30% time alongside something that ships and sells now.~~ **RESOLVED 2026-04-08, Decision 5:** project is decoupled from the 1K MRR / 6-month goal. Implementation has full flexibility on the 18-24 month horizon.
- **Portfolio question (raised by Decision 5):** if the AI tutor is decoupled from 1K MRR, does the 1K MRR / 6 month goal stay active for Alteramens via a different vehicle, or is it itself decoupled / revised? **Resolve in a separate #strategy session at the Alteramens portfolio level**, not in this project's log.

---

## Decision template (for future entries)

```
### YYYY-MM-DD — Decision N — short label
**Decided:** what was decided in one sentence.
**Reasoning:** why this and not the alternatives.
**Implication:** what this forces or unblocks.
**Reference:** [[wiki/...]] or [[other vault doc]] if applicable.
```
