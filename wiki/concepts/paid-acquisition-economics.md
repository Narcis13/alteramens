---
title: "Paid Acquisition Economics — When to Spend, How to Measure"
type: concept
category: decision-framework
sources: [paid-acquisition-skills-suite]
entities: []
related: [validate-before-build, kill-fast, distribution-over-product, hypothesis-driven-experimentation, value-before-ask, productize-yourself]
maturity: developing
confidence: high
contradictions: []
applications: []
---

# Paid Acquisition Economics

Decision framework pentru cea mai importantă întrebare înainte de paid: **ar trebui să cheltui bani pe ads?** Și dacă da, **cum măsor real eficiența**, dincolo de cifrele pe care ți le dă platforma?

## Întrebarea prealabilă: "should I run ads at all?"

Pentru un solo builder cu buget limitat, răspunsul implicit la "ar trebui să run ads?" e **NU**. Paid acquisition e **accelerator**, nu fundație. Accelerator pe motor stricat = crashes faster.

### Pre-condiții non-negociabile

Rulează ads **DOAR** dacă ai toate 5:

1. **Conversion tracking verificat** — pixel-ul triggerează pe conversie reală, nu doar page view. Test end-to-end cu cont real.
2. **Landing page care convertește organic > 1%** — dacă traffic-ul organic nu convertește, traffic-ul plătit nici atât (e de calitate mai scăzută)
3. **Ai minim 10 clienți plătitori** — fără ei nu știi cine e ICP-ul, nu știi cât valorează un client, nu poți face lookalikes calitative
4. **Ai LTV estimat** — chiar dacă e aproximativ ("client mediu stă 8 luni × $50/lună = $400"); fără LTV, CPA target e ghicitoare
5. **Ai $1000+ în buget de test** — sub acest prag, nu atingi semnificație statistică în timp util; mai bine ține banii și construiește [[distribution-over-product|distribuție organică]]

Dacă **oricare** lipsește → construiește fundația mai întâi. [[validate-before-build]] la nivel de acquisition.

## Ordinea economică corectă

```
Validate product (primii 10 clienți, organic/manual)
    ↓
Build conversion infrastructure (tracking, landing page, LTV model)
    ↓
Build organic distribution (SEO, content, community)
    ↓
THEN layer paid acquisition on top
```

**De ce ordinea asta?**
- Paid fără product-market fit = amplifici zgomot
- Paid fără conversion infrastructure = nu poți măsura ce funcționează
- Paid fără organic baseline = nu ai cu ce să compari (blended CAC inexistent)
- Paid peste toate 3 = accelerator care compound-ează

## Blended CAC vs. Platform CPA — critical distinction

**Platform CPA** = ceea ce îți raportează Google/Meta/LinkedIn
**Blended CAC** = total spend ÷ total new customers (toate canalele)

Diferența e **semnificativă** în ambele direcții:

### De ce platform CPA e inflated (prea optimist)
Platforms atribuie conversii pe ferestre lungi (28-90 zile) și pe touch-uri multiple. Un utilizator care:
- Descoperă pe organic search
- Revine via newsletter
- Face click pe ad retargeting
- Convertește

…va apărea ca "ad conversion" în platformă, deși paid-ul a fost doar ultimul touch. Platform CPA ar fi $30; blended CAC poate fi $120 pentru că 3 canale au contribuit.

### De ce platform CPA poate fi underreported (prea pesimist)
Cu iOS 14+ tracking restrictions, platforms nu mai văd toate conversiile. Un user care:
- Vede ad
- Convertește după 3 săptămâni fără click ultim

…poate să nu fie atribuit deloc. Platform zice CPA $80; blended CAC real e $40.

### Ground truth: GA4 + manual reconciliation
- Setează UTM-uri consistente pe toate campaniile
- Compară platform data cu GA4 first-touch + last-touch
- Calculează blended CAC lunar: $spend_all_channels ÷ new_paying_customers

Dacă blended CAC > LTV × 0.33 (rule of thumb: CAC payback în <3 luni pentru SaaS solo), **oprește paid**. Economia nu funcționează.

## Budget discipline (cele 3 faze)

### Faza 1: Testing (primele 2-4 săptămâni)
- **Split**: 70% proven/safe (brand search, top-performing audiences) + 30% testing new
- **Nu scala încă** — strângi date, nu bani
- **Target**: learnings, nu ROAS

**Red flag**: "am cheltuit 2000 în prima săptămână pe una campanie"**. Asta nu e testing, e YOLO.

### Faza 2: Consolidation (după ce ai 50+ conversions per campanie)
- Identifică winners (angles + audiences + creative combinations)
- Kill losers brutal ([[kill-fast]] aplicat la paid)
- Switch la automated bidding cu target bazat pe historical data

### Faza 3: Scaling
- Crește bugete câte 20-30% odată
- **Așteaptă 3-5 zile** între creșteri (algorithm learning)
- Dacă CPA începe să crească la volum mai mare → ai lovit limita audiences; e momentul pentru **expansion**, nu scaling al aceleiași audiențe

**Anti-pattern comun**: dublarea bugetului peste noapte. Distrugi algorithm learning; CPA explodează; tragi concluzia greșită că "nu scalează"; kill campanie care era câștigătoare.

## Metrics triad — nu doar CPA

Optimization pe o singură metrică distorsionează portfolio-ul. Watch toate 3:

