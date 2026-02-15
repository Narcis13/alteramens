---
parent: "[[contzo/contzo|Contzo]]"
type: learnings
---

# Contzo - Ce am învățat

## Din Research

- ANAF OAuth2 are "family" parameter pe refresh tokens - race condition posibil cu concurrent refreshes
- ANAF API poate returna 200 OK cu body gol - trebuie validare response comprehensivă
- XML UBL rounding: diferențe de 0.01 RON la TVA cauzează rejecții sistematice
- Claude API fără prompt caching = $450+/lună. Cu caching + model routing = controlabil
- USB token fizic necesar pentru OAuth inițial + yearly refresh = 45 manual re-auth sessions per year
- ANAF test environment nu reflectă fidel producția
- Claude Agent SDK la v0.2.37 - breaking changes expected, wrap in abstraction layer

## Din Planning

- ~200KB de documentație planificare înainte de prima linie de cod
- Contzo workflow skill (Claude Code) = structured development sessions
- Atomic sessions protocol: 1 plan = 1 session = 1 commit, max 500 LOC
