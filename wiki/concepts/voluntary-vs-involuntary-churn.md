---
title: "Voluntary vs Involuntary Churn"
type: concept
category: mental-model
sources: [lifecycle-retention-skills-suite]
entities: []
related: [dynamic-save-offer, dunning-stack, churn-health-score, friction-cost]
maturity: seed
confidence: high
contradictions: []
applications: []
---

# Voluntary vs Involuntary Churn

Taxonomia fundamentală pentru orice strategie de retention: churn-ul nu e un fenomen unic. Există două tipuri distincte, fiecare cu **cauză diferită, soluție diferită, și cost/beneficiu diferit al recuperării**. Tratarea lor ca un singur problem e cauza cea mai comună prin care founders își ratează save-urile ușoare.

## Cele două tipuri

| Tip | Cauză | Soluție | Pondere tipică |
|---|---|---|---|
| **Voluntary** | Customer alege să anuleze | Cancel flows, save offers, exit surveys | 50-70% din total churn |
| **Involuntary** | Payment fails (card expirat, insufficient funds, stolen card) | Dunning emails, smart retries, card updaters | 30-50% din total churn |

Procentajul exact variază per industrie și per segment (B2C tinde să aibă mai mult involuntary; B2B ceva mai mult voluntary), dar **distribuția e rareori 90/10 — mai degrabă 60/40**. Ignorarea unei jumătăți înseamnă ignorarea unei jumătăți din oportunitatea de recuperare.

## De ce distincția contează

Intervențiile sunt fundamental diferite:

- **Voluntary** necesită convingere: user-ul a decis că nu mai vrea produsul. Trebuie să-i dai un motiv să rămână — intervenție comportamentală, prezentată la momentul cancel ([[dynamic-save-offer]]) sau preventiv pe baza unor leading signals ([[churn-health-score]]).
- **Involuntary** necesită execuție operațională: user-ul încă vrea produsul, dar plata a eșuat. Nu trebuie să-l convingi de nimic — trebuie să-l readuci pe plată cu minim friction ([[dunning-stack]]).

**Implicația crucială**: involuntary churn e adesea **mai ușor de recuperat** decât voluntary — nu necesită construirea unui copywriting save offer, nu necesită discount, nu necesită procesare emoțională. Necesită pipeline tehnic corect.

## Recovery benchmarks

### Voluntary (cancel flow save)
- Save rate global: 25-35% cu flow dinamic corect ([[dynamic-save-offer]])
- Offer acceptance: 15-25%
- Pause reactivation: 60-80%

### Involuntary (payment recovery)
- Soft decline recovery (insufficient funds, processor timeout): **70%+ posibil**, 50-60% mediu
- Hard decline recovery (stolen, closed account): **40%+ posibil**, 20-30% mediu
- Overall payment recovery: **60%+ posibil**, 40-50% mediu
- Pre-dunning prevention (card expiry alerts, updater services): **20-30% additional**, reduce hard declines cu 30-50%

Un founder care setează doar cancel flow dar nu dunning, pierde jumătate din save-uri. Un founder care setează dunning dar nu cancel flow, pierde celelaltă jumătate.

## De ce founders tind să ignore involuntary

- **E invizibil în UI** — user-ul nu clickează nimic; pur și simplu dispare
- **E delegat la payment processor by default** — mulți cred că Stripe "se ocupă automat"
- **Nu e o conversație umană** — cancel flow se simte ca "interacțiune customer"; dunning se simte ca "infrastructură"
- **Nu are storytelling** — nu poți scrie un tweet despre "am recuperat 62% din failed payments" ușor; poți scrie despre "am salvat un customer cu un email personal"

**Realitatea**: pentru orice SaaS cu >$1K MRR, setup-ul corect al dunning stack-ului e probabil **cea mai rapidă cale de a adăuga 10-20% la MRR** fără a atrage un singur customer nou.

## Implicații operaționale

### Tracking separat
Analyze dashboard should split:
- Voluntary churn rate = cancels / total customers
- Involuntary churn rate = failed-payment-driven cancels / total customers
- Revenue churn per tip

Dacă nu măsori separat, nu știi care jumătate pierzi.

### Fix ordinea (pentru solo builder cu 10h/săptămână)
1. **First**: setup dunning stack complet (pre-dunning + smart retries + email sequence) — e scris în [[dunning-stack]], runează single config, value compounding
2. **Second**: setup cancel flow minim viabil (exit survey + 2-3 save offers mapate) — e scris în [[dynamic-save-offer]]
3. **Third**: proactive retention via [[churn-health-score]] — mai complex, necesită instrumentare

Fix-ul 1 salvează cel mai mult revenue cu cel mai puțin effort.

### Măsoară "true saves", nu "immediate saves"
Un user salvat care anulează 30 zile mai târziu n-a fost salvat. Tracking-ul save-cohort LTV-ului la 90-180 zile distinge save-urile reale de amânările.

## Legătura cu Alteramens

Pentru orice produs pe care Alteramens îl launch-uiește cu billing recurrent (nbrAIn, BunBase, viitor SaaS), **această taxonomie e primul layer de gândit înainte de orice copy de retention**. Fără ea, efortul de retention se aplică cu intensitate greșită pe probleme greșite.

Relația cu [[dynamic-save-offer]]: e un sub-caz aplicat pe voluntary. Relația cu [[dunning-stack]]: e sub-cazul aplicat pe involuntary. [[churn-health-score]] e pentru **prevenția voluntary-ului înainte de click**.

Relația cu [[friction-cost]]: în dunning, friction pentru user-ul care vrea să plătească = failed payment care devine permanent. Un payment update page care cere re-login = friction cost de 30-50% pe recovery. Același principiu care domina signup CRO domină și dunning UX.
