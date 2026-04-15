---
title: "Revenue Attribution Loop — Measure, Route, Equip, Repeat"
type: concept
category: decision-framework
sources: [sales-revenue-ops-skills-suite]
entities: [alteramens]
related: [tracking-plan-as-contract, lead-lifecycle-funnel, fit-plus-engagement-scoring, speed-to-lead, performance-data-loop, compounding-games]
maturity: seed
confidence: high
contradictions: []
applications: []
---

# Revenue Attribution Loop

**Analytics + RevOps + Sales-Enablement formează un ciclu închis.** Nu sunt trei practici separate — sunt trei faze ale unui singur sistem de revenue accountability. Dacă una e slabă, loop-ul se sparge.

```
Analytics (measure) → RevOps (route & qualify) → Sales-Enablement (equip & close)
                ↑___________________________________________________|
                        (feedback: what worked → what to measure next)
```

## Cele patru etape

### 1. Measure (Analytics)
Track events cu discipline ([[tracking-plan-as-contract]]): cine vine de unde, ce fac, când.
- UTMs la sursă
- Events la fiecare action relevantă
- Conversions marked explicit
- User identity legat cross-session

**Output**: Data streams care pot fi queried pentru "care canal aduce ce tipuri de users?"

### 2. Route (RevOps — scoring)
Score-uiește leads pe fit + engagement ([[fit-plus-engagement-scoring]]). Route-uiește către rep-ul potrivit sau path (self-serve vs demo).
- MQL threshold = function of fit + engagement
- Routing rules (round-robin / territory / account-based / skill-based)
- Fallback owner
- Speed-to-lead SLA ([[speed-to-lead]])

**Output**: "Each qualified lead e in the right hands în under 5min."

### 3. Qualify (RevOps — lifecycle)
Move leads prin lifecycle stages ([[lead-lifecycle-funnel]]). Confirmă BANT, create opportunity, or recycle.
- Stage entry/exit criteria enforced
- Required fields per stage
- Stale alerts
- Handoff SLAs

**Output**: "Pipeline e clean, predictable, measurable."

### 4. Close (Sales Enablement)
Echipează reprezentanții cu collateral tailored pe stage: demo scripts, objection docs, ROI calculators, proposals, case studies.
- Assets scanabile în 3s
- Per-persona customization
- Per-stage of funnel
- Tested cu top reps

**Output**: "Reps close more of qualified pipeline."

### Feedback loop
Closed-won și closed-lost data feed-uiește înapoi în:
- **Scoring model** (what signals preced wins? recalibrează threshold)
- **Tracking plan** (new events needed to capture patterns noi)
- **Collateral** (which objections won? which materials worked in demo?)
- **Funnel definitions** (stages care accumulate stuck deals trebuie redefinite)

## De ce "loop" și nu "funnel"

Funnel-ul e metaforă liniară: leads intră top, customers ies bottom. Reality: data de la close (won sau lost) **trebuie** să se întoarcă în scoring-ul și tracking-ul de la top. Altfel, model-ul se deprecia și calitatea lead-urilor scade silently.

Attribution without feedback = vanity metrics. Un "loop" closed înseamnă:
1. Măsori CE se întâmplă
2. Action-ezi pe baza măsurătorilor
3. Vezi rezultatele acțiunilor
4. Feed-uiești learning-urile înapoi în măsurare (next cycle e mai precis)

## Key metrics across the loop

