---
title: "SEO Skills Suite — Vizibilitate în Search Tradițional și AI"
type: source
format: code
origin: vault
source_ref: ".claude/skills/"
ingested: 2026-04-14
guided: false
entities: [alteramens]
concepts: [extractable-content, third-party-signal, machine-readable-structure, hub-and-spoke-architecture, agent-readable-web, answer-engine-optimization, programmatic-seo]
key_claims:
  - "AI Overviews apar în ~45% din search-urile Google și reduc click-urile către site-uri cu până la 58% (ai-seo)"
  - "Brand-urile sunt de 6.5x mai des citate prin surse third-party decât pe propriul domeniu — Wikipedia (7.8% din citările ChatGPT), Reddit (1.8%), G2, YouTube (ai-seo)"
  - "Princeton GEO research (KDD 2024): citarea surselor dă +40% vizibilitate, statistici +37%, citate expert +30%; keyword stuffing -10% (ai-seo)"
  - "web_fetch și curl NU pot detecta schema JSON-LD injectat prin JavaScript; folosește Rich Results Test sau Screaming Frog (seo-audit)"
  - "Programmatic SEO — ierarhia defensibilității datelor: proprietary > product-derived > user-generated > licensed > public (programmatic-seo)"
  - "Regula celor 3 click-uri: paginile importante la maxim 3 click-uri de homepage, altfel sunt îngropate (site-architecture)"
  - "Hub-and-spoke model: hub pages consolidate authority, spokes link înapoi la hub; max 4-7 items în header nav (site-architecture)"
  - "AI agents cumpără în numele utilizatorilor — adaugă /pricing.md și /llms.txt la site root pentru a fi parseable fără JavaScript (ai-seo)"
  - "Optimization is passage-first, not page-first — păstrează blocurile de răspuns la 40-60 cuvinte pentru extracția optimă (ai-seo)"
confidence: high
---

# SEO Skills Suite

5 skill-uri coordonate pentru vizibilitate în search — de la auditul tradițional, la optimizarea pentru AI, la scalarea programatică. Toate fac parte din același ecosistem și se cross-referențiază activ.

## Cele 5 skill-uri

| Skill | Path | Focus |
|---|---|---|
| **seo-audit** | `.claude/skills/seo-audit/SKILL.md` | Audit tehnic & on-page: crawlability, indexation, Core Web Vitals, title/meta/heading, conținut, E-E-A-T |
| **ai-seo** | `.claude/skills/ai-seo/SKILL.md` | Optimizare pentru AI Overviews, ChatGPT, Perplexity, Claude, Gemini, Copilot — citare, nu doar ranking |
| **schema-markup** | `.claude/skills/schema-markup/SKILL.md` | JSON-LD, schema.org — Organization, Article, Product, FAQ, HowTo, BreadcrumbList, etc. |
| **programmatic-seo** | `.claude/skills/programmatic-seo/SKILL.md` | Pagini la scală (1000+) folosind template-uri + date — 12 playbooks |
| **site-architecture** | `.claude/skills/site-architecture/SKILL.md` | Ierarhie pagini, URL structure, navigație, internal linking, hub-and-spoke |

## Principiile fundamentale pe care le împărtășesc

Aceste 5 skill-uri operează la layer-e diferite dar derivă din același set de principii. Extrase ca pagini de concepts:

- **[[extractable-content]]** — scrierea passage-first: fiecare bloc trebuie să funcționeze standalone
- **[[third-party-signal]]** — prezența în surse externe (Wikipedia, Reddit, G2) multiplică citarea AI mai mult decât propriul site
- **[[machine-readable-structure]]** — structura explicită (schema, heading, breadcrumbs, URLs) e primitiva SEO, nu decorul
- **[[hub-and-spoke-architecture]]** — modelul topical authority: hub-uri conectate cu spokes, traseu clar pentru user și crawler
- **[[agent-readable-web]]** — noul strat al webului: `/pricing.md`, `/llms.txt`, `/robots.txt` cu bots AI explicite

Concepte deja existente în wiki, acum îmbogățite:
- **[[answer-engine-optimization]]** — promovat de la seed la developing cu research Princeton GEO, trei piloni (Structure/Authority/Presence), platforme specifice
- **[[programmatic-seo]]** — promovat cu 12 playbooks, ierarhia defensibilității datelor, quality-over-quantity

