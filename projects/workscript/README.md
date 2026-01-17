---
type: project
status: active
tags:
  - proiect
  - saas
  - workscript
date: 2026-01-17
repo: https://github.com/Narcis13/workscript
---

# WorkScript

## Overview

Engine de workflow-uri JSON care va sta la baza [[concepts/agentic-business-platform|Agentic Business Platform]].

## Repository

https://github.com/Narcis13/workscript

## Tech Stack

| Component | Tehnologie |
|-----------|------------|
| Runtime | Bun |
| Limbaj | TypeScript (85%), JavaScript |
| Arhitectură | Monorepo (`/apps`, `/packages`) |
| Orchestrare | PM2 |
| Extensii | Chrome extension (`/chrome`) |

## Status

- **Engine:** ~75% ready
- **UI:** Demo funcțional pentru workflow-uri JSON
- **Automatizări:** Setabile prin UI

## Ce poate acum

- Execuție workflow-uri JSON
- Configurare automatizări
- Demo UI pentru vizualizare

## Ce lipsește pentru MVP business

- [ ] Plugin business (API-uri și tabele specifice)
- [ ] Import extrase de cont
- [ ] Integrare facturi
- [ ] Interfață conversațională (Anthropic Agent SDK)

## Migrări planificate (POST-validare)

| Migrare | De ce | Prioritate |
|---------|-------|------------|
| SQLite → PostgreSQL | Scalabilitate, queries complexe | După primii clienți |
| Frontend → NextJS | SSR, performance, ecosystem | După validare UI |
| Mobile → React Native/Expo | Acces mobil pentru antreprenori | După web stable |

**DECIZIE:** Nu facem migrări până nu validăm că cineva vrea produsul.

## Decizii

Vezi [[projects/workscript/decisions|Log decizii]] pentru istoricul deciziilor majore.

## Conexiuni

- [[concepts/agentic-business-platform]] - Conceptul de business
- [[owner/Who am i]] - Context personal
- [[MANIFEST]] - Obiective
