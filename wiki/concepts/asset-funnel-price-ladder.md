---
title: "Asset Funnel — Price Ladder de la Free la High-Ticket"
type: concept
category: decision-framework
sources: [asset-creators-operator-playbook]
entities: [beehiiv, kit, gumroad, payhip, lemon-squeezy, creator-shows]
related: [google-doc-offer, lead-lifecycle-funnel, good-better-best-pricing, productize-yourself, value-based-pricing, bootcamp-pricing, scientific-content-split, internal-to-product]
maturity: seed
confidence: high
contradictions: []
applications: []
alignment:
  - pillar: building-as-51yo-from-ro-public-hospital
    relation: reinforces
    source_event: "2026-04-24 ingest | Asset Creators Operator Playbook"
---

# Asset Funnel — Price Ladder de la Free la High-Ticket

O arhitectură cu **4 trepte de preț** care oferă fiecărui interesat un yes-button la bugetul lui. Premisa: majoritatea readerilor **nu cumpără HT la primul contact**. De-aia construiești o ladder care îi convertește din strangers în buyers la $49, apoi îi urcă spre HT prin email sequencing automatizat.

| Tier | Preț | Delivery | Scop |
|---|---|---|---|
| **Lead magnet** | Free | PDF / Notion via email opt-in | Captură email |
| **Micro offer** | $27-49 | Self-serve digital (template pack, mini-course, swipe file) | Primul purchase → **buyer identity** |
| **Mid offer** | $199-499 | Cohort workshop + templates, sau 1-week sprint | Qualify buyers care vor more |
| **High-ticket** | $1,000-3,000/mo | 1:1 coaching via [[google-doc-offer]] | Real revenue |

## Matematica $5K/mo (honest)

**Varianta A (mai multe HT):**
- 3 HT × $1,500/mo = $4,500
- 20 micro × $49 = $980
- **Total: $5,480/mo**

**Varianta B (mai multe micro):**
- 2 HT × $1,500/mo = $3,000
- 50 micro × $49 = $2,450
- **Total: $5,450/mo**

**HT-urile fac heavy lifting-ul.** Micros există ca să (a) construiască email list de **buyers** (nu subscribers) și (b) finanțeze ads/tools — NU ca să înlocuiască HT.

Asta e distincție crucială: **un buyer e 10-100x mai probabil să devină un HT client decât un subscriber.** De-aia chiar și $27 first purchase e strategic — crearea customer identity e worth way more decât $27.

## Upsell mechanism (unde se întâmplă alchimia)

Când un buyer cumpără $49 micro → intră într-o **secvență de 5 emailuri în 7 zile**:
- **Email 1-3:** delivery value, reinforcement of first purchase, setup pentru próximo
- **Email 4:** pitch mid offer ($199-499) — timp de a gândi
- **Email 5:** soft pitch HT + link la [[google-doc-offer]]

**Conversion rate micro → HT: 8-14%** (historical, creator-shows roster).

Matematica: 20 micro/lună × 10% = **2-3 HT leads/lună** → 1-2 HT close/lună (closing rate ~50% pentru leads warmed prin micro).

## Email infrastructure

| Componentă | Default | Alternative |
|---|---|---|
| **ESP** | [[beehiiv]] (creatori noi, cu growth features) | [[kit]] (dacă deja ai list) |
| **Micro checkout** | [[gumroad]] (VAT handled) | [[payhip]] (EU-friendly) |
| **HT checkout** | Stripe Payment Links | [[lemon-squeezy]] (MoR dacă vrei taxe globale handled) |
| **Delivery micro/mid** | Notion (duplicated page per buyer) | — |
| **Delivery HT** | Loom + DM (80% async) + Zoom (20% call) | — |

**Never both Kit și Beehiiv** — pick one, don't split the list.

**Zero Zapier în primele 90 zile** — automatizările native ale ESP + Stripe sunt suficiente.

## Refuzat explicit

- **Kajabi** — overkill, slow, expensive, traps you
- **ClickFunnels** — 2015 energy
- **Skool** pentru produse — fine for community, bad for sales
- **"AI creator agent" launched în ultimele 6 luni** — wait 18 months, see who survives

