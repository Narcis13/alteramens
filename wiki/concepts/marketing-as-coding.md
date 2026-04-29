---
title: "Marketing as Coding — Reframe-ul Dev-Native pentru Growth"
type: concept
category: mental-model
sources: [marketing-as-coding-reframe]
entities: []
related: [engineering-as-marketing, hypothesis-driven-experimentation, compounding-games, encoded-judgment, viral-artifacts, validate-before-build, kill-fast, distribution-over-product, skill-era]
maturity: seed
confidence: high
contradictions: []
applications: []
---

# Marketing as Coding

**Reframe-ul:** marketing-ul nu e o disciplină separată de engineering — e **același sistem** (ipoteză → build → measure → iterate → compound) pe **alt runtime**: atenția și comportamentul uman, în loc de silicon și electroni.

Concept-ul ăsta e *umbrella* pentru un set de patterns deja existente în wiki ([[engineering-as-marketing]], [[hypothesis-driven-experimentation]], [[compounding-games]], [[viral-artifacts]]). Diferența e că **operează pe layer-ul de identitate developer**: schimbă vocabularul cu care un developer abordează marketing-ul, nu tactica în sine.

## De ce contează (problema reală)

Developer-ii *pot* face marketing — au gândire sistemică, comfort cu metrics, abilitate de build. Dar **procrastinează**. Cauza nu e lene; e **mismatch de framework**:

| Marketing tradițional oferă | Coding oferă | Gap |
|---|---|---|
| "Talk to people" | Visible progress (commits, diff-uri) | Lipsa de tangibilitate |
| Algoritmi opaci care decid alcanze | Control determinist | Lipsa de control |
| Posts care mor în 24h | Repos care cresc | Lipsa de compounding |

Reframe-ul rezolvă mismatch-ul **fără a schimba activitatea de bază** — doar reformulează input-ul ca pe ceva pe care developer-ul deja **vrea** să-l facă.

## Mapping-ul 1:1

Conținutul concret al reframe-ului e un tabel de echivalențe care transformă fiecare practică de marketing într-o practică de engineering deja familiară:

| Coding Concept | Marketing Equivalent |
|---|---|
| User Stories / Requirements | Customer Discovery & Jobs-to-be-Done — pain points = bugs |
| System Architecture | Funnel architecture — acquisition → activation → revenue → referral |
| Modular code | Assets în Git — emails ca React components, landing pages ca Next.js, threads ca markdown + YAML pentru variants |
| Unit tests | Offer/content validation — Twitter thread v0.1 → measure replies în 24h |
| CI/CD | Campaign launch — deploy via GitHub Actions + Zapier/Make |
| Logging & monitoring | Analytics & attribution — LTV/CAC/payback ca latency/error rate/throughput |
| Refactoring | Funnel optimization — kill 80% din canalele care return <5% |
| Open-source community | Audience building — GitHub stars = engaged followers, PRs = guest posts |
| Technical debt | Brand debt / inconsistent messaging |

Tabelul nu e exhaustiv; e *generativ* — extinzi mapping-ul pentru orice tactică nouă (ex: "feature flag rollout ↔ gradual audience expansion").

## Cele 3 dev-native primitives

Reframe-ul devine operațional prin trei practici concrete:

### 1. Marketing repo

Folder `/marketing` versionat alături de `/src`:

```
/marketing
├── campaigns/          # markdown + YAML frontmatter pentru A/B variants
├── funnels/            # diagrame ca cod (Mermaid, Figma exports)
├── scripts/            # automation, scrapers, data pipelines
├── analytics/          # dashboards (Streamlit/Retool) ca cod
└── decisions/          # ADR-style: "de ce am ales canal X peste Y"
```

Reguli:
- Fiecare campanie trăiește într-o **branch** (ex: `growth/feature/lead-magnet-v2`)
- Variante A/B = frontmatter pe același fișier, nu fișiere duplicate
- PR-uri pentru "ship" — code review-ul devine **growth review**

### 2. Growth sprints (cycle săptămânal)

| Zi | Activitate | Output |
|---|---|---|
| Luni (2h) | Growth sprint planning — pick 3 tickets cu acceptance criteria măsurabile | 3 issues în repo cu hypothesis statement |
| Mar-Joi | Build — implementezi tickets, ship cât poți | Branch-uri merged în `main` |
| Vineri (1h) | Retro + metrics review | Update `decisions/` + `analytics/` cu learnings |

Ticket format minimal:
```
Title: Cold DM sequence v0.1
Hypothesis: Because [observation], we believe [change] will cause [outcome] for [audience]. Measure via [metric].
Acceptance: 80% open rate, 15% reply rate
Branch: growth/feature/cold-dm-v0
```

### 3. PLG ca marketing prin produs

În loc să separi "marketing" de "product", **muți marketing-ul în produs**:
- Viral invite system → cod, nu campanie
- Onboarding 3× mai bun → conversie fără ad spend
- Public roadmap + changelog → content recurrent automat
- Empty states care vând upgrade → in-app marketing

Asta canalizează tendința developer-ilor să polish-eze produsul **în direcția care generează revenue**.

