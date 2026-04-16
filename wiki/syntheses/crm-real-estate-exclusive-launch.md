---
title: "CRM pentru Agenți Imobiliari cu Mandat Exclusiv — Strategie Completă de Lansare"
type: synthesis
trigger: query
question: "Pe baza cunoștințelor acumulate, cum ar arăta o strategie completă de lansare pentru o platformă CRM destinată agenților imobiliari specializați în contracte de reprezentare exclusivă?"
sources_consulted: [saas-launch-manifest, strategy-foundations-framework-alteramens, alteramens-manifest]
concepts_involved: [bounded-problem-wedge, phased-launch, validate-before-build, kill-fast, orb-channel-framework, value-based-pricing, good-better-best-pricing, jobs-to-be-done, voice-of-customer, engineering-as-marketing, deliver-dont-promise, programmatic-seo, third-party-signal, peer-voice-outreach, compounding-games, productize-yourself, encoded-judgment, skill-era, specific-knowledge, internal-to-product, data-compounding-moat, distribution-over-product, leverage]
entities_involved: [alteramens]
created: 2026-04-16
updated: 2026-04-16
maturity: seed
confidence: medium
contradictions: []
applications: []
---

# CRM pentru Agenți Imobiliari cu Mandat Exclusiv — Strategie de Lansare

Aplicarea framework-urilor Alteramens ([[saas-launch-manifest]], [[strategy-foundations-framework-alteramens]], [[bounded-problem-wedge]]) la o idee de vertical SaaS: CRM pentru agenți imobiliari care lucrează pe mandat de reprezentare exclusivă.

> **Gap de wiki recunoscut:** Faber nu conține surse specifice despre real estate sau exclusive agency methodology. Această sinteză e bazată 100% pe framework-urile generice Alteramens. Pre-requisite recomandat: ingest 3-5 surse (REMAX Approach, Mike Ferry, Gary Keller *SHIFT*) via `/faber-ingest` înainte de validare.

---

## 0. Testul de eligibilitate — trece ideea prin filtrul Alteramens?

Conform [[alteramens-manifest]] și [[productize-yourself]]:

| Criteriu | Răspuns provizoriu | Flag |
|---|---|---|
| **Specific knowledge?** | Piață RO + metodologia "exclusive agency" (cunoscută de REMAX, Imobiliare.ro Academy) | ⚠️ Founder gap — fără origine în real estate |
| **Judgment encodabil?** | **DA** — CRM-ul encodează playbook-ul (prospectare FSBO → pitch exclusiv → management așteptări → raport săptămânal) [[encoded-judgment]] |
| **Leverage?** | SaaS + conținut → da [[leverage]] |
| **Compound?** | Date tranzacționale + conținut SEO + testimoniale → da [[data-compounding-moat]] |
| **Distribuție clară la 10 clienți?** | Facebook groups, training-uri REMAX, LinkedIn, podcast-uri RE | Verificabil |

**Verdict:** Ideea trece filtrul **doar dacă** rezolvi gap-ul de autenticitate. Fără un insider, riști un CRM generic cu skin imobiliar — anti-pattern "platform" din [[bounded-problem-wedge]].

---

## I. Bounded wedge — definește exact problema

Per [[bounded-problem-wedge]], răspunde la fiecare într-o propoziție:

1. **Cine cumpără?** — Agent individual / broker mic (1–5 agenți) care vinde cu mandat exclusiv (nu "listing deschis")
2. **De ce acum?** — Imobiliare.ro organic reach scade; agenții exclusivi nu au tool dedicat metodologiei lor
3. **Ce înlocuiește?** — Excel + WhatsApp + Imoapp + calendar Google sau HubSpot adaptat manual
4. **Cât plătește azi?** — Imoapp ~€30-50/lună, HubSpot Starter €20/user, comision split 50% din 2-4% din preț proprietate
5. **Cum arată succesul?** — Proprietăți listate → vândute în <X zile la ≥Y% din preț cerut (binar)
6. **Scope de conținut?** — Pipeline seller finite (prospectare → pitch → mandat → marketing → ofertă → închidere)

**Anti-pattern:** "CRM pentru toți agenții" = compete cu HubSpot, Salesforce, Imoapp, KW Command.

---

## II. Judgment-ul encodat — ce face CRM-ul diferit

Per [[encoded-judgment]] și [[skill-era]] — nu vinzi funcționalitate, vinzi **pattern-urile succesului în mandat exclusiv**:

