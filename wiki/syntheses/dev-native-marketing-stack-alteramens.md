---
title: "Dev-Native Marketing Stack pentru Alteramens — Cum Reframe-ul 'Marketing as Coding' Unifică Framework-urile Existente"
type: synthesis
trigger: insight
question: "Cum se conectează reframe-ul marketing-as-coding cu framework-urile alteramens deja definite (strategy, paid, SEO, content, CRO, lifecycle, sales-revops) și ce arhitectură concretă rezultă?"
sources_consulted: [marketing-as-coding-reframe, sales-revenue-ops-skills-suite, severino-claude-sales-system, ai-marketing-distribution]
concepts_involved: [marketing-as-coding, engineering-as-marketing, hypothesis-driven-experimentation, encoded-judgment, compounding-games, viral-artifacts, distribution-over-product, skill-era]
entities_involved: [alteramens]
created: 2026-04-20
updated: 2026-04-20
maturity: draft
---

# Dev-Native Marketing Stack pentru Alteramens

## Întrebarea care a generat sinteza

Wiki-ul Alteramens conține deja **8 framework-uri marketing** (strategy, paid, SEO, content, CRO, lifecycle, sales-revops, plus ORB pe canale) și **multiple concepte de growth** (engineering-as-marketing, hypothesis-driven-experimentation, viral-artifacts, distribution-over-product). E un corpus mare, dar **fragmentat ca activitate**: fiecare framework e o disciplină separată cu propriul vocabular.

Reframe-ul **[[marketing-as-coding]]** propune un singur unlock: tratează **toate** ca module ale aceluiași sistem versionat. Întrebarea: dacă luăm asta serios, **ce arhitectură concretă rezultă** pentru un solo dev cu 1K MRR target și timp limitat?

## Răspunsul scurt

Un singur **growth repo** per proiect Alteramens, cu 8 sub-foldere care mapează 1:1 framework-urile existente, operate prin **un singur ritual săptămânal** (growth sprint), cu **AI ca executor pe fiecare sub-folder**. Wiki-ul Faber devine **knowledge layer-ul** care alimentează skills-urile care alimentează repo-ul. Distribuția (skills exportate) închide loop-ul către alți developeri care devin canale.

## Arhitectura propusă

### Stratul 1 — Knowledge layer (deja există: `wiki/`)

Faber wiki-ul e single source of truth pentru:
- Framework-urile (`*-framework-alteramens`) — *cum* funcționează fiecare disciplină
- Conceptele transversale (hypothesis-driven, compounding-games, etc.) — *de ce* funcționează
- Decisions per proiect — *ce* am ales și de ce

**Rolul în reframe:** wiki-ul e **biblioteca de patterns** la care orice nou ticket de marketing referă. Înainte de a deschide un branch nou, întrebare obligatorie: "ce concept din wiki aplic aici?"

### Stratul 2 — Skills layer (parțial există: `.claude/skills/`)

Skills existente acoperă deja:
- `/paid-ads`, `/ad-creative`, `/ab-test-setup` (paid)
- `/seo-audit`, `/programmatic-seo`, `/site-architecture`, `/schema-markup`, `/ai-seo` (SEO)
- `/copywriting`, `/copy-editing`, `/content-strategy`, `/email-sequence` (content)
- `/page-cro`, `/form-cro`, `/popup-cro`, `/signup-flow-cro`, `/onboarding-cro`, `/paywall-upgrade-cro` (CRO)
- `/churn-prevention` (lifecycle)
- `/sales-enablement`, `/cold-email`, `/competitor-alternatives`, `/lead-magnets`, `/free-tool-strategy`, `/launch-strategy`, `/pricing-strategy` (sales-revops + assorted)
- `/customer-research`, `/marketing-psychology`, `/marketing-ideas`, `/community-marketing`, `/social-content`, `/referral-program`, `/revops`, `/analytics-tracking` (transversale)

**Rolul în reframe:** skills sunt **funcțiile reutilizabile** ale repo-ului. Apelezi `/paid-ads` în loc să rescrii hypothesis structure de fiecare dată. Un skill = encoded judgment + workflow → exact ce face Skill Era valoroasă.

### Stratul 3 — Marketing repo (DE CONSTRUIT pentru fiecare proiect)

Folder per proiect, structurat consistent:

