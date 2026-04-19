---
title: "Sovereign AI Tokenization — Local PII Gate ca Moat Regulatoriu"
type: concept
category: technical-playbook
sources: []
entities: [alteramens]
related: [agent-native-startup, vertical-operator-edge, encoded-judgment, data-compounding-moat, headless-saas-thesis, ambient-computation]
maturity: seed
confidence: medium
contradictions: []
applications: ["workshop/ideas/altera-os.md"]
---

# Sovereign AI Tokenization — Local PII Gate ca Moat Regulatoriu

Un pattern tehnic + strategic: **zero date personale identificabile nu părăsesc instanța fără tokenizare reversibilă local**. Între orice consumator de cloud LLM (Anthropic, OpenAI, etc.) și sistemul care stochează date sensibile, se interpune un strat care: (1) detectează PII prin regex + NER local, (2) înlocuiește cu tokeni stabili per-sesiune, (3) persistă mapping-ul criptat, (4) face request-ul la cloud cu textul tokenizat, (5) reverse-uie tokenii în răspuns înainte să ajungă la user.

## De ce e concept, nu feature

La prima vedere pare o cerință tehnică de compliance. În realitate, în era agent-native, **este un moat strategic** pentru orice vertical reglementat:

- **Sănătate (EU + RO):** GDPR Art. 9 + Legea 95/2006 interzic transferul de date medicale spre procesatori extracomunitari fără anonimizare demonstrabilă
- **Legal:** secretul profesional impune aceeași barieră
- **Finanțe/Accounting:** date fiscale individuale (CNP-uri, salarii) sub aceleași reguli
- **HR:** dosare angajați sub GDPR strict

Fără acest strat, cloud LLM-urile sunt **legal inutilizabile** în aceste verticale. Cu el, devin utilizabile — dar doar pentru cine îl construiește. **Cine are stratul, are acces la cel mai bun model; cine nu, rămâne la modele self-hosted mai slabe.**

## Structura tehnică

```
Input cu PII → [DETECT] → [TOKENIZE] → [PERSIST mapping] → [CLOUD LLM]
                                                                  ↓
Output final ← [REVERSE] ← [LOAD mapping] ← Response tokenizat ←
```

Componente:
- **Detector multi-strat:** regex pentru pattern-uri deterministe (CNP, CUI, IBAN, telefoane, emailuri, cod ICD) + NER local (model mic, ex: `Xenova/bert-base-multilingual-uncased-ner-hrl` prin transformers.js) pentru nume proprii, adrese
- **Token format:** `[PERSON_1]`, `[CNP_1]`, `[ADDR_1]`, stable per-sesiune (aceeași valoare → același token)
- **Mapping store:** per-tenant, per-sesiune, criptat, `expires_at` default 24h, auto-purge
- **Audit log:** hash(input) + token count per invocație (pentru dovadă GDPR)
- **Policy setting:** per-tenant `sanitization_level: strict | moderate | off`

## De ce **reversibil** (și nu doar hash-ing)

Anonimizarea ireversibilă (redactare completă) ar merge pentru clasificare, dar **pierde coerența răspunsului**: "Pacientul Popescu a fost diagnosticat cu..." → răspunsul LLM ar trebui să menționeze un nume, dar nu știe care. Tokenizarea reversibilă păstrează coerența conversațională și permite LLM-ului să refere la entitate consistent.

## Moat dynamics

**De ce e defensibil:**
1. **Cost fix ridicat de construcție** — NER multilingv, tuning pentru cazuri edge RO (diacritice, formate locale), audit loguri — câteva luni de muncă specializată
2. **Compounding per vertical** — fiecare categorie de PII detectată (FO spital, cod ICD, grupa sanguină, număr deviz) adaugă la detector. Anii de operare = detector mai bun
3. **Trust capital netransferabil** — o dată dovedit că "nu scurge date", clientul nu mai caută alternative
4. **Blocage pentru competitori globali** — startup-urile SV nu vor construi NER românesc. Startup-urile RO fără acest strat nu pot vinde în sănătate/legal

## Boundary — ce NU e

- Nu e **encryption at rest** (ortogonal, ambele sunt necesare)
- Nu e **on-prem LLM** (alternativă diferită cu tradeoff-uri diferite: control 100%, dar calitate mai mică)
- Nu e **RAG cu permisioning** (orthogonal — tokenizarea operează pe textul trimis, nu pe ce poate citi agentul)
- Nu garantează **zero-knowledge** față de provider-ul cloud — providerul vede tokeni și context, deci deduce structura. Asta e acceptabil sub GDPR dacă mapping-ul nu părăsește instanța

## Aplicabilitate dincolo de Altera OS

Pattern-ul se extinde natural:
- Orice [[agent-native-startup]] în vertical reglementat EU
- Orice instrument care wrap-uiește un sistem de record cu PII (vezi [[headless-saas-thesis]])
- Orice self-hosted tool care vrea să folosească cloud inference păstrând compliance
- [[ambient-computation]] pipelines care procesează documente automat — tokenizarea e strat obligatoriu la ieșirea spre cloud

## Semnale de design

Dacă construiești sovereign tokenization, nu face:
- ❌ Tokeni aleatori fără structură (LLM se încurcă; folosește `[TYPE_N]` semantic)
- ❌ Mapping global (rupe tenant isolation; mapping per-sesiune per-tenant)
- ❌ Stocaj indefinit (risc GDPR; `expires_at` obligatoriu)
- ❌ Detecție doar regex (pierzi nume proprii; NER e necesar)
- ❌ Tokenizare opțională în config (trebuie să fie default-on; "off" = escape hatch conștient)

## Open Questions

- NER-ul local e suficient pentru nume RO/nume etnice diverse sau trebuie fine-tuning?
- Cum validezi empiric "zero leaks"? Test suite cu 1000+ documente mock + fuzzer?
- La scale (sute de tenants × mii de invocări/zi), costul NER local devine bottleneck — când migrezi la NER server separat?
- Există instanțe când **sanitization_level: off** e corect (e.g., research pe date publice deja anonimizate)?
- Se poate împacheta acest layer ca **stand-alone MCP server** de vândut altor builder-i? (meta-product opportunity)
