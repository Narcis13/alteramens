---
title: "Strategy & Foundations Framework pentru Proiecte Alteramens — Configurație Înainte de Execuție"
type: synthesis
trigger: insight
question: "Cum folosesc cele 6 skill-uri Strategy & Foundations (context, psychology, research, pricing, launch, ideas) într-un flux coerent pentru un proiect Alteramens cu timp limitat și obiectiv 1K MRR?"
sources_consulted: [strategy-foundations-skills-suite]
concepts_involved: [product-marketing-context, jobs-to-be-done, voice-of-customer, orb-channel-framework, phased-launch, value-based-pricing, good-better-best-pricing, validate-before-build, kill-fast, productize-yourself, skill-era, distribution-over-product, encoded-judgment]
entities_involved: [alteramens]
created: 2026-04-15
updated: 2026-04-15
maturity: developing
---

# Strategy & Foundations Framework pentru Proiecte Alteramens

Cele 6 skill-uri din [[strategy-foundations-skills-suite]] împărtășesc 7 principii fundamentale deja extrase ca pagini de concepts. Acest document le leagă într-un **framework aplicat pentru un solo builder cu timp limitat** — respectând filosofia Alteramens.

## Prima regulă: Configurația înainte de execuție

Cluster 6 nu e marketing — e **pre-marketing**. Dacă sari peste el și mergi direct la `copywriting`, `paid-ads`, sau `page-cro`, skill-urile lucrează cu asumpții goale. Outputul va fi generic: text care ar putea merge pe orice SaaS, ad-uri targeting "SaaS users", pagini care optimizează conversia pentru audiență necunoscută.

**Ordinea obligatorie pentru orice proiect Alteramens nou**:

1. `/product-marketing-context` — scrie `.agents/product-marketing-context.md`
2. `/customer-research` — minimum Mode 2 (watering hole) dacă n-ai Mode 1
3. `/pricing-strategy` — decide cele 3 axe (packaging × metric × price point)
4. `/launch-strategy` — alege între 5-phase plan sau single full launch
5. Abia apoi → Clusters 1–5 (CRO, SEO, Content, Paid, Lifecycle)

Skipping = multiplicator cu 0. Fiecare skill din Clusters 1–5 verifică `product-marketing-context.md` ca PRIMUL pas; fără el, fac 5 întrebări de context de fiecare dată → pierderi de productivitate catastrofale.

## Cele 7 principii ca gate-keeper

Pentru orice decizie strategică într-un proiect, rulează acest test:

1. **[[product-marketing-context|Context persistent scris?]]** — dacă nu, toate celelalte skills îți vor cere același context repetat
2. **[[jobs-to-be-done|JTBD identificat?]]** — ce job face clientul cu acest produs? Functional + Emotional + Social?
3. **[[voice-of-customer|Vocabular verbatim capturat?]]** — ai 5+ quotes independente pentru fiecare claim principal?
4. **[[orb-channel-framework|Canal Owned funcțional?]]** — ai minim 1 Owned activ înainte să investești în Rented/Borrowed?
5. **[[phased-launch|Fază de launch conștientă?]]** — știi în ce fază ești (Internal/Alpha/Beta/Early Access/Full)?
6. **[[value-based-pricing|Preț ancorat de alternative?]]** — știi next best alternative + perceived value, nu cost × markup?
7. **[[good-better-best-pricing|Tier structure cu Better ca țintă?]]** — ai 3 tiers (sau motiv explicit să nu ai)?

Dacă răspunsul e "nu" sau "nu știu" la oricare, **înainte** de a lansa/optimiza/promova, oprește-te și rezolvă.

## Fluxul complet pentru un proiect nou

### Faza 0 — Validare (pre-proiect)

Înainte de a numi asta "proiect":

- **[[validate-before-build]]** + `customer-research` Mode 2 (digital watering hole): există **job real neacoperit**? Cauți 10+ quotes din Reddit/G2/HN/Indie Hackers care descriu problema în cuvintele lor — nu în ale tale.
- Dacă nu găsești 10 quotes: **[[kill-fast]]**. Nu proiectul — ipoteza.

### Faza 1 — Setup context (1–2 sesiuni, ~2h)

- `/product-marketing-context` cu auto-draft din codebase (sau din MANIFEST-ul proiectului)
- Actualizare 12 secțiuni cu ce ai din validation + watering hole mining
- **Output**: `.agents/product-marketing-context.md` — infrastructura partajată

### Faza 2 — Pricing (1 sesiune, ~1h)

- `/pricing-strategy` cu contextul deja scris
- Decide 3 axe:
  - Packaging: ce feature-uri în fiecare tier?
  - Metric: per-user / per-usage / per-transaction / flat?
  - Price point: folosește Van Westendorp simplified (5–10 prospects, nu 50) pentru range inițial
- Alege Good-Better-Best structure cu Better ca țintă, 2–3× spread între Better și Best
- **Output**: pricing page draft + value metric clar

### Faza 3 — Launch strategy (1 sesiune, ~1h)

- `/launch-strategy`
- Decide: 5-phase sau single full launch?
  - 5-phase OK dacă ai audiență deja (email list, community)
  - Full launch OK dacă produsul e simplu și ai Borrowed channels pregătite (podcast interviews, influencer)
- Definește ORB: ce e Owned (email newsletter? Blog?), ce e Rented (Twitter? Reddit?), ce e Borrowed (podcast? Substack swap?)
- **Output**: launch plan cu checklist pre/during/post

### Faza 4 — Execuție (Clusters 1–5)

Acum skill-urile de execuție pot opera cu context:

