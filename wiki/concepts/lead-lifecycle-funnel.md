---
title: "Lead Lifecycle Funnel — Subscriber to Evangelist"
type: concept
category: decision-framework
sources: [sales-revenue-ops-skills-suite]
entities: [alteramens]
related: [speed-to-lead, fit-plus-engagement-scoring, revenue-attribution-loop, buyer-stage-mapping, aha-moment, dunning-stack]
maturity: seed
confidence: high
contradictions: []
applications: []
---

# Lead Lifecycle Funnel

**Nu există "lead-uri" — există stages.** Un lead la Subscriber stage trebuie tratat diferit de unul la Opportunity stage. Confuzia între stages = confuzie în owners, SLA-uri, și tipul de interacțiune care se potrivește.

## Cele 7 stages canonice

| Stage | Entry criteria | Exit criteria | Owner |
|---|---|---|---|
| **Subscriber** | Opts in pentru content (blog, newsletter) | Furnizează company info sau arată engagement | Marketing |
| **Lead** | Contact identificat cu info de bază | Satisface fit minim | Marketing |
| **Lead → MQL** | Pass fit + engagement threshold | Sales acceptă sau respinge în SLA | Marketing |
| **MQL → SQL** | Sales acceptă după conversație qualifying | Opportunity creată sau recycled | Sales (SDR/AE) |
| **SQL → Opportunity** | BANT (budget, authority, need, timeline) confirmat | Closed-won sau Closed-lost | Sales (AE) |
| **Opportunity → Customer** | Closed-won signed | Expand, renew, sau churn | CS / Account Mgmt |
| **Customer → Evangelist** | NPS înalt, referral activity, case study | — | CS / Marketing |

## De ce matter atât de mult definițiile

Revenue team alignment: Marketing + Sales + CS **trebuie** să acorde definițiile. Altfel:
- Marketing rapoartează 500 MQLs/lună
- Sales spune "dar doar 50 sunt real" — restul nu-s workabili
- Exec vede cifrele diferite → conflict → blame
- **Definiție corectă = una pe care sales efectiv o lucrează**. Dacă sales ignoră MQL-ul, definiția e greșită.

## Handoff = leak point

**Every handoff is a potential leak.** Marketing→Sales, SDR→AE, AE→CS — fiecare are nevoie de:
1. **SLA** (explicit time commitment)
2. **Tracking mechanism** (e măsurat?)
3. **Accountable owner** (cine pierde dacă SLA rupt?)

Fără aceste trei, leak-urile devin invizibile și lead-urile "dispar".

## Stage hygiene

**Required fields per stage** — nu lăsa un deal să avanseze fără datele critice. Pipeline-ul unde "90% closed won rate" e de fapt "nimeni nu a completat câmpurile".

**Stale deal alerts** — deal-ul care stă într-un stage > 2× average time → flag automat. Fie avansează, fie merge la Lost.

**Stage skip detection** — deal sare de la Qualified direct la Proposal? Ceva e greșit. Fie skipped Discovery (rău), fie stage definitions sunt greșite.

**Close date discipline** — push-urile de close date necesită un **reason**. "Silent pushes" = forecast-ul e iluzie.

## Lifecycle ≠ Pipeline

Cele două nu sunt același lucru:
- **Lifecycle** = entire customer journey de la Subscriber la Evangelist (inclusiv lifecycle post-sale)
- **Pipeline** = doar Opportunity stages (Qualified → Discovery → Demo → Proposal → Negotiation → Won/Lost)

Lifecycle e domeniu RevOps; pipeline e sub-set pe latura sales. Sunt frecvent confundate.

## Connection to other concepts

- **[[speed-to-lead]]** — SLA critic e la handoff-ul Lead→MQL→SQL (marketing→sales)
- **[[fit-plus-engagement-scoring]]** — ce definește tranziția Lead→MQL
- **[[buyer-stage-mapping]]** — stages corespund intent-ului de content (Subscriber consumă TOFU, MQL consumă MOFU, SQL consumă BOFU)
- **[[aha-moment]]** — activation (Customer stage) corespunde cu aha moment delivered
- **[[revenue-attribution-loop]]** — tracking flow-ul de la Subscriber la Customer e fundamentul measurement-ului atribution

## Aplicare la Alteramens

Pentru 1K MRR target cu small-team operations, lifecycle-ul se simplifică:

- **Subscriber** → newsletter subs, free-tool users (vezi [[engineering-as-marketing]])
- **Lead** → email + company
- **MQL** → trial signup + fit + behavior signal
- **SQL** → self-serve conversion sau demo request qualified
- **Opportunity** → activat în trial, showing buying intent (pricing page, multiple sessions)
- **Customer** → paid subscription
- **Evangelist** → referrals + testimonials

**Simplification for small team**: poți colapsa Lead și MQL dacă volumul e mic — dar **scorecard-ul de fit/engagement trebuie să existe** chiar dacă merge într-un spreadsheet, nu într-un Salesforce workflow complex.

**SLA-uri pentru small team**:
- MQL alert: push la telefon (nu depinzi de CRM)
- Contact: 24h (nu 4h — realistic pentru 10h/săptămână operation)
- Qualification: 1 săptămână
- Stale alert: deals care stau >14 zile într-un stage

## Ce poate merge prost

- **Definiții vagi**: "MQL e când par interesați" = nu e o definiție, e sentiment
- **Ownership gap**: "Marketing deține MQL până când sales acceptă" — cine deține DURING handoff? În fereastra de acceptance? Gap = leak
- **Static definitions**: comportamentul buyer-ului se schimbă. Scoring models trebuie recalibrate quarterly. Definiții care nu se schimbă în 2 ani sunt stale.
