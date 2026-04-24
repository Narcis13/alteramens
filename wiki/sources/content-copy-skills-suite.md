---
title: "Content & Copy Skills Suite — Mesaj, Conținut, Captură"
type: source
format: code
origin: vault
source_ref: ".claude/skills/"
ingested: 2026-04-14
guided: true
entities: [alteramens]
concepts: [searchable-vs-shareable, seven-sweeps-editing, voice-of-customer, content-pillars, buyer-stage-mapping, value-before-ask, hub-and-spoke-architecture, encoded-judgment, skill-era]
key_claims:
  - "Orice piesă de conținut trebuie să fie searchable, shareable sau ambele — search captează cerere existentă, share creează cerere (content-strategy)"
  - "Editarea de copy se face în 7 pase secvențiale, fiecare pe o singură dimensiune: Clarity → Voice → So-What → Prove-It → Specificity → Emotion → Zero-Risk, cu loop-back după fiecare (copy-editing)"
  - "Customer language > company language: oglindește vocabularul din review-uri, interviuri, support tickets — nu inventa terminologia (copywriting, copy-editing)"
  - "Lead magnet: asks minimum needed; fiecare câmp suplimentar reduce conversia cu 5-10%; 20-40% conversion pe traffic warm, 5-15% pe cold (lead-magnets)"
  - "Conținutul are 4 stadii de buyer journey, fiecare cu modificatori de keyword distincti: awareness ('what is', 'how to'), consideration ('best', 'vs'), decision ('pricing', 'reviews'), implementation ('templates', 'tutorial') (content-strategy, lead-magnets)"
  - "Content pillars = 3-5 topice owned de brand. Identifică prin 4 lentile: product-led, audience-led, search-led, competitor-led (content-strategy)"
  - "Cele 6 surse de ideație de conținut: keyword data, call transcripts, surveys, forum research (Reddit/Quora/HN), competitor analysis, sales/support input (content-strategy)"
  - "CTA formula: [Action Verb] + [What They Get] + [Qualifier]. 'Start My Free Trial' bate 'Sign Up'; 'Get the Complete Checklist' bate 'Submit' (copywriting)"
  - "Copy editing prin Expert Panel: 3-5 personas, score 1-10, target 7+ per persona, 8+ media. Compulsory pentru launch copy / pricing / high-traffic (copy-editing)"
  - "Content upgrades (lead magnets specifice unui post) convertesc 2-5x mai bine decât sidebar CTAs generice (lead-magnets)"
confidence: high
---

# Content & Copy Skills Suite

Un set de 4 skill-uri coordonate pentru toate operațiile de **mesaj-către-piață**: ce să spui (copywriting), cum să-l rafinezi (copy-editing), ce subiecte să acoperi (content-strategy), cum să capturezi atenție convertibilă (lead-magnets). Această pagină documentează suite-ul ca un singur corp de expertiză — vocabular comun, principii partajate, refer-uri reciproce.

Skill-urile live în `.claude/skills/` și sunt invocabile direct prin `/<nume-skill>` în Claude Code.

## Cele 4 skill-uri

| Skill | Path | Focus |
|---|---|---|
| **copywriting** | `.claude/skills/copywriting/SKILL.md` | Scriere copy nou — homepage, landing, pricing, feature, about |
| **copy-editing** | `.claude/skills/copy-editing/SKILL.md` | Rafinare/refresh copy existent prin **Seven Sweeps Framework** |
| **content-strategy** | `.claude/skills/content-strategy/SKILL.md` | Planificare conținut — pillars, clusters, ideation, prioritizare |
| **lead-magnets** | `.claude/skills/lead-magnets/SKILL.md` | Gated content pentru email capture și calificare lead |

## Principiile fundamentale pe care le împărtășesc

Cele 4 skill-uri, deși aplicate pe surfețe diferite, derivă din același set de pattern-uri reutilizabile. Acestea au fost extrase ca pagini de concepts separate:

- **[[searchable-vs-shareable]]** — fiecare piesă captează cerere existentă (search) sau creează cerere nouă (share); prioritizarea search-ului ca fundație
- **[[seven-sweeps-editing]]** — metodologia secvențială de editare prin 7 pase single-dimension cu loop-back
- **[[voice-of-customer]]** — sursa autoritativă a vocabularului; oglindire, nu invenție terminologică
- **[[content-pillars]]** — 3-5 topice owned, identificate prin 4 lentile (product/audience/search/competitor)
- **[[buyer-stage-mapping]]** — 4 stadii × modificatori de keyword × format lead magnet × CTA → secvență coerentă

## Afirmații-cheie per skill

### copywriting
6 principii stilistice: **simplu peste complex**, **specific peste vag**, **activ peste pasiv**, **încrezător peste calificat**, **arată-nu-spune**, **onest peste senzațional**. Page Structure Framework: above-fold (headline + subheadline + primary CTA) + 6 secțiuni core (social proof / problem / solution / how it works / objection handling / final CTA). CTA formula: `[Action Verb] + [What They Get] + [Qualifier]`. Voice-and-tone calibration: headlines mai bold, body mai clar, CTA-uri mai action-oriented.