| Stage | Metric | Benchmark |
|---|---|---|
| Analytics | Tracking coverage | >95% events firing correct |
| Analytics | UTM compliance | >80% traffic tagged |
| RevOps | Lead→MQL rate | 5–15% |
| RevOps | MQL→SQL rate | 30–50% |
| RevOps | Speed-to-lead | <5 min ideal, <30 min acceptable |
| Sales Enablement | SQL→Opportunity | 50–70% |
| Sales Enablement | Win rate | 20–30% (varies by ACV) |
| Overall | Pipeline coverage | 3–4× quota |
| Overall | CAC / LTV:CAC | 3:1 to 5:1 healthy |
| Overall | Pipeline velocity | (# × avg size × win rate) / cycle days |

## Failure modes (where loop breaks)

### Analytics-weak
- Tracking gaps → scoring model impossible → pipe pollution
- No UTMs → can't tell what channel works → spend inefficient
- PII leaks → compliance risk, tool lock-outs

### RevOps-weak
- MQL definition că sales nu respectă → leads "disappear"
- No SLAs → speed-to-lead drifts spre hours/days → conversion tanks
- Missing stages / unclear ownership → deals stuck, nimeni nu știe de ce

### Sales-enablement-weak
- Generic collateral → reps rescriu → inconsistent messaging → brand dilution
- Missing objection docs → same objections kill deals repeatedly
- No demo scripts → junior reps underperform, senior reps over-load

### Feedback-weak
- Closed-lost data nu ajunge la marketing → same bad-fit leads keep coming
- Win patterns nu update-ează scoring → model stays stale
- New objections din field nu ajung la content team → collateral nu se adaptă

## Connection to other concepts

- **[[tracking-plan-as-contract]]** — layer-ul "measure" al loop-ului
- **[[lead-lifecycle-funnel]]** — layer-ul "qualify"
- **[[fit-plus-engagement-scoring]]** — layer-ul "route"
- **[[speed-to-lead]]** — SLA critic pe handoff routing→qualification
- **[[performance-data-loop]]** — conceptul general de loop de optimizare aplicat acum la revenue specific
- **[[compounding-games]]** — loop-ul închis e ceea ce permite LTV:CAC >3:1 să compoundeze over time

## Aplicare la Alteramens

Small team operations trebuie să implement-eze loop-ul **simplified, nu skipped**:

### Minimum viable loop pentru 1K MRR

```
Analytics:
- GA4 + GTM (free, 2h setup)
- UTM spreadsheet pentru campaigns
- 5 essential events tracked (signup, activation, purchase, churn, referral)

RevOps:
- Spreadsheet lead-scoring (fit 0-30 + engagement 0-50 + negative -30)
- Push notification la form submit
- 1-week SLA pentru first contact

Sales Enablement:
- 1-pager pentru demo (PDF, 1 page)
- 5-question objection doc
- 3 case studies (1 per primary persona)

Feedback:
- Weekly review: closed-won reasons, closed-lost reasons, lead source breakdown
- Monthly: recalibrate scoring thresholds
- Quarterly: tracking plan audit
```

### De ce nu e optional
Tentația la small team e să skip-uiești pentru că "avem doar 10 leads/lună". Dar:
- **10 leads/lună** = ~120/an. Închizi 15 → $2K MRR la ACV $150/mo. Loop-ul măreste close rate de la 15% la 25% → $3.3K MRR din același 120 leads.
- **Without loop**: identic 15% close rate, dar nu știi de ce. Can't improve systematically.
- **With AI-augmented**: loop-ul e mai cheap than ever — Claude poate synthesize data săptămânal, update scoring model, draft collateral. Ce era 10h/săptămână pentru un RevOps team e acum 2h/săptămână solo.

### Trap-uri small-team specific
- **Over-engineering loop înainte de a avea data** — first, ship un minimal loop. Scale-uiește layer by layer.
- **Ignoring feedback pentru că volum mic** — 10 deals/lună e SUFFICIENT pentru pattern recognition dacă documentezi closed-lost reasons
- **Hero mode** ("eu țin minte toate info-urile") — asta se sparge la deal #20. Tracking plan-ul și lifecycle definitions sunt exactly external memory

## Ce validează că loop-ul funcționează

- Poți răspunde, pentru ultimul trimestru: "care channel a adus closed deals și la ce cost?"
- Scoring model-ul prezice >60% din closed-won deals la MQL stage
- Reprezentanții găsesc collateral-ul potrivit în <30 secunde
- Closed-lost reasons update-ează scoring threshold în <30 zile
- Lead-to-customer cycle time scade trimestru după trimestru