| Metric | Ce măsoară | Când arată probleme |
|---|---|---|
| **CPA** | Cost per conversie | Crescând → landing page, targeting, sau creative issues |
| **ROAS** | Revenue / ad spend | Scăzând → upsell rate scăzut sau churn mare |
| **Blended CAC** | All spend / new customers | Crescând în timp ce CPA platform stabil → attribution issue |

### Optimization levers (quick reference)

**CPA too high** → landing page check (conversion), tighten audience, test new angles, improve relevance
**CTR low** → new hooks/angles, refine targeting, refresh creative (fatigue)
**CPM high** → audience too narrow, expand, try different placements
**ROAS low but CPA OK** → conversions sunt low-quality; segmentare audience sau creative attracting wrong-fit

## Attribution windows — noua realitate

| Fenomen | Impact |
|---|---|
| iOS 14+ opt-out | 20-40% tracking pierdut pe Meta |
| Chrome cookie deprecation | Similar pentru cross-site tracking |
| Server-side tracking (Conversions API) | Recuperare parțială, cere dev effort |
| Blended measurement (ga4 + platform) | Devine standard, nu opțional |

**Implicație pentru Alteramens**: nu lua platform numbers la nominal. Build blended measurement de la început, chiar dacă e imperfectă.

## Anti-pattern-uri

1. **Paid înainte de PMF** — accelerezi ceva care nu merge; accelerezi și descoperirea că nu merge, dar dai bani în proces
2. **Optimize pe platform CPA ignorând blended** — "platform zice $20 CPA, excelent!" — dar blended e $80 pentru că paid canibalizează organic
3. **Scale prematur** — dublare peste noapte; distruge algorithm learning
4. **Un canal only** — toate ouăle în Google Ads sau Meta; un policy change platform te scoate din joc peste noapte
5. **Budget allocation uniform** — 20% pe fiecare din 5 campanii; nimic nu primește destul pentru semnificație
6. **"Set and forget"** — campanii neatinse luni de zile; creative fatigue + audience burnout inevitabile
7. **No attribution audit** — crezi platform-ului orbește; peste 6 luni realizezi că 50% din "ad conversions" ar fi convertit organic

## Legătura cu alte concepte

- **[[validate-before-build]]**: la nivel de acquisition, paid e pre-condițional de validare
- **[[distribution-over-product]]**: organic e fundația care trebuie să existe înainte de paid layer
- **[[kill-fast]]**: aplicat la campanii și angles — dacă după 1000 impresii nu arată semnal, kill
- **[[value-before-ask]]**: landing page-ul post-click trebuie să demonstreze valoare înainte de signup, altfel paid = găleată cu găuri
- **[[hypothesis-driven-experimentation]]**: fiecare campanie e o ipoteză; fără ipoteză, cheltuiala = aleator

## Legătura cu Skill Era

Economia paid-ului e **counter-intuitive** — cu skill encapsulat, se rezolvă sistematic. `/paid-ads` forțează pre-launch checklist, refuză să lanseze fără conversion tracking, calculează LTV implicit.

Pentru solo builder, asta e protecție împotriva fall-back-ului emotional: "dar poate dacă cheltui $500 pe ads primesc feedback rapid." Skill-ul spune no; întreabă pentru tracking, pentru LTV, pentru organic baseline. Ghidează spre decision framework, nu spre cheltuială.

## Decision tree pentru Alteramens (10h/săpt, buget limitat)

```
Am produs cu $100+ MRR din organic/manual?
├── NU → DON'T RUN ADS. Focus: validare + organic distribuție
└── DA → Am tracking + landing page + LTV estimat?
    ├── NU → Build infrastructure FIRST. Nu cheltui până e setat.
    └── DA → Am $1000+ test budget cu tolerance de pierdere totală?
        ├── NU → Strânge bugetul. Sub $1000 nu înveți nimic statistical.
        └── DA → Run testing phase, 2-4 săptămâni, 70/30 split.
            └── După 50+ conversions per campanie → consolidează.
                └── După 3 luni blended CAC < LTV × 0.33 → scale with discipline.
                    └── Altfel → retrage; economia nu funcționează pe acest produs/audiență.
```

Acest tree e **protecție** împotriva cheltuielii prematură — cea mai frecventă eroare a solo builder-ului presat de "trebuie să cresc mai rapid".

## Când paid devine strategic pentru Alteramens

**Pentru nbrAIn** (SaaS RO accounting):
- Nu acum (pre-PMF, fără 10 clienți plătitori)
- Momentul corect: după 20-30 clienți organici, cu LTV > 6 luni validat, cu landing page care convertește 2%+ pe traffic organic
- Canal probabil primul: **Google Ads search pe brand-uri competitor** (Saga, WizCount alternatives) — high intent, lower cost

**Pentru digital products Alteramens** (cursuri, templates):
- Paid face sens mai devreme (LTV clar la checkout, no churn model)
- Canal: Meta pentru awareness + retargeting; LinkedIn pentru B2B targeting
- Budget: start cu $500 test, per launch

**Pentru brand-ul personal Narcis** ([[productize-yourself]]):
- Nu ads. Conținutul organic + distribuția community sunt fundația.
- Paid aici ar fi anti-pattern — diluează autenticitatea care e valoarea brandului personal.

Aceste decizii nu sunt statice — vor fi revizitate după milestones.
