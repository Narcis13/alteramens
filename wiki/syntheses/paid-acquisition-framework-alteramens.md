---
title: "Paid Acquisition Framework pentru Proiecte Alteramens — Experimentation as Compounding Asset"
type: synthesis
trigger: insight
question: "Când și cum folosesc cele 3 skill-uri Paid Acquisition (paid-ads, ad-creative, ab-test-setup) pentru un proiect Alteramens cu buget limitat și 10h/săpt, astfel încât fiecare euro cheltuit să producă învățare compounding?"
sources_consulted: [paid-acquisition-skills-suite, cro-skills-suite, seo-skills-suite, content-copy-skills-suite, skill-era-article, naval-framework]
concepts_involved: [hypothesis-driven-experimentation, ice-prioritization, angle-diversification, performance-data-loop, paid-acquisition-economics, validate-before-build, kill-fast, distribution-over-product, value-before-ask, buyer-stage-mapping, voice-of-customer, encoded-judgment, skill-era, productize-yourself, data-compounding-moat, world-model]
entities_involved: [alteramens, naval-ravikant]
created: 2026-04-14
updated: 2026-04-14
maturity: developing
---

# Paid Acquisition Framework pentru Proiecte Alteramens

Cele 3 skill-uri Paid Acquisition ([[paid-acquisition-skills-suite]]) se împart 5 principii fundamentale, extrase ca concepts. Acest document le leagă într-un **framework operațional pentru un solo builder cu $1000 buget de test și 10h/săpt** — centrat pe principiul că **paid acquisition bine condusă e compounding asset, nu cost continuu**.

## Teza centrală: experimentation as compounding asset

Pentru majoritatea companiilor, paid ads e un **cost**: plătești lunar, primești trafic lunar, oprești → traficul dispare. Relație lineară.

Pentru o companie care aplică disciplină experimentală riguroasă, paid ads devine **asset**: fiecare campanie produce **date proprietare** care alimentează playbook-ul → playbook-ul reduce costul deciziilor viitoare → baseline-ul viitor e mai bun → compound lift cumulativ.

Diferența nu e în mărimea bugetului — e în **ce faci cu datele**. Un solo builder cu $1000/lună care operează corect loop-ul va produce, în 12 luni, cunoaștere mai valoroasă decât un competitor cu $50k/lună care rulează campanii fără disciplină.

Acesta este argumentul central al acestui framework: **paid ca mecanism de învățare, nu ca mecanism de trafic**.

## Prima regulă: nu cheltui până ai fundația

Paid acquisition e accelerator pe fundația formată din produs + validare + conversion infrastructure + organic distribution. Fără fundație, paid = bani arși plus concluzii greșite.

Vezi [[paid-acquisition-economics|decision tree-ul]] pentru decizia explicită "should I run ads at all". Până când răspunsul e "da" pentru 5 pre-condiții, paid e OFF.

**Pentru portfolio-ul Alteramens curent:**
- **nbrAIn**: paid OFF încă. Nu ai cei 10-30 clienți organici. Focus: [[distribution-over-product|distribuție organică]] + content pe SEO.
- **Digital products** (cursuri, templates, dacă se lansează): paid ON după primul launch organic reușit.
- **Personal brand Narcis**: paid permanent OFF. Anti-pattern pentru [[productize-yourself]].

## Cele 5 principii ca filtru operațional

Pentru orice decizie de acquisition plătită, rulează acest test:

1. **[[hypothesis-driven-experimentation|Ai ipoteză falsifiabilă?]]** — "Because [data], we believe [change] will cause [outcome] for [audience]. Known true when [metrics]."
2. **[[ice-prioritization|Ai scorat ICE?]]** — cea mai bună idee e prima; alternativele sunt în backlog cu scor explicit
3. **[[angle-diversification|Ai 3-5 angles distincte?]]** — nu 30 de variații ale aceluiași mesaj
4. **[[performance-data-loop|Ai setup pentru capture?]]** — pattern + apply-to documentat pentru fiecare winner și loser
5. **[[paid-acquisition-economics|Economia funcționează?]]** — blended CAC < LTV × 0.33 ca rule of thumb

Dacă oricare e "nu" → ai o pârghie clară de îmbunătățire înainte de a cheltui.

