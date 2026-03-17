---
status: active
type: devtools
repo: local
stack: Bun, TypeScript, HTML, CSS, vanilla JS
version: v0.1.0
tags: [devtools, ui, framework, agent-native, cli, components, html-first]
license: MIT
created: 2026-03-17
updated: 2026-03-17
---

# Loom UI

**Agent-native UI framework — CLI-distributed, manifest-driven, zero-dependency HTML components.**

## Ce este

Loom este un CLI-distributed UI framework care generează și menține componente HTML/CSS/JS plain, folosind manifeste JSON machine-readable. Este proiectat cu AI coding agents ca primary consumer și oamenii ca editor-reviewers.

**Core Thesis:** *The CSS is the component. The JSON manifest is the documentation. The AI is the compiler. The CLI is the conductor. Audit and repair is the superpower.*

## Ce NU este

- Nu e JavaScript framework (no virtual DOM, no JSX, no reactivity)
- Nu e build tool (no webpack, no Vite, no compile step)
- Nu e utility-first CSS (not Tailwind)
- Nu e package importat la runtime (no node_modules în output)
- Nu e design system pentru humans — e design system pentru agenți să parseze

## Value Proposition

- **Agent-first** - manifeste JSON cu contract explicit (slots, variants, states, tokens)
- **Zero dependencies în output** - pure HTML + CSS + vanilla JS
- **CLI-distributed** - `npx @loom-ui/cli` fără instalare locală
- **Audit & repair** - `loom audit` detectează devieri de la contract, `loom repair` le fixează automat
- **Attribute Protocol** - DOM contract stabil prin `data-ui`, `data-part`, `data-state`, `data-variant`, `data-size`
- **Context generator** - `loom context` produce `.loom/context.json` pentru agenți (manifest aggregator)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun.js |
| Language | TypeScript (strict) |
| Distribution | npm (`npx @loom-ui/cli`) |
| Output | Pure HTML + CSS + vanilla JS |
| Manifest | JSON |
| Testing | Bun test runner + happy-dom |

## Arhitectura

```
loom-ui/
├── src/
│   ├── commands/     # init, add, list, inspect, explain, audit, repair, theme, conform...
│   ├── audit/        # rules, checker, reporter, repairer
│   ├── parser/       # html-parser, css-parser
│   ├── generator/    # context.json, manifest aggregator, skill generator
│   └── utils/        # fs, logger, config
├── registry/
│   ├── tokens/       # palette, semantic, spacing, typography, effects, motion
│   ├── base/         # reset, prose
│   ├── core/         # dom.js, events.js, store.js, utils.js
│   ├── primitives/   # button, input, card...
│   ├── recipes/      # dialog, tabs...
│   ├── patterns/     # auth-form, dashboard-shell, crud-table
│   └── themes/       # default, midnight, paper, brutalist
└── tests/
```

## Attribute Protocol (DOM Contract)

| Atribut | Scop | Exemplu |
|---------|------|---------|
| `data-ui` | Component identity | `data-ui="dialog"` |
| `data-part` | Slot role în parent | `data-part="trigger"` |
| `data-state` | Runtime state (JS modifică) | `data-state="open"` |
| `data-variant` | Visual variant (set în markup) | `data-variant="destructive"` |
| `data-size` | Size variant | `data-size="lg"` |

**Regulă:** JS modifică DOAR `data-state`. CSS targetează `[data-state="open"]`. Nicio clasă pentru state.

## CLI Commands

- `loom init` - setup proiect (tokens, reset, .loom/config.json)
- `loom add <component>` - copiază componente din registry în proiect
- `loom list` - listează componente disponibile cu filtrare
- `loom inspect <component>` - afișează manifest complet
- `loom explain <component>` - descriere human-readable pentru agenți
- `loom audit [path]` - verifică DOM contract violations
- `loom repair [path]` - auto-fix violations detectate
- `loom context` - generează `.loom/context.json` (agent manifest)
- `loom theme <apply|list|diff>` - theme management
- `loom conform` - aliniază componente la token changes
- `loom doctor` - validare completă project health

## Manifest Format (exemplu)

```json
{
  "name": "button",
  "version": "1.0.0",
  "description": "Actionable element for user interactions",
  "files": ["button.html", "button.css"],
  "slots": ["root"],
  "variants": ["primary", "secondary", "ghost", "destructive"],
  "sizes": ["sm", "md", "lg"],
  "states": ["default", "hover", "active", "disabled", "loading"],
  "tokens": ["--color-action-primary", "--space-2", "--radius-md"]
}
```

## Stare Curenta

- **v0.1.0** - spec complet, implementare în curs
- Registry cu token system definit
- Spec complet: LOOM-SPEC.md (arhitectura, protocol, commands)
- npm package: `@loom-ui/cli`

## Legaturi

- [[loom-ui/docs/architecture|Arhitectura detaliata]]
- [[loom-ui/decisions/decisions|Log decizii]]
- [[loom-ui/learnings/learnings|Ce am invatat]]

## Next Steps

- [ ] Implementare CLI commands (init, add, list)
- [ ] Audit engine (checker + reporter)
- [ ] Repair engine
- [ ] Context generator pentru agenți
- [ ] Publish pe npm ca `@loom-ui/cli`
- [ ] Integrare cu proiecte Alteramens care au UI (DavidUp, Contzo, BunBase)
