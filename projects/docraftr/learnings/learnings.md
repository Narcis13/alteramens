---
parent: "[[docraftr/docraftr|docraftr]]"
type: learnings
---

# docraftr - Ce am învățat

## Design & Architecture

- Separarea strictă pe layere (Core → Components → Engine → Loom → DB → Services → Actions → Dual → Agent) face codul navigabil și testabil — fiecare layer știe doar ce are sub el.
- Registry-ul global cu cheie `type:mode` e o soluție elegantă pentru a avea același nume de componentă în două moduri (read/input) fără a duplica cod sau a complica API-ul.
- Un singur `DocumentComponent` interface pentru ambele moduri (read + input) reduce surface area-ul dramatic — un hybrid doc amestecă literalmente aceleași componente.
- Conditions recursive (AND/OR peste FieldCondition) oferă expresivitate suficientă fără overhead-ul unui expression language custom.

## Implementation

- Dot-notation paths pentru binding (`"invoice.lines.0.total"`) sunt mult mai ușor de parsat și validat decât template strings — și sunt complet agent-parseable.
- `defineAction(meta, zodSchema, handler)` ca pattern unificator permite HTTP router, CLI parser și agent toolkit să consume aceeași sursă — zero drift între canale.
- Injectarea CSS/JS Loom inline în output elimină dependency-ul la runtime, dar mărește HTML-ul considerabil (showcase report = 226KB). Trade-off acceptabil pentru self-contained documents.
- Tenant scoping la nivel de service (nu de query) e mai robust — un developer care uită să propage `tenantId` primește compile error, nu data leak.

## Agent-Native Design

- `createDocraftrTools()` day-one schimbă fundamental modul în care documentele sunt create — un agent poate genera un `DocumentDefinition` end-to-end și îl poate randa imediat.
- Reference templates în `src/agent/` sunt esențiale: un agent fără exemplare concrete generează definiții generice. Templatele ancorează stilul.
- Declarative JSON > generated code: agent poate edita JSON (diff-friendly), nu poate edita sigur cod runtime.

## Romanian Business Domain

- Validarea CUI/CNP/IBAN cu checksum e non-trivial dar finite — worth a dedicated module, nu scattered prin components.
- Invoice și company blocks ca componente de prim rang economisesc ore la fiecare document românesc nou.
- Specificitatea (Romanian-first) e un avantaj, nu o limitare — nișă cu barieră de intrare.

## Process

- Showcase files (`showcase-report.html`, `showcase-form.json`) ca artifact de dev fac regresii vizibile — un diff pe HTML output e imediat observabil.
- Bun test runner + zero build step = iteration loop foarte scurt; schimbări în components se reflectă instant.
- Structura `src/__tests__/<layer>/` oglindește arhitectura — ușor de știut unde să scrii testul.
