---
title: "Altera OS — Framework Fit & Honest Gaps"
type: synthesis
trigger: query
question: "Trece spec-ul Altera OS filtrele Skill Era + agent-native era? Ce concepte wiki instanțiază și ce lipsește?"
sources_consulted: [skill-era-article, pat-walls-agent-first-1t-thread, eric-siu-world-intelligence, naval-framework, alteramens-manifest]
concepts_involved: [skill-era, encoded-judgment, agent-native-startup, vertical-operator-edge, internal-to-product, emergent-schema, executable-wiki, ambient-computation, conversational-interface, headless-saas-thesis, data-compounding-moat, compounding-games, specific-knowledge, productize-yourself, bounded-problem-wedge, validate-before-build, outcome-based-pricing, media-plus-agents-distribution, mcp-as-distribution, sovereign-ai-tokenization, dual-orchestrator-pattern, ai-native-operational-platform]
entities_involved: [alteramens, nbrain, pat-walls]
created: 2026-04-19
updated: 2026-04-19
maturity: developing
---

# Altera OS — Framework Fit & Honest Gaps

Un filed-query: spec-ul `workshop/ideas/altera-os.md` (v1.2, 2103 linii) evaluat contra cadrului filozofic + operațional Alteramens acumulat în wiki. Scopul: să verificăm ce concepte existente instanțiază, ce concepte noi expune, și unde playbook-ul agent-native îl prinde pe picior greșit.

## Verdict Sumar