### copy-editing
**Seven Sweeps Framework** — pase secvențiale, fiecare o singură dimensiune, cu loop-back după fiecare:
1. **Clarity** — poate cititorul înțelege?
2. **Voice & Tone** — sună consistent?
3. **So What** — fiecare claim răspunde "de ce să-mi pese"?
4. **Prove It** — fiecare claim are evidență?
5. **Specificity** — vague→concret (numere, timeframe-uri, exemple)
6. **Heightened Emotion** — face cititorul să simtă ceva?
7. **Zero Risk** — orice barieră lângă CTA e eliminată?

**Expert Panel Scoring** ca quality gate: 3-5 personas (conversion copywriter, UX writer, customer persona, brand strategist), score 1-10, target 7+ individual și 8+ media. Compulsory pentru launch copy, pricing, high-traffic.

### content-strategy
**Searchable vs Shareable**: search = cerere existentă, share = cerere nouă; search-ul e fundația, share-ul e amplificarea.

**Content Pillars**: 3-5 topice owned, identificate prin 4 lentile (product-led, audience-led, search-led, competitor-led).

**Buyer-Stage Keyword Mapping**: awareness ("what is", "how to"), consideration ("best", "vs"), decision ("pricing", "reviews"), implementation ("templates", "tutorial").

**6 Surse de Ideație**: keyword data, call transcripts, surveys, forum research (Reddit/Quora/HN), competitor analysis, sales/support input.

**Prioritization Scoring**: Customer Impact (40%) + Content-Market Fit (30%) + Search Potential (20%) + Resource Requirements (10%).

### lead-magnets
**Gating Strategy**: full gate / partial gate / ungated / content upgrade — alegere bazată pe poziția în funnel. Asks minimum needed; fiecare câmp suplimentar reduce conversia cu 5-10%.

**Format × Buyer Stage Matrix**: checklist/cheat sheet (awareness), comparison/assessment/case studies (consideration), templates/calculators/implementation guides (decision).

**Promotion Stack**: blog CTAs + content upgrades (cele specifice convertesc 2-5x sidebar CTAs), exit-intent popups, social, paid, partner co-promo.

**Benchmarks**: 20-40% landing page conversion pe warm traffic, 5-15% pe cold; email engagement target 30-50% open / 2-5% click.

## De ce am ingerat ca suite, nu separat

Cele 4 skill-uri partajează un vocabular comun și se cross-referențiază în "Related Skills":
- copywriting → copy-editing (după draft) → page-cro (dacă e nevoie de schimbare structurală)
- content-strategy → seo-audit, ai-seo, programmatic-seo, site-architecture
- lead-magnets → free-tool-strategy, form-cro, popup-cro, page-cro, paid-ads, social-content, email-sequence

Extragerea celor 5 concepts cross-cutting permite querying-ul pattern-urilor fără duplicare.

## Conexiunea cu Skill Era — esența ingerării

Cele 4 skill-uri nu sunt notițe sau template-uri statice — sunt **[[encoded-judgment|judgment encodat]]**, invocabil prin command, exact ce propovăduiește [[skill-era]]:

- **Înainte de Skill Era**: angajai un copywriter, un content strategist, un lead-gen consultant — sau citeai 5 cărți și improvizai. Distribuția cunoașterii era oameni.
- **Skill Era**: același judgment e încapsulat într-un fișier `.md` cu instrucțiuni structurate, pe care un agent îl execută la cerere. Distribuția cunoașterii devine **invocare**.

Pentru un solo builder cu 10 ore/săptămână ([[productize-yourself|Naval]]: timp = constraint principal), această translație e existențială. Nu mai e "cine îmi scrie homepage-ul?" — e `/copywriting`. Nu mai e "ce conținut să fac?" — e `/content-strategy`. Nu mai e "cum capturez emailuri?" — e `/lead-magnets`. Apoi `/copy-editing` peste tot ce iese.

**Implicația pentru Alteramens**: aceeași logică se aplică la outputs. Patterns-urile care emerg din aplicarea acestor skill-uri pe proiecte reale (nbrAIn, BunBase etc.) devin candidate pentru [[encoded-judgment]] propriu — skill-uri scrise de tine, pentru utilizatorii (sau agenții) care vor avea aceeași problemă. Vezi [[content-copy-framework-alteramens]] pentru aplicare.

## Suite-uri înrudite

- **[[cro-skills-suite]]** (6 skill-uri) — *copy convertește pe pagini optimizate*; combinatorial: copywriting + page-cro + signup-flow-cro
- **[[seo-skills-suite]]** (5 skill-uri) — *content atrage traffic care intră în pagini optimizate cu copy convertibil*; combinatorial: content-strategy + ai-seo + schema-markup + programmatic-seo
- Suite-ul Content & Copy se așează în mijloc: **mesajul** (copywriting), **rafinarea** (copy-editing), **planul de conținut** (content-strategy), **conversia atenției în lead** (lead-magnets) — alimentând atât SEO (subiecte) cât și CRO (copy-ul de pe pagini).

Vezi [[content-copy-framework-alteramens]] pentru framework-ul aplicat pe proiecte Alteramens.
