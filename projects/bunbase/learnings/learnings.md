---
parent: "[[bunbase/bunbase|BunBase]]"
type: learnings
---

# BunBase - Ce am învățat

## Technical

- bun:sqlite TypeScript type definitions need updating (runtime works fine)
- CSS warnings during build sunt cosmetice, fără impact funcțional
- Test isolation issues apar la parallel execution cu database state shared (4 teste fail)
- Collection name collisions în test suite - context.test.ts, hooks.test.ts, server.test.ts
- Custom routes trebuie spread after system routes, before admin routes (admin wildcard)
- Bun.spawnSync util pentru testing build scripts (not just module imports)

## Process

- v0.1, v0.2, v0.3 delivered cu GSD workflow (phases + plans + verification)
- 470+ teste automate dau confidence pentru refactoring
- Schema-in-database pattern allows rapid prototyping fără migrations