```
projects/{name}/marketing/
├── README.md                    # vision, ICP, current sprint, north-star metric
├── campaigns/
│   ├── active/                 # currently running, branch-uite
│   ├── archived/               # killed sau finalizate, cu retro
│   └── _template.md            # frontmatter standard
├── funnels/
│   └── current.mermaid         # diagrama acquisition → activation → revenue → referral
├── assets/
│   ├── landing-pages/          # Next.js / static, in-repo
│   ├── emails/                 # MJML / React Email / markdown
│   ├── ad-copy/                # frontmatter cu variants A/B
│   └── content/                # blog drafts, threads, scripts
├── scripts/                    # scrapers, automation, pipelines
├── analytics/
│   ├── dashboard.py            # Streamlit single-file
│   └── events.md               # tracking plan ca contract
├── decisions/                  # ADR-style: "de ce am ales canal X"
└── retros/
    └── 2026-W17.md             # per săptămână, hypothesis × outcome × learning
```

**Convenții obligatorii:**
- Branch naming: `growth/<framework>/<feature>` (ex: `growth/seo/programmatic-clinics-page`)
- Fiecare ticket cere hypothesis statement (vezi [[hypothesis-driven-experimentation]])
- Fiecare merge la `main` produce o linie în `retros/`
- Decisions sunt append-only (ADR pattern)

### Stratul 4 — Distribution layer (de construit)

Reframe-ul închide loop-ul când **skill-urile devin canalul**. Adică:
- Publici skills pe GitHub / marketplace
- Alți developeri le invocă în Claude Code / agent stack
- Fiecare invocare = touchpoint de distribuție pentru Alteramens
- Wiki-ul Faber devine **content engine** vizibil prin skills

Acesta e [[distribution-over-product]] aplicat: nu construiești audiență din content, construiești audiență din **utilitate executabilă în workflow-ul agenților**.

## Mapping framework Alteramens → modul în repo

| Framework wiki | Sub-folder repo | Skills primare | Output măsurabil |
|---|---|---|---|
| [[strategy-foundations-framework-alteramens]] | `README.md` + `decisions/` | `/product-marketing-context` | ICP doc + positioning vs alternatives |
| [[paid-acquisition-framework-alteramens]] | `campaigns/paid/` | `/paid-ads`, `/ad-creative`, `/ab-test-setup` | CPA, ROAS pe canal |
| [[seo-framework-alteramens]] | `assets/content/` + `scripts/seo/` | `/seo-audit`, `/programmatic-seo`, `/schema-markup`, `/ai-seo` | Organic traffic, indexed pages, citations |
| [[content-copy-framework-alteramens]] | `assets/content/` + `assets/emails/` | `/copywriting`, `/content-strategy`, `/social-content`, `/email-sequence` | Engagement rate, share rate |
| [[cro-framework-alteramens]] | `assets/landing-pages/` | `/page-cro`, `/form-cro`, `/signup-flow-cro` | Conversion rate per page |
| [[lifecycle-retention-framework-alteramens]] | `assets/emails/lifecycle/` | `/churn-prevention`, `/onboarding-cro`, `/paywall-upgrade-cro` | Activation rate, MRR retention |
| [[sales-revenue-ops-framework-alteramens]] | `scripts/revops/` + `analytics/` | `/revops`, `/sales-enablement`, `/competitor-alternatives` | Pipeline, LTV:CAC |
| [[orb-channel-framework]] | `decisions/channel-mix.md` | `/launch-strategy`, `/community-marketing`, `/referral-program` | % owned vs rented vs borrowed traffic |

**Insight cheie:** mapping-ul e exhaustiv. Cele 8 framework-uri ale Alteramens **deja sunt** structura unui marketing repo bine arhitecturat — doar că sunt scrise ca disciplines, nu ca foldere. Reframe-ul le materializează.

## Ritualul săptămânal (operating cadence)

| Zi | Activitate | Durata | Output |
|---|---|---|---|
| **Luni** | Growth sprint planning | 60min | 3 tickets în `campaigns/active/` cu hypothesis statements |
| **Mar–Joi** | Build (alături de dev) | ad-hoc | Branch-uri merged, assets shipped |
| **Vineri** | Retro + dashboard review | 45min | `retros/YYYY-Wnn.md` + decisions update |

**Cele 3 tickets/săptămână:**
- 1 din top-of-funnel (paid sau SEO sau content)
- 1 din mid-funnel (CRO sau lifecycle)
- 1 din bottom-of-funnel sau distribution moat (sales, revops, sau skill exportat)

Asta forțează **balanță** și împiedică obsesia pe un singur layer (anti-pattern comun la solo founders).

## Cum AI-augmentation amplifică fiecare layer

Pentru Narcis specific, multiplier-ul e disproportionate:

| Layer | Without AI | With Claude Code |
|---|---|---|
| Knowledge | Re-citești framework-urile | Apelezi `/faber-query` și primești sinteză |
| Skills | Implementezi from scratch | Skill-uri scrise o dată, invocate de N ori |
| Repo | Polish manual pe asset-uri | Generezi 5 variants ad copy într-un prompt |
| Distribution | Public PRs sporadic | Skills publicate sistematic + changelog automat |

