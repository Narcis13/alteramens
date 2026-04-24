---
title: "Lemon Squeezy"
type: entity
category: tool
aliases: ["Lemon Squeezy", "lemon-squeezy", "lemonsqueezy"]
first_seen: asset-creators-operator-playbook
sources: [asset-creators-operator-playbook]
related_entities: [gumroad, payhip]
related_concepts: [asset-funnel-price-ladder]
vault_refs: []
status: active
---

# Lemon Squeezy

Platformă de checkout + merchant of record (MoR) pentru digital products și SaaS. Achiziționat de Stripe în 2024. Diferența-cheie vs. [[gumroad]] / [[payhip]]: **Lemon Squeezy e MoR**, deci gestionează TOATE taxele globale (US sales tax, EU VAT, etc.) ca un layer legal complet, nu doar computațional.

## Poziționare în playbook-ul [[creator-shows]]

Dual-use:
- **High-ticket checkout** — alternativă la Stripe Payment Links pentru HT $1-3K/mo (playbook-ul o listează ca "Stripe Payment Links or Lemon Squeezy")
- **Micro offer checkout** — poate înlocui [[gumroad]] / [[payhip]] dacă vrei un layer de MoR mai formal

## De ce MoR contează

Pentru creatorul bazat în Romania care vinde global:
- **Taxe US (sales tax, state-by-state)** — complex fără MoR
- **Retenție VAT EU** pentru B2C — compliance-heavy
- **Filing-uri multi-jurisdiction** — MoR absoarbe toată complexitatea

Fee-ul MoR (5-8%) se plătește pentru a evita acest overhead legal. Relevant pentru Alteramens dacă Narcis vinde global de la primul produs.

## Trade-offs

**Pro:**
- Taxe globale complet handled
- Integrare nativă cu Stripe (post-achiziție 2024)
- UI modern, API bun pentru automatizări
- Subscription billing mature

**Con:**
- Fee-ul MoR mai mare decât Stripe direct
- Brand recognition mai mic decât Gumroad
- Ecosistem mai tânăr (fewer plugins/integrări)

## Context Alteramens

Opțiune serioasă dacă Narcis vrea **un singur tool pentru micro + HT** și vrea să scape de headache-ul fiscal global. Trade-off între fee-ul MoR și costul administrativ al VAT-ului manual prin ANAF + Stripe direct.
