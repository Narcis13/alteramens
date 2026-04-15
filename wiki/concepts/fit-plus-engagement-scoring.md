---
title: "Fit + Engagement Scoring — Both, Not Either"
type: concept
category: decision-framework
sources: [sales-revenue-ops-skills-suite]
entities: [alteramens]
related: [lead-lifecycle-funnel, speed-to-lead, tracking-plan-as-contract, encoded-judgment, ice-prioritization]
maturity: seed
confidence: high
contradictions: []
applications: []
---

# Fit + Engagement Scoring

**MQL requires BOTH fit AND engagement.** Niciunul singur nu e suficient. Asta e poate cea mai frecvent ignorată regulă în RevOps.

- **Perfect-fit company care nu a interacționat** = NOT MQL (n-au buyer intent)
- **Student care a descărcat toate ebook-urile** = NOT MQL (n-au fit)

Scoring-ul e funcția care operaționalizează acest AND.

## Cele trei dimensiuni

### 1. Explicit scoring (fit) — CINE sunt

| Dimension | Examples |
|---|---|
| Company size | Employees, revenue, funding stage |
| Industry | Matches ICP vertical? |
| Role | Job title, seniority, department (buyer vs end user) |
| Tech stack | Folosesc ce tu integrate-zi cu? |
| Geography | Servezi regiunea lor? |

### 2. Implicit scoring (engagement) — CE fac

| Signal | Relative weight |
|---|---|
| Pricing page view | High intent |
| Demo request | Very high intent |
| Multiple sessions în 7 zile | High intent |
| Email open + click | Medium intent |
| Single blog post read | Low intent |
| Product usage (PLG) | Depends — feature-specific |

### 3. Negative scoring — SIGNALS de disqualification

| Red flag | Effect |
|---|---|
| Competitor email domain | Auto-disqualify |
| Free email (gmail, yahoo) | Downgrade pentru B2B |
| Student/intern titles | Downgrade |
| Unsubscribe history | Downgrade |
| Spam complaint | Hard block |

## Construirea modelului

1. **Define ICP attributes** — din customer research, cine e buyer-ul ideal?
2. **Mine closed-won data** — care comportamente preced wins?
3. **Set point values** — typical: 1–10 per attribute, total target 100
4. **Set MQL threshold** — typical 50–80/100
5. **Backtest pe istoric** — prezisese modelul deal-urile câștigate trecute?
6. **Launch, measure, recalibrate** — buyer behavior se schimbă → recalibrare quarterly

## Greșeli comune

- **Over-weighting content downloads** — research ≠ buying intent. Cineva poate descărca 5 ebook-uri și nu cumpăra niciodată.
- **Missing negative scoring** — fără red flags, modelul lasă prin competitori, studenți, tire-kickers
- **Set and forget** — modelul se deprecia; pattern-urile de 2 ani în urmă nu mai matchează buyer-ii de azi
- **Equal weight pe pagini** — pricing page ≠ blog post. Nu toate pageviews valorează la fel.

## De ce AND, nu OR

**Fit fără engagement** = Perfect-match company care nu știe că exiști sau nu cumpără acum. Sales outreach la ei e spray-and-pray → low conversion → frustrare rep → pipe polluted.

**Engagement fără fit** = Entuziasm dar no buying power/authority/budget. Content consumers, competitors researching, students scriind paper-uri. Sales time pe ei = waste.

**AND** = cineva care matchează cine ai targets AND arată pattern-uri de pre-purchase research. Asta e MQL.

## Connection to other concepts

- **[[lead-lifecycle-funnel]]** — scoring-ul definește tranziția Lead→MQL
- **[[speed-to-lead]]** — MQL-ul calificat prin scoring justifică SLA-ul de 5min; lead necalificat nu
- **[[tracking-plan-as-contract]]** — scoring-ul depinde de tracking-ul de evenimente corect implementat
- **[[encoded-judgment]]** — un scoring model e judgment encodat: "dacă persona X face action Y, ar probabil cumpăra" — cristalizat în numere
- **[[ice-prioritization]]** — scoring-ul aplicat la leads e version-ul ICE aplicat la prospects

## Aplicare la Alteramens

Pentru 1K MRR target, scoring-ul poate fi simplu — dar **trebuie să existe**:

### Minimal scoring (spreadsheet OK)
- **Fit (0–30 puncte)**
  - Is this a business email? (0 or 10)
  - Matches target industry? (0 or 10)
  - Role includes decision-making signal? (0 or 10)
- **Engagement (0–50 puncte)**
  - Signed up for trial (20)
  - Visited pricing page (15)
  - Opened first onboarding email (5)
  - Used product N+ times (10)
- **Negative (-30 to 0)**
  - Free email domain (-5)
  - Previously unsubscribed (-20)
  - From competitor domain (-30)

**MQL threshold**: 50/100. Sub, stays în nurture. Peste, flags pentru personal outreach.

### De ce merită efortul
La volum mic, "răspunde la tot cu intensitate maximă" pare fezabil — dar reality check: 10h/săptămână / 30 MQLs = 20min/MQL, including discovery + demo + proposal + follow-up. Imposibil. Scoring-ul **protejează timpul** spre leads care au realistic shot.

## Ce validează că scoring-ul funcționează

- MQL→SQL rate >30% (dacă sub, threshold e prea permissive)
- Closed-won rate on MQLs > baseline pe unscored leads
- Rep feedback: "MQL-urile astea sunt de fapt workabile" ≠ "spam-ul uzual"
- Model recalibrated ultimul: **maximum 90 zile în urmă**
