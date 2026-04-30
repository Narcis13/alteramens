---
title: "Paid Acquisition Skills Suite — Ipoteză, Creativitate, Rigoare Statistică"
type: source
format: code
origin: vault
source_ref: ".claude/skills/"
ingested: 2026-04-14
guided: true
entities: [alteramens]
concepts: [hypothesis-driven-experimentation, ice-prioritization, angle-diversification, performance-data-loop, paid-acquisition-economics, voice-of-customer, buyer-stage-mapping, validate-before-build, kill-fast, encoded-judgment, skill-era]
key_claims:
  - "Orice experiment serios începe cu ipoteză falsifiabilă: 'Because [data], we believe [change] will cause [outcome] for [audience]. We'll know when [metrics].' — nu 'let's see what happens' (ab-test-setup)"
  - "ICE Prioritization: Impact + Confidence + Ease, scorate 1-10, formulă = (I+C+E)/3. Rulezi highest-score prima, re-scorezi lunar (ab-test-setup)"
  - "Angle Diversification: 3-5 motivații distincte per campanie, nu 10 variații ale aceluiași mesaj. Categorii validate: pain/outcome/social-proof/curiosity/comparison/urgency/identity/contrarian (ad-creative)"
  - "Experimentation velocity țintă: 4-8 experiments/lună, win rate 20-30%, backlog 20+ ipoteze. Rate susținute >30% indică ipoteze prea conservatoare (ab-test-setup)"
  - "Sample size se pre-commită înainte de launch; stop-early pe peek = false positives. La 95% confidence, p<0.05 (ab-test-setup)"
  - "Platform CPA e inflat; măsoară blended CAC comparat cu GA4. Atribuirea ad-platformelor supra-creditează canalele plătite (paid-ads)"
  - "Creative fatigue apare la ~1000 impresii per variantă; retire-uiește după, nu înainte. Testing hierarchy: concept/angle (cel mai mare impact) > hook > visual > body > CTA (ad-creative)"
  - "Retargeting ladder funnel-based: hot (1-7 zile, high frequency OK) → warm (7-30 zile, 3-5x/săpt) → cold (30-90 zile, 1-2x/săpt); exclude customers + recent converters (paid-ads)"
  - "Testing phase budget split: 70% proven/safe + 30% testing new angles. Scaling phase: consolidează pe combinatii câștigătoare, crește 20-30% odată, așteaptă 3-5 zile pentru algorithm learning (paid-ads)"
  - "RSA headlines: 15 headlines max, trebuie să aibă sens în orice combinație, include minim 1 keyword + 1 benefit + 1 CTA (ad-creative)"
confidence: high
---

# Paid Acquisition Skills Suite

Un set de 3 skill-uri coordonate pentru **acquisition plătită cu rigoare** — strategia de campanii (paid-ads), producția de creative la scară (ad-creative), și disciplina experimentală (ab-test-setup). Această pagină documentează suite-ul ca un singur corp de expertiză: ipoteză → producție → măsurare → învățare → iterație.

Skill-urile live în `.claude/skills/` și sunt invocabile direct prin `/<nume-skill>` în Claude Code.

## Cele 3 skill-uri

| Skill | Path | Focus |
|---|---|---|
| **paid-ads** | `.claude/skills/paid-ads/SKILL.md` | Strategie campanii: platforme, audiențe, bugete, retargeting, optimizare |
| **ad-creative** | `.claude/skills/ad-creative/SKILL.md` | Producție creative la scară (100+ variații): angles, specs, iteration loop |
| **ab-test-setup** | `.claude/skills/ab-test-setup/SKILL.md` | Design experiments: ipoteză, sample size, semnificație, playbook compounding |

## Principiile fundamentale pe care le împărtășesc

Cele 3 skill-uri derivă din același set de pattern-uri reutilizabile, extrase ca pagini de concepts separate:

- **[[hypothesis-driven-experimentation]]** — orice cheltuială/creativ/test începe cu ipoteză falsifiabilă, nu cu speranță
- **[[ice-prioritization]]** — framework universal (Impact + Confidence + Ease)/3 pentru a alege ce să testezi next
- **[[angle-diversification]]** — 3-5 motivații distincte per ask; vary angles, not word choice
- **[[performance-data-loop]]** — pull → analyze winners/losers → generate variations → test → compound. Meta-pattern de învățare
- **[[paid-acquisition-economics]]** — blended CAC vs. platform CPA + "should I run ads at all" + budget discipline

## Afirmații-cheie per skill

