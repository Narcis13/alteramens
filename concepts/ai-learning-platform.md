---
title: AI Learning Platform
status: pivoted
created: 2025-01-25
pivoted: 2026-04-07
pivoted_to: projects/ai-tutor-admitere
tags: [saas, education, AI, b2c, b2b, pivoted]
priority: high
revenue_potential: high
effort: high
---

> [!warning] PIVOT — 2026-04-07
> Această explorare generică a fost **reframuită** într-un produs cu scope îngust:
> **AI tutor pentru admitere UMF Carol Davila, biologie, cohorta 2027.**
>
> - Brainstorm sursă: [[wiki/sources/brainstorm-ai-tutor-medicina|Brainstorm — AI Tutor pentru Admitere Carol Davila]]
> - Strategic frame: [[wiki/syntheses/ai-tutor-admitere-strategic-frame|Strategic Frame (5 layers)]]
> - Decision log: [[projects/ai-tutor-admitere/decisions|projects/ai-tutor-admitere/decisions.md]]
> - Pattern: [[wiki/concepts/bounded-problem-wedge|Bounded Problem Wedge]] — vagueness was the enemy
>
> Documentul de mai jos rămâne pentru context istoric. Nu mai e roadmap activ.
> Decizia strategică din 2026-04-08: **proiectul e decuplat de obiectivul 1K MRR / 6 luni** și se joacă pe orizont 18-24 luni (compounding game). Vezi [[projects/ai-tutor-admitere/decisions|decisions.md]] pentru detalii.

---

# AI Learning Platform

## One-liner
Platformă de învățare AI-first care adaptează conținutul, ritmul și metodele pentru fiecare cursant.

## Problema observată

**Context România:**
- Sistemul educațional e rigid, one-size-fits-all
- Profesorii nu au timp/resurse pentru personalizare
- AI nu e integrat în educație (nici măcar menționat)
- Gap mare între ce se învață și ce cere piața

**Frustrări potențiale (de validat):**
- Cursanții se plictisesc sau se pierd
- Nu știu ce să învețe pentru cariera lor
- Cursurile online au dropout rate ~90%
- Lipsă feedback și adaptare în timp real

---

## Ipoteze de validat

> Aplicare: [[wiki/concepts/validate-before-build|Validate Before Build]] — talk to people înainte de a scrie cod.

### Ipoteză 1: Problema există și e dureroasă
- [ ] Oamenii simt că educația actuală nu li se potrivește
- [ ] Sunt dispuși să caute alternative
- [ ] Au încercat deja soluții (și nu au funcționat)

### Ipoteză 2: Există willingness to pay
- [ ] Părinții ar plăti pentru copii
- [ ] Adulții ar plăti pentru upskilling
- [ ] Companiile ar plăti pentru angajați

### Ipoteză 3: AI personalization e diferențiatorul
- [ ] Oamenii vor personalizare, nu doar content
- [ ] Experiențele adaptative sunt percepute ca valoroase
- [ ] Gamification crește engagement-ul

---

## Segmente de piață potențiale

| Segment | Problemă | Willingness to pay | Notă |
|---------|----------|-------------------|------|
| **Părinți (copii 10-18)** | Copilul nu performează la școală, viitor incert | Medie-înaltă | Competiție: meditații |
| **Studenți/Tineri (18-25)** | Nu știu ce skills să dezvolte | Mică (buget limitat) | Freemium? |
| **Adulți career-switch (25-45)** | Vor să se reconvertească în tech/AI | Înaltă | Urgent, dispuși să plătească |
| **Companii (L&D)** | Angajații nu au skills necesare | Foarte înaltă | B2B, sales cycle lung |

**Ipoteză inițială:** Adulți 25-45 care vor reconversie profesională = cel mai bun segment de start
- Durere acută (job nesatisfăcător sau amenințat de AI)
- Au bani
- Pot decide singuri

---

## Diferențiatori propuși (de validat)

> Filtru de evaluare: [[wiki/concepts/encoded-judgment|Encoded Judgment]] — unde e judgment-ul față de un curs Udemy generic?

