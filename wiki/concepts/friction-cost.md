---
title: "Friction Cost"
type: concept
category: pattern
sources: [cro-skills-suite, lifecycle-retention-skills-suite, semnal-x-growth-system]
entities: []
related: [value-before-ask, progressive-commitment, kill-fast, aha-moment, dunning-stack, peer-voice-outreach, capture-at-source, human-in-loop-publishing]
maturity: developing
confidence: high
contradictions: []
applications: ["workshop/drafts/semnal-x-growth-system.md"]
---

# Friction Cost

Fiecare punct de fricțiune (câmp de formular, pas de flow, click suplimentar, decizie forțată, eroare ambiguă) **are un cost cuantificabil în conversii**. Fricțiunea nu este neutră — se acumulează multiplicativ de-a lungul unui funnel și poate dubla sau halvă rata de conversie.

## Cuantificarea clasică

Din [[cro-skills-suite|form-cro]], regula de baston pentru formulare:

| Câmpuri | Reducere completare |
|---|---|
| 3 | Baseline (referință) |
| 4-6 | -10% până la -25% |
| 7+ | -25% până la -50%+ |

Principiul se extinde la orice cerere: fiecare pas, fiecare click, fiecare decizie necesară e un câmp "invizibil". Multi-step signup cu 5 pași scurți poate converti mai bine decât single-step cu 10 câmpuri — sau mai rău, depinde de cum gestionează [[progressive-commitment|angajamentul progresiv]].

## Auditul fricțiunii

Pentru fiecare element de fricțiune, rulează testul:

1. **Necesitate**: Este strict necesar ÎNAINTE ca utilizatorul să poată experimenta valoarea? Dacă nu → [[value-before-ask|amână-l]].
2. **Inferență**: Poate fi dedus din alte date? (Ex: company name din email domain, locație din IP)
3. **Amânare**: Poate fi colectat mai târziu prin progressive profiling?
4. **Eliminare completă**: Este cu adevărat folosit în follow-up sau e vanity data? Întreabă echipa de sales: "ați folosit vreodată câmpul X la un client?"

Dacă răspunsul la 1 e "nu" și la 2-4 e "da", câmpul ar trebui eliminat sau amânat.

## Tipuri de fricțiune invizibilă

- **Cognitive load**: prea multe opțiuni simultane, copy neclar, labels ambigue
- **Visual clutter**: layouts aglomerate, CTA-uri multiple în aceeași vizualitate
- **Perceptual friction**: placeholder-uri în loc de labels (dispar la tastare), erori neclare
- **Technical friction**: pagini lente, formulare care pierd datele la refresh, CAPTCHA abuziv
- **Decision friction**: "Select a plan" fără plan recomandat, pricing cu 7 tier-uri
- **Trust friction**: cereri de date care par nejustificate (ex: număr de telefon pentru newsletter)

## Aplicații cross-skill

- **page-cro**: "Friction Points" e una din cele 7 dimensiuni de audit — form fields, unclear next steps, mobile issues, slow load
- **signup-flow-cro**: prioritizarea câmpurilor (Essential / Often needed / Deferrable) e o aplicație directă
- **form-cro**: regula 3/4-6/7+ vine de aici
- **popup-cro**: frecvența și trigger-ul popup-urilor contează ca fricțiune — popup-uri agresive reduc conversia pe întreaga pagină
- **onboarding-cro**: fiecare pas între signup și [[aha-moment]] e fricțiune; "Do, don't show" e o anti-friction tactic
- **paywall-upgrade-cro**: steps de la paywall la payment; pre-fill, minimizarea pașilor

## Legătura cu Alteramens

Pentru un solo builder, [[kill-fast|regula "kill fast"]] este fricțiune cost aplicată la nivel de proiect: fiecare proiect care nu converteste într-un timp rezonabil "costă" timp și atenție care puteau merge în altă direcție. Același principiu — audit rigoros la ce merită păstrat — se aplică și la product (câmpuri, feature-uri) și la strategie (inițiative de marketing).

## Anti-pattern frecvent: fricțiune ca "filtru de calitate"

Afirmația "formularele lungi filtrează leadurile proaste" este aproape întotdeauna falsă la scară mică. Ce filtrează de fapt:
- Oamenii cu timp puțin (deseori cei mai valoroși)
- Utilizatorii mobili
- Cei cu ADHD / disabilități / tastat dificil

Filtrarea corectă se face după colectarea datelor (lead scoring, disqualify questions opționale în onboarding) — nu prin bariere la poartă. Regula: **cere minimul, filtrează ulterior**.

## Friction at Personal Publishing — The Shipping-Friction Variant

From [[semnal-x-growth-system]]: the same friction-cost logic applies when the "funnel" is a solopreneur's own output pipeline (idea → draft → post). For a builder with expertise and ideas but poor posting consistency, the bottleneck is almost never content quality. It is **activation energy from idea to queue.**

Concrete budget: **<60 seconds from "I have an idea" to "it is in the queue"** is the threshold below which shipping becomes habitual. Above that threshold, the writer decides to "do it later" — which statistically means never.

Every point of friction in the personal-publishing loop has the same multiplicative cost as fields in a form:

| Friction point | Cost (empirical) |
|---|---|
| Context switch from terminal → dedicated capture app | lose ~30% of seeds |
| Pre-capture categorization (pick pillar before writing) | lose another 20-40% |
| Perfectionism gate ("is this good enough to queue?") | lose 50%+ |
| Multi-step drafting without variant offers | 2-5x time to ship |

Design implications (operationalized in [[capture-at-source]] and [[human-in-loop-publishing]]):
- Capture where thought happens — no context switch
- Write-only capture; classify later
- Offer 3 draft variants immediately, not 1 perfect draft
- Human-in-loop gate at publish, not at capture

The core insight: **friction-cost logic is not limited to forms and funnels.** Any pipeline where one person owns multiple steps (capture, draft, ship) is subject to the same multiplicative decay — and solopreneur publishing is the clearest personal-scale application.

## Contraexemple

- **KYC în fintech**: fricțiunea e impusă legal, nu se poate elimina
- **B2B enterprise sales**: o anumită fricțiune semnalizează seriozitate și filtrează disquals
- **Crypto/high-value transactions**: fricțiune intenționată pentru a preveni erori ireversibile

În aceste cazuri, fricțiunea este justificată — dar trebuie să existe o justificare explicită, nu default.
