---
parent: "[[loom-ui/loom-ui|Loom UI]]"
type: learnings
---

# Loom UI - Ce am invatat

## Design

- "The CSS is the component" e o inversare importantă față de frameworks JS: CSS e sursa de adevăr, nu codul
- Data attributes ca DOM contract sunt mai stabili decât clase — renaming classes e un anti-pattern pentru agenți
- Manifeste JSON per componentă permit agenților să înțeleagă contractul fără să parseze HTML/CSS
- Separarea token / primitive / recipe / pattern e o ierarhie naturală pentru UI systems

## Agent-Native Thinking

- Agenții au nevoie de un "single context document" (.loom/context.json) — nu pot scana manual toată structura
- Audit + repair e esential pentru agent workflows: agentul generează, auditul verifică, repair-ul corectează deviațiile
- `data-state` ca single source of truth pentru JS este un contract simplu și robust pe care agenții îl pot respecta consistent

## Process

- Spec complet înainte de implementare (LOOM-SPEC.md) e valoroasă pentru un framework — interface stabila înainte de cod
- CLI-first la design permite agentilor să opereze framework-ul la fel cum operează humans
