---
title: "Progressive Commitment"
type: concept
category: pattern
sources: [cro-skills-suite]
entities: []
related: [friction-cost, value-before-ask, aha-moment, escape-hatch-principle]
maturity: developing
confidence: high
contradictions: []
applications: []
---

# Progressive Commitment

Oamenii se angajează în **creșteri escaladate**. Fiecare pas completat face următorul mai ușor psihologic (momentul "deja am investit, merg mai departe"). Arhitectura optimă a unui flow exploatează această dinamică: **începe cu cea mai joasă barieră, crește progresiv**, și plasează cerințele sensibile după momentul de angajament psihologic.

## Pattern-ul

```
Pas 1: Barieră foarte joasă (email doar)
   ↓ angajament mic creat
Pas 2: Angajament mediu (password + name)
   ↓ investiție crescută, mai greu de renunțat
Pas 3: Customization / întrebări sensibile
   ↓ utilizatorul e deja "intrat"
```

Fiecare pas ar trebui să pară completabil în **secunde**. Dacă un pas pare dificil, e probabil prea devreme sau prea aglomerat.

## De ce funcționează

Două mecanisme psihologice:

1. **Consistency bias**: oamenii tind să continue acțiuni pe care le-au început (sunk cost + identitate)
2. **Reducerea costului perceput**: văzând o barieră joasă la început, costul total pare mai mic — chiar dacă suma e aceeași ca într-un single-step cu toate câmpurile

## Aplicații în suite-ul CRO

### signup-flow-cro — Progressive Commitment Pattern
1. Email only (cea mai mică barieră)
2. Password + name
3. Customization questions (opționale)

### form-cro — Progressive Commitment în lead forms
1. Low-friction start (email)
2. More detail (name, company)
3. Qualifying questions
4. Contact preferences

### onboarding-cro — Checklist-ul de onboarding
- 3-7 items, ordonate după valoare, quick wins first
- Fiecare check creează micro-commitment
- Progress bar vizibil amplifică efectul

### paywall-upgrade-cro — De la paywall la payment
- Minimize steps
- Keep in-context (nu redirect masiv)
- Pre-fill known information (reduce fricțiunea, păstrează angajamentul creat)

## Regulile de arhitectură

1. **Leading with the easy**: întrebările simple (nume, email) primele, cele sensibile (telefon, company size, use case) ulterior
2. **Chunk by topic**: un singur topic per pas, nu amestecuri
3. **Allow back navigation**: dar salvează progresul (nu pierde datele la refresh)
4. **Visible progress**: progress bar sau "Step X of Y" — utilizatorul vede că se apropie de final
5. **Instant feedback**: fiecare pas validat să pară un mic câștig

## Anti-pattern: micro-commitment fără valoare

Progressive commitment nu înseamnă "împarte 10 câmpuri în 10 pași". Dacă fiecare pas e doar un câmp fără contextualizare, fluxul devine obositor. Regula: **fiecare pas trebuie să aibă propria logică și propriul micro-reward** (validare pozitivă, feedback, sau preview de valoare viitoare).

## Single-step vs. multi-step — când se aplică

Multi-step (progressive commitment explicit) funcționează când:
- > 3-4 câmpuri necesare
- Produse B2B complexe care necesită segmentare
- Secțiuni logic distincte (personal info → business info → preferences)

Single-step funcționează când:
- ≤ 3 câmpuri
- Produse B2C simple
- Vizitatori high-intent (din ads, waitlist)

Forțarea multi-step pentru 2 câmpuri e teatralitate fără beneficiu.

## Legătura cu Alteramens

La nivel de produs: fiecare feature adăugat ar trebui să încorporeze progressive commitment dacă cere configurare (nu "setup ecran uriaș de 20 câmpuri", ci "3 pași de câte 30 secunde").

La nivel strategic, este și o metaforă pentru [[compounding-games|jocurile compounding]]: pași mici consistent, fiecare făcând următorul mai ușor — tot un pattern de escaladare angajament în care suma e mai mare decât părțile.

## Legătura cu alte concepte

- **[[friction-cost]]**: progressive commitment distribuie costul fricțiunii de-a lungul timpului, în loc să-l concentreze într-un moment
- **[[value-before-ask]]**: primul pas ar trebui să fie lângă valoare (nu un câmp neutru)
- **[[aha-moment]]**: fluxul ar trebui să culmineze rapid în momentul aha; progressive commitment fără aha e doar fricțiune distribuită
