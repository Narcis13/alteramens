---
parent: "[[docraftr/docraftr|docraftr]]"
type: decisions
---

# docraftr - Decizii

| Decizie | Rațiune | Outcome |
|---------|---------|---------|
| JSON `DocumentDefinition` ca singurul contract | Declarativ, diff-friendly, agent-generabil, persistabil în DB | Active |
| Single `DocumentComponent` interface pentru read și input | Același tip folosit în `report`, `form`, `hybrid` — evită duplicarea | Active |
| Component registry pe cheie `type:mode` | `text:read` și `text:input` coexistă fără colision, mode e prima cetățenie | Active |
| Conditions recursive (AND/OR) peste FieldCondition | Expresivitate suficientă fără a inventa un DSL de expressions | Active |
| Binding prin dot-notation paths (nu expressions) | Simplu, agent-parseable, fără sandbox pentru eval | Active |
| Dual HTTP + CLI dintr-o singură definiție action | Un endpoint = un CLI command = o tool definition; evită drift | Active |
| Loom UI vendored în `vendor/loom/` | Zero dependency externă pe build, control complet pe asset bundling | Active |
| SQLite + Drizzle (nu Postgres) | Single-file, zero-config, potrivit pentru embed în Bun CLI | Active |
| Multi-tenancy by default (tenantId în fiecare query) | Refactor ulterior pentru multi-tenant e dureros; scris așa de la început | Active |
| Validatori români ca layer separat | CUI/CNP/IBAN sunt reutilizabile, nu sunt legate de rendering | Active |
| `createDocraftrTools()` ca agent toolkit first-class | Documentele sunt target natural pentru agenți; tool-urile trebuie să existe day-one | Active |
| Theme prin CSS custom properties injectate inline | Nu necesită build step, tema e doar data | Active |
| Bun ca runtime (nu Node) | Consistent cu restul Alteramens; bun:sqlite nativ | Active |
| Zod pentru validation la toate nivelurile | Același tool pentru action input, component props, document schema | Active |
| `defineAction(meta, schema, handler)` pattern | Forțează metadata explicitly declarată; enables introspection pentru CLI/HTTP/tools | Active |
| PDF rendering deferred | HTML e output-ul primar; PDF se adaugă ulterior peste HTML | Pending |
| Template marketplace / library | v0.1 include reference templates, dar distribuția publică e viitoare | Pending |