| Filtru | Rezultat | Notă |
|---|---|---|
| **[[skill-era]]** (judgment encodat, leverage, compounding) | ✅ TRECE MAXIMAL | Secțiunea 18 self-check e onestă și aliniată |
| **[[agent-native-startup]]** (agent IS the product) | ⚠️ PARȚIAL | Hibrid UI+chat, nu inversie structurală |
| **[[headless-saas-thesis]]** (wrap incumbent, don't rebuild) | ❌ INVERS | Construiește DB proprie în loc să wrap-uiască sisteme spital existente |
| **[[media-plus-agents-distribution]]** (distribuție înainte de produs) | ❌ ABSENT | Zero plan distribuție până Phase 3 (luna 5-6) |
| **[[outcome-based-pricing]]** (switchable din v1) | ❌ ABSENT | Standard SaaS pricing, fără instrumentare outcomes |
| **[[bounded-problem-wedge]]** (narrow beats generic) | ⚠️ TENSIUNE | MVP = 1 use-case; build plan = 14 packages |
| **[[validate-before-build]]** (market signal before scale) | ⚠️ TENSIUNE | 20+ săptămâni infra înainte de semnal SaaS |

Traducere: pe axa "este acest proiect coerent cu fundamentul Alteramens?" → DA, e cea mai completă materializare. Pe axa "execută playbook-ul agent-native ca să câștige în cycle-ul 2026?" → nu, fragmentar.

## Coverage — concepte existente pe care Altera OS le instanțiază

15 concepte wiki apar în spec la nivel de decizie de arhitectură sau constraint:

| Concept wiki | Manifestare în Altera OS |
|---|---|
| [[skill-era]] | Skills MD + tools TS + MCP (Phase 3) = distribuție via agent workflows |
| [[encoded-judgment]] | 4 locații: classification taxonomy, sanitization policy, schema promotion heuristics, workflow orchestration |
| [[agent-native-startup]] | Spec îl citează explicit; robun = agent-first surface (dar hibrid, vezi gaps) |
| [[vertical-operator-edge]] | Narcis @ Spital Pitești, ~10 ani IT sanitar — trec cele 4 teste operator-edge |
| [[internal-to-product]] | D1: spital first → SaaS; Phase 3 = productize |
| [[emergent-schema]] | D4 (EAV first → structured promotion dinamic) — match 1:1 |
| [[executable-wiki]] | Faber încorporat la runtime în `altera.db` ca tabele `wiki_*` |
| [[ambient-computation]] | Event bus + triggers + nightly schema analyzer |
| [[conversational-interface]] | Chat panel persistent + robun intent routing |
| [[data-compounding-moat]] | EAV + wiki + collections acumulează context tenant-specific |
| [[compounding-games]] | 6 luni / 3 faze, disciplinate |
| [[specific-knowledge]] + [[productize-yourself]] | Secțiunea 18 face self-check pe ambele |
| [[mcp-as-distribution]] | Menționat post-Phase 3 ca follow-on distribution layer |
| [[knowledge-driven-platform-paradigm]] (synthesis) | Întreaga sinteză descrie exact ce vrea Altera să fie |
| [[agent-native-vertical-playbook]] (synthesis) | Spec îl citează ca "al doilea vertical" după nBrain |

Observație: spec-ul este un Frankensyn — aproape întreg framework-ul Alteramens compilat într-un plan executabil. Asta e și punctul lui forte și riscul.

## Cele 4 fisuri vs [[agent-native-vertical-playbook]]

### Fisura 1 — Nu e "pur agent-native", e hibrid

[[agent-native-startup]] e explicit: *"there is no UI-first product the agent supplements — the agent IS the entire offering."* Altera OS are **Admin UI React 19 co-egal cu chat panel**. Spec-ul D6 menționează "Dual: Admin UI + chat embedded."

Conceptul wiki numește explicit anti-pattern-ul: *"chatbot supplementing UI."* Păstrabil doar dacă spec-ul admite că e **"hybrid operational platform"**, nu agent-native în sensul [[pat-walls]]. Altfel e pretenție + arhitectură divergente.

### Fisura 2 — Rebuilduiește în loc să wrap-uiască

[[headless-saas-thesis]] e direcția câștigătoare: wrap the incumbent (SAGA, [[workday]], sisteme spital existente). Altera OS construiește `altera.db` de la zero, împletind 6 module în jurul unei DB proprii.

Pentru spitalul Pitești e justificabil (nu există incumbent SaaS puternic local). Dar **pentru Phase 3 productization** la alte SMB-uri, argumentul "de ce nu folosiți ce aveți + agent wrapper" va veni tare din partea oricărui prospect care deja rulează SIUI / Hipocrate / Medic-Info / soluții ERP locale.

Decizie implicită: Altera OS bet-uiește pe **categoria generalistă** (vezi [[ai-native-operational-platform]]), nu pe wrap-vertical. Sunt strategii diferite cu GTM diferit.

### Fisura 3 — Distribuție = zero

[[agent-native-vertical-playbook]] e brutal: *"distribution must start before product. If [...] ships in Q3 2026 with zero owned audience, launch is cold."*

Spec-ul menționează Product Hunt + HealthTech EU communities în Phase 3 (luna 5-6). **Asta e exact lansare cold.** Nu există plan de:
- LinkedIn cadence săptămânal începând aprilie 2026
- Newsletter / build-in-public
- Content programmatic (SEO / AEO) în timp ce se construiește
- Pregătire audience înainte de Product Hunt

[[media-plus-agents-distribution]] are fereastra de compounding 12-24 luni. Dacă startezi la lună 5, lansezi la lună 6 fără audiență. Asta a eșuat deja pentru zeci de builder-i tehnici cu produse bune.

### Fisura 4 — Pricing default, nu outcome-based

Phase 3 zice "Stripe adapter, tenant subscription, usage metering". Nu există instrumentare [[outcome-based-pricing]] în v1: ore economisite pe raport, documente procesate, deadline-uri prinse, întrebări rezolvate fără user intervention.

[[agent-native-vertical-playbook]]: *"instrument outcomes from day one [...] a retrofit is 10x more expensive than instrumenting now."*

## Tensiuni cu disciplina framework-ului

### [[bounded-problem-wedge]] vs scope
MVP real = 1 use-case (raport trimestrial). Build plan = 14 packages + 2 UIs + CLI + binary + Docker. Conceptul wiki spune clar: *"narrow beats generic."* Altera OS pariază pe **platformă-primul**, wedge-al-doilea. Risc de antipattern "platform-before-wedge" (vezi istoria [[salesforce]] vs. Siebel, Airtable vs. 100 Access clones).

Contra-argument: la scala 1 operator + Claude Code, timpul suplimentar de a construi 14 packages vs. 1 nu e 14x — e mai degrabă 2-3x pentru că judgment-ul și DB-ul sunt share-uite. Deci scope-ul poate fi apărabil dacă și numai dacă platforma e cu adevărat unified (vezi [[ai-native-operational-platform]]).

### [[validate-before-build]] semi-respectat
Validare e la **un singur user** (Narcis + spital Pitești). E [[internal-to-product]] by design, deci e OK pentru Phase 1-2. Dar Phase 3 productization (landing, Stripe, docs, outreach) e un pariu făcut upfront în spec, nu post-signal. Ideal: Phase 3 trigger = "cel puțin 2 spitale follow-up real interested after seeing Pitești demo", nu calendar-fix.

### Buget de complexitate
Narcis are 08:00-15:00 constraint (job plătit). 26 săptămâni × 6 migrări de repo-uri existente + 14 packages noi + 2 UIs + sanitization + NER + MCP. Chiar AI-augmented, e foarte agresiv. Istoric Alteramens: proiecte solo multi-package mai scurte au derapat. Risc real: Phase 1 alunecă la 12 săptămâni, Phase 2 la 18, Phase 3 nu ajunge în fereastră.

## Concepte noi pe care spec-ul le expune

Trei pattern-uri în spec nu erau capturate în wiki și merită concepte dedicate:

1. **[[sovereign-ai-tokenization]]** — PII detection + tokenize + reverse, per-tenant, per-session, mandatory layer between local data și cloud LLM. Face cloud LLM-urile utilizabile în verticale EU reglementate (sănătate, legal, finanțe). Generalizabil dincolo de Altera.

2. **[[dual-orchestrator-pattern]]** — Robun @ runtime (users) + Claude Code @ dev-time (build/migrări/debug), **sharing aceeași DB și același sistem de skills**. E o expresie concretă a [[ai-collaborator-army]] aplicată la un produs singular. Pattern reutilizabil pentru orice builder.

3. **[[ai-native-operational-platform]]** — categoria pe care Altera o pariază. NU e [[agent-native-startup]] mono-vertical-wrap. NU e [[headless-saas-thesis]] wrap. E o a treia formă: platformă generalistă self-contained (ingest + schema emergent + agent + skills + binary) care re-inventează MS Access pentru era agenților.

Draft-uri pentru toate trei au fost filed simultan cu această sinteză.

## Recomandări (ordonate după ROI)

1. **Sprint 0 = distribuție.** LinkedIn cadence start aprilie 2026, înainte de orice cod. Topic mix: build-in-public progres Altera OS, lecții spital, Skill Era applied, Romanian healthcare IT observations. Altfel Phase 3 lansează mort.

2. **Decide explicit categoria.** Altera OS e "hybrid operational platform" ([[ai-native-operational-platform]])? Sau vrea să fie [[agent-native-startup]] pur? Ambele pot funcționa — dar mesajul, arhitectura și GTM diferă radical. Rezolvă asta în spec înainte de Sprint 2.

3. **Instrumentează outcomes de la Sprint 1.** Ore economisite raport Q1 (baseline = 2-3 zile manual), documente ingestate/săpt, întrebări robun rezolvate. Tabel `outcomes_metrics` cu tenant_id în DB. Cost marginal acum, 10x retrofit cost mai târziu.

4. **Split Phase 1 de Phase 3 în decizie.** Phase 1-2 = hospital tool pur, executat pe intranet. Phase 3 productization = gate pe signal real (≥2 spitale RO follow-up după demo Pitești). Nu calendar-fix.

5. **Pressure-test "wrap vs build" pentru spital.** Există API-uri expuse la SIUI/Hipocrate/Medic-Info? Dacă da, Phase 2 poate adăuga wrapper-e în loc de rebuild. Dacă nu, argumentul "generalist primitive" e întărit.

## Ce ar invalida această sinteză

- Spitalul Pitești respinge toolul ca "prea complex/AI-fishy" în Phase 1 → toate celelalte considerații sunt teoretice
- Reglementare GDPR/sănătate RO blochează cloud LLM chiar cu tokenization → sanitization layer insuficient, arhitectura se schimbă radical
- Phase 1 atinge 10 săptămâni în loc de 8 → efect cascadă, Phase 3 nu încape în fereastră 1K MRR
- Apare un competitor agent-native în healthcare EU cu distribuție gata → window-ul se închide înainte de Phase 3

## Open Questions

- E playbook-ul [[agent-native-vertical-playbook]] aplicabil categoric generalistă ([[ai-native-operational-platform]]), sau distribuția generalistă cere framework diferit?
- `executable-wiki` embedded în produs (nu doar pentru builder) schimbă calitativ moat-ul, sau e doar feature printre altele?
- Poate Faber (public slice din wiki Alteramens) să devină singură surface de distribuție pentru Altera OS — wiki-ul E marketing-ul?
- Tensiunea "platform vs wedge" se rezolvă dacă primul use-case (raportul trimestrial) e wedge-ul real, iar restul modulelor sunt infrastructură derived?

## See Also

- [[alteramens-thesis]] — de ce funcționează la nivel filozofic
- [[agent-native-vertical-playbook]] — cele 3 legs (moat + produs + pricing + distribution)
- [[knowledge-driven-platform-paradigm]] — paradigma pe care Altera OS o materializează
- [[sovereign-ai-tokenization]] / [[dual-orchestrator-pattern]] / [[ai-native-operational-platform]] — concepte noi extrase din spec
- `workshop/ideas/altera-os.md` — spec-ul evaluat