Combo: 30 min/zi în growth repo cu Claude = output echivalent cu un growth team de 3-5 oameni operat manual.

## Mantra unificată

Reframe-ul produce un litmus test pentru orice activitate de marketing din Alteramens:

> **"Dacă nu se întâmplă în repo, nu se întâmplă."**

Variantă lungă (din sursa originală): *"If it doesn't have a repo, a dashboard, and an experiment loop, it's not marketing — it's wishful thinking."*

Test rapid pre-acțiune:
- E într-un branch `growth/...`?
- Are un hypothesis statement în ticket?
- Va produce o linie în retros săptămânal?

3 da → ship. Lipsește unul → reformulează sau drop.

## Conexiunea cu obiectivul 1K MRR

Reframe-ul e **load-bearing** pentru target-ul 1K MRR pentru că:

1. **Compoundează atomic** — fiecare commit în growth repo e un asset permanent vs efemer (post mort în 24h)
2. **Reduce friction-ul de inițiere** — "deschide editor" e o acțiune zilnică deja; "fă marketing" e amorf
3. **Forțează măsurarea** — dashboard-ul e în repo, nu în head, nu în Notion ad-hoc
4. **Generează skills exportabile** — fiecare câștig devine skill pentru alți developeri = distribuție organică
5. **Aliniază cu Skill Era** — proiectele Alteramens devin **referințe vii** pentru cum se face dev-native marketing → atrage exact audiența care va plăti

## Acțiuni concrete (next 14 zile)

1. **Pick proiectul-pilot** — probabil [[projects/altera-os|Altera OS]] sau primul subproiect cu MRR target. Selecție based pe care e cel mai aproape de revenue.
2. **Bootstrap repo** — `mkdir projects/{name}/marketing` cu structura propusă mai sus, README din `strategy-foundations-framework-alteramens`
3. **Primul sprint** — 3 tickets, fiecare apelând un skill diferit. Documentează experiența.
4. **Update wiki** — promote conceptul [[marketing-as-coding]] de la `seed` la `developing` cu evidența din pilot
5. **Iterează ritualul** — după 4 sprint-uri, decide dacă cadence-ul săptămânal e sustenabil cu programul 08:00-15:00 + side time

## Risc-uri și mitigation

| Risc | Mitigation |
|---|---|
| Repo devine dump folder fără discipline | Forțează hypothesis statement în ticket template; refuză merges fără retro link |
| Polish-ul pe campaign code înlocuiește ship-ul | Cap săptămânal: max 3 tickets, restul în backlog. Friday e ship deadline. |
| Dashboard ignored în favorul "intuiției" | `analytics/dashboard.py` deschis înainte de planning; Friday review obligatoriu |
| Skills exportate fără utilitate reală pentru alți dev | Validează utility înainte de publish (vezi `/free-tool-strategy` scorecard ≥25) |
| 8 framework-uri × 3 tickets/săptămână = burnout | Nu e obligatoriu să atingi toate săptămânal. Rotație lunară cu focus pe 2-3 layers/lună |

## Limitări ale sintezei

- **Nu e încă validat empiric** — sinteza e proposal, nu post-mortem. Valoarea apare după 4-8 săptămâni de operating real.
- **Asume continuitate Faber wiki** — dacă wiki-ul stagnează, knowledge layer-ul slăbește; reframe-ul depinde de faptul că wiki-ul rămâne maintained
- **Asume fluență AI** — pentru un dev fără Claude Code/skills, multiplier-ul scade dramatic; reframe-ul rămâne valid dar return-on-time scade
- **Nu rezolvă "ce să vinzi"** — reframe-ul accelerează *cum* vinzi; *ce* vinzi vine din [[validate-before-build]] + customer discovery

## Referințe

Surse:
- [[marketing-as-coding-reframe]] — articolul-trigger
- [[sales-revenue-ops-skills-suite]] — pattern-ul "skills ca încarnare a framework-urilor"
- [[severino-claude-sales-system]] — case study de dev-native sales execution cu Claude
- [[ai-marketing-distribution]] — strategii de distribuție compatibile cu skill-uri exportate

Concepte umbrella:
- [[marketing-as-coding]] — reframe-ul în sine
- [[skill-era]] — de ce skills sunt unitatea distribuției
- [[compounding-games]] — de ce repo-ul ca asset compound bate posts efemere
- [[encoded-judgment]] — de ce skills sunt mai valoroase ca "scripts" — au judgment

Frameworks operaționalizate:
- Toate cele 8 `*-framework-alteramens` mapate în secțiunea de mapping