| Cluster | Skill-uri relevante | Depends on |
|---|---|---|
| **Content & Copy** | copywriting, copy-editing, content-strategy, lead-magnets | `product-marketing-context` + `voice-of-customer` data |
| **SEO** | seo-audit, ai-seo, schema-markup, programmatic-seo, site-architecture | `product-marketing-context` (categoria produs, vocabular) |
| **Paid** | paid-ads, ad-creative, ab-test-setup | `product-marketing-context` (obiecții, verbatim) + pricing (CAC/LTV boundaries) |
| **CRO** | page-cro, signup-flow-cro, onboarding-cro, form-cro, popup-cro, paywall-upgrade-cro | `product-marketing-context` (aha moment, personas, goals) |
| **Lifecycle** | email-sequence, cold-email, churn-prevention, referral-program | `product-marketing-context` + `customer-research` (pain/trigger) |

### Faza 5 — Iterare prin marketing-ideas

Când ești blocat sau ai buget/timp pentru experimente:

- `/marketing-ideas` cu context + stage + budget
- Alege 2–3 idei compatibile și execută-le prin skill-urile specifice
- NU execuți toate 139 — alegi pe cele care se potrivesc cu fază + resurse

## Cazul tipic Alteramens: solo + AI-augmented + timp limitat

### Bottleneck-ul real

Pentru Narcis, bottleneck-ul NU e execuția (AI + Claude Code rezolvă rapid). Bottleneck-ul e **decizia și validarea**:

- "La ce job răspunde produsul?" — nu scrii mai repede cu AI dacă nu știi job-ul
- "Cine plătește exact?" — nu faci ad-uri mai bune dacă nu știi ICP-ul
- "Cât să ceri?" — nu construiești pricing page mai bine dacă nu ai ancora alternativelor

Cluster 6 lucrează exact pe bottleneck. **Investiția în el e ROI cel mai mare per oră** pentru un solo operator AI-augmented.

### Timp alocat recomandat

Pentru un proiect nou vizat la 1K MRR în 3-6 luni:

| Fază | Timp | Output |
|---|---|---|
| Validation + watering hole research | 4-6h spread pe 1-2 săptămâni | 10+ verbatim quotes, 3 competitor "4-star" review analyses |
| Context setup | 2h | `.agents/product-marketing-context.md` V1 |
| Pricing decisions | 1-2h | Pricing page draft + value metric |
| Launch plan | 1h | 5-phase plan sau full launch checklist |
| **Total Cluster 6** | **~10h total** | Infrastructură pentru toate celelalte skills |

După 10 ore în Cluster 6, celelalte skills execută de 2–3× mai repede (sari peste re-prompting pentru context) și output-ul e mai bun (ancorat de verbatim real + JTBD real + pricing real).

### Anti-pattern specific Alteramens

"Vreau să încep cu copywriting pentru landing page" → **nu**. Fără Cluster 6, copywriting va produce text generic. AI-ul tău va scrie 5 variante la fel de plauzibile, și nu vei ști care e "right" — pentru că n-ai ancora de VoC.

Cu Cluster 6 făcut: `/copywriting` produce 3 variante care folosesc verbatim din research + sunt adresate unui JTBD specific + convertesc un tier Good-Better-Best definit. AI-ul tău devine multiplicator real, nu generator de slop plauzibil.

## Legătura cu celelalte frameworks

| Framework | Dependency pe Cluster 6 |
|---|---|
| [[cro-framework-alteramens]] | Aha moment ([[aha-moment]]) se derivă din JTBD; persoanas din context |
| [[seo-framework-alteramens]] | Categorie produs + vocabular client din context; keyword research → verbatim |
| [[content-copy-framework-alteramens]] | VoC e materia primă; JTBD e structura; brand voice din context |
| [[paid-acquisition-framework-alteramens]] | Obiecții + verbatim pentru ads; CAC bounds din pricing; personas pentru targeting |
| [[lifecycle-retention-framework-alteramens]] | Switching dynamics (JTBD Four Forces); ICP pentru segmentare email |

**Cluster 6 nu înlocuiește celelalte frameworks — le face posibile.** Fără el, toate sunt exerciții academice.

## Checklist "sunt gata pentru execuție?"

Pentru orice proiect Alteramens nou, înainte de a invoca `/copywriting` sau `/paid-ads` sau `/page-cro`:

- [ ] `.agents/product-marketing-context.md` există și e completat la cel puțin 8/12 secțiuni
- [ ] Secțiunea "Customer Language" conține minimum 10 verbatim quotes
- [ ] JTBD (functional + emotional + social) e identificat pentru ICP primar
- [ ] JTBD Four Forces (Push/Pull/Habit/Anxiety) e mapat
- [ ] Next best alternative e clar identificat cu preț real
- [ ] Pricing decision pe 3 axe (packaging/metric/point) e luat
- [ ] Tier structure definită (Good/Better/Best sau motiv explicit)
- [ ] Launch phase curentă știută (Internal/Alpha/Beta/Early Access/Full)
- [ ] Owned channel minim 1 activ sau în construcție
- [ ] 1 rented + 1 borrowed channel identificate

Dacă <8/10 → înapoi la Cluster 6 înainte de Clusters 1–5.

## Mesajul central

**Configurația bună bate execuția bună la AI-augmented solo operator.**

AI-ul execută rapid oricum. Ce alege AI-ul să execute depinde de contextul pe care îl primește. Context prost → execuție rapidă de slop. Context bun → execuție rapidă de valoare reală.

Cluster 6 e unde investești în context — și acest context compoundează peste toate celelalte 30+ skill-uri care îl citesc. E [[encoded-judgment]] pur — scrii judgment-ul **o dată**, îl folosești de sute de ori.

Pentru 1K MRR în 6 luni, asta e diferența între 10× mai multe experimente (prost) și 3× mai multe experimente (bune).