## Mantra (litmus test)

> *"If it doesn't have a repo, a dashboard, and an experiment loop, it's not marketing — it's wishful thinking."*

Înainte de orice activitate prezentată ca "marketing":
- [ ] **Repo:** există asset-uri versionate?
- [ ] **Dashboard:** există metrici tracked?
- [ ] **Experiment loop:** există ipoteză + criteriu de succes + plan de iterare?

3 da → marketing real. Lipsește unul → wishful thinking.

## Conexiuni cu wiki

### Caz particular din care a evoluat
- **[[engineering-as-marketing]]** — *building free tools as distribution* e o instanță. Marketing-as-coding generalizează la *toate* activitățile de marketing.

### Mecanisme operaționale
- **[[hypothesis-driven-experimentation]]** — ipoteza falsifiabilă e exact "test description" pentru un unit test pe runtime-ul atenției
- **[[validate-before-build]]** — discovery înainte de campanie = aceeași disciplină ca discovery înainte de feature
- **[[kill-fast]]** — Friday retro = sprint review în care variantele losing sunt archived fără atașament

### Compounding & moat
- **[[compounding-games]]** — repo + dashboard + experiment loop pe atenție = exact joc compound, doar runtime-ul diferă
- **[[viral-artifacts]]** — output-urile care se share-uiesc singure = features pe care le construiești în PLG sub-repo
- **[[distribution-over-product]]** — repo-ul de marketing **e** distribuția; n-o externalizezi la algoritmi

### Skill Era fit
- **[[encoded-judgment]]** — fiecare experiment câștigător devine pattern reutilizabil în `decisions/`. Repo-ul **devine un skill** pe care îl invoci pentru proiecte viitoare.
- **[[skill-era]]** — marketing-as-coding face naturală exportarea de skills către agenți (`/launch-campaign`, `/run-cold-dm-sequence`)

## Aplicare la Alteramens

Pentru Narcis (developer + AI-augmented + 1K MRR target + timp limitat) reframe-ul ăsta e **disproportionately valuable** pentru că:

### 1. Stack-ul deja există în potențial
- `wiki/` Faber e deja un repo versionat cu knowledge structurată
- `.claude/skills/` deja conține workflows reutilizabili
- Lipsește doar `/marketing` ca folder fizic și ritualul săptămânal

### 2. Constraint-ul de timp e rezolvat de framework
- 30 min/zi în growth repo > 2h/săptămână de "marketing" abstract
- Sprint cycle săptămânal compatibil cu program 08:00-15:00 + side time

### 3. AI-augmented amplifică fiecare layer
- Claude scrie copy variants (3-5 într-un prompt)
- Claude analizează metrics săptămânal (`/analyze-growth-week`)
- Claude generează hypothesis statements pornind de la observation
- Marketing repo + AI = un growth team de 5 oameni operat de unul

### 4. Filtru de evaluare pentru proiecte
Înainte de orice idee nouă: "are deja un marketing repo planuit, sau e wishful thinking?"

## Anti-patterns

1. **Repo de marketing ca dump folder** — fără hypothesis statements și decisions ADR-style, repo-ul devine doar un folder. Codul fără teste e debt; campania fără hypothesis e zgomot.
2. **Toate experimentele ca "let's see what happens"** — vezi [[hypothesis-driven-experimentation]]; reframe-ul cere falsificabilitate, nu doar tracking.
3. **Polish infinit pe campaign code fără ship** — "perfect campaign code" e bikeshedding. Ship la 80%, măsoară, iterează.
4. **PLG ca scuză să nu faci customer development** — produsul nu vinde dacă nu rezolvă problema. Reframe-ul nu înlocuiește discovery, doar îl mută în repo.
5. **Branch namespace fără branch discipline** — `growth/feature/X` fără PR-uri, review, sau merge ritual = doar prefix decorative.

## Ce articolul nu spune (gap-uri pe care le acoperim aici)

- **Cum prioritizezi cele 3 tickets** → folosește ICE/RICE peste hypothesis statements
- **Cum măsori "brand debt"** → audit anual de positioning vs current messaging across asset-uri
- **Cum integrezi cu un cofondat / colaborator non-developer** → expune un read-only dashboard + comments în PR-uri (nu îi forța pe ei în Git)
- **Threshold-ul de "wishful thinking"** → propunere: 2 săptămâni cu 0 commits în `/marketing` = signal pentru retro

## Maturity & next steps

- **Maturity: seed** — concept proaspăt, sursă unică, neaplicat încă în vault
- **Promote la `developing`** când: există un `/marketing` folder real într-un proiect Alteramens (probabil [[projects/altera-os|Altera OS]] sau viitorul subproiect cu MRR target)
- **Promote la `mature`** când: 3+ campanii shipped din repo cu hypothesis + retro documentate + revenue impact măsurat

## Sinteze derivate

- [[dev-native-marketing-stack-alteramens]] — operationalizează reframe-ul peste cele 8 framework-uri marketing existente; arhitectură concretă (growth repo + 8 sub-foldere + ritual săptămânal) pentru solo dev cu 1K MRR target