## Afirmații-cheie per skill

### seo-audit
Audit-ul se face în ordinea priorității: (1) crawlability & indexation, (2) fundamente tehnice (speed, mobile, HTTPS), (3) on-page (title, meta, heading, content), (4) calitate conținut (E-E-A-T), (5) autoritate & link-uri. Core Web Vitals thresholds: LCP < 2.5s, INP < 200ms, CLS < 0.1. **Limitare critică**: `web_fetch` și `curl` nu pot detecta schema injectat prin JavaScript — folosește browser tool sau Rich Results Test.

### ai-seo
**Diferența cheie față de SEO tradițional**: SEO tradițional te ranchează; AI SEO te citează. Cei trei piloni: (1) **Structure** — face conținutul extractabil prin blocuri standalone, tabele de comparație, FAQ-uri de 40-60 cuvinte; (2) **Authority** — statistici cu surse, citate de experți, freshness signals; (3) **Presence** — Wikipedia, Reddit, G2, YouTube — deseori mai valoroase decât propriul site. Princeton GEO research (KDD 2024): "Cite sources" +40%, "Add statistics" +37%, "Add quotations" +30%, **"Keyword stuffing" -10%**. Pentru agenți AI cumpărători: adaugă `/pricing.md` și `/llms.txt`.

### schema-markup
JSON-LD e formatul recomandat de Google (față de microdata, RDFa). Schema-urile core: Organization, WebSite, Article/BlogPosting, Product, SoftwareApplication, FAQPage, HowTo, BreadcrumbList, LocalBusiness, Event. Poți combina cu `@graph`. Validează cu Rich Results Test înainte de deploy. **Content cu schema corect are 30-40% mai multă vizibilitate în AI answers**.

### programmatic-seo
Ierarhia defensibilității datelor: **proprietary > product-derived > user-generated > licensed > public**. 12 playbooks: Templates, Curation, Conversions, Comparisons, Examples, Locations, Personas, Integrations, Glossary, Translations, Directory, Profiles. Principii: unique value per page, subfolders (nu subdomains) pentru a consolida authority, quality > quantity ("100 great pages > 10K thin ones"). Penalizări Google: doorway pages, keyword stuffing, duplicate content.

### site-architecture
**Regula 3 click-uri**: orice pagină importantă la maxim 3 click-uri de homepage. Header nav: 4-7 items maxim, CTA rightmost, logo linkează homepage. URL design: readable, hyphens not underscores, lowercase, reflect hierarchy, no dates in blog URLs, no query parameters for content. **Hub-and-spoke**: hub pages linkează la spokes, spokes linkează back la hub. Breadcrumbs = internal linking gratuit + structură vizibilă pentru crawler.

## De ce am ingerat ca suite

Skill-urile se referă reciproc explicit (fiecare are secțiune "Related Skills" care le conectează). În practică, un proiect SEO real invocă mai multe: audit + site architecture + schema + programmatic + ai-seo. Tratarea ca suite permite:

1. Extragerea concepts-urilor cross-cutting fără duplicare
2. Un framework aplicat unic ([[seo-framework-alteramens]]) care orchestrează folosirea lor
3. Cross-references existente în wiki (AEO, programmatic-seo) sunt îmbogățite în loc să fie duplicate

## Cum se leagă de filosofia Alteramens

- **[[distribution-over-product]]**: SEO (traditional + AI) este **forma dominantă de distribuție permissionless** pentru un solo builder. Nu ai nevoie de permisiunea nimănui să publici o pagină.
- **[[skill-era]]**: AI SEO și agent-readable web sunt **consecințele** skill era pe partea de content. Web-ul se despică în layer uman și layer agentic; cele 5 skill-uri acoperă ambele layer-e.
- **[[encoded-judgment]]**: programmatic-seo scrie la scală doar dacă datele + judgment-ul în template sunt valoroase. Altfel e zgomot care penalizează.
- **[[data-compounding-moat]]**: datele proprietare care alimentează programmatic SEO SUNT moat-ul — și cresc cu utilizarea.

Vezi [[seo-framework-alteramens]] pentru framework-ul aplicat pe proiecte Alteramens.
