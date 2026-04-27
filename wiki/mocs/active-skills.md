---
title: "Active Skills — Map of Content"
type: moc
category: map-of-content
topic: active-skills
sources: []
entities: [alteramens]
concepts: [skill-era, encoded-judgment, thin-harness-fat-skills, atoms-molecules-compounds, skill-graphs, brain-ram-leverage, executable-wiki, knowledge-first-development]
syntheses: [marketing-skills-catalog, faber-as-skill-graph, content-copy-framework-alteramens, cro-framework-alteramens, seo-framework-alteramens, lifecycle-retention-framework-alteramens, paid-acquisition-framework-alteramens, sales-revenue-ops-framework-alteramens, strategy-foundations-framework-alteramens]
related: [skill-engineering, skill-era, encoded-judgment, thin-harness-fat-skills, atoms-molecules-compounds, skill-graphs, brain-ram-leverage, faber-as-skill-graph, marketing-skills-catalog, executable-wiki]
maturity: developing
confidence: high
created: 2026-04-27
updated: 2026-04-27
alignment:
  - pillar: skill-era-craftsmanship
    relation: reinforces
    source_event: "2026-04-27 build | MOC active-skills"
  - pillar: ai-agents-for-solo-builders
    relation: reinforces
    source_event: "2026-04-27 build | MOC active-skills"
---

# Active Skills — Map of Content

Bridge MOC între `.claude/skills/*/SKILL.md` și wiki Faber. **Fiecare skill instalat în atelier are aici un loc semantic** — un rând care îl descrie + linkuri spre concept(e) sau synthesis(e) din wiki care încodează judgment-ul aplicat de skill. Răspunde direct la Open Question #1 din [[skill-engineering]] MOC: *"merită un MOC care unește graph-ul skills cu graph-ul Faber?"* — da, ăsta e.

**De ce contează:** Până acum, cele două graph-uri (skills în `.claude/`, concepts/syntheses în `wiki/`) trăiau separat. Un agent care intra în repo vedea fie unul, fie altul. MOC-ul ăsta e *single point of orientation*: pornești de aici, alegi clusterul, vezi atât skill-ul executabil cât și conceptul wiki care îi explică *de ce funcționează*.