## Secvența de lucru pentru un proiect

### Faza 0 — Pre-paid (până când pre-condițiile sunt satisfăcute)
**Obiectiv**: **nu cheltui**. Construiește fundația.
- 10-30 clienți organici/manuali (validare PMF)
- Conversion tracking testat end-to-end (GA4 + platform pixel)
- Landing page cu conversie organică >1%
- LTV estimat (chiar aproximativ: clienți × avg monthly × avg retention)
- $1000+ test budget cu tolerance de pierdere totală

**Skills**: nu `/paid-ads`, `/ad-creative`, `/ab-test-setup` încă. Focus pe SEO, content, CRO, customer research.

### Faza 1 — Testing phase (2-4 săptămâni, $1000-$3000 buget)
**Obiectiv**: **învață**, nu scala.

**Step 1: Definește 3 ipoteze cu ICE**
Folosind `/ab-test-setup`, formulează 3-5 ipoteze de campanie cu ICE scoring. Exemple pentru nbrAIn (hypothetically, după Faza 0):
- "Because contabilii RO caută 'alternative Saga' (GSC data), we believe Google Search ads pe branded competitor keywords will achieve CPA <$50 for single-practice accountants"
- "Because VoC indică frustrare cu interfețe învechite, we believe Meta ads cu before/after screenshots will achieve CTR >1.5% for modern-inclined practitioners"
- "Because cold audience nu cunoaște nbrAIn, we believe LinkedIn ads targeting 'contabil' job title nu vor atinge CPA target în testing budget" (ipoteza de eliminat rapid)

Prima ipoteză în execuție: highest ICE.

**Step 2: Generează creative cu angles diverse**
Folosind `/ad-creative`, generează 3-5 angles per campanie × 5 variații per angle = 15-25 variații. Fiecare angle e o sub-ipoteză.

Pentru ipoteza de "branded competitor" de mai sus:
- Angle 1 (Pain): "Saga prea complicat? Încearcă nbrAIn — 5 min setup."
- Angle 2 (Outcome): "Automatizează 15h/săpt de muncă repetitivă."
- Angle 3 (Comparison): "nbrAIn vs Saga — ce fac mai bine pentru cabinete solo"
- Angle 4 (Identity): "Pentru contabilul solo care vrea control real asupra datelor."
- Angle 5 (Social proof): "Alătură-te celor X contabili care au migrat din Saga" (dacă ai numerele reale; altfel skip)

**Step 3: Setează budget split 70/30**
- 70% pe campania cu highest ICE (prea repede pentru a fi "proven", dar highest confidence)
- 30% pe testing de angles în a doua campanie

**Step 4: Capture religios**
Pentru fiecare ipoteză, înainte de launch: deschide playbook entry template (din [[performance-data-loop]]) și pre-completează câmpurile cunoscute. După 1000+ impresii/angle, completează rezultatele.

**Output faza 1**: 3-5 playbook entries cu patterns validate (sau infirmate).

### Faza 2 — Consolidation (lunile 2-3, $3000-$10000/lună)
**Obiectiv**: **scale pe winners + retire losers**.

- Kill fără ezitare campaniile și angles cu ICE < baseline sau cu CPA > 2x target
- Consolidează bugetul pe winners; crește 20-30% odată, 3-5 zile între creșteri
- Lansează noi angles pe bază de patterns din playbook (exploitation 70%) + 1-2 wild cards (exploration 30%)
- Setup retargeting funnel: hot (1-7 zile) → warm (7-30 zile) → cold (30-90 zile) cu messaging diferit per stage

**Skills**: `/paid-ads` pentru optimization decisions, `/ad-creative` pentru a produce next wave, `/ab-test-setup` pentru landing page tests în paralel.

**Metric de succes**: blended CAC scade în timp ce spend crește. Dacă CAC crește odată cu spend → ai lovit audience limits; e momentul pentru expansion, nu scaling.

### Faza 3 — Scaling + playbook maturation (lunile 4-12)
**Obiectiv**: **compound lift**.

- Velocity experiments: 4-8 per lună între campanii, creative, landing pages
- Quarterly playbook audit: care patterns au fost scalate, ce zone sub-testate
- Blended CAC reconciliation lunară cu GA4 (nu te baza pe platform numbers)
- Expansion: pe baza audience learnings, identifică audiențe adjacente (ex: contabili cu 2-5 angajați după ce validezi pe solo)

