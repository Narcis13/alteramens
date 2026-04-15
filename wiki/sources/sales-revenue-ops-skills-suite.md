---
title: "Sales & Revenue Ops Skills Suite — Connecting Marketing to Closed Revenue"
type: source
format: code
origin: vault
source_ref: ".claude/skills/"
ingested: 2026-04-15
guided: true
entities: [alteramens]
concepts: [speed-to-lead, lead-lifecycle-funnel, fit-plus-engagement-scoring, engineering-as-marketing, honest-competitive-positioning, tracking-plan-as-contract, revenue-attribution-loop]
key_claims:
  - "Speed-to-lead under 5 minutes = 21× mai mari șanse de calificare; după 30 min conversia scade 10×; după 24h leadul e cold (revops)"
  - "MQL requires BOTH fit AND engagement — niciunul singur nu e suficient. Companie ideală care nu interacționează ≠ MQL. Student care descarcă toate ebook-urile ≠ MQL (revops)"
  - "Lifecycle cu 7 stage-uri clare: Subscriber → Lead → MQL → SQL → Opportunity → Customer → Evangelist. Fiecare are entry/exit criteria, owner, SLA (revops)"
  - "Define-before-automate: workflow-uri pe procese corecte pe hârtie, NU pe idei vagi. Automatizarea unui proces greșit = rezultate greșite mai rapid (revops)"
  - "LTV:CAC sănătos între 3:1 și 5:1. Sub 3:1 = problem economic; peste 5:1 = under-investing în creștere (revops)"
  - "Pipeline coverage ratio 3-4× quota pentru predictibilitate (revops)"
  - "Track for decisions, NOT data — fiecare event trebuie să informeze o decizie. Vanity metrics sunt waste (analytics-tracking)"
  - "Event naming: object_action în lowercase_underscores (signup_completed, cta_clicked); context merge în properties, NU în event name (analytics-tracking)"
  - "Sales uses what sales trusts — dacă reprezentanții rescriu deck-ul înainte să-l trimită, ai scris deck-ul greșit. Testează draft-urile cu top performers (sales-enablement)"
  - "Scannable over comprehensive: reprezentantul are 3 secunde în timpul unui call, NU 30. Dacă nu găsește răspunsul, docul a eșuat (sales-enablement)"
  - "10-12 slide deck framework: Problem → Cost → Shift → Approach → Product → Proof → Case → Implementation → ROI → Pricing → Next Steps (sales-enablement)"
  - "Honesty builds trust în pagini competitive — cititorii verifică claims. Acknowledge competitor strengths; be accurate about own limitations (competitor-alternatives)"
  - "4 formate comparative distincte cu intent de căutare diferit: [X] alternative (switching active) | [X] alternatives (plural, research) | You vs [X] (direct compare) | [A] vs [B] (third option inserted) (competitor-alternatives)"
  - "Centralized competitor data = single source of truth per competitor. Update o dată → propagă în toate paginile. 4-stars reviews > 3 sau 5 stars (4★ = critică constructivă) (competitor-alternatives)"
  - "Free tool trebuie să fie util CHIAR FĂRĂ produsul principal. Lead-value × expected leads > build cost + maintenance (free-tool-strategy)"
  - "Free tool evaluation scorecard (8 factori × 1–5): 25+ strong, 15–24 promising, <15 reconsider. Factori: search demand, ICP match, uniqueness, path to product, feasibility, maintenance, link-potential, share-worthiness (free-tool-strategy)"
  - "MVP tool = core functionality only + minimal UX + basic lead capture. Skip: accounts, saving results, advanced features, perfect design (free-tool-strategy)"
  - "Every handoff is a potential leak — marketing→sales, SDR→AE, AE→CS. Fiecare handoff are nevoie de SLA, tracking, și owner accountable (revops)"
  - "Single source of truth pentru fiecare lead/account; dacă date live în multiple sisteme, vor intra în conflict (revops)"
confidence: high
---

# Sales & Revenue Ops Skills Suite

5 skill-uri care transformă output-ul marketing în pipeline măsurabil și revenue închisă. **Cluster-ul 8 e layer-ul de accountability:** nu creează cerere (Clusters 1–7 fac asta), ci **conectează cererea la deal-uri închise** prin sisteme, collateral, măsurare și poziționare competitivă.

## Cele 5 skill-uri