## De ce 4 trepte și nu 2 (Free + HT)?

**Ratio-uri empirice:**
- 1,000 X impressions → 10 profile visits → 1 follow → 0.1 email subscribe → **0.01 buyer ($49)**
- 100 buyers → 10 HT leads → 3-5 HT closes

Fără micro step, **jump-ul de la free la $1-3K/mo e prea mare**. Micro acționează ca:
- **Filter de intenție** (cine plătește $49 e serios)
- **Creator de customer identity** (odată cumpărat, ești mai probabil să cumperi din nou)
- **Finanțare de ads/tools** (fără HT presiune)

## Honest timeline pentru prim $5K/mo

Marketingul spune: "3-6 luni."
**Honest average: luna 5** (din playbook [[creator-shows]]).
**Honest lower bound: luna 4.** Honest upper bound: **luna 10** dacă audience-ul e sub 1K sau dacă Phase 1 (Google Doc Offer validation) durează mai mult de 2 rescrieri.

**~25% clienți nu termină programul.** De obicei pentru că au oprit posting-ul, nu pentru că sistemul a fail-uit.

## Relația cu alte concepte

- **[[google-doc-offer]]** — doc-ul e asset-ul care închide HT. Fără doc, ladder-ul rupe la top.
- **[[lead-lifecycle-funnel]]** — asset-funnel e specific pentru creator economy, lead-lifecycle-funnel e cadrul general pentru SaaS (subscriber → MQL → SQL → buyer → advocate). Se completează.
- **[[good-better-best-pricing]]** — asset-funnel NU e same cu good-better-best. Good-better-best oferă 3 tiers simultan pentru același decision. Asset-funnel oferă tiers **temporal** — în trepte de commitment crescător.
- **[[productize-yourself]]** — cele 4 trepte sunt toate productizări ale aceluiași [[specific-knowledge]] la diferite intensități (free = introducere, micro = applied template, mid = cohort, HT = 1:1).
- **[[internal-to-product]]** — ladder-ul e **explicitly documented model**: Swipe Bank → $97 Notion template. 30-idea list → $49 prompt pack. Playbook → $997 course. Products emerge din tools-ul folosit în delivery.
- **[[bootcamp-pricing]]** — mid-tier cohort workshop aplică bootcamp pricing (time-bounded package).

## Aplicabilitate la Alteramens

Direct aplicabil pentru primul offer monetizabil:

**Varianta "Skills Suite" (probabilă):**
- **Free:** CLAUDE.md template / skill starter pack (lead magnet)
- **Micro $29-49:** Notion template cu 5 skills Alteramens + README pattern
- **Mid $199-299:** 1-week sprint "Encode your first skill cu judgment" (cohort sau async cu templates)
- **HT $1K-2K/mo:** 1:1 advisory pentru devs / SMB-uri care vor să productizeze expertise

**Matematica realistă pentru Narcis:**
- 2 HT × $1K/mo = $2,000 + 10 micro × $49 = $490 → **~$2,500/mo**
- La luna 6-8, cu pivot pe $2K HT dacă demand permite → $5K realist

**Key constraint verificat:** playbook-ul assumes 2-4h/zi × 5 zile. Narcis are **2-4h/zi după orele 15:00** — se mapează 1:1 pe profilul audienței target a [[creator-shows]]. Timeline-ul 12-16 săptămâni e viable în part-time.

## Limitări recunoscute

- **Cere skill vândabil demonstrabil** — fără proof (personal sau client), HT ratează.
- **Cere audience cu cel puțin 500-1,000 engaged** — sub asta, volume-ul de lead magnet opt-ins e prea mic pentru upsell pipeline.
- **Cere ~3 luni de discipline content + ~3 luni de iterație pe Google Doc Offer** înainte de validation real.
- **Nu funcționează pentru B2B enterprise** — dacă ICP-ul e CFO la companie cu procurement process, ladder-ul (mai ales micro) nu se potrivește. Creat pentru solo operator / SMB / creator.
