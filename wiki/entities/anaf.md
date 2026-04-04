---
title: "ANAF — Romanian National Tax Authority"
type: entity
category: regulation
aliases: [ANAF, "Agentia Nationala de Administrare Fiscala"]
first_seen: nbrain-concept
sources: [nbrain-concept]
related_entities: [nbrain]
related_concepts: [conversational-interface]
vault_refs: ["concepts/agentic-business-platform.md"]
status: active
---

# ANAF — Romanian National Tax Authority

Agenția Națională de Administrare Fiscală. The Romanian government body that manages taxation, including the e-Factura electronic invoicing system.

## Relevance to Alteramens

ANAF is central to the [[nbrain]] platform:
- **e-Factura system** — Mandatory electronic invoicing for Romanian businesses
- **Tax declarations** — Monthly/quarterly submissions that accountants handle
- **Client pain point** — "How much do I owe ANAF?" is the #1 question entrepreneurs ask their accountants
- **OAuth2 integration** — Planned for Contzo/nbrAIn to pull data directly

## Key Challenges

- API instability and OAuth2 race conditions
- XML UBL format with rounding issues
- USB token requirements for re-authentication
- Constantly changing regulations