| Skill | Path | Focus |
|---|---|---|
| **sales-enablement** | `.claude/skills/sales-enablement/SKILL.md` | Collateral de vânzare: decks, one-pagers, objection docs, demo scripts, playbooks, persona cards |
| **revops** | `.claude/skills/revops/SKILL.md` | Lifecycle management, lead scoring, routing, pipeline stages, data hygiene — sistemul care conectează marketing la revenue |
| **analytics-tracking** | `.claude/skills/analytics-tracking/SKILL.md` | Tracking plans, event naming, GA4/GTM, UTM strategy — fundația măsurării |
| **competitor-alternatives** | `.claude/skills/competitor-alternatives/SKILL.md` | 4 formate de pagini competitive (alternative, alternatives, you-vs, vs-vs) |
| **free-tool-strategy** | `.claude/skills/free-tool-strategy/SKILL.md` | Engineering-as-marketing — free tools ca mecanism de distribuție și lead gen |

## Principiile fundamentale pe care le împărtășesc

Acest cluster se definește prin **accountability la revenue** — fiecare skill are o legătură clară cu ARR. Principiile comune:

- **[[speed-to-lead]]** — Timpul de răspuns e cel mai mare factor în conversia lead-ului. Sub 5min = 21×. După 30min = 10× drop. SLA-uri explicite ca guardrails.
- **[[lead-lifecycle-funnel]]** — Subscriber → Lead → MQL → SQL → Opportunity → Customer → Evangelist. Fiecare stage are entry/exit criteria, un owner, și un SLA. Handoff-urile sunt puncte de leak.
- **[[fit-plus-engagement-scoring]]** — MQL = fit ȘI engagement (nu sau). Negative scoring ca guardrail. Scoring models recalibrated quarterly pe baza closed-won data.
- **[[tracking-plan-as-contract]]** — Event-urile sunt decisions-first, nu data-first. Naming: object_action. Context în properties, NU în event name.
- **[[honest-competitive-positioning]]** — Cititorii verifică claims. Acknowledge competitor strengths. 4-star reviews sunt aur. Help them decide > trash them.
- **[[engineering-as-marketing]]** — Free tools ca distribuție permissionless. Util chiar fără produs. Scorecard 1–5 pe 8 factori pentru evaluare.
- **[[revenue-attribution-loop]]** — Analytics → RevOps → Sales-Enablement formează un ciclu închis: măsoară → optimizează → echipează → măsoară din nou.

## Afirmații-cheie per skill

### sales-enablement

**Core idea**: "Sales uses what sales trusts." Collateral-ul e inutil dacă reprezentanții nu-l trimit. Testează drafturile cu top performers; folosește limbajul lor, nu al marketing-ului.

**8 tipuri de asset-uri**:
1. **Sales deck** (10–12 slides): Problem → Cost → Shift → Approach → Product → Proof → Case → Implementation → ROI → Pricing → Next Steps. Story arc, NOT feature tour.
2. **One-pager / leave-behind** — scanabilă în 30s, o singură pagină, CTA specifică (nu `info@`).
3. **Objection handling doc** — categorii: Price/Timing/Competition/Authority/Status-Quo/Technical. Pentru fiecare: exact statement, real concern, response approach, proof point, follow-up question. Două formate: quick-reference table + detailed doc.
4. **ROI calculator** — Inputs (manual processes, tool costs, error rates) → Calculations (time/cost savings, revenue impact) → Outputs (annual ROI, payback period, 3-year value). Per-persona: CTO/VP Sales/CFO/End User au angle-uri diferite.
5. **Demo script** — Opening (2m) → Discovery recap (3m) → Solution walkthrough (15–20m, 3–4 workflows) → Interaction points → Close (5m). **"Demo after discovery, not before."**
6. **Case study brief (sales format)** — scurt, outcome-focused, tagged pentru retrieval (industry/use case/size). Marketing case study ≠ sales case study.
7. **Proposal** — 5–7 pagini max; executive summary mirror-ează limbajul lor; nu ascunde prețul.
8. **Buyer persona cards** — Economic buyer / Technical buyer / End user / Champion / Blocker. Fiecare cu top objections și messaging angle.

**Customization by buyer**: Tech buyer (arhitectură, security, integrations); Economic buyer (ROI, payback, risk); Champion (internal selling points, quick wins).

### revops

**Core idea**: Revenue team alignment. Marketing + Sales + CS trebuie să acorde definițiile. Dacă marketing numește ceva MQL și sales nu lucrează, definiția e greșită.