- **Listing Presentation Generator** — CMA + deck pitch pentru proprietar, argumente pentru exclusivitate
- **Weekly Seller Report** — raport automat săptămânal (vizite, clickuri, feedback) — cheia psihologică a mandatului exclusiv (reduce anxietatea vânzătorului)
- **Objection Playbook** — răspunsuri gata pentru top 20 obiecții ("dar dacă găsesc eu singur cumpărătorul?")
- **Pipeline Predictor** — AI care estimează "X% șanse închidere în 60 zile la preț cerut, bazat pe comparabile"

**Testul:** competitor cu 10 ingineri poate clona feature-urile în 3 luni. Nu poate clona metodologia + corpusul de obiecții + pattern-urile din piața RO — [[specific-knowledge]] + [[voice-of-customer]] acumulat.

---

## III. Secvența — respectă [[saas-launch-manifest]]

### Săptămâna 0-2: Validare (fără cod) [[validate-before-build]]

1. **10 interviuri** cu agenți pe mandat exclusiv (nu orice agent)
   - Surse: Facebook ("Agenți Imobiliari România", "REMAX Romania"), LinkedIn "agent imobiliar exclusiv", Imobiliare.ro Academy
   - Protocol [[peer-voice-outreach]]: nu pitchezi, întrebi despre durerea ultimelor 7 zile
2. **Capturează verbatim quotes** [[voice-of-customer]] — min. 10 citate independente
3. **JTBD mapping** [[jobs-to-be-done]]:
   - Functional: "să demonstrez proprietarului că muncesc pentru el, săptămânal"
   - Emotional: "să nu-mi fie rușine când proprietarul mă sună"
   - Social: "să fiu perceput ca agent profesionist, nu intermediar"
4. **Testul de plată:** suma concretă = semn puternic; "interesant" = kill
5. **Kill criteria** [[kill-fast]]: <3/10 durere intensă → **STOP**, schimbă wedge

### Săptămâna 3-4: Foundation (NU cod încă)

Per [[strategy-foundations-framework-alteramens]]:

1. `/product-marketing-context` → `.agents/product-marketing-context.md` (12 secțiuni)
2. `/pricing-strategy` cu [[good-better-best-pricing]]:
   - **Good** (€29/lună): pipeline + CMA + reports
   - **Better** (€69/lună, ținta): + objection playbook + AI predictor + marketing automation
   - **Best** (€149/lună): + brokerage features
3. Ancorare [[value-based-pricing]]: 1 tranzacție reușită = mii € comision → €69/lună trivial
4. `/launch-strategy` → 5-phase (feedback înainte de public)

### Săptămâna 5-6: MVP "embarrassingly simple"

- **Singurul modul unic:** Weekly Seller Report automatizat
- Restul: integrare Imobiliare.ro/Storia API + Google Calendar + kanban simplu
- **NU construi:** mobile app, AI personalizat, multi-language
- [[internal-to-product]]: un agent-test care îl folosește zilnic = validare continuă

### Săptămâna 7-8: Prima plată

- Landing page: "Raport Săptămânal Automatizat — €29/lună, anulabil oricând"
- Target: primii 3 clienți plătitori din cei 10 interviați
- Nu reușești în 2 săptămâni → înapoi la validare

---

## IV. Lansare în 5 faze [[phased-launch]]

| Fază | Durată | Activitate | Gate de trecere |
|---|---|---|---|
| **Internal** | Luna 2 | Tu + 1 agent friendly | MVP rulează fără crash |
| **Alpha** | Luna 3 | 5-10 agenți plătesc €1 | ≥3 folosesc săptămânal |
| **Beta** | Luna 4 | 30 agenți, pricing redus €19 | ≥10 case studies + 3 testimoniale video |
| **Early Access** | Luna 5 | 100 agenți, pricing full, waitlist | MRR ≥€500 |
| **Full Launch** | Luna 6 | Product Hunt, StartupCafe.ro, podcast PR | MRR ≥€1000 |

Fiecare fază = mini-lansare cu comunicare separată.

---

## V. Distribuție [[distribution-over-product]] + [[orb-channel-framework]]

### Owned (construit din ziua 1)
- **Newsletter "Săptămâna Agentului Exclusiv"** — 1 email/săpt: 1 obiecție + răspuns, 1 studiu de caz, 1 tactică
- **Blog SEO** per [[programmatic-seo]]: pagini "Cum să obții mandat exclusiv în [oraș]" (50 orașe RO), "X vs HubSpot pentru agenți exclusivi"

### Rented (2 canale)
- **LinkedIn RO** — build-in-public despre metodologie (nu produsul); thread săptămânal
- **Grupuri Facebook** — participare genuină 3 luni înainte de pitch [[third-party-signal]]

