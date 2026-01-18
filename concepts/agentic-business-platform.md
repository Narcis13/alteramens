---
type: concept
status: researching
tags:
  - saas
  - romania
  - contabilitate
  - ai
  - validated-direction
date: 2026-01-17
monetizare: subscription
potential: high
complexitate: medium-high
---

# nbrAIn - Agentic Business Platform

> **Brand:** nbrAIn (se citește "brain", conține AI, nb = Narcis Brindusescu)
> **Tagline:** "Datele tale, la o întrebare distanță"

## Descriere scurtă

Platformă colaborativă contabil-antreprenor cu interfață conversațională AI. Antreprenorii și contabilii împărtășesc aceleași date și interacționează natural prin întrebări, nu prin formulare rigide.

## Viziune

> "Nu mai completezi date în formulare închise prestabilite și apoi generezi rapoarte prestabilite... acum întrebi și primești răspuns."

**Paradigma nouă:**
- Contabilul întreabă: "Am înregistrat amortizarea pe luna aceasta la firma X?"
- Antreprenorul întreabă: "Care este cea mai veche factură neîncasată de la clienții din București?"

## Problema

### Pentru contabili independenți
- Muncă repetitivă lunară pentru toți clienții
- Reconciliere manuală extrase de cont + facturi
- Clienți care trimit documente haotic (email, WhatsApp, poștă)
- Întrebări repetitive de la clienți care întrerup workflow-ul

### Pentru antreprenori IMM
- Nu știu "cum stau cu banii" fără să sune contabilul
- Excel hell pentru evidențe simple
- ERP-uri complexe pe care nu le folosesc
- Lipsa vizibilității în timp real

## Soluția propusă

### Core Features (MVP)
1. **Date shared** între contabil și client
2. **Interfață conversațională** - întrebi, primești răspuns
3. **Import automat** extrase de cont
4. **Reconciliere asistată** facturi-plăți

### Expansiune ulterioară
- Marketing/CRM conversațional
- Integrare email/social media
- Forecasting cash flow
- Multi-firmă pentru contabili

## Monetizare

- **Model:** B2B SaaS, subscription lunar
- **Cine plătește:** Antreprenorul direct (contabilul poate include în servicii)
- **Preț:** 50 EUR/lună (~250 RON) per firmă
- **Potențial:**
  - 4 clienți × 250 RON = 1.000 RON MRR (obiectiv minim)
  - 20 clienți × 250 RON = 5.000 RON MRR
- **Cost API:** ~$1/user/lună → marjă ~98%
- **Justificare preț:** Acces hands-free 24/7 la datele firmei, conversațional

## Target Market

**Piață primară:** România
- Contabili independenți / cabinete mici
- IMM-uri fără contabil angajat
- Freelanceri / PFA cu activitate constantă

**De ce România:**
- Înțelegem piața locală
- Trust factor "fondator local"
- Competiție mai slabă pe nișe specifice
- Relații directe posibile (soția are deja clienți)

## Unfair Advantages

1. **Acces direct la piață** - soția are 20 clienți potențiali
2. **Dual expertise** - economist + developer
3. **Înțelegere profundă** - 10 ani experiență contabilitate
4. **Validare imediată** - putem testa cu clienții existenți

## Tech Stack (WorkScript)

- **Engine:** WorkScript (75% ready)
- **Backend:** TypeScript, Bun
- **Repo:** https://github.com/Narcis13/workscript
- **AI:** Anthropic Agent SDK (de integrat)

### Migrări planificate (POST-validare)
- [ ] PostgreSQL (de la SQLite)
- [ ] NextJS pentru frontend
- [ ] React Native/Expo pentru mobile

**IMPORTANT:** Migrările se fac DUPĂ validare, nu înainte.

## Validare

### În progres
- [ ] Interviu cu soția (customer interview #1)
- [ ] Conversații cu 2-3 clienți ai ei
- [ ] Demo "Wizard of Oz" cu date reale

### Întrebări de validat
1. Care e task-ul cel mai repetitiv și stupid pentru contabil?
2. Ce întrebări primește constant de la clienți?
3. Cum trimit clienții documentele acum?
4. Cât ar plăti pentru "liniște" (să nu mai fie sunată)?

### De confirmat
- [ ] Am găsit oameni cu problema asta? **DA - acces direct**
- [ ] Există competitori? **De cercetat**
- [ ] Ar plăti cineva pentru asta? **De validat**

## Următorul pas

**Interviu cu soția - 30 minute structurat**

Întrebări:
1. Ce faci în fiecare lună pentru TOȚI clienții?
Operez documenetele primare , facturile le import din sistemul e-factura, operez manual extrasul de cont si alte operatiuni , fac declaratiile fiscale lunare sau trimestriale , inchid luna si verific datele finale.
2. Ce task durează cel mai mult dar e repetitiv?
Toate taskurile dureaza aproximativ acelasi numar de minute
3. Top 3 întrebări când te sună un client?
Cit am de plata la ANAF? Cit pot sa scot pe dividende?
4. Cum îți trimit clienții documentele?
Unii prin email dar majoritatea fizic, uneori daca nu sunt acasa le arunca peste gard!
5. Ce informație îți lipsește constant de la ei?
Nimic deosebit , ii sun sa se grabeasca cu datele
6. Ce ai vrea să poată vedea singuri?
Cam tot ce am spus ca ii preocupa
7. Baghetă magică - ce problemă dispare mâine?
Stresul ca nu imi ajunge timpul sa termin toate firmele

## Riscuri

| Risc | Mitigare |
|------|----------|
| Scope creep (prea multe features) | MVP brutal de simplu |
| Over-engineering înainte de validare | Validare ÎNAINTE de migrări |
| Piață prea mică în RO | Expansiune regională după product-market fit |

## Competitori de analizat

- [ ] FGO / alte soft-uri contabilitate RO
- [ ] Facturis, SmartBill (facturare)
- [ ] Notion/Airtable (generic, nu specializat)
- [ ] Soluții internaționale (QuickBooks, Xero)

## Conexiuni

- [[owner/Who am i]] - Background și unfair advantages
- [[projects/workscript/README]] - Proiectul tehnic
- [[MANIFEST]] - Obiective și timeline

## Istoric

| Data | Eveniment |
|------|-----------|
| 2026-01-17 | Sesiune brainstorm inițială, decizie focus România, nișă contabili-antreprenori |
| 2026-01-18 | Validare interviu soție, brand decis (nbrAIn), preț 50 EUR, strategie social media |
