---
title: "SaaS Launch Manifest — Plan de Acțiune pentru Builder cu Timp Limitat"
type: synthesis
trigger: query
question: "Cum începi corect un proiect SaaS, bazat pe cunoștințele acumulate în Faber wiki?"
sources_consulted: [alteramens-manifest, naval-framework, skill-era-article, ai-marketing-distribution, severino-claude-sales-system, eric-siu-world-intelligence, nbrain-concept]
concepts_involved: [validate-before-build, kill-fast, encoded-judgment, skill-era, distribution-over-product, mcp-as-distribution, deliver-dont-promise, viral-artifacts, leverage, productize-yourself, compounding-games, internal-to-product, data-compounding-moat, programmatic-seo]
entities_involved: [alteramens, nbrain, naval-ravikant, simon-severino, eric-siu, single-grain]
created: 2026-04-06
updated: 2026-04-06
maturity: developing
---

# Manifestul SaaS al Unui Builder cu Timp Limitat

Un plan de acțiune sintetizat din cunoștințele acumulate în Faber wiki — pentru a începe corect un proiect SaaS.

---

## I. Contextul tău real — nu te minți

Ești un om cu job full-time (08:00-15:00), familie, credință, sănătate — toate non-negociabile [[alteramens-manifest]]. Ai ~10 ore pe săptămână pentru Alteramens. Asta nu e o scuză — e un filtru. Orice proiect care nu funcționează în aceste constrângeri este greșit ales, nu greșit executat.

**Superpower-ul tău real:** Claude Code ca multiplicator de productivitate. Proiecte care ar lua luni pot fi făcute în săptămâni. Bottleneck-ul nu e coding-ul, ci **validarea și găsirea problemei potrivite** [[alteramens-thesis]].

---

## II. Cele 3 adevăruri fundamentale

### 1. Judgment > Funcționalitate [[encoded-judgment]]

Un API trimite email-uri. Un skill știe *cum* să scrii un email care convertește. Diferența e judgment-ul acumulat din experiență.

**Filtru:** Dacă produsul tău face doar ce face un API generic, nu ai moat. Întreabă: **"Unde e judgment-ul encodat?"** Dacă nu poți răspunde, proiectul nu e potrivit pentru Skill Era [[skill-era]].

### 2. Distribuția bate produsul [[distribution-over-product]]

200K+ proiecte se lansează zilnic. Majoritatea mor în obscuritate. Diferența nu e calitatea codului, ci **accesul la piață**.

**Implicație:** Nu începe cu produsul. Începe cu canalul de distribuție. Întreabă: **"Cum ajung la primii 10 utilizatori FĂRĂ să scriu cod?"**

### 3. Compounding-ul e tot [[compounding-games]]

Fiecare schimbare de direcție resetează ceasul. Kill fast ideile individuale, dar NU jocul. Jocul tău: *building profitable software that encodes specific knowledge*. Asta rămâne constant.

---

## III. Secvența corectă — în această ordine exactă

### Săptămâna 0: Alege problema (nu soluția)

1. **Listează 3 dureri pe care le cunoști din interior** — nu din afară, din trăit.
   Tu ai: contabilitate românească (soție + 20 clienți), administrare IT spital, development cu AI.

2. **Pentru fiecare durere, răspunde:**
   - Cine are această problemă? (specific, nu generic)
   - Plătesc deja pentru o soluție? (dacă da, piață validată)
   - Pot ajunge la ei? (ai acces la primii 10?)

3. **Aplică filtrul Productize Yourself** [[productize-yourself]]:
   - E specific knowledge? (nimeni altcineva nu o are exact așa)
   - Are leverage? (code, nu servicii manuale)
   - Encodează judgment? (nu doar funcționalitate mecanică)
   - Compound-ează? (fiecare lună făcut mai bun)

> **Anti-pattern:** Să cauți idei pe Twitter/Reddit. Cele mai bune probleme sunt cele pe care le trăiești zilnic. [[internal-to-product]]

### Săptămâna 1: Validează problema (nu soluția)

**NU scrie cod.** Vorbește cu oameni.

1. **5 conversații reale** cu oameni care au durerea
   - Nu pitcha. Ascultă. Întreabă: "Care e cel mai frustrant lucru despre X?"
   - Notează cuvintele lor exacte (devin copy mai târziu)

2. **Testul de plată:** "Dacă aș avea ceva care rezolvă asta, cât ai plăti?"
   - Dacă tac sau zic "interesant" = semn slab
   - Dacă zic o sumă concretă sau cer mai multe detalii = semn puternic

3. **Kill criteria** [[kill-fast]]: Dacă după 5 conversații nimeni nu pare dispus să plătească → **NEXT**. Fără atașament, fără sunk cost.

> "Building feels productive. Selling feels vulnerable. The temptation to hide in code is strong." [[validate-before-build]]

### Săptămâna 2: MVP embarrassingly simple

Ai validare? Construiește **cel mai mic lucru posibil** care testează ipoteza.

- **Wizard of Oz** e perfect: tu faci manual ce produsul va automatiza
- Un spreadsheet + un form + un email e un MVP valid
- Un Claude Code skill care rezolvă problema e un MVP valid
- **NU:** framework, design system, migrări de DB, CI/CD

> "An MVP must be embarrassingly simple." [[alteramens-manifest]]

### Săptămâna 3: Prima plată