### Borrowed
- **Podcast tour** — "Business la Zi", "Imobiliare Talks", podcast-uri RE
- **Co-marketing cu Imobiliare.ro Academy** — ei livrează cursurile, tu livrezi tool-ul care operaționalizează metodologia
- **Parteneriat broker owner** — agenție mare îți dă 5-10 agenți, tu le dai produsul la preț dealer

### Engineering as Marketing [[engineering-as-marketing]]
**Tool gratuit:** "CMA Generator Romania" — generează Comparative Market Analysis profesional din adresă + suprafață. Fără signup. Valoros chiar dacă nu cumperi CRM-ul. Leadurile intră natural.

### Deliver-Don't-Promise [[deliver-dont-promise]]
Cold email template săptămânal (10/zi, adaptat per agent):
> "Am văzut anunțul tău pentru [proprietate X] pe Imobiliare.ro. 3 observații: (1) prețul e 8% peste mediana [cartier] pe ultimele 90 zile — atașez CMA. (2) fotografiile 4,7 sunt slab iluminate. (3) descrierea nu menționează [feature] care apare în 80% căutări pentru zonă. — Narcis"

Rezultat: agent = "cine e tipul ăsta?" → inbound.

---

## VI. Pricing încapsulat

| Tier | Preț | Target | Metric |
|---|---|---|---|
| **Starter** | €29/mo | Agent individual, <5 mandate active | per-user |
| **Pro** 🎯 | €69/mo | Agent cu volum, >5 mandate | per-user |
| **Brokerage** | €149/mo | Broker cu 3-10 agenți | per-seat, min 3 seats |

**Ancore** [[value-based-pricing]]:
- Next best alternative: HubSpot Starter €20/user × 3-5h/lună setup manual = cost ascuns €100-200
- Valoare percepută: 1 mandat extra/lună = €2,000-5,000 comision
- Cost de a nu avea: mandate pierdute din proprietari neinformați ≈ 20% churn pe mandate

Free trial 14 zile fără card, **nu freemium** (agenții nu sunt price-sensitive când văd ROI).

---

## VII. Compounding pe 6+ luni [[compounding-games]]

```
Luna 1-6: Agenți exclusivi București + Cluj
    ↓
Luna 6-12: Extindere orașe RO + brokerages (Better → Best)
    ↓
Luna 12-18: Template metodologie pentru Est-Europa (BG, MD)
    ↓
Luna 18+: Metodologia ca SaaS vertical — playbook-uri export (agent asigurări exclusiv, consultant financiar exclusiv)
```

---

## VIII. Kill criteria explicite [[kill-fast]]

Borne ÎNAINTE să începi:

- **Săptămâna 2:** <3 interviuri cu durere intensă → STOP, alt wedge
- **Luna 2:** <3 utilizatori alpha activi săptămânal → STOP
- **Luna 4:** <€300 MRR → revalidare wedge
- **Luna 6:** <€1K MRR → pivot sau archive

Fără atașament. Jocul e "SaaS pe care îl ship-ezi", nu "CRM-ul ăsta specific".

---

## IX. Red flags și gap-uri

1. **Autenticitatea** — Narcis vine din healthcare IT, nu real estate. Per [[productize-yourself]], autenticitatea e multiplicator major. **Recomandare:** co-pilot agent (equity partner / advisor 1-2%), sau 30+ interviuri adânci.

2. **TAM fragmentat** — ~30K agenți RO, dar fracțiune mică lucrează pe mandat exclusiv (metodologia încă în adoptare). 1K MRR = ~15-20 clienți Pro — fezabil dar necesită acquisition focalizat.

3. **Integrări critice** — Imobiliare.ro și Storia au API-uri limitate/scumpe; fără ele, CRM-ul e orbit. **Validează accesul API înainte de săptămâna 5.**

4. **Wiki gap** — nu există pagini Faber despre vertical SaaS sau real estate. Pre-requisite: ingest 3-5 articole despre exclusive agency methodology (REMAX Approach, Mike Ferry, Gary Keller *SHIFT*) via `/faber-ingest` înainte de validare.

---

## X. Formula scurtă

```
Wedge bounded (agent exclusiv, nu "imobiliar")
  × Insider autentic (co-founder sau 30+ interviuri)
  × Validare cu 10 conversații înainte de cod
  × MVP = Weekly Seller Report + pipeline simplu
  × Good-Better-Best cu Pro ca țintă (€69/lună)
  × Distribuție din ziua 1 (newsletter + Facebook + LinkedIn)
  × 5-phase launch, nu big bang
  × Kill dacă <€300 MRR la luna 4
  = Drum spre 1K MRR cu Pro × 15 clienți
```
