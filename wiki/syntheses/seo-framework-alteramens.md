---
title: "SEO Framework pentru Proiecte Alteramens — Vizibilitate Compusă în Era AI"
type: synthesis
trigger: insight
question: "Cum aplic cele 5 skill-uri SEO (audit, ai-seo, schema, programmatic, site-architecture) într-o secvență coerentă pentru un proiect Alteramens, ținând cont de split-ul între search tradițional și AI search?"
sources_consulted: [seo-skills-suite, ai-marketing-distribution]
concepts_involved: [extractable-content, third-party-signal, machine-readable-structure, hub-and-spoke-architecture, agent-readable-web, answer-engine-optimization, programmatic-seo, distribution-over-product, skill-era, encoded-judgment, data-compounding-moat, mcp-as-distribution, validate-before-build]
entities_involved: [alteramens]
created: 2026-04-14
updated: 2026-04-14
maturity: developing
---

# SEO Framework pentru Proiecte Alteramens

Cele 5 skill-uri SEO din suite-ul local ([[seo-skills-suite]]) acoperă spectrul complet — de la audit tehnic la AI citations la scalare programatică. Acest document le integrează într-un framework aplicat pentru un solo builder cu timp limitat, într-un ecosistem unde **web-ul se despică în layer uman și layer agentic**.

## Teza de bază

**SEO nu mai e despre ranking pe pagina 1 Google. E despre vizibilitate în cele 2 funnel-uri paralele:**

1. **Human-mediated**: utilizatorul caută pe Google, click-uiește, aterizează pe site-ul tău
2. **AI-mediated**: utilizatorul întreabă ChatGPT/Perplexity/Gemini, AI-ul decide să te citeze (sau nu)

Al doilea funnel devine rapid dominantul. AI Overviews apar în 45% din search-uri Google; click-urile la site-uri scad până la 58%. [[distribution-over-product]] cere prezență în ambele.

## Secvența de lucru pentru un proiect nou

### Faza 0 — Fundație structurală (pre-lansare)

**Invocări**: `/site-architecture`, `/schema-markup`

**Deliverables**:
1. **Page hierarchy ASCII + Mermaid** (site-architecture output format)
2. **URL map table** — URLs consistent (hyphens, lowercase, readable)
3. **Navigation spec** — header 4-7 items, CTA rightmost, footer pe 4 coloane
4. **Internal linking plan** — [[hub-and-spoke-architecture|hub-and-spoke]] cu minim 3-5 hubs identificate
5. **Schema markup pe toate paginile relevante** — Organization (homepage), Article (blog), Product/SoftwareApplication (product pages), BreadcrumbList (everywhere)

**Decizii importante la început**:
- Subfolders vs subdomains → **întotdeauna subfolders** (consolidation authority)
- Trailing slash policy → pick one, enforce
- Blog URL pattern → `/blog/slug`, NU `/blog/year/month/slug`

### Faza 1 — Agent-ready layer (săptămâna 1 de lansare)

**Invocare**: (nu există skill dedicat, extras din ai-seo)

Crează **cele 4 fișiere-convenție** pentru agent-readable web:

1. `/robots.txt` cu AI bots explicit:
   ```
   User-agent: GPTBot
   Allow: /

   User-agent: PerplexityBot
   Allow: /

   User-agent: ClaudeBot
   Allow: /

   User-agent: Google-Extended
   Allow: /

   User-agent: CCBot
   Disallow: /
   ```

2. `/sitemap.xml` — auto-generated de static site generator
3. `/pricing.md` — structured pricing data
4. `/llms.txt` — overview compact + link-uri key pages

Vezi [[agent-readable-web]] pentru detaliu. **Timp de implementare: sub 2 ore**.

### Faza 2 — Content extractabil (primele 3 luni de content)

**Invocări**: `/ai-seo` pentru audit content, `/copywriting` pentru scris nou

**Regulile de [[extractable-content]]** aplicate:
- Lead cu răspuns direct în primul paragraf
- Blocuri de 40-60 cuvinte pentru snippet extraction
- Tabele pentru comparații ("X vs Y")
- FAQ sections cu întrebări naturale
- H2/H3 imită pattern-uri de query
- "Last updated" vizibil pe toate pagini importante

**Princeton GEO optimization** (din skill-ul ai-seo, max impact):
- Cite sources (+40%)
- Add statistics (+37%)
- Expert quotations (+30%)
- **NU** keyword stuffing (-10%, activ penalizat)

### Faza 3 — Third-party presence (săptămâni 4-12)

**Invocări**: implicit, parte din strategia generală de content

[[third-party-signal]] aplicat practic pentru un solo builder:
1. **Alege 2-3 surse** (nu toate — timp limitat). Pentru SaaS B2B: Reddit niche communities + G2 + 1 industry publication
2. **Participare autentică, nu pitch**
3. **Target 20+ G2/Capterra reviews** pentru B2B SaaS (threshold pentru AI visibility)
4. **Wikipedia**: doar dacă ești genuinely notable; altfel nu forța

### Faza 4 — Audit & iterație (luna 3+)

**Invocare**: `/seo-audit`

Audit complet în ordinea priorității:
1. Crawlability & indexation (blockers)
2. Technical foundations (speed, mobile, HTTPS)
3. On-page (title, meta, heading, content)
4. Content quality (E-E-A-T)
5. Authority & links

