---
title: "Agent-Readable Web — Noul Strat al Internetului"
type: concept
category: pattern
sources: [seo-skills-suite]
entities: [alteramens]
related: [skill-era, mcp-as-distribution, machine-readable-structure, encoded-judgment, distribution-over-product, answer-engine-optimization]
maturity: developing
confidence: high
contradictions: []
applications: []
---

# Agent-Readable Web

Web-ul se despică în două layer-e paralele: cel **human-readable** (HTML randat, JavaScript, design) și cel **agent-readable** (fișiere plain-text structurate, servite la paths convenționale, designed pentru consum LLM). Acest concept captează layer-ul al doilea — o extindere a paradigmei `robots.txt` la întregul set de nevoi ale agenților AI.

## Principiul

AI agents cumpără, compară, recomandă produse **în numele utilizatorilor**. Un agent care evaluează SaaS-uri pentru un client NU randează JavaScript-ul tău, NU traversează signup-ul tău, NU interpretează design-ul tău. Caută fișiere pe care LE POATE parsa. Dacă pricing-ul tău e ascuns într-un SPA React, agentul filtrează produsul tău din recomandări.

**Implicație**: dacă nu exiști ca plain-text structurat, nu exiști în ecosistemul agentic emergent.

## Fișierele-convenție

| Path | Scop | Cine citește |
|---|---|---|
| `/robots.txt` | Allow/Disallow pentru crawlers | Googlebot, Bingbot, **GPTBot, PerplexityBot, ClaudeBot, Google-Extended** |
| `/sitemap.xml` | URL-uri indexable | SEO crawlers |
| `/llms.txt` | Overview compact al site-ului pentru LLM context | AI systems când fetch context site-wide |
| `/pricing.md` (sau `.txt`) | Structured pricing data | Agenți care compară produse |
| `/AGENTS.md` (sau similar) | Capabilities pentru agenți (API, endpoints, limits) | Agenți care integrează cu produsul |

## De ce `/pricing.md` e un game-changer

Din [[seo-skills-suite|ai-seo]]:

> AI agents increasingly compare products programmatically before a human ever visits your site. Opaque pricing gets filtered out of AI-mediated buying journeys. A simple markdown file is trivially parseable by any LLM — no rendering, no JavaScript, no login walls.

**Un `/pricing.md` arată așa**:

```markdown
# Pricing — [Product]

## Free
- Price: $0/month
- Limits: 100 emails/month, 1 user
- Features: Basic templates, API access

## Pro
- Price: $29/month (annual) | $35/month (monthly)
- Limits: 10,000 emails/month, 5 users
- Features: Custom domains, analytics, priority support

## Enterprise
- Price: Custom — contact sales@example.com
- Features: SSO, SLA, dedicated account manager
```

Un agent care compară 10 SaaS-uri în 5 secunde are datele — al tău și al competitorilor. Dacă competitorul n-are `/pricing.md`, ai avantaj asimetric.

## De ce `/llms.txt` contează

