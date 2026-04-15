---
title: "CRO Framework pentru Proiecte Alteramens — Conversie prin Fricțiune Redusă și Valoare Demonstrată"
type: synthesis
trigger: insight
question: "Cum aplic cele 6 skill-uri CRO (page, signup, onboarding, form, popup, paywall) într-o secvență coerentă pentru un proiect SaaS Alteramens cu timp limitat?"
sources_consulted: [cro-skills-suite]
concepts_involved: [value-before-ask, friction-cost, progressive-commitment, aha-moment, escape-hatch-principle, context-aware-interrupt, validate-before-build, kill-fast, deliver-dont-promise, distribution-over-product, skill-era, encoded-judgment]
entities_involved: [alteramens]
created: 2026-04-14
updated: 2026-04-14
maturity: developing
---

# CRO Framework pentru Proiecte Alteramens

Cele 6 skill-uri CRO din suite-ul local ([[cro-skills-suite]]) împărtășesc 6 principii fundamentale, deja extrase ca pagini de concepts. Acest document le leagă într-un **framework aplicat pentru un solo builder cu timp limitat** — respectând filosofia Alteramens ([[validate-before-build]], [[kill-fast]], [[productize-yourself]]).

## Prima regulă: CRO-ul vine DUPĂ validare

Înainte de orice optimizare de conversie: **există deja utilizatori care vin, și măcar unul plătește?** Dacă nu:

- Nu optimiza landing page-ul — nu are destul traffic pentru date semnificative
- Nu optimiza signup flow-ul — nu ai destui signups
- Nu adăuga A/B testing infrastructure — e prematur

CRO este multiplicator, nu sursă. Multiplicatorul cu 0 e 0. Focul rămâne [[validate-before-build|validarea]] și [[distribution-over-product|distribuția]].

**Regulă operațională**: ai nevoie de minimum 1000 de vizitatori pe săptămână pe o pagină înainte de a face A/B test serios. Sub acest prag, CRO-ul e calitativ (audit + quick wins), nu cantitativ.

## Cele 6 principii ca test unic de audit

Pentru orice surface de conversie (pagină, formular, popup, paywall), rulează acest test:

1. **[[value-before-ask|Valoarea înaintea cererii]]**: utilizatorul a experimentat valoare înainte de a cere ceva?
2. **[[friction-cost|Cost fricțiune]]**: fiecare câmp/pas/click e strict necesar înainte de valoare?
3. **[[progressive-commitment|Angajament progresiv]]**: cel mai ușor element vine primul? Crescute escaladat?
4. **[[aha-moment|Moment aha]]**: flow-ul converge spre momentul aha cât mai rapid?
5. **[[escape-hatch-principle|Ieșire demnă]]**: există o cale non-punitivă de a ieși, vizibilă și clară?
6. **[[context-aware-interrupt|Întrerupere contextuală]]**: trigger-ul e bazat pe semnal (nu pe timp fix)?

Dacă oricare e "nu", ai o pârghie clară de îmbunătățire — înainte de a testa.

## Secvența de lucru pentru un proiect nou

### Faza 0 — Pre-lansare (înainte să ai traffic)
1. **Definește aha moment-ul IPOTETIC** (va fi validat ulterior): ce acțiune crezi că corelează cu retenția?
2. **Construiește signup flow minimal**: email + password (sau SSO), nimic altceva înainte de produs
3. **Construiește onboarding care culminează în aha rapid**: < 5 min până la primul câștig
4. **Amână tot ce amână-bil**: company, role, phone, use case → progressive profiling ulterior

**Skills folosite**: `/signup-flow-cro` pentru signup, `/onboarding-cro` pentru flow, `/page-cro` pentru landing.

### Faza 1 — Primele 100 signups
Obiectiv: **validezi aha moment-ul real**, nu îl optimizezi.
- Instrumentează events: fiecare pas în onboarding, fiecare feature folosit
- Analizează cohorts: cine rămâne 7 zile vs. cine pleacă
- Identifică acțiunea discriminatorie → acela e aha-ul real

**Skill folosit**: `/analytics-tracking` pentru măsurare (vezi catalog-ul skills).

