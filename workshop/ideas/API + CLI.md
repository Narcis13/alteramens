---
type: idee
status: researching
tags:
  - idee
  - devtools
  - validated
date: 2026-02-18
monetizare: open-source + premium features
potential: medium
complexitate: medium
---
Dualitate API endpoints + cli commands
# API + CLI (Dualize)

## Descriere scurta
Librarie refolosibila care expune business logic automat ca API routes (Hono) si CLI commands din aceeasi sursa. Convention-over-config cu file-based action discovery.

## Problema
Proiectele Bun+Hono necesita atat API cat si CLI, dar logica se duplica sau se cupleaza la transport. Fiecare proiect reinventeaza acelasi pattern.

## Solutia propusa
`dualize` - o librarie care scaneaza un director de actions si genereaza automat rute Hono + comenzi CLI. Fiecare action e o functie pura cu Zod schema.

## Design
[[docs/plans/2026-02-18-dualize-design|Design doc complet]]

## Urmatorul pas
Implementare MVP - registry + hono adapter + cli adapter

---

## Conexiuni
- Idei similare: [[projects/bunbase/bunbase|BunBase]] (are deja CLI + API)
- Se aplica la: toate proiectele Bun+Hono (DavidUp, Contzo, Robun, Forma)
