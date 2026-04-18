---
parent: "[[docraftr/docraftr|docraftr]]"
type: doc
---

# docraftr - Arhitectura

## Principiu Fundamental

Un document e o definiție JSON declarativă. Engine-ul o randează prin layere ierarhice: Core → Components → Engine → Loom. Peste engine, layere orthogonale expun același capability în multiple canale (HTTP, CLI, agent tools).

## Subsisteme

### `src/core/`
Browser-safe primitives. Fără DB, fără Node APIs.
- TypeScript types pentru `DocumentDefinition`, `DocumentSection`, `DocumentComponent`
- Zod schemas pentru validare
- Component registry: `getComponentType(type, mode)` — cheia e `type:mode` (ex: `text:read`, `text:input`)
- Condition evaluator (recursive AND/OR peste `FieldCondition` / `ConditionGroup`)
- Form validation primitives

### `src/components/`
70+ `ComponentTypeDefinition`. Fiecare expune:
```typescript
{
  type: string,
  mode: 'read' | 'input' | 'both',
  validate(component, data): ValidationResult,
  renderLoom(component, resolvedData, ctx): string
}
```

Grupate pe domeniu:
- **content** — text, heading, rich text
- **layout** — spacers, dividers, containers
- **data** — tables, lists, key-value pairs
- **financial** — amounts, totals, tax lines
- **romanian** — invoice blocks, company blocks, ID cards
- **interactive/** — input, textarea, select, radio, checkbox, date, multi-select (subdirectory separat)

Registration: `registerReadOnlyComponents()` + `registerInteractiveComponents()`. Registry global, necesar înainte de orice render.

### `src/engine/`
Orchestrator de rendering.
- `renderDocument(definition, data, ctx)` — punctul de intrare
- Iterează sections → evaluează `skip_when` → pentru fiecare component: resolve `bind`, validate, render
- `loom-html.ts` asamblează reports (`assembleLoomDocument`)
- `loom-form.ts` asamblează forms (cu `l-model` binding, pagination, reactive state)

**Data flow:**
```
DocumentDefinition + data
  → iterate sections (skip_when check)
    → iterate components (visible_when check)
      → resolve bindings (dot-notation paths)
      → lookup ComponentTypeDefinition
      → validate() → renderLoom() → HTML fragment
    → assembleLoomSection (stack | grid)
  → assembleLoomDocument | assembleLoomForm
  → inline Loom CSS/JS + theme tokens as CSS custom properties
  → final HTML string
```

### `src/loom/`
Integrare cu Loom UI vendored în `vendor/loom/`.
- `assets.ts` — lazy-load + cache CSS/JS
- `tokens.ts` — map `DocumentTheme` la CSS custom properties (`--color-*`, `--space-*`)

### `src/db/`
SQLite + Drizzle ORM. Trei tabele:
- `docraftrTemplates` — stochează `DocumentDefinition` ca JSON
- `docraftrSubmissions` — date primite din forms
- `docraftrRenders` — HTML persistat pe render

Fiecare query e scoped pe `tenantId`.

### `src/services/`
CRUD business logic. Fiecare metodă primește `tenantId`. Nu expune direct nimic — actions sunt interfața publică.

### `src/actions/`
`defineAction(meta, zodSchema, handler)`. Metadata include metodă HTTP + path; Zod schema validează input-ul. Layer-ul dual auto-înregistrează actionul ca HTTP endpoint + CLI command.

### `src/dual/`
- `createDocraftrApp()` — factory care wireş totul
- `hono-adapter.ts` — înregistrează Hono routes din action metadata
- `cli-adapter.ts` — parsează format `action:subaction key=value`

### `src/agent/`
Agent toolkit pentru Claude:
- API client
- `createDocraftrTools()` — tool definitions compatibile cu Claude tool use API
- Document generation prompts
- Reference templates (invoice, contact form, etc.)

### `src/validators/`
- `cui.ts` — Cod Unic de Înregistrare (firmă RO) cu checksum
- `cnp.ts` — Cod Numeric Personal (persoană fizică RO)
- `iban.ts` — IBAN cu checksum mod-97

## Condition System

Recursive. Două forme:

```typescript
type Condition = FieldCondition | ConditionGroup

interface FieldCondition {
  field: string                // dot-path
  op: 'eq'|'neq'|'gt'|'lt'|'in'|'empty'|...
  value?: unknown
}

interface ConditionGroup {
  op: 'and' | 'or'
  conditions: Condition[]
}
```

Folosit în `skip_when` (section), `visible_when` (component, both modes), `required_when` (input mode).

## Data Binding

Dot-notation. `"invoice.lines.0.total"` traversează obiecte și array-uri. Nu există template strings — bind-ul e un path, nu o expresie.

```json
{
  "type": "text",
  "mode": "read",
  "bind": { "value": "supplier.name" }
}
```

## Theme System

`DocumentTheme` → CSS custom properties injectate inline în HTML output. Componente nu știu de temă; citesc tokens.

## Multi-Tenancy

`ActionContext` poartă `tenantId`. Services îl propagă la toate query-urile DB. Zero cross-tenant leakage by default.

## Loom HTML Attributes

Contract DOM stabil (moștenit din Loom UI):
- `data-ui` — component type
- `data-size`, `data-variant` — visual axis
- `l-model` — two-way binding (forms)
- `l-show` — conditional visibility
- `l-on:*` — event handlers

## Adding a Component

1. Define `ComponentTypeDefinition` în fișierul relevant din `src/components/`
2. Export din `src/components/index.ts`
3. Adaugă în array-ul de registrare potrivit
4. Test în `src/__tests__/components/`

## Adding an Action

1. `defineAction()` în `src/actions/`
2. Export din `src/actions/index.ts`
3. Adaugă în `allActions()`
4. Dual layer auto-înregistrează HTTP + CLI

## Testing

Bun test runner. Structură:
```
src/__tests__/
├── core/          # registry, conditions, validation
├── components/    # per-component unit tests
├── engine/        # rendering integration
├── actions/       # action-level tests
└── validators/    # CUI/CNP/IBAN checksum cases
```