1. **AI Tutor personal** - Răspunde la întrebări, adaptează explicațiile
2. **Learning path dinamic** - Se ajustează în funcție de progres și obiective
3. **Gamification serioasă** - Nu doar badges, ci mecanici care cresc retenția
4. **Skill assessment continuu** - Știi mereu unde ești și cât mai ai
5. **Conexiune cu job market** - Învață ce contează pentru angajatori

---

## Competiție

| Competitor | Ce face bine | Ce-i lipsește |
|------------|--------------|---------------|
| **Coursera/Udemy** | Catalog mare, brand | Zero personalizare, dropout mare |
| **Duolingo** | Gamification, engagement | Doar limbi străine |
| **Khan Academy** | Gratuit, quality | UI vechi, fără AI |
| **Brilliant** | Interactive, STEM | Nișă limitată |
| **Platforme RO** | Context local | Calitate variabilă, fără AI |

**Oportunitate:** Nimeni nu face AI-first + personalizare + gamification în RO.

---

## MVP Posibil (post-validare)

**Versiunea 0 (No-code, 2 săptămâni):**
- Landing page cu waitlist
- Curs pilot pe un singur subiect (ex: "Intro în AI pentru non-tehnici")
- AI tutor = ChatGPT wrapper cu context specific
- Feedback loop manual

**Metrici de succes:**
- 100 signups pe waitlist
- 10 plătitori pentru curs pilot
- NPS > 40

---

## Întrebări deschise

1. Ce subiect/skill are cea mai mare cerere?
2. Preț: one-time, subscription, sau per-course?
3. Cum scalezi crearea de conținut?
4. Certificări? Contează?
5. Mobile-first sau web?

---

## Next steps

### Săptămâna 1 (validare)
- [ ] 5 interviuri cu adulți 25-45 interesați de reconversie
- [ ] Folosește [[templates/customer-interview|Customer Interview Script]]
- [ ] Postează în comunități relevante (Reddit, Facebook groups) să găsești interviewees

### Săptămâna 2 (sinteză)
- [ ] Analizează pattern-uri din interviuri
- [ ] Decide: continue / pivot / [[wiki/concepts/kill-fast|kill]]
- [ ] Dacă continue: definește MVP și pricing

---

## Learnings

<!-- Adaugă aici ce descoperi din interviuri -->

### Interviu 1
- Data:
- Persoană:
- Key insight:

### Interviu 2
- Data:
- Persoană:
- Key insight:

---

## Decizii

| Data | Decizie | Reasoning |
|------|---------|-----------|
| 2025-01-25 | Focus pe segment adulți 25-45 | Durere acută, willingness to pay |
| 2026-04-07 | **PIVOT — abandon segment adulți 25-45, focus exclusiv pe admitere medicină Carol Davila 2027** | Vague "personalized learning" eșuează la fiecare test din [[wiki/concepts/bounded-problem-wedge\|Bounded Problem Wedge]]. Scope îngust = manual finit, deadline real, buyer identificat (părinți), alternativă validată (meditații 5-10k EUR). Vezi [[wiki/sources/brainstorm-ai-tutor-medicina\|brainstorm]]. |
| 2026-04-08 | **Decuplare de obiectivul 1K MRR / 6 luni** | Proiectul are orizont 18-24 luni (cohorta 2027). Decizie: full-time pe acest joc compounding, flexibilitate pe implementare. Decision 5 în [[projects/ai-tutor-admitere/decisions\|decisions.md]]. |

---

## Links
- [[templates/customer-interview|Interview Script]]
- [[projects/bunbase|bunbase]] - potential backend

### Faber wiki
- [[wiki/concepts/validate-before-build|Validate Before Build]] — principiu operațional
- [[wiki/concepts/kill-fast|Kill Fast]] — regula 2-3 săptămâni
- [[wiki/concepts/encoded-judgment|Encoded Judgment]] — filtru "unde e judgment-ul?"
- [[wiki/concepts/skill-era|Skill Era]] — context: AI personalization ca skill, nu funcție