> **Convenție:** Skills se invocă prin `/<nume>` în Claude Code. Source-of-truth e `.claude/skills/{name}/SKILL.md`. Acest MOC e indexul semantic, nu copia conținutului — vezi [[marketing-skills-catalog#Relationship to wiki philosophy|principiul "source of truth lives in the canonical place"]].

## Cum se citește

- **Caut un skill** — scanează clusterele, fiecare are tabel cu `skill | level | trigger | concept(e) wiki înrudite`.
- **Caut "ce încodează skill-ul X"** — caută rândul lui și urmează wikilink-urile spre concepts/syntheses.
- **Plănuiesc un proiect** — citește mai întâi conceptele înrudite, apoi invocă skill-ul (judgment-ul wiki înarmează skill-ul cu context).
- **Auditez `.claude/skills/`** — folosește `composition_level` din coloana `level` ca lentilă [[atoms-molecules-compounds]]; vezi [[skillify]] pentru disciplina de verification.

## Statistică rapidă

- **Total skills:** 54 (`.claude/skills/`)
- **Atoms:** 4 — `faber-brief`, `faber-status`, `faber-sync`, plus skills fără frontmatter de level (`knowledge-capture`, `session-sync` — flag pentru update)
- **Molecules:** 50 (majoritatea)
- **Compounds:** 0 (vezi [[faber-as-skill-graph#Open questions|open question]] despre primul compound)

---

## Cluster A — Faber: knowledge-base operations

Skill-urile care construiesc, întrețin și interoghează wiki-ul Faber. Operationalizează patternul [[executable-wiki]] și disciplina [[knowledge-first-development]] — cunoaștere productizată ca infrastructură agentică.

**Concept-rădăcină:** [[executable-wiki]] · [[skill-graphs]] · [[capture-at-source]]
**Synthesis activă:** [[faber-as-skill-graph]] (lens atoms/molecules/compounds aplicat la `.claude/skills/faber-*`) · [[faber-sqlite-index]]

| Skill | Level | Trigger | Concept(e) wiki |
|---|---|---|---|
| **`faber-brief`** | atom | "brief me", "what's been happening", `/faber-brief` — wake-up briefing dintr-un singur SQL pass peste `faber.db` | [[capture-at-source]], [[longitudinal-user-model]] |
| **`faber-status`** | atom | "wiki status", "faber dashboard" — page counts, recent activity, top entities, integrity | [[faber-sqlite-index]] |
| **`faber-sync`** | atom | "sync faber", "rebuild faber db" — drop+recreate `faber.db` din `.md` files (idempotent) | [[faber-sqlite-index]], [[emergent-schema]] |
| **`faber-ingest`** | molecule | "ingest", "add to wiki" — guided processing al unei surse (sources/entities/concepts cu confirmare) | [[capture-at-source]], [[encoded-judgment]] |
| **`faber-seed`** | molecule | "seed the wiki", "bootstrap faber" — autonomous seeding din vault | [[capture-at-source]], [[knowledge-first-development]] |
| **`faber-query`** | molecule | "ask faber", "what does faber know" — search + synthesize cu citații; opțional file ca synthesis | [[skill-graphs]], [[executable-wiki]] |
| **`faber-link`** | molecule | "link this to the wiki", "cross-reference cu faber" — cross-link vault doc ↔ wiki bidirectional | [[skill-graphs]] |
| **`faber-lint`** | molecule | "check wiki health" — contradictions, orphans, stale, phantoms, thin pages, log integrity | [[skill-graphs]] (auditul topologiei) |
| **`faber-slides`** | molecule | "make slides for this" — deck HTML autonom din wiki page / vault doc / output `/faber-query` | [[searchable-vs-shareable]] |
| **`faber-meet`** | molecule | "self review", "meet lunar" — revizia lunară pillars/stances/commitments cu snapshot | [[work-as-play]], [[productize-yourself]] |
| **`faber-mirror`** | molecule | "weekly mirror", "confruntă-mă" — confrontational reflection peste log-ul ultimelor 7 zile | [[accountability]], [[deliver-dont-promise]] |

> Notă: `faber-meet` și `faber-mirror` sunt skill-uri *self-curatorial* — citesc din și scriu în `wiki/self/` și `wiki/syntheses/mirror-*.md`. Sunt parte din Faber operations dar adresează *agentul uman* (Narcis), nu wiki-ul ca atare.

---

## Cluster B — Semnal: distribuție pe X

Skill-urile pillar-aware pentru distribuția zilnică pe X (Twitter), preserving the [[voice-preservation|voice]] și [[content-pillars|content pillars]].

**Concept-rădăcină:** [[content-pillars]] · [[voice-preservation]] · [[building-in-public]] · [[x-content-pillars]]
**Synthesis activă:** [[personal-brand-strategy]]

| Skill | Level | Trigger | Concept(e) wiki |
|---|---|---|---|
| **`semnal-draft`** | molecule | "draft post din seed X", "fă 3 variante" — seed → 3 publish-ready X variants (plain/spicy/reflective) | [[voice-preservation]], [[content-pillars]], [[x-content-pillars]] |
| **`semnal-reply`** | molecule | "reply la postul ăsta" — 3 value-add reply variants (add-context / gentle-contrarian / question-unlock) | [[value-before-ask]], [[peer-voice-outreach]], [[building-in-public]] |

> *Sweet-spot radar:* familia Semnal e un schelet pentru combaterea slăbiciunii declarate "amână postarea" ([[narcis-trajectory-2026]]). Vezi `wiki/self/narcis-pillars.md` pentru mizele.

---

## Cluster C — Cross-medium content output

Skill-uri care iau material existent (idee / wiki page / draft) și-l transformă în multiple formate publishable.

**Concept-rădăcină:** [[searchable-vs-shareable]] · [[extractable-content]] · [[content-pillars]]
**Synthesis activă:** [[content-copy-framework-alteramens]]

| Skill | Level | Trigger | Concept(e) wiki |
|---|---|---|---|
| **`to-content`** | molecule | "write content about X", "scrie conținut despre" — topic → 5 piese (YouTube/LinkedIn/Substack/X/blog), pre-grounded prin `/faber-query` | [[extractable-content]], [[searchable-vs-shareable]], [[content-pillars]] |
| **`frontend-slides`** | molecule | "build a presentation", "convert PPT to web" — HTML deck zero-deps, viewport-fit, annotation layer mandatory | [[searchable-vs-shareable]] |

> Distincție: `frontend-slides` = generic deck-builder (orice topic, orice sursă). `faber-slides` = wiki-aware (deck din wiki page / vault doc, autonomous styling).

---

## Cluster D — Agent meta & self-curation

Skills care întrețin agentul însuși (Claude working model) și mențin coerența între sesiuni.

**Concept-rădăcină:** [[productize-yourself]] · [[work-as-play]] · [[accountability]] · [[calibration-over-content]]

| Skill | Level | Trigger | Concept(e) wiki |
|---|---|---|---|
| **`agent-reflect`** | molecule | "agent reflect", "reflectează", "update agent/claude" — review log evidence → propose edits to `agent/claude.md` | [[calibration-over-content]], [[seven-critics-loop]] |

> Familie cu doar un membru deocamdată. Candidați viitori: skill care detectează *dark skills* (vezi [[skillify]] §"silent rot"), skill care propune promotion concept→mature pe baza inbound wikilinks.

---

## Cluster E — Knowledge & session capture (legacy / pre-Faber)

Skill-uri create înainte de pattern-ul Faber. Funcționale dar parțial înlocuite de `/faber-ingest` și `/faber-link`. Lipsă `composition_level` în frontmatter — flag pentru audit.

**Concept-rădăcină:** [[capture-at-source]]

| Skill | Level | Trigger | Concept(e) wiki |
|---|---|---|---|
| **`knowledge-capture`** | *(missing)* | proactive — propune salvare în `docs/` când întâlnește info reutilizabilă | [[capture-at-source]] |
| **`session-sync`** | *(missing)* | "salvează sesiunea", "închide bucla" — captură decizii + learnings în vault la final de sesiune | [[capture-at-source]] |

> **Open question (audit):** Ar trebui acoperite de `/faber-ingest` (pentru material substanțial) și `/agent-reflect` (pentru meta-învățare). Decision pending: deprecate, fold-in, sau păstrează ca atoms separați? Vezi [[skillify]] §"check-resolvable + DRY".

---

## Cluster F — Tooling (operational helpers)

Skill-uri care manipulează sisteme externe (email client, etc.). Nu încodează judgment — sunt thin wrappers peste CLI-uri externe.

| Skill | Level | Trigger | Concept(e) wiki |
|---|---|---|---|
| **`email`** | molecule | "check email", "triage inbox", `/email` — manage Gmail via Himalaya CLI | *— operational, no encoded judgment yet* |

> Filtrul "where is the judgment?" ([[encoded-judgment]]) le marchează ca **API-shaped**, nu skill-shaped. Candidat pentru promovare la skill cu judgment când se adaugă patterns de triage / response (ex: "reply ca Narcis" = voice-aware reply skill).

---

## Marketing skills (35) — vezi catalogul existent

Restul de **35 de skills** sunt marketing și sunt deja indexate într-o synthesis dedicată cu cluster-taxonomy + invocation patterns + relații cu framework-urile aplicate.

**👉 Citește:** [[marketing-skills-catalog]]

Catalogul acoperă 8 clustere (CRO, SEO, Content, Paid, Lifecycle, Strategy, Distribution, Sales/RevOps), cu deep-ingest complete pentru 4 dintre ele (CRO, SEO, Lifecycle, Sales/RevOps). Fiecare cluster trimite mai departe la framework-ul Alteramens corespunzător:

- **CRO** → [[cro-framework-alteramens]] · concepte: [[value-before-ask]], [[friction-cost]], [[progressive-commitment]], [[aha-moment]], [[escape-hatch-principle]], [[context-aware-interrupt]]
- **SEO** → [[seo-framework-alteramens]] · concepte: [[extractable-content]], [[third-party-signal]], [[machine-readable-structure]], [[hub-and-spoke-architecture]], [[agent-readable-web]], [[answer-engine-optimization]], [[programmatic-seo]]
- **Content & Copy** → [[content-copy-framework-alteramens]]
- **Paid Acquisition** → [[paid-acquisition-framework-alteramens]] · concepte: [[paid-acquisition-economics]], [[hypothesis-driven-experimentation]], [[ice-prioritization]], [[performance-data-loop]]
- **Lifecycle & Retention** → [[lifecycle-retention-framework-alteramens]] · concepte: [[dynamic-save-offer]], [[voluntary-vs-involuntary-churn]], [[dunning-stack]], [[churn-health-score]], [[referral-loop]], [[peer-voice-outreach]]
- **Strategy & Foundations** → [[strategy-foundations-framework-alteramens]] · concepte: [[product-marketing-context]], [[jobs-to-be-done]], [[orb-channel-framework]], [[phased-launch]], [[value-based-pricing]], [[good-better-best-pricing]]
- **Distribution Channels** → (no dedicated framework — skills: `social-content`, `community-marketing`)
- **Sales & RevOps** → [[sales-revenue-ops-framework-alteramens]] · concepte: [[speed-to-lead]], [[lead-lifecycle-funnel]], [[fit-plus-engagement-scoring]], [[engineering-as-marketing]], [[honest-competitive-positioning]], [[tracking-plan-as-contract]], [[revenue-attribution-loop]]

> **Lista nominală** a celor 35 marketing skills (pentru completitudine, fără re-detaliere): `ab-test-setup`, `ad-creative`, `ai-seo`, `analytics-tracking`, `churn-prevention`, `cold-email`, `community-marketing`, `competitor-alternatives`, `content-strategy`, `copy-editing`, `copywriting`, `customer-research`, `email-sequence`, `form-cro`, `free-tool-strategy`, `launch-strategy`, `lead-magnets`, `marketing-ideas`, `marketing-psychology`, `onboarding-cro`, `page-cro`, `paid-ads`, `paywall-upgrade-cro`, `popup-cro`, `pricing-strategy`, `product-marketing-context`, `programmatic-seo`, `referral-program`, `revops`, `sales-enablement`, `schema-markup`, `seo-audit`, `signup-flow-cro`, `site-architecture`, `social-content`. Pentru detalii (trigger + when-to-invoke), [[marketing-skills-catalog|deschide catalogul]].

---

## Relația MOC ↔ Catalog ↔ Framework-uri

Trei niveluri, trei roluri distincte:

```
[active-skills MOC]   — nivel 1: index unificat, cluster taxonomy, "unde e judgment-ul?"
        │
        ├──> [marketing-skills-catalog] (synthesis) — nivel 2: marketing-specific clustering + invocation patterns
        │           │
        │           └──> [{cluster}-framework-alteramens] (synthesis) — nivel 3: framework aplicat la Alteramens
        │
        ├──> [faber-as-skill-graph] (synthesis) — nivel 2: lens compoziție pentru Faber-family
        │
        └──> [skill-engineering] (MOC) — nivel 0: meta-MOC despre cum se proiectează skills în general
```

Ierarhia răspunde la întrebarea: *"de ce două graph-uri în loc de unul singur?"* — pentru că skill-urile sunt **executabile**, conceptele sunt **explicabile**. MOC-ul le unește fără să le contopească.

---

## Open questions

Continuă din [[skill-engineering#Open questions|skill-engineering MOC]]:

1. **Composition-level audit pe `knowledge-capture` și `session-sync`** — adaugă frontmatter sau deprecate? Decision: după `/faber-lint` audit pe `.claude/skills/` (pending).
2. **Primul compound** — un orkestrator care înlănțuie skills (ex: `/launch-pack` = `product-marketing-context` → `site-architecture` → `copywriting` × pages → `seo-audit` → `analytics-tracking` → `launch-strategy`). Plătește ceiling-ul 8-10 din [[atoms-molecules-compounds]]?
3. **Deep-ingest pentru cluster Faber** — ca la marketing, fiecare skill Faber → concept dacă produce learnings non-obvious pe proiecte reale. Trigger: `/faber-link` aplicat dezvăluie inbound traffic?
4. **`email` și `frontend-slides` ca tooling vs skill** — au judgment minim. Filtrul [[encoded-judgment]] le promovează doar dacă acumulează patterns reutilizabile (voice, design system). Open.
5. **MOC-ul ăsta vs `wiki/index.md`** — index.md e auto-generated. MOC-ul e curat manual. Coexistă fără overlap — index.md inventoriază, MOC-ul orientează.

## Update triggers

Re-vizitează MOC-ul ăsta când:
- Se adaugă/scoate un skill în `.claude/skills/`
- Un skill primește `composition_level` schimbat
- Un skill marketing primește deep-ingest (mută din "în catalog" în deep-ingested-cluster)
- Apare primul **compound** (creează cluster nou)
- `marketing-skills-catalog` se reorganizează (sincronizează cluster names)

## Pillars activi pe care MOC-ul îi întărește

- `skill-era-craftsmanship` — întreg `.claude/skills/` e operaționalizarea pillar-ului; MOC-ul îl face navigabil
- `ai-agents-for-solo-builders` — graf de skills compus + brain-RAM-conscious clustering = scheletul pillar-ului

---

*Pentru `/faber-query` despre "ce skills există" / "ce skill să folosesc": pornește de aici. Pentru "cum se proiectează un skill": [[skill-engineering]]. Pentru "ce-am acumulat ca knowledge": [[wiki/index|index.md]].*