**Compounding vizibil**: după 6-9 luni, deciziile "launch X campaign" sunt luate de 3x mai rapid pentru că pattern-ul e deja în playbook. Sample sizes devin mai mici pentru că confidence scores sunt mai mari ("știu deja că angle-ul Pain funcționează pentru RO accounting; testez doar formularea").

## Integrarea cu celelalte 3 suite-uri

Paid acquisition nu funcționează în izolare. E acceleratorul unei infrastructuri deja construite:

```
┌─────────────────────────────────────────────────────────┐
│  SEO suite: organic traffic + AI citations             │
│  Content & Copy: message care rezonează                │
│  CRO suite: post-click conversion optimizat            │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
            ┌──────────────────────────┐
            │  Paid acquisition suite  │
            │  amplificator + learner  │
            └──────────────────────────┘
                        │
                        ▼
            ┌──────────────────────────┐
            │  Playbook compounding    │
            │  (experiment patterns)   │
            └──────────────────────────┘
```

**Dependențe explicite**:
- Ad-creative folosește [[voice-of-customer]] din Content & Copy suite pentru formulări
- Angles folosesc [[buyer-stage-mapping]] din Content & Copy pentru matching cu audience temperature
- Landing pages unde ajunge paid traffic sunt optimizate prin CRO suite (page-cro, form-cro, popup-cro)
- Hypothesis structure din ab-test-setup e folosită și pentru CRO tests pe pagini organic

## Anti-pattern-uri specifice solo builder-ului

1. **"Voi cheltui $500 să văd dacă merge produsul"** — paid nu validează produsul; validează rezonanța mesajului cu audiența. Fără produs validat, concluziile sunt false positives/negatives.
2. **Scaling prematur după un winner** — un pattern validat pe 1000 impresii nu e "proven". Trebuie replicat pe 3+ audiences sau contexte pentru a intra ca solid în playbook.
3. **Neglijarea capture-ului în goana după optimization** — sistemul optimizează pe termen scurt, dar în 3 luni realizezi că nu știi **de ce** ai câștigat; nu poți repeta.
4. **Buget distribuit uniform** — $200 pe 5 campanii = zero semnificație pentru oricare. $1000 pe 1 campanie + strict hypothesis = învățare.
5. **Set and forget** — "las campania să ruleze, mă uit luna viitoare". Creative fatigue + audience burnout + missed optimizations. Minim săptămânal 30 min review.
6. **Platform trust orbesc** — "platforma zice ROAS 4x, excelent!". Poate, dar blended reality poate fi ROAS 1.8x. Always reconcile cu GA4.
7. **Paid pentru personal brand** — pentru [[productize-yourself]] și brand-ul Narcis, paid dilutează autenticitatea. Organic distribution only.

## Skill Era — mecanica compounding-ului pentru solo builder

Cele 3 skill-uri sunt ceea ce face compounding-ul posibil pentru un solo builder cu 10h/săpt:

### Fără skill-uri
- Configurare experiment: 2-3 ore (hypothesis research, sample size calc, tracking verify, variant design)
- Creative generation: 3-4 ore (10-15 headlines, descriptions, platform spec compliance)
- Analysis + playbook capture: 1-2 ore
- **Total per experiment**: 6-9 ore = **1 experiment/săptămână** la 10h/săpt

### Cu skill-uri
- `/ab-test-setup` — structura ipotezei + sample size + metric taxonomy în 30 min
- `/ad-creative` — 5 angles × 5 variations = 25 variații în 45 min
- `/paid-ads` — campaign structure + targeting + budget split în 30 min
- Analysis + capture: 1 oră
- **Total per experiment**: 2.5-3 ore = **3-4 experiments/săptămână** = **12-16/lună**, peste țintă

### Velocity → compounding
Cu 12-16 experimente/lună × 20-30% win rate → 2.5-5 winners/lună → 30-60 patterns validate în 12 luni. Fiecare pattern reutilizabil în contexte viitoare.