### Faza 2 — Primele 1000 signups / primul MRR
Obiectiv: **elimini scurgerile evidente** din funnel.
- Audit landing page cu `/page-cro` pe cele 7 dimensiuni
- Audit signup flow cu `/signup-flow-cro` — câmp cu câmp
- Audit onboarding cu `/onboarding-cro` — identifică drop-off-ul major
- **Nu face A/B testing încă** — volumul e prea mic pentru semnificație. Fă ceea ce e evident greșit, pe bază de audit, nu test.

### Faza 3 — Primii 10 clienți plătitori / $1K MRR
Obiectiv: **construiește paywall-ul**.
- Definește trigger-urile: usage limits, feature gates, trial expiration
- Aplică `/paywall-upgrade-cro`: value before ask, context-aware timing, escape hatch clar
- Niciodată paywall în onboarding (înainte de aha)
- Escape hatch: "Continue with Free" vizibil, fără guilt-trip

### Faza 4 — Scalare (după PMF)
Acum e timpul pentru A/B testing sistematic (`/ab-test-setup`), pentru popup-uri (`/popup-cro`) și pentru formulare lead-gen (`/form-cro`). Înainte de PMF, acestea sunt overhead.

## Anti-pattern-uri de evitat în solo-builder mode

1. **Over-engineering CRO la volum mic**: complexitate de A/B testing infrastructure înainte de 1000 sesiuni/săptămână
2. **Popup-uri agresive ca substitut pentru product**: dacă produsul nu reține, popup-urile nu repară
3. **Paywall prea devreme**: conversion killer listat explicit în `/paywall-upgrade-cro`
4. **Dark patterns pentru "numere mai bune"**: short-term gain, long-term reputational damage (violează [[escape-hatch-principle]])
5. **CRO înainte de distribution**: optimizezi ce? Dacă nu ai tracfic, nu ai ce optimiza. Vezi [[distribution-over-product]].

## Cum se leagă de filosofia Alteramens

### [[skill-era|Skill era]] aplicată intern
Cele 6 skill-uri SUNT [[encoded-judgment|judgment encodat]] — expertiză productizată. Le invoci prin `/<skill-name>`, nu reinventezi roata. Pentru un solo builder, invocarea lor în Claude Code e echivalentul a a avea un consultant CRO on-demand.

### [[productize-yourself|Productize yourself]] în context CRO
Ce encodezi tu, Narcis? Deciziile luate aplicând aceste skill-uri pe un proiect real devin [[encoded-judgment]] specific: "când am optimizat signup-ul la [proiect], am eliminat X câmp și conversia a urcat cu Y%". Acestea pot deveni concepts noi în wiki, sau chiar skills specifice.

### [[kill-fast]] aplicat la CRO
Dacă după 2-3 săptămâni de iterație CRO conversia nu se mișcă pe niciun lever evident — problema nu e optimizarea, e product/market fit. CRO nu repară produsul greșit.

### [[deliver-dont-promise]] ca principiu superior
Toate cele 6 concepts sunt expresii ale acestui principiu. Valoare livrată > valoare promisă. Demo interactive > copy lung. Rezultat vizibil > feature list.

## Checklist rapid — primul pas pentru proiectul curent

Întreabă-te, pentru proiectul la care lucrezi acum:

- [ ] Am definit aha moment-ul explicit? (nu "signup")
- [ ] Landing page-ul îl comunică în < 5 secunde?
- [ ] Signup-ul are ≤ 3 câmpuri esențiale?
- [ ] Onboarding-ul ajunge la aha în < 5 minute?
- [ ] Paywall-ul (dacă există) vine după aha, nu înainte?
- [ ] Orice modal/popup are buton X vizibil și text non-manipulativ?
- [ ] Trigger-urile întreruperilor sunt bazate pe semnal (scroll, click, behavior), nu pe timp fix?

Dacă bifezi toate — ești deja în față față de 80% din produsele SaaS de pe piață. Dacă nu — ai o listă concretă de îmbunătățiri.

## Întrebări deschise

- Care din cele 6 concepts se va aplica cel mai des pe proiectele Alteramens? (Voi ști după primele 2-3 aplicări.)
- Există un al 7-lea concept care emerge din aplicare? (Probabil — "recovery patterns" pentru utilizatori stalled?)
- Cum se extinde framework-ul de la SaaS la digital products (cursuri, templates)?

Aceste întrebări se vor rezolva când skill-urile vor fi invocate pe proiecte reale — atunci voi adăuga secțiunea "Applications" din frontmatter-ul fiecărui concept.
