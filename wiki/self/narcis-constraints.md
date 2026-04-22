---
title: "Narcis — Constrângeri active"
type: self
subtype: constraints
status: active
maturity: developing
created: 2026-04-22
updated: 2026-04-22
constraints:
  - slug: weekday-work-hours
    description: "Program zilnic 08:00-15:00 la Spitalul Pitești. Proiectele personale rulează după 15:00 și în weekend."
    kind: time
    status: active
  - slug: procrastination-on-publishing
    description: "Tendință de a amâna postarea. Prefer să experimentez — blocajul principal e shipping-ul public, nu producția."
    kind: weakness
    status: active
  - slug: non-idiomatic-english
    description: "Engleză decent, dar non-idiomatic. Reduce viteza și calitatea scrierii pure EN — de aceea Romglish + voice_rules."
    kind: resource
    status: active
---

# Constrângeri active

Limitări reale care trebuie respectate de orice plan. Skills și agenți citesc lista asta din `v_self_active_context` la startup.

## Program de lucru (08:00–15:00)

**Slug:** `weekday-work-hours`

Job 9-to-3 (literalmente 8-15) la Spitalul Pitești. Proiectele personale încep după 15:00 și continuă în weekend. Orice propunere de workflow care presupune disponibilitate între 08 și 15 e invalidă.

## Amânarea postării {#amanare-postarea}

**Slug:** `procrastination-on-publishing`

Slăbiciunea declarată deschis. Prefer să experimentez — amân împărtășirea. Este friction-ul real între cunoașterea acumulată și audiența care m-ar putea răsplăti pentru ea.

**Regulă implicită:** orice sistem construit pentru mine trebuie să atace friction-ul de shipping, nu să adauge cool features. Stance-ul [[narcis-stances#shipping-peste-perfectionism|Shipping > perfecționare]] e contra-forța directă.

## Engleză non-idiomatic

**Slug:** `non-idiomatic-english`

EN decent, nu creativ. Textul pur EN fără editare stricativă iese sterilizat. Soluția: [[narcis-voice]] — Romglish în mod intențional + reguli explicite pentru texte EN-only (X posts, landing pages).