Asta e **nu doar viteză — e compounding-ul [[encoded-judgment|judgment-ului]] tău specific**. Playbook-ul devine **[[specific-knowledge]]** ([[productize-yourself|Naval]]) — derivat din data proprie, imposibil de copiat.

### Meta-recursivitate: skills-urile care generează skills
Pe măsură ce playbook-ul se maturizează, pattern-urile încep să arate ca noi skill-uri candidate:

- "Pentru SaaS RO B2B, angle-ul 'Pain + specific timp pierdut în RON' convertește 2x. Formulă: `[verb acțiune] + [X ore/săpt] × [Y RON/oră] = [Z RON/lună]`" → candidate pentru skill specializat `/ro-saas-ad-copy`
- "Campaign audit check pentru nbrAIn: blended CAC, angle health, creative fatigue, budget pacing" → candidate pentru `/nbrain-weekly-audit`

Asta e [[skill-era]] aplicată recursiv: tu însuți contribui la biblioteca de [[encoded-judgment]] reutilizabilă — nu doar consumi skill-uri existente.

## Checklist rapid — primul pas pentru proiectul curent

Pentru proiectul Alteramens cu status activ (de obicei nbrAIn):

- [ ] Am trecut prin [[paid-acquisition-economics|decision tree]] și sunt în "DA, run ads"?
- [ ] Am minim 3 ipoteze cu ICE scored?
- [ ] Am 3-5 angles distincte pentru prima campanie, fiecare ancorat în [[voice-of-customer|VoC]]?
- [ ] Am playbook template deschis și pre-completat?
- [ ] Am conversion tracking testat end-to-end?
- [ ] Am $1000+ test budget și tolerance de pierdere totală?
- [ ] Am cadence de review (săptămânal running, lunar playbook)?
- [ ] Am blended measurement setup (GA4 + platform reconciliation)?

8/8 = gata de launch; <5/8 = nu lansa încă, construiește ce lipsește.

## Summary: cele 4 suite-uri, o singură filosofie

| Suite | Întrebarea pe care o răspunde | Principii cross-cutting |
|---|---|---|
| [[seo-skills-suite|SEO]] | "Cum mă găsesc cei care caută organic?" | machine-readable-structure, hub-and-spoke, AEO |
| [[content-copy-skills-suite|Content & Copy]] | "Ce scriu și cum?" | searchable-vs-shareable, voice-of-customer, content-pillars, buyer-stage-mapping, seven-sweeps |
| [[cro-skills-suite|CRO]] | "Cum convertesc cei care ajung?" | value-before-ask, friction-cost, progressive-commitment, aha-moment |
| **Paid Acquisition** (acest framework) | "Cum scalez cu disciplină și învăț compounding?" | hypothesis-driven-experimentation, ice-prioritization, angle-diversification, performance-data-loop, paid-acquisition-economics |

Toate 4 sunt expresii ale [[skill-era|Skill Era]]: judgment expert encapsulat în formă invocabilă. Compounding-ul ia forme diferite per suite — dar mecanismul e identic: **judgment encodat × aplicare repetată × capture structurat = asset care se apreciază în timp**.

Pentru un solo builder cu 10h/săpt, combinarea celor 4 suite-uri e forma operațională a [[productize-yourself|thesis-ei Naval]]: specific knowledge + leverage + judgment + accountability, aplicate sistematic. **Nu ai de concurat cu companii mari — ai de compound cu disciplină.** Timpul e aliat.

## Întrebări deschise (de rezolvat prin aplicare)

- Care din cele 5 concepts se va aplica primul pe un proiect real Alteramens? (Probabil ICE prioritization — aplicabil înainte chiar de prima campanie.)
- Cum se integrează playbook-ul de experimente cu vault-ul Alteramens? (Probabil `wiki/syntheses/playbook-[proiect].md` cu apendix lunar.)
- Există un al 6-lea concept care emerge după primele 6 luni de aplicare? (Candidat: "creative fatigue patterns" specific pentru audiențe B2B RO.)
- Cum se cuplează skill-urile paid cu [[mcp-as-distribution|MCP as distribution]] — ads pentru agent plugins, ce înseamnă asta?

Aceste întrebări primesc răspuns doar prin aplicare. Atunci voi adăuga `applications:` în frontmatter-ul fiecărui concept și potențial voi updata synthesis-ul cu learnings.