**Limitarea critică**: verifică schema cu Rich Results Test, NU cu `web_fetch`/`curl` (nu vede JSON-LD injected via JS).

Output-ul audit-ului: Quick Wins → High-Impact Changes → Long-term recommendations.

### Faza 5 — Programmatic scalare (luna 6+, după PMF)

**Invocare**: `/programmatic-seo`

**Pre-requisite**: ai [[data-compounding-moat|date proprietare]] sau product-derived. Fără ele, programmatic SEO = thin content + penalty.

Alege playbook-ul potrivit:
- Ai product cu integrări → **Integrations playbook**
- Tool/utility → **Conversions playbook** (unit conversions, calcul-uri)
- Multi-segment audience → **Personas playbook** ("CRM pentru real estate")
- Content/expertise → **Glossary** sau **Curation** ("Best X tools")

**Threshold**: 100 great pages > 10K thin pages. Respect quality.

## Meta-principiul: 2 funnel-uri simultan

Oricare decizie SEO evaluează prin ambele lentile:

| Decizie | Human funnel (Google ranking) | AI funnel (citation) |
|---|---|---|
| Adaugi schema | ✓ rich snippets, CTR ↑ | ✓ +30-40% AI visibility |
| Ai `/pricing.md` | – (neglijabil) | ✓ agenți te compară |
| Scriu comparison article | ✓ ranking pentru "X vs Y" | ✓ ~33% din citation share AI |
| Gated content | ✓ lead gen | ✗ AI nu accesează → invizibil |
| Keyword stuffing | ~ neutral/penalty | ✗ -10% citation rate (Princeton GEO) |
| Prezență Reddit authentic | ~ minimal | ✓✓ 6.5x multiplier citations |

**Regula**: cautare după intersecție — tactici care funcționează în ambele funnel-uri simultan (schema, extractable content, citations, third-party presence) sunt investiții prime. Tactici care optimizează doar unul la costul celuilalt (keyword stuffing, gated content pe pagini importante) sunt traps.

## Cum se leagă de filosofia Alteramens

### [[skill-era|Skill era]] aplicat la SEO
- Cele 5 skill-uri SUNT [[encoded-judgment]] — invocabile prin `/<skill>`, nu reinventezi roata
- Fiecare skill aplicat pe un proiect real încorporează [[specific-knowledge]]-ul tău (IT/healthcare/Romania) în output
- Output-ul poate deveni, iterativ, sursă pentru concepts noi în wiki (ex: "pattern X funcționează bine în B2B healthcare RO")

### [[validate-before-build]] ca și filtre
SEO fără PMF = zero impact. Înainte de a investi în programmatic SEO sau content strategy mare:
- Ai utilizatori care plătesc?
- Ai minimum 100 signups organice/lună din alte canale?

Dacă nu — SEO-ul nu e prioritate. Focal [[distribution-over-product|distribuție]] directă (cold outreach, community, paid ads) înainte.

### [[data-compounding-moat]] pentru programmatic SEO
Programmatic SEO e veritabil doar cu date defensibile. Pentru proiectele Alteramens potențiale:
- **AI tutor medicină** ([[brainstorm-ai-tutor-medicina]]): longitudinal user models → pagini programmatice "Cum să înveți X pentru admitere" bazat pe patterns reale
- **Workscript**: ANAF compliance patterns → "Cum să declari X în 2026" (update frequency critic)
- **nbrAIn**: conversation insights → "Întrebări frecvente despre X în consulting"

### [[agent-readable-web]] ca leverage asimetric
Solo builder vs companii cu echipe SEO: pe propriul site, ai dezavantaj de resurse. Pe agent-readable web (`/pricing.md`, `/llms.txt`), ești la paritate — sau cu avantaj, dacă adopți înainte de mainstream.

Pentru fiecare produs Alteramens: aceste fișiere sunt **ziua 0**, nu "nice to have".

## Checklist rapid pentru proiectul curent

Pentru site-ul/proiectul la care lucrezi acum:

- [ ] Există `/robots.txt` cu AI bots explicit mentionați?
- [ ] Există `/pricing.md` cu tier-uri clare?
- [ ] Există `/llms.txt` cu overview?
- [ ] Schema markup pe paginile importante (Organization, Product/Article, BreadcrumbList)?
- [ ] Core Web Vitals verdict verde (LCP < 2.5s, INP < 200ms, CLS < 0.1)?
- [ ] Un H1 per pagină, hierarchy H1→H2→H3 respectată?
- [ ] URLs readable (hyphens, lowercase, no query params, no dates)?
- [ ] Internal linking hub-and-spoke identificabil?
- [ ] Paginile importante au extractable blocks (40-60 cuvinte standalone)?
- [ ] Last updated date vizibil pe content?

Dacă bifezi 8+/10 — ești deja peste 90% din site-urile SaaS. Dacă nu — ai listă concretă de prioritizare.

## Întrebări deschise

- Care playbook programmatic SEO se va potrivi cel mai bine cu primul SaaS Alteramens? (Depinde de nișa aleasă.)
- Cum monitorizezi AI citation rate fără a plăti pentru tools enterprise (Otterly/Peec)?
- Când devine `/llms.txt` un standard formal? Cum urmăresc evoluția?
- Există oportunitate de a crea un **Faber-generated `/llms.txt`** programatic, din content wiki?

Aceste întrebări se rezolvă pe parcursul aplicării framework-ului pe proiecte concrete.