**Lead lifecycle (7 stages)**:
| Stage | Entry | Exit | Owner |
|---|---|---|---|
| Subscriber | Opts in | Arată engagement | Marketing |
| Lead | Contact info | Fit minim | Marketing |
| MQL | Fit + engagement threshold | Sales accept/reject în SLA | Marketing |
| SQL | Sales acceptă, qualificat | Opportunity sau recycled | Sales (SDR/AE) |
| Opportunity | BANT confirmat | Won sau Lost | Sales (AE) |
| Customer | Closed-won | Expand/renew/churn | CS |
| Evangelist | NPS înalt, referrals | — | CS/Marketing |

**MQL-to-SQL SLA**: MQL alert → rep contactează în 4h business → qualificare/respingere în 48h → rejected la nurture cu reason code.

**Speed-to-lead (Lead Connect data)**:
- <5min = 21× mai mari șanse de qualify
- >30min = conversia scade 10×
- >24h = lead-ul e efectiv rece

**Scoring**: Explicit (fit: company size/industry/role/tech stack) + Implicit (engagement: pricing page/demo request/multi-visit) + Negative (competitor domains, unsubscribes, bad titles). MQL threshold: 50–80 pe 100.

**Routing methods**: Round-robin | Territory-based | Account-based | Skill-based. Fallback owner obligatoriu — unassigned leads se răcesc rapid.

**Pipeline stages**: Qualified → Discovery → Demo/Evaluation → Proposal → Negotiation → Closed Won/Lost. Stage hygiene: required fields per stage, stale deal alerts (2× avg days), stage-skip detection, close date discipline.

**Deal desk**: activat la ACV >$25K, non-standard terms, multi-year, volume discounts. Tiers de aprobare pe discount (10-20% mgr, 20-40% VP, 40%+ deal desk).

**Metrics**: Lead→MQL 5–15%, MQL→SQL 30–50%, SQL→Opp 50–70%, Win rate 20–30%, CAC/LTV>3:1, Speed-to-lead <5min, Coverage ratio 3–4× quota.

### analytics-tracking

**Core idea**: "Track for decisions, not data." Fiecare event trebuie să informeze o decizie specifică. Quality > quantity.

**Event naming**: `object_action`, lowercase cu underscores, specific (`cta_hero_clicked` ≠ `button_clicked`). Context în properties, nu în event name. Fără spații sau caractere speciale.

**Essential properties**: Page (title, location, referrer) + User (user_id, user_type, account_id) + Campaign (UTM cascade) + Product (id, name, category, price).

**GA4 + GTM**: GA4 property & data stream → enhanced measurement → custom events marked ca conversions. GTM: Tags (cod care executa) + Triggers (când) + Variables (valori dinamice). DataLayer pattern standard.

**UTM convention**: utm_source/medium/campaign/content/term — lowercase, underscores consistente, specific dar concis. Documentat central.

**Validation**: Events firing pe trigger corect, property values populate, no duplicates, no PII leak. Tools: GA4 DebugView, GTM Preview, browser extensions.

**Privacy**: Consent required în EU/UK/CA (consent mode: wait for consent). IP anonymization. Only collect what you need.

### competitor-alternatives

**Core idea**: "Honesty builds trust." Cititorii sunt evaluatori activi — verifică claims. Acknowledge strengths; be accurate about limitations. Help them decide > win at all costs.

**4 formate distincte pe intent**:
| Format | URL | Search intent |
|---|---|---|
| [X] Alternative (singular) | `/[competitor]-alternative` | User vrea să switch-uie acum |
| [X] Alternatives (plural) | `/alternatives/[competitor]-alternatives` | User researchează opțiuni devreme în journey |
| You vs [X] | `/vs/[competitor]` | User compară direct |
| [A] vs [B] | `/compare/a-vs-b` | User compară 2 competitori (inserezi 3rd option) |

**Essential sections**:
- TL;DR (2–3 propoziții diferențe cheie)
- At-a-glance comparison table
- Paragraph comparisons (NU doar tabele)
- Feature, pricing, support, ease-of-use, integrations
- "Who X is best for" pentru AMBII (onest)
- Migration section cu quote de la switchers
- CTA clară

**Centralized competitor data** = single source of truth per competitor (positioning, pricing, feature ratings, strengths/weaknesses, best-for/not-for, common complaints din reviews, migration notes). Update o dată → propagă peste toate paginile.

**Research**: Sign up and USE it. G2/Capterra/TrustRadius review mining. **4-star reviews** sunt aurul (3★ = zgomot, 5★ = fanboy, 4★ = critică constructivă). Talk cu customers care au switched (ambele direcții).

**Updates**: Quarterly pricing verify, when-notified feature changes, annual full refresh.

### free-tool-strategy

