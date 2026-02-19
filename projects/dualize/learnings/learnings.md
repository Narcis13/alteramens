---
parent: "[[dualize/dualize|Dualize]]"
type: learnings
---

# Dualize - Ce am invatat

## Design Phase

- Pattern-ul "define once, expose both" apare in multe proiecte Alteramens - validarea ca librarie separata era overdue
- Zod schemas sunt suficient de expresive incat sa genereze CLI args, help text si OpenAPI spec dintr-o singura sursa
- Convention-over-config reduce friction dar trebuie sa oferi escape hatches (meta overrides) pentru cazuri edge
- `Bun.Glob` nativ inlocuieste complet dependente ca `fast-glob` sau `globby`

## Architecture

- Separarea scanner → registry → adapters permite testare izolata a fiecarei componente
- ActionContext trebuie sa fie identic indiferent de transport - asta e cheia reutilizabilitatii
- Error codes (NOT_FOUND, VALIDATION) sunt mai utile decat HTTP status codes direct - adaptoarele traduc

## Process

- Design doc inainte de cod a cristalizat arhitectura - fara refactoring major asteptat
- Implementation plan cu TDD (test first per task) da incredere ca fiecare piesa functioneaza independent
- Ideea a venit din pattern-ul repetitiv observat in BunBase, DavidUp, Robun - toate aveau API + CLI separate
