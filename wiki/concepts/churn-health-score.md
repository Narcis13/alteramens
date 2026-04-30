---
title: "Churn Health Score"
type: concept
category: decision-framework
sources: [lifecycle-retention-skills-suite]
entities: []
related: [voluntary-vs-involuntary-churn, dynamic-save-offer, longitudinal-user-model, performance-data-loop]
maturity: seed
confidence: high
contradictions: []
applications: []
---

# Churn Health Score

Framework pentru **predicția și prevenția churn-ului voluntary înainte de a se materializa**. Agregă leading signals comportamentale într-un score 0-100 per user, cu intervenții gradate per bucket. Cel mai bun save e cel pe care user-ul nu știe că a fost făcut.

## Formularea principiului

Click-ul pe "Cancel" e ultimul pas dintr-un proces care începe cu săptămâni/luni înainte. Scăderea login-ului, stagnarea feature usage-ului, spike-ul în support tickets — toate sunt **leading indicators** ale unei decizii care nu s-a luat încă conștient.

Intervenția la momentul cancel ([[dynamic-save-offer]]) salvează 25-35%. Intervenția **înainte de cancel**, pe baza semnalelor, poate evita cancel-ul complet — save rate efectiv 100%, pentru că user-ul nici nu ajunge în flow.

## Cele 8 risk signals principale

| Signal | Risk Level | Lead Time |
|---|---|---|
| Login frequency drops 50%+ | High | 2-4 săpt |
| Key feature usage stops | High | 1-3 săpt |
| Support tickets spike apoi devin zero | High | 1-2 săpt |
| Email open rates decline | Medium | 2-6 săpt |
| Billing page visits increase | High | Zile |
| Team seats removed | High | 1-2 săpt |
| Data export initiated | **Critical** | Zile |
| NPS <6 | Medium | 1-3 luni |

**Citire-cheie**: signal-urile scurte (zile) sunt **intent**, signal-urile lungi (săptămâni/luni) sunt **disengagement**. Răspunzi diferit la ele.

## Health Score Formula

Agregare weighted cu pondere calibrată empiric:

```
Health Score = (
  Login frequency score × 0.30 +
  Feature usage score   × 0.25 +
  Support sentiment     × 0.15 +
  Billing health        × 0.15 +
  Engagement score      × 0.15
)
```

Scale 0-100.

Fiecare sub-score e agregarea semnalelor din categoria respectivă, normalizat per user-ul istoric (ce era "normal" pentru acel user, nu media). Un power-user care face 3 login-uri pe zi și scade la 1/zi e în High Risk. Un light-user care face 2 login-uri/lună și menține cadența e în Healthy.

## Bucket-uri și intervenții

| Score | Status | Acțiune |
|---|---|---|
| 80-100 | Healthy | **Upsell opportunities**, referral trigger moments |
| 60-79 | Needs attention | **Proactive check-in email** — "We noticed X, need help?" |
| 40-59 | At risk | **Intervention campaign** — re-engagement sequence, feature tutorial, success manager touch |
| 0-39 | Critical | **Personal outreach** — founder email, call for high-value, credit + priority fix |

## Proactive intervention examples

| Trigger | Intervenție |
|---|---|
| Usage drop >50% pentru 2 săptămâni | "We noticed you haven't used [feature]. Need help?" email |
| Approaching plan limit | Upgrade nudge (not a wall — paywall handles acel moment) |
| No login pentru 14 zile | Re-engagement email cu recent product updates |
| NPS detractor (0-6) | Personal follow-up în 24h |
| Support ticket nerezolvat >48h | Escalation + proactive status update |
| Annual renewal în 30 zile | Value recap email + renewal confirmation |

## De ce e judgment, nu algoritm

Health score-ul pare o formulă mecanică, dar judgment-ul stă în:

1. **Selectarea semnalelor** — nu orice eveniment e relevant. "Page views" nu e semnal; "data export" e critical. Alegerea pornește de la cauzalitate, nu de la ce e ușor de tracked.
2. **Calibrarea pe user individual** — "normal" diferă masiv între users. Un model care compară user cu el însuși istoric bate un model care compară cu media.
3. **Response mapping pe bucket** — nu toate user-urile în "critical" merită personal outreach. Triaging pe LTV / MRR contează.
4. **Timing-ul intervenției** — intervenție prea devreme = anxious; prea târziu = too late. Sweet spot-ul e în leading window, nu la pragul de cancel.
5. **Tipul intervenției match la cauză** — dacă signal-ul e "feature nu e folosit", intervenția e tutorial/onboarding, nu discount. Dacă e "billing page visits", intervenția e save offer preventiv.

## Tools & infrastructure

Setup-ul complet cere:
- **Event tracking** — Mixpanel, PostHog, Segment pentru raw events
- **Health score aggregation** — Customer.io, Vitally, Catalyst pentru calculare + triggers
- **Intervention execution** — email sequences (Customer.io), in-app (Intercom, Beamer), CSM routing

Pentru solo builder, minim viable stack: **PostHog pentru events + Customer.io pentru health-score-based sequences**. ~$100/lună, scalează 10-100× peste acel cost.

## Benchmarks post-implementare

Cu un health score sistem funcțional:
- Proactive save rate: **5-15% din ce ar fi fost cancel** (save înainte de flow)
- Timp alocat personal outreach: reduce cu 40-60% (prioritizat pe "critical" bucket, nu reactive)
- Upsell conversion pe "healthy" bucket: **2-4× vs random** (user-ii healthy sunt și cei mai receptivi)

## Anti-patterns

- **Lagging indicators în score** — folosirea doar a "login-ul acesta" sau "payment-ul acesta" fără trend. Signal-ul valoros e delta, nu absolutul.
- **Single signal "red flag"** — un singur login drop nu înseamnă churn. Multi-signal agregate batter false positive rate.
- **Intervenție generică pe bucket** — aceleași email pentru toți "at risk" ignoră varianta cauzelor. Necesită tree de intervenții per sub-cauză.
- **Score invizibil team-ului** — dacă health score-ul trăiește doar într-o tabelă DB și nu e în CRM/UI, CSM-ii nu-l folosesc
- **Acționare tardivă** — intervenție la "critical" bucket = 80% out. Intervenție la "needs attention" = 80% savable.

## Legătura cu Alteramens

Pentru un solo builder cu 10h/săptămână, health score-ul complet e **Fază 3** (nu Fază 1). [[dunning-stack]] primul, cancel flow al doilea, health score-ul doar când ai ≥50-100 users care să justifice instrumentarea.

**Pentru nbrAIn / BunBase**: când aceste produse ajung la MRR $5K+, setup-ul unui health score minim (3 signale: login, feature usage, billing page visits) devine ROI pozitiv.

Relația cu [[longitudinal-user-model]]: same idea, alt context — modelarea user-ului în timp pentru decizii informate. Health score e aplicarea longitudinal model-ului la problema specifică de retention.

Relația cu [[performance-data-loop]]: health score-ul necesită data loop — tracking signals, iterație pe threshold-uri, calibrare pe feedback. Fără loop, score-ul nu se îmbunătățește niciodată.

Relația cu [[encoded-judgment]]: framework-ul de mai sus poate fi el însuși encodat într-un skill (`/setup-health-score`) care ia context-ul produsului și propune signal-uri, weights, intervenții. Judgment-ul retention specialist-ului devine invocabil.