**Core idea**: Engineering as marketing. Build something useful și dă-l gratis pentru traffic, links, leads, brand.

**Principiile celor 4**:
1. **Solve a real problem** — util ȘI fără produsul tău principal
2. **Adjacent to core product** — drum natural spre ceea ce vinzi
3. **Simple and focused** — face un lucru bine, low friction
4. **Worth the investment** — lead value × expected leads > build + maintenance

**6 tipuri de tool**:
| Type | Examples | Best for |
|---|---|---|
| Calculators | ROI, savings, pricing | Decizii cu numere |
| Generators | Templates, policies, names | Creează ceva rapid |
| Analyzers | Website grader, SEO audit | Evaluare existent |
| Testers | Meta tag preview, speed tests | Verifică dacă funcționează |
| Libraries | Icons, templates, snippets | Referință |
| Interactive | Tutorials, playgrounds, quizzes | Învățare |

**Gating strategy**:
- Fully gated (max capture, low usage)
- Partially gated (balance — cel mai comun)
- Ungated + optional email (max reach, lower capture)
- Ungated entirely (SEO/brand pur, no direct leads)

**Build vs Buy**:
- Build custom: concept unic, core brand, high value
- No-code (Outgrow, Involve.me, Typeform, Bubble, Webflow): speed to market
- Embed existing: white-label disponibil, nu e core differentiator

**MVP scope**: Core functionality + essential UX + basic lead capture. Skip: accounts, saving, advanced features, perfect design, every edge case.

**Evaluation scorecard (1–5 pe 8 factori)**:
- Search demand | ICP match | Uniqueness | Path to product | Build feasibility | Maintenance (inverse) | Link potential | Share-worthiness

**25+**: strong | **15–24**: promising | **<15**: reconsider.

## De ce am ingerat ca suite

Acest cluster e diferit de Clusters 1–7 pe un plan critic: **e singurul cluster care duce măsurarea până la revenue închisă**. Celelalte creează demand (SEO, copy, paid, content), optimizează conversii (CRO), sau engage users (lifecycle). Cluster 8 închide loop-ul — transformă demand în pipeline, pipeline în deals, deals în revenue măsurat.

Ingestul ca suite permite:

1. **Cross-cutting concepts reutilizabile** de toate celelalte 5 framework-uri deja existente ([[cro-framework-alteramens]], [[seo-framework-alteramens]], [[content-copy-framework-alteramens]], [[paid-acquisition-framework-alteramens]], [[lifecycle-retention-framework-alteramens]], [[strategy-foundations-framework-alteramens]])
2. **Framework aplicat unic** ([[sales-revenue-ops-framework-alteramens]]) — cum arată cluster-ul 8 pentru Alteramens la 1K MRR (small team, AI-augmented, revenue-accountability-first)
3. **Închide catalogul** — toate 8 clustere din marketing-skills-catalog acum au deep-ingest

## Cum se leagă de filosofia Alteramens

- **[[skill-era]]**: Analytics tracking plans + lead scoring models + objection handling docs = **judgment encodat**. Un senior revops mindset compressed in a skill. Scoring model nu e code, e *judgment encodat cu threshold-uri*.
- **[[productize-yourself]]**: Objection handling docs și buyer persona cards sunt *specific knowledge encoded for leverage* — reprezentanții noi pot accesa judgment-ul senior immediately.
- **[[distribution-over-product]]**: Free tools (engineering-as-marketing) sunt distribuție permissionless la scale; competitor-alternatives pagini captează search intent competitiv. Ambele = distribution care compoundează.
- **[[compounding-games]]**: LTV:CAC >3:1 măsoară explicit dacă economic engine-ul compoundează. Speed-to-lead <5min compoundează pentru că alertarea automată câștigă competiția pentru atenția lead-ului în fereastra de 5min.
- **[[validate-before-build]]**: Free-tool-strategy scorecard-ul validates înainte de build — 8 factori × 1–5, threshold 25+ for strong. Tracking plan-ul validates post-launch — definești events INAINTE să implementezi.
- **[[encoded-judgment]]**: Ecosistemul întreg al cluster-ului 8 e judgment encodat: MQL threshold (50–80), speed SLA (4h contact, 48h qualify), pipeline coverage (3–4×), LTV:CAC (3–5:1), deal desk trigger (>$25K). Toate sunt numere specifice care vin din pattern recognition pe sute de companii.

Vezi [[sales-revenue-ops-framework-alteramens]] pentru framework-ul aplicat la un proiect Alteramens de 1K MRR cu timp limitat și AI-augmented execution.