### paid-ads
**Platform selection** conform intenției: Google Ads (search intent), Meta (demand gen + visual), LinkedIn (B2B + job targeting), TikTok (younger + video), X (tech audiences). Nu "run everywhere" — unde e audiența ta.

**Campaign structure**: Account → Campaign (per obiectiv × audiență × produs) → Ad Set (per targeting variation) → Ad (per creative variation). Naming convention consistentă: `[Platform]_[Objective]_[Audience]_[Offer]_[Date]`.

**Budget allocation**:
- Testing phase (2-4 săpt): 70% proven / 30% testing new
- Scaling: consolidează pe winners, crește cu 20-30% odată, 3-5 zile între creșteri pentru algorithm learning

**Retargeting ladder**:
| Funnel stage | Audience | Message | Window | Freq cap |
|---|---|---|---|---|
| Hot | Cart/trial users | Urgency, objection handling | 1-7 zile | Higher OK |
| Warm | Pricing/feature visitors | Case studies, demos | 7-30 zile | 3-5x/săpt |
| Cold | Any visit | Educational, social proof | 30-90 zile | 1-2x/săpt |

**Exclusions non-negociabile**: existing customers, recent converters (7-14 zile), bounced visitors (<10 sec), pagini irelevante (careers, support).

**Metrics triad pentru optimization**:
- CPA prea mare → landing page check, tighten targeting, test new angles, improve relevance
- CTR scăzut → new hooks/angles, refine targeting, refresh creative (fatigue)
- CPM mare → expand targeting, try different placements, improve creative fit

**Attribution reality check**: platform attribution e **inflată**; folosește UTM-uri, compară cu GA4, urmărește **blended CAC, not platform CPA**.

### ad-creative
**Two modes de operare**:
- Mode 1: Generate from scratch (context + audience + platform specs)
- Mode 2: Iterate from performance data (CSV/API → identify patterns → double down + explore)

**Core loop**: pull performance → winning patterns → new variations → validate specs → deliver.

**Angle definition înainte de producție**: stabilește 3-5 angles distincte (pain, outcome, social proof, curiosity, comparison, urgency, identity, contrarian). Pentru fiecare angle: multiple variații (word choice, specificity, tone, structure).

**Platform specs** — truncare silent dacă depășești:
- Google RSAs: 30 char headlines (până la 15), 90 char descriptions (până la 4)
- Meta: 125 char primary text visible (2200 max), 40 char headline recommended
- LinkedIn: 150 char intro recommended (600 max), 70 char headline recommended
- TikTok: 80 char ad text recommended (100 max)
- X: 280 char tweet + 70 char card headline

**Testing hierarchy** (ordered by impact):
1. Concept/angle (biggest impact)
2. Hook/headline
3. Visual style
4. Body copy
5. CTA

**Batch workflow** (Anthropic growth team: 100+ variations per cycle):
- Break into sub-tasks (headlines / descriptions / primary text separate)
- Generate in waves: Wave 1 core angles (3-5 × 5 variations), Wave 2 extensions on top 2, Wave 3 wild cards
- Quality filter: char limits, dedup, platform policy, headline/description combo sanity

**Retirement rule**: Allow 1,000+ impressions per variantă înainte de a judeca. Rotating creative prematurely = zgomot statistic, nu învățare.

### ab-test-setup
**Hypothesis structure** (obligatoriu):
```
Because [observation/data],
we believe [change]
will cause [expected outcome]
for [audience].
We'll know this is true when [metrics].
```

Weak: "Changing button color might increase clicks."
Strong: "Because users report difficulty finding CTA (heatmaps + feedback), we believe larger contrasting button will increase CTA clicks by 15%+ for new visitors. Measured by CTR from page view to signup start."

**Sample size reference** (quick):
| Baseline conversion | 10% lift | 20% lift | 50% lift |
|---|---|---|---|
| 1% | 150k/variant | 39k/variant | 6k/variant |
| 3% | 47k/variant | 12k/variant | 2k/variant |
| 5% | 27k/variant | 7k/variant | 1.2k/variant |
| 10% | 12k/variant | 3k/variant | 550/variant |

**Metrics taxonomy**:
- Primary (single, tied to hypothesis)
- Secondary (support interpretation)
- Guardrail (must not get worse — stop if significantly negative)

**Peeking problem**: stop-early pe date preliminare = false positives. Pre-commit la sample size, trust the process.

**ICE scoring**: prioritize experiments cu (Impact + Confidence + Ease)/3. Re-score monthly.

