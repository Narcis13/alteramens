---
title: "Dunning Stack"
type: concept
category: technical-playbook
sources: [lifecycle-retention-skills-suite]
entities: []
related: [voluntary-vs-involuntary-churn, dynamic-save-offer, friction-cost]
maturity: seed
confidence: high
contradictions: []
applications: []
---

# Dunning Stack

Pipeline-ul tehnic și de comunicare care recuperează payment failures înainte să devină churn permanent. Nu un single email, ci un **stack cu 5 etape**: pre-dunning → smart retry → dunning emails → grace period → hard cancel. Fiecare etapă are decizii specifice care determină rata de recovery.

## Pipeline-ul complet

```
Pre-dunning → Smart Retry → Dunning Emails → Grace Period → Hard Cancel
(prevenție)   (auto retry)  (user action)     (last chance)  (resurection path)
```

Fiecare etapă există pentru că payment failure-ul are cauze diferite, iar intervenția corectă depinde de cauză.

## Etapa 1 — Pre-dunning (prevent failures before they happen)

Cel mai eficient ROI din întreg stack-ul. Intervenții:

- **Card expiry alerts**: email la 30, 15, 7 zile înainte de expirare
- **Backup payment method**: prompt pentru a doua metodă la signup (scade hard decline dramatic)
- **Card updater services**: Visa Account Updater + Mastercard Automatic Billing Updater — **reduc hard declines cu 30-50%** automat
- **Pre-billing notification**: email 3-5 zile înainte de charge pentru planuri anuale

Effort: setup one-time. Impact: 20-30% din failed payments nici măcar nu mai ajung la "failed" status.

## Etapa 2 — Smart Retry

Nu toate decline-urile sunt egale. Retry strategy by type:

| Decline Type | Exemple | Retry Strategy |
|---|---|---|
| **Soft decline** (temporary) | Insufficient funds, processor timeout | Retry 3-5× peste 7-10 zile |
| **Hard decline** (permanent) | Card stolen, account closed | **Don't retry** — cere card nou |
| **Authentication required** | 3D Secure, SCA | Send user la update payment cu auth flow |

**Retry timing optimal**:
- Retry 1: 24h după failure
- Retry 2: 3 zile după failure
- Retry 3: 5 zile după failure
- Retry 4: 7 zile după failure (cu email escalation)
- După 4 retry-uri: hard cancel cu reactivation path

**Smart retry tip**: retry în ziua lunii în care payment-ul a succeedat istoric. Dacă Day 1 a mers anterior, retry pe Day 1 next month. Stripe Smart Retries handles asta automat — majoritatea celorlalte processor-uri trebuie config manual.

## Etapa 3 — Dunning Email Sequence

4 emailuri escalând gradual tone-ul, nu agresivitatea:

| # | Timing | Tone | Content |
|---|---|---|---|
| 1 | Day 0 (failure) | Friendly alert | "Your payment didn't go through. Update your card." |
| 2 | Day 3 | Helpful reminder | "Quick reminder — update payment to keep access." |
| 3 | Day 7 | Urgency | "Your account will be paused in 3 days. Update now." |
| 4 | Day 10 | Final warning | "Last chance to keep your account active." |

**Best practices**:
- **Direct link la payment update page**, fără login required dacă posibil (prin signed URL cu expiry)
- **Plain text performs better decât designed emails** pentru dunning (simulate personal communication)
- **Don't blame** — "your payment failed" / "we weren't able to process your payment" **NU** "you failed to pay"
- **Show what they'll lose** — data, team access, settings
- **Include support contact** — uneori problema e reală și user-ul are nevoie de ajutor
- **Subject lines direct**, fără clickbait

## Etapa 4 — Grace Period

După emailul final, 1-3 zile de grace period în care access-ul e degradat, nu tăiat:
- Read-only mode pentru date
- Banner permanent "Payment required to resume"
- Notification in-app la fiecare login

Grace period-ul evită "accidental cancel" — users care au primit emailurile în spam și ar fi pierdut datele.

## Etapa 5 — Hard Cancel + Reactivation Path

După grace period:
- Account cancelled în billing system
- Data retention **30-90 zile minim** (regulatory varies; păstrează pentru reactivation)
- Win-back email sequence triggered automat (vezi email-sequence)
- One-click reactivation flow — user plătește card updated, totul revine

**Crucial**: **never delete data imediat**. Cancelled-and-returned users au rată mai mare decât new signups. Data loss face reactivation-ul psihologic imposibil.

## Recovery Benchmarks

| Metric | Poor | Average | Good |
|---|---|---|---|
| Soft decline recovery | <40% | 50-60% | 70%+ |
| Hard decline recovery | <10% | 20-30% | 40%+ |
| Overall payment recovery | <30% | 40-50% | 60%+ |
| Pre-dunning prevention | 0% | 10-15% | 20-30% |

**Un SaaS cu $10K MRR și 3% involuntary churn pierde ~$300/lună fără dunning. Cu stack corect: recuperează $180/lună, acumulând $2,160/an din setup one-time.**

## Decizii critice per provider

| Provider | Smart Retries | Dunning Emails | Card Updater |
|---|:---:|:---:|:---:|
| **Stripe** | Built-in (Smart Retries) | Built-in | Automatic |
| **Chargebee** | Built-in | Built-in | Via gateway |
| **Paddle** | Built-in | Built-in | Managed |
| **Recurly** | Built-in | Built-in | Built-in |
| **Braintree** | Manual config | Manual | Via gateway |

Stripe e **default-ul sensibil pentru solo builders** — smart retries și card updater sunt automat; dunning emails built-in, customizable; minimă configurare manuală.

## Anti-patterns

- **No dunning at all** — failed payment = instant hard cancel. Pierzi 40-60% din recuperabili.
- **Email blast fără retry logic** — dacă nu retry-uiești smart, emailul ajunge la cineva care oricum ar fi avut funds peste 2 zile
- **Same retry schedule pentru soft și hard declines** — retry pe hard decline e zgomot; trebuie card nou
- **Designed HTML emails cu imagini** pentru dunning — ajung în spam mai des; plain text performează mai bine
- **Blame language** — "You failed to pay" creează resentment; "Your payment didn't go through" = situație
- **Cancel imediat după ultimul email** fără grace period — pierzi users care nu au citit emailurile
- **Delete data imediat post-cancel** — blochează reactivation-ul care are rată bună

## Legătura cu Alteramens

Pentru orice SaaS Alteramens launch-uiește cu Stripe:
1. **Zi 1 de billing live**: setup Smart Retries ON, card updater ON, built-in dunning email templates customized (30 min config în dashboard Stripe)
2. **Zi 2**: write cele 4 dunning emails în stilul Alteramens (plain text, direct, no blame) — folosind skill-ul `/email-sequence` cu sequence type "dunning"
3. **Zi 3**: set up grace period 3 zile (feature flag read-only mode)
4. **Zi 4**: write win-back email pentru cancelled users (1 săpt post-cancel)

Total: 1-2 zile de muncă. ROI: 40-60% din involuntary churn recuperat **pe toate generațiile viitoare de customers**. Definiția [[encoded-judgment]] compounding.

Relația cu [[friction-cost]]: fiecare pas în plus între "click email" și "payment updated" costă ~30% recovery. Signed-URL fără login, auto-fill pt return users, mobile-optimized — toate reduc friction cost.

Relația cu [[voluntary-vs-involuntary-churn]]: dunning stack e intervenția pentru jumătatea involuntary. Fără ea, orice save offer optimization e muncă pe jumătatea de problem.
