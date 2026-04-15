---
title: "Product Marketing Context — Persistent Positioning Doc ca Primitivă Cross-Skill"
type: concept
category: pattern
sources: [strategy-foundations-skills-suite]
entities: [alteramens]
related: [encoded-judgment, specific-knowledge, voice-of-customer, jobs-to-be-done]
maturity: seed
confidence: high
contradictions: []
applications: []
---

# Product Marketing Context

Înainte să lucrezi pe orice skill de marketing (CRO, SEO, copy, ads, email, launch, pricing), salvezi **o singură dată** răspunsurile fundamentale despre produs/audiență/poziționare într-un fișier persistent — apoi toate celelalte skill-uri citesc de acolo în loc să te întrebe din nou.

Skill-ul `product-marketing-context` creează `.agents/product-marketing-context.md`. Toate celelalte 30+ skill-uri de marketing din suite-ul local verifică existența acestui fișier ca primă operație.

## Principiul fundamental

**Încetezi să te repeți.** Un operator solo cu timp limitat (cazul Alteramens) nu își permite să-și descrie produsul de 30 de ori către 30 de skill-uri diferite. Contextul devine infrastructură partajată.

Acesta este [[encoded-judgment]] recursiv: un skill al cărui output devine input pentru toate celelalte skill-uri. E același pattern ca Faber ([[executable-wiki]]) — capturezi cunoștința o dată, o citezi de multe ori.

## Cele 12 secțiuni capturate

1. **Product Overview** — one-liner, ce face, categorie, tip, business model
2. **Target Audience** — company type, decision-makers, primary use case, JTBD ([[jobs-to-be-done]]), use cases
3. **Personas** (B2B) — User, Champion, Decision Maker, Financial Buyer, Technical Influencer
4. **Problems & Pain Points** — core challenge, de ce alternative nu ajung, cost, tensiune emoțională
5. **Competitive Landscape** — direct (same solution/problem), secondary (diff solution/same problem), indirect (conflicting approach)
6. **Differentiation** — key differentiators, how/why better, why they choose you
7. **Objections & Anti-Personas** — top 3 objecții + cine NU e fit
8. **Switching Dynamics** — JTBD Four Forces: Push, Pull, Habit, Anxiety
9. **Customer Language** — verbatim phrases ([[voice-of-customer]])
10. **Brand Voice** — tone, style, personality
11. **Proof Points** — metrici, logos, testimonials
12. **Goals** — business goal, conversion action, current metrics

## Două moduri de creare

- **Auto-draft din codebase** (recomandat): skill-ul citește README, landing pages, marketing copy, package.json, about pages și draftează V1 — apoi tu corectezi. Mai rapid decât de la zero.
- **From scratch**: conversațional, o secțiune pe rând.

## Regula de captură: verbatim over polished

"We were drowning in spreadsheets" > "manual process inefficiency". Cuvintele exacte ale clientului sunt mai valoroase decât descrieri lustruite pentru că reflectă cum gândesc și vorbesc efectiv — ceea ce face copy-ul mai rezonant. Vezi [[voice-of-customer]].

## De ce contează pentru Alteramens

- **Timp limitat** (08:00–15:00 job, după program proiecte): nu poți permite să repeți contextul la fiecare skill invocation
- **AI-augmented development**: multiplicatorul e în viteza cu care skill-urile lucrează pe același context
- **[[skill-era]] internă**: aplicăm pattern-ul skill-era la propriul workflow — contextul produsului e "infrastructură" partajată între agenți

## Când îl rulezi

**PRIMUL la orice proiect nou.** Înainte de copywriting, înainte de SEO, înainte de paid ads. Fără acest fișier, celelalte skill-uri îți fac 10 întrebări de context înainte să livreze ceva — de fiecare dată.

## Când îl actualizezi

- Schimbare de poziționare (nou ICP, nou mesaj central)
- Schimbare de pricing sau business model
- Rezultate noi din [[customer-research|customer research]] (verbatim nou, personas noi)
- Lansare majoră care schimbă "ce ești"

## Relația cu alte skill-uri

| Skill | Cum folosește contextul |
|---|---|
| `copywriting` | Tone, verbatim, value props, obiecții |
| `page-cro` | Aha moment, personas, goals |
| `customer-research` | Sare peste întrebările deja acoperite |
| `pricing-strategy` | ICP, alternative, value delivered |
| `launch-strategy` | Audience, owned channels existente, goals |
| `seo-audit` | Categorie produs, vocabulary client |
| `ad-creative` | Verbatim pentru headline, obiecții pentru counter-copy |

## Limite

- **Decade rapid**: un fișier de 6 luni vechi poate fi mai rău decât absent (context stale → copy stale)
- **Nu înlocuiește research-ul viu**: e snapshot, nu continuu; trebuie reîmprospătat cu noi interviuri/reviews
- **Risk of overfit**: dacă îl umpli cu asumpții nevalidate, toate skill-urile multiplică aceleași asumpții

Documentul corect etichetează fiecare afirmație cu sursa (research, asumpție, data client real) ca în [[voice-of-customer|VOC]].