**Experiment velocity targets**:
- 4-8 experiments/lună (most teams)
- 20-30% win rate e normal pentru programe mature (sustained >30% indică ipoteze prea conservatoare)
- 2-4 săpt avg test duration
- 20+ ipoteze în backlog
- Compound lift trackat cumulativ

**Cadence**:
- Weekly (30 min): running experiments QA, guardrail check, NOT call winners early
- Bi-weekly: conclude completed, update playbook, launch next from backlog
- Monthly (1h): review velocity, win rate, cumulative lift, replenish backlog, re-ICE
- Quarterly: playbook audit — ce patterns au fost scalate, ce zone sub-testate

## De ce am ingerat ca suite, nu separat

Cele 3 skill-uri partajează un vocabular comun (ipoteză, variantă, metric primar, learning loop) și se cross-referențiază direct:
- ad-creative → paid-ads (strategy) + ab-test-setup (structuring creative tests cu rigor statistic)
- paid-ads → ad-creative (bulk creative) + ab-test-setup (landing page testing)
- ab-test-setup → ad-creative (variant copy) + paid-ads (creative testing în campanii)

Extragerea celor 5 concepts cross-cutting permite querying-ul patterns-urilor fără duplicare și, important, **reutilizarea framework-urilor dincolo de acquisition**. De exemplu, ICE Prioritization aplică la ideation de produse, la backlog de features, la alegerea între proiecte Alteramens.

## Conexiunea cu Skill Era — experimentation ca compounding asset

Cele 3 skill-uri nu sunt playbook-uri statice — sunt **[[encoded-judgment|judgment encodat]]** pentru o zonă cu cost real (bani cheltuiți pe ads), unde greșelile sunt scumpe. Skill Era transformă economia acestei arii în două direcții:

### Directionul 1: Velocity-ul învățării
Fără skill-uri: fiecare test cere set-up manual (hypothesis, sample size, tracking, variant design, analysis). Overhead de ore per experiment = lenta de 1-2 experiments/lună pentru un solo builder.

Cu skill-uri: `/ab-test-setup` produce structura într-o invocare. `/ad-creative` produce 100 de variații într-o sesiune. `/paid-ads` dă checklist pre-launch. Velocity țintă de 4-8 experiments/lună devine realizabilă.

### Direcția 2: Compounding asset-ul
Aici e cheia care transformă acquisition plătită dintr-un cost continuu într-un **asset care se apreciază**:

**Fiecare experiment câștigător devine un entry în experiment playbook** — un pattern reproductibil care:
1. Se aplică la alte pagini/fluxuri (cross-pollination)
2. Se encodează ulterior ca parte dintr-un skill propriu (ex: "pentru SaaS RO B2B, headline-urile cu '[verb acțiune] + [cifră specifică în RON]' converteasc 2x vs alternative")
3. Scade costul deciziilor viitoare — nu reinventezi roata la fiecare campanie

**Matematica compounding-ului**: 6 experimente/lună × 25% win rate = 1.5 winners/lună. În 12 luni: 18 patterns validated. Fiecare pattern reutilizat salvează ore și îmbunătățește baseline-ul viitor. Baseline-ul mai bun înseamnă teste viitoare mai bune (sample size mai mic la același lift).

**Implicația pentru Alteramens**: playbook-ul de experimente devine **[[specific-knowledge]]** în sensul [[productize-yourself|Naval]]: cunoaștere care nu poate fi copiată pentru că e derivată din date proprii. Competitorii cu bugete mai mari nu au pattern-urile tale. Asta e moat-ul solo builder-ului care respectă disciplina experimentală: **timpul îți devine aliat, nu constraint**.

Vezi [[paid-acquisition-framework-alteramens]] pentru aplicare cu buget $0 de start.

## Suite-uri înrudite

- **[[cro-skills-suite]]** (6 skill-uri) — *post-click conversion*; paid acquisition trimite trafic în CRO-ul optimizat
- **[[seo-skills-suite]]** (5 skill-uri) — *organic acquisition*; paid + organic se amplifică reciproc (branded search după paid, retargeting după organic)
- **[[content-copy-skills-suite]]** (4 skill-uri) — *mesajul*; copy-ul bun face diferența între paid cu ROAS 1x vs 3x
- Paid acquisition suite e **acceleratorul**: odată ce SEO, content și CRO funcționează organic, paid-ul le scalează cu multiplicator — și, critic, **învață mai rapid** (feedback days vs luni)