Cel mai important moment. Până acum ai cheltuit timp. Acum testezi dacă piața plătește.

- Pune un preț (oricât de mic — $10, $50, nu contează)
- Livrează valoare primului client
- **Feedback-ul celui care plătește > feedback-ul celor 1000 care folosesc gratis**

Dacă obții prima plată → ai un SaaS. Dacă nu → revino la Săptămâna 0 cu o altă problemă.

---

## IV. Distribuția — gândește-o ÎNAINTE de produs

Alege **2 canale** din cele de mai jos și implementează-le în paralel cu dezvoltarea produsului [[ai-marketing-distribution]]:

### Canale cu leverage mare, efort mic:

| Canal | Cum funcționează | Efort inițial |
|-------|-----------------|---------------|
| **MCP as Distribution** [[mcp-as-distribution]] | Tool-ul tău devine plugin în workflow-ul agenților AI | Mediu — build MCP server |
| **Deliver-Don't-Promise** [[deliver-dont-promise]] | Cold email cu valoare livrată upfront, nu promisiuni | Mic — 3 emails/dimineață |
| **Programmatic SEO** [[programmatic-seo]] | Code generează 1000+ pagini pentru long-tail keywords | Mediu — one-time setup |
| **Free Tool as Funnel** | Un tool gratuit care rezolvă o sub-problemă | Mic — weekend project |
| **Viral Artifacts** [[viral-artifacts]] | Output-ul produsului e inherent shareable | Mic — design choice |

### Deliver-Don't-Promise — cel mai rapid de implementat

Modelul lui [[simon-severino]]:
1. AI research-ează prospect-ul (site, LinkedIn, positioning)
2. AI generează 3 îmbunătățiri concrete
3. Trimite 2 din 3 în email, a treia o ții
4. Ei vin la tine = inbound-like

**De ce funcționează:** Toți ceilalți promit. Tu livrezi. Fresh într-o mare de slop.

---

## V. Sistem operațional zilnic

### Ritual zilnic (90 minute)

**06:00-07:30 dimineața:**
- 15 min: Review — Ce e cel mai important lucru azi?
- 60 min: Deep work — Un singur deliverable
- 15 min: Ship — Commit, deploy, sau trimit un email

**16:00-17:00 seara:**
- 30 min: Interacțiune cu piața (conversații, emails, feedback)
- 30 min: Notare învățări, update wiki

### Ritual săptămânal

**Sâmbătă (2h):** Build sprint — un feature complet
**Duminică (2h):** Reflecție + planning săptămâna viitoare

### Cadența de ship [[alteramens-manifest]]

> "Ship weekly — if nothing came out in a week, something is wrong."

Fiecare săptămână trebuie să producă ceva vizibil: un feature, un email trimis, o conversație cu un potențial client, un articol publicat.

---

## VI. Moat-ul tău — ce nu poate fi copiat

### [[specific-knowledge]] [[productize-yourself]]

- 10 ani în contabilitate
- Soție expert contabil cu 20 clienți (= user research gratis)
- Developer care înțelege domeniul din interior
- Piață românească = nimeni din Silicon Valley nu va face asta

### Data Compounding Moat [[data-compounding-moat]]

Luna 1: Haos. Luna 2: Primele pattern-uri. Luna 3: Flywheel-ul pornește. Luna 4+: Sistem care prinde ce omul nu vede.

Un competitor poate copia tech-ul, arhitectura, prompt-urile. **Nu poate fast-forward lunile de context acumulat.**

### Internal-to-Product [[internal-to-product]]

Construiește pentru tine. Dovedește că funcționează. Apoi vinde altora. Lunile de greșeli și învățări = diferențierea.

---

## VII. Checklist de sanitate — verifică lunar

- [ ] **Vorbesc cu piața săptămânal?** (minim 2 conversații/săptămână)
- [ ] **Am revenue (sau semne clare de revenue)?** Dacă nu după 3 săptămâni → kill
- [ ] **Distribuția e activă?** Nu doar produsul, ci și canalul
- [ ] **Compound-ez?** Fiecare săptămână construiește pe cea precedentă?
- [ ] **E autentic?** Ar putea altcineva cu background-ul meu să facă asta mai bine?
- [ ] **Unde e judgment-ul?** Dacă produsul e doar un API wrapper → repensează

---

## VIII. Ce să NU faci

1. **Nu construi înainte de validare.** Codul e refugiu confortabil. Vânzarea e incomodă. Fă ce e incomod.
2. **Nu te atașa de idei.** 2-3 săptămâni fără semne de viață = archive. Fără excepții.
3. **Nu optimiza prematur.** PostgreSQL, NextJS, microservicii — toate vin DUPĂ prima plată.
4. **Nu hobby projects.** "No hobby projects that don't compound toward 1K MRR." [[kill-fast]]
5. **Nu building in vacuum.** Zero conversații cu potențiali clienți = cel mai mare red flag.
6. **Nu distribui manual ce poți automatiza.** Code + AI = leverage permissionless [[leverage]].

---

## IX. Formula scurtă

```
Problemă reală (din experiență proprie)
  × Validare rapidă (5 conversații, 3 săptămâni max)
  × MVP rușinos de simplu
  × Distribuție automată (2 canale din ziua 1)
  × Judgment encodat (nu funcționalitate mecanică)
  × Ship weekly
  × Kill fast ce nu merge
  = Drum spre 1K MRR
```
