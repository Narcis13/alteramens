---
type: decisions
project: workscript
date: 2026-01-17
---

# Decizii WorkScript

Log cu deciziile majore și reasoning-ul din spate.

---

## 2026-01-17: Focus pe validare, nu pe migrări

### Context
WorkScript are engine ~75% ready. Planuri inițiale de migrare la PostgreSQL, NextJS, React Native.

### Decizie
**AMÂNĂM toate migrările tehnice până după validarea cu clienți reali.**

### Reasoning
- Construiam în vid - 0 conversații cu potențiali clienți
- Migrările sunt "cod confortabil" vs "vânzare incomodă"
- Engine-ul actual e suficient pentru un demo Wizard of Oz
- Timp limitat (câteva ore/zi) → focus pe ce contează pentru revenue

### Consecințe
- SQLite rămâne pentru MVP
- Frontend-ul actual rămâne
- Mobile app se amână
- Focus pe: interviu soție → demo → primii clienți

---

## 2026-01-17: Piață România, nișă contabili-antreprenori

### Context
Dilema: piață globală (EN) vs România (RO) vs hibrid

### Decizie
**Focus pe România, nișă: colaborare contabil-antreprenor IMM**

### Reasoning
Unfair advantages pentru RO:
1. Soția = expert contabil cu 20 clienți (acces direct la piață)
2. Background economist ASE + 10 ani contabilitate
3. Înțelegere profundă a problemelor din ambele părți
4. Trust factor "fondator local" pentru IMM-uri

### Consecințe
- Comunicare și UI în română
- Marketing pe canale RO (LinkedIn, grupuri antreprenori)
- Preț în RON
- Suport direct, relații personale

---

## 2026-01-17: Interfață conversațională ca diferențiator

### Context
CRM-uri și soft-uri contabilitate existente = formulare rigide, rapoarte prestabilite

### Decizie
**Diferențiatorul principal: interfață conversațională AI**

### Viziune
- Contabilul întreabă: "Am înregistrat amortizarea luna asta la firma X?"
- Antreprenorul întreabă: "Care e cea mai veche factură neîncasată?"

### Reasoning
- Paradigma se schimbă cu AI
- IMM-urile nu vor să învețe soft-uri complexe
- Natural language > formulare
- Anthropic Agent SDK disponibil pentru integrare

### De validat
- Chiar vor oamenii asta sau e "nice to have"?
- Ce întrebări concrete ar pune?

---

## Template pentru decizii viitoare

```markdown
## YYYY-MM-DD: [Titlu decizie]

### Context
[Ce problemă rezolvăm]

### Decizie
**[Decizia clară, bold]**

### Reasoning
[De ce am ales asta]

### Consecințe
[Ce înseamnă pentru proiect]
```
