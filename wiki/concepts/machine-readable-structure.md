---
title: "Machine-Readable Structure — Structura ca Primitivă SEO"
type: concept
category: technical-playbook
sources: [seo-skills-suite]
entities: []
related: [extractable-content, agent-readable-web, answer-engine-optimization, hub-and-spoke-architecture, encoded-judgment]
maturity: developing
confidence: high
contradictions: []
applications: []
---

# Machine-Readable Structure

Pentru crawlers, AI systems și agenți, **structura explicită este primitivă, nu decorativă**. Schema markup, heading hierarchy, breadcrumbs, URL patterns, XML sitemaps, robots.txt, `llms.txt`, `pricing.md` — toate sunt manifestări ale aceluiași principiu: **dacă nu e structurat explicit, nu există pentru mașini**.

## Principiul

Un browser uman compensează pentru lipsa de structură (un titlu în `<div class="big">` arată ok). Un crawler/AI nu compensează — dacă nu e un `<h1>`, nu e titlu. Dacă schema lipsește, produsul n-are preț. Dacă robots.txt blochează, site-ul nu există pentru acel bot.

Implicație: **implementează structura explicit, validează, păstrează sincronizată cu content-ul vizibil**.

## Layer-ele de structură

### Layer 1 — HTML semantic
- **Un singur H1 per pagină** (penalty pentru multiple)
- **Hierarhia H1 → H2 → H3** (nu skip-uri)
- **Heading-urile descriu conținut**, nu stilizează
- `<article>`, `<section>`, `<nav>`, `<main>` — nu doar `<div>` peste tot

### Layer 2 — URL & internal linking
- **URLs readable**: `/features/analytics`, nu `/f/a123`
- **Hyphens, nu underscores**: `/blog/seo-guide`
- **Lowercase consistent**, redirect pentru uppercase
- **No query params pentru content**: `/blog/post-title`, nu `/blog?id=123`
- **Breadcrumbs pe toate paginile** (structură vizibilă + BreadcrumbList schema)
- **No orphan pages** (fiecare pagină are minim un inbound internal link)

### Layer 3 — Schema.org (JSON-LD)
Schema-urile core din [[seo-skills-suite|schema-markup]]:

| Tip | Scop |
|---|---|
| `Organization` | Homepage/about — name, url, logo, sameAs |
| `Article` / `BlogPosting` | Blog posts — headline, image, datePublished, author |
| `Product` / `SoftwareApplication` | Product pages — name, offers, aggregateRating |
| `FAQPage` | FAQ content — mainEntity cu Q&A pairs |
| `HowTo` | Tutorials — name, step |
| `BreadcrumbList` | Navigation context |
| `LocalBusiness` | Local presence — address, openingHours |

**Regula**: doar marchezi content care EXISTĂ vizibil. Schema pentru content lipsă = penalty.

**Format**: JSON-LD (recomandat de Google), nu microdata/RDFa. Plasare: `<head>` sau end of `<body>`. Multiple schema-uri într-o pagină: folosește `@graph`.

### Layer 4 — XML sitemap & robots.txt
- **XML sitemap** cu toate URL-urile canonice indexable
- **Submitted la Search Console**
- **Separate sitemaps** pentru page types la scale (programmatic SEO)
- **robots.txt** cu rules explicite: Allow/Disallow pentru bots (inclusiv AI bots — vezi [[agent-readable-web]])

### Layer 5 — Meta & Open Graph
- **Title tag** unique, 50-60 caractere, primary keyword la început
- **Meta description** unique, 150-160 caractere
- **Open Graph tags** pentru social sharing (og:title, og:description, og:image)
- **Canonical tag** self-referencing pe pagini unice, pointing to canonical pentru duplicate

## Limitări practice (important!)

Din [[seo-skills-suite|seo-audit]]:

**`web_fetch` și `curl` NU pot detecta schema JSON-LD injectat prin JavaScript.**

Multe CMS plugins (AIOSEO, Yoast, RankMath) injectează schema client-side. `curl` vede HTML-ul static, care nu include `<script>` generate de JS. Raportarea "no schema found" pe baza `web_fetch` = **audit finding fals**.

**Metode corecte de validare**:
1. Browser tool cu JS rendered: `document.querySelectorAll('script[type="application/ld+json"]')`
2. Google Rich Results Test (https://search.google.com/test/rich-results)
3. Screaming Frog (renders JS)

**Regula operațională**: înainte de a raporta o problemă de schema/structure, verifică cu tool care rulează JavaScript.

## Impact măsurabil

- Content cu schema corect: **+30-40% vizibilitate AI** (ai-seo research)
- Rich snippets: CTR +10-30% pe SERP (Google research)
- Passage indexing: doar pentru content structurat clar (Google)
- Core Web Vitals: **LCP < 2.5s, INP < 200ms, CLS < 0.1** — structura are impact prin rendering efficiency

## Anti-patterns

- **Schema fără content vizibil**: marking up "rating 5 stars" când pagina n-arată review-uri. Google detectează și penalizează.
- **Multiple H1s**: "fiecare section e important deci H1". Nu. Alege unul.
- **Heading-uri ca styling**: `<h3>` pentru că "e dimensiunea vrută". Folosește CSS, păstrează hierarchy.
- **URL-uri cu dates**: `/blog/2024/01/15/titlu` — nu adaugă valoare, face link-urile fragile când refresh-ul content-ului.
- **Schema nepacifical**: schema Organization pe pagina despre un produs (nu despre companie). Specificitate contează.

## Pentru Faber wiki

Wiki-ul tău Alteramens deja urmează pattern-ul:
- **Frontmatter YAML** = machine-readable structure
- **faber.db** = derived structured index (din markdown)
- **FABER.md** = schema definition pentru tipurile de pagini
- **Wikilinks typed** = relații machine-queryable

Aceasta e machine-readable structure aplicată la **knowledge management**, nu SEO. Same principle, altă aplicare: dacă nu e structurat, nu poate fi interogat.

## Legătura cu [[skill-era]]

În [[skill-era]], structura machine-readable nu mai e doar pentru Google — e pentru agenți. Un site fără schema e invizibil atât pentru Google AI Overviews cât și pentru ChatGPT care caută să răspundă unui utilizator. Investiția în schema este investiție în vizibilitate cross-agent.

Vezi [[agent-readable-web]] pentru layer-ul nou: fișiere dedicate agenților (`/pricing.md`, `/llms.txt`).

## Legătura cu alte concepte

- **[[extractable-content]]**: passage-first writing DEPINDE de heading hierarchy corect; structura fără content extractabil e schelet gol
- **[[agent-readable-web]]**: extensia spre un strat nou de fișiere dedicate agenților
- **[[answer-engine-optimization]]**: schema markup este una din tactici principal din AEO
- **[[hub-and-spoke-architecture]]**: internal linking face parte din structura machine-readable