Site-ul tău are un overview compact servit direct pentru AI systems (format definit la [llmstxt.org](https://llmstxt.org)). Un LLM care ajunge la domeniul tău încarcă `/llms.txt` ca context inițial — **decide în prima secundă dacă merită explorat mai departe**.

Un `/llms.txt` conține:
- Ce face produsul
- Cine e audience-ul
- Link-uri către pagini-cheie (inclusiv pricing)
- Schema de navigare scurtă

## De ce `/AGENTS.md` contează

Dacă produsul tău are API, integrări, MCP server, webhooks — un agent care vrea să integreze trebuie să afle asta. `/AGENTS.md` este manifestul pentru capabilities: ce operations expune, ce auth metoda, ce rate limits. Este **distribuția ta pentru agenți** (vezi [[mcp-as-distribution]]).

## robots.txt pentru bots AI

Bots AI specifici de cunoscut:
- **GPTBot** și **ChatGPT-User** — OpenAI
- **PerplexityBot** — Perplexity
- **ClaudeBot** și **anthropic-ai** — Anthropic
- **Google-Extended** — Google (Gemini + AI Overviews)
- **Bingbot** — Microsoft Copilot (via Bing)
- **CCBot** — Common Crawl (folosit pentru training)

**Decizia strategică**: blochezi sau permiți?
- Allow → AI te poate cita în răspunsuri (distribuție gratuită)
- Disallow → Content-ul tău nu intră în training/citations (protecție IP)

**Middle ground**: allow search bots (GPTBot, PerplexityBot, ClaudeBot), block training-only (CCBot). Asta permite citarea fără a contribui la training seturi generale.

## Cum se leagă de [[skill-era]]

Agent-readable web este **expresia infrastructurală a skill era**. În skill era:
- Nu vinzi towards humans (exclusiv) — vinzi towards AI care vorbesc cu humans
- [[distribution-over-product]] înseamnă că cine e lipibil pentru agenți câștigă
- [[mcp-as-distribution]] e forma activă; agent-readable web e forma pasivă

Pentru un solo builder, asta e **un leverage asymmetric**: investiția în `/pricing.md` + `/llms.txt` e de câteva ore, dar te plasează în jumătatea invizibilă față de competitorii care "încă fac SPA frumos și ignoră agenții".

## Implementare minimă (< 2 ore de lucru)

Pentru orice produs nou Alteramens:

1. **`/robots.txt`** cu rules explicite pentru bots AI (allow search, optional block CCBot)
2. **`/sitemap.xml`** auto-generated (orice static site generator face asta)
3. **`/pricing.md`** cu tabele clare per tier
4. **`/llms.txt`** cu overview 200-500 cuvinte + link-uri key pages
5. **(opțional)** `/AGENTS.md` dacă ai API sau integrări

Toate sunt fișiere plain-text — zero framework, zero rendering complexity. Orice site poate avea pe ele într-o după-amiază.

## Anti-patterns

- **Pricing doar pe SPA JavaScript**: agenții filtrează → excluded din compararea AI
- **"Contact sales" pentru tot**: agentul nu poate proceda. În B2B enterprise cu deals mari, e legitim; pentru self-serve SaaS, e conversion killer agent-side.
- **Block total toți AI bots**: fără citații, fără training, dar și fără distribuție. Decisive doar dacă IP-ul e super-sensibil.
- **llms.txt stale**: fișier outdated care descrie v1 când ești pe v3 → AI propagă info incorect.
- **Conflict între pagina vizibilă și /pricing.md**: pricing diferit → trust issue + AI va cita whichever în mod confuz.

## Open questions (pentru Alteramens)

- **Standard-ul este încă emergent**: `llms.txt` e propus (llmstxt.org), nu formal adoptat. `AGENTS.md` e convenție informală. Expect convergence în următoarele 12 luni.
- **Va exista un `/mcp.json`** sau echivalent care expune MCP endpoints programatic? Probabil da.
- **Monitoring**: cum știi că agenții folosesc aceste fișiere? Referral traffic din AI sources (GPT, Perplexity) + log analysis.

## Pentru Alteramens concret

Pentru orice produs pe care-l construiești:
- Ziua 0: `/robots.txt` cu AI bots explicit
- Ziua 1: `/pricing.md` minimal, se updata-tează când se schimbă pricing
- Ziua 2: `/llms.txt` cu overview și link-uri
- Ziua 30+: `/AGENTS.md` dacă MCP sau API e exposé

Acest set de fișiere este un **leverage play specific skill era**: investition mică, upside asimetric pentru cazul în care agenții devin principalii comparators.

## Legătura cu alte concepte

- **[[skill-era]]**: agent-readable web este infrastructura skill era pe partea de content/distribuție
- **[[mcp-as-distribution]]**: MCP = forma activă (agentul invocă); agent-readable web = forma pasivă (agentul citește)
- **[[machine-readable-structure]]**: extinsia logică — de la schema în HTML la fișiere dedicate agent-first
- **[[encoded-judgment]]**: pricing-ul explicit și clar e encoded judgment ("așa se poziționează acest produs")
- **[[distribution-over-product]]**: accesul la layer-ul agentic este permissionless leverage
