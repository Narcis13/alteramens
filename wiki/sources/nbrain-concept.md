---
title: "nbrAIn — Agentic Business Platform for Romanian Accounting"
type: source
format: article
origin: vault
source_ref: "concepts/agentic-business-platform.md"
ingested: 2026-04-05
guided: false
entities: [nbrain, workscript, anaf]
concepts: [conversational-interface, validate-before-build, specific-knowledge]
key_claims:
  - "Conversational AI replaces rigid forms — ask questions, get answers from shared data"
  - "Target: Romanian accountants (independent/small firms) + SME entrepreneurs"
  - "Price: 50 EUR/month per firm, ~98% margin with ~$1 API cost"
  - "4 clients = 1000 RON MRR minimum; 20 clients = 5000 RON MRR"
  - "Wife has 20 direct clients for immediate validation"
  - "Wife interview confirmed: stress from not enough time to finish all firms"
  - "Clients send documents chaotically — email, WhatsApp, physically (over the fence!)"
  - "Top client questions: How much do I owe ANAF? How much can I take as dividends?"
confidence: high
---

# nbrAIn — Agentic Business Platform

The primary revenue candidate for Alteramens. A B2B SaaS targeting Romanian accountants and SME entrepreneurs with a conversational AI interface. Source: [[concepts/agentic-business-platform|Concept note]].

## The Problem

**For accountants:** Repetitive monthly work across all clients. Documents arrive chaotically (email, WhatsApp, physical). Constant interruptions from client questions. Not enough time to finish all firms.

**For entrepreneurs:** Don't know "how they stand financially" without calling the accountant. Excel hell. Complex ERPs they don't use. No real-time visibility.

## The Solution

Shared data between accountant and client, accessible through natural language. Instead of forms and reports, you ask questions:
- Accountant: "Did I record depreciation for firm X this month?"
- Entrepreneur: "What's my oldest unpaid invoice from Bucharest clients?"

## Unfair Advantages

1. **Direct market access** — wife has 20 clients for testing
2. **Dual expertise** — economist (10yr accounting) + developer
3. **Deep understanding** — lived both sides of the problem
4. **Immediate validation** — can test with real clients

## Validation Status (as of Jan 2026)

Wife interview completed. Confirmed:
- All tasks take approximately same time (no easy wins)
- Main pain: stress that there isn't enough time
- Clients care about: "How much do I owe?" and "How much can I take as dividends?"
- Documents arrive chaotically, sometimes literally thrown over the fence

## Tech Foundation

WorkScript engine (~75% ready). Migrations to PostgreSQL/NextJS ONLY after market validation.
