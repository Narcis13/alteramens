---
parent: "[[loom-ui/loom-ui|Loom UI]]"
type: doc
---

# Loom UI - Arhitectura

## Core Concept

**The CSS is the component. The JSON manifest is the documentation. The AI is the compiler. The CLI is the conductor.**

## Layere

### Token System (`registry/tokens/`)
CSS custom properties organizate în straturi:
- `palette.css` → culori raw
- `semantic.css` → semnificatie (--color-action-primary)
- `aliases.css` → shorthand-uri
- `spacing.css`, `typography.css`, `effects.css`, `motion.css`

### Base (`registry/base/`)
- `reset.css` - normalize browsere
- `prose.css` - typography pentru content

### Core JS (`registry/core/`)
- `dom.js`, `events.js`, `focus.js`, `motion.js`, `store.js`, `utils.js`
- Zero dependency vanilla JS utilities

### Registry Layers
```
tokens/ → base/ → primitives/ → recipes/ → patterns/
```
- **primitives** - button, input, card, badge...
- **recipes** - dialog, tabs, dropdown... (composte din primitives)
- **patterns** - auth-form, dashboard-shell, crud-table... (full UX flows)

### Themes (`registry/themes/`)
Fiecare temă redefine CSS custom properties. Componente nu se schimbă.

## CLI Architecture (`src/`)

### Commands
- `init` - copiază tokens + reset, creează `.loom/config.json`
- `add` - copiază componenta din registry în proiect
- `audit` - scanează HTML pentru DOM contract violations
- `repair` - auto-fix violations (rewrite data-attributes conform manifest)
- `context` - aggregates toate manifeste în `.loom/context.json`
- `conform` - re-aliniază componente la token changes

### Audit Engine (`src/audit/`)
- `rules.ts` - reguli de validare (data-ui prezent, data-state valid...)
- `checker.ts` - DOM contract checker
- `reporter.ts` - formatted output (human + JSON)
- `repairer.ts` - auto-fix engine

### Parser (`src/parser/`)
- `html-parser.ts` - lightweight parser pentru audit (no full DOM needed)
- `css-parser.ts` - token extraction din CSS files

## Attribute Protocol

```html
<div data-ui="dialog" data-state="closed">
  <button data-part="trigger">Open</button>
  <div data-part="overlay" hidden></div>
  <div data-part="panel" data-variant="default" data-size="md">
    <header data-part="header">
      <h2 data-part="title">Dialog Title</h2>
    </header>
    <div data-part="body">Content</div>
  </div>
</div>
```

```css
[data-ui="dialog"][data-state="open"] [data-part="overlay"] { }
[data-ui="button"][data-variant="primary"] { }
```

## Context Document (`.loom/context.json`)

Agregat generat de `loom context` pentru agent injection:
```json
{
  "version": "1.0",
  "components": [...all manifests...],
  "tokens": [...all CSS custom properties...],
  "themes": ["default", "midnight", "paper", "brutalist"]
}
```
