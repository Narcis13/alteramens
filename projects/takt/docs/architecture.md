---
parent: "[[takt/takt|Takt]]"
type: doc
---

# Takt - Arhitectura

## Principiu Fundamental

O singură bază de date SQLite este sursa de adevăr. CLI-ul o operează direct (fără server). Web-ul o operează prin Hono HTTP. Ambele emit evenimente pe același event bus; subscribers reacționează uniform indiferent de origine.

## Layere

### CLI Layer (`src/*.ts`)
Fiecare fișier `cli-<domain>.ts` expune comenzi pentru o entitate (board, column, card, label, comment, notification, artifact, trigger, search). Toate importă direct `db.ts` — fără HTTP intermediar.

- `cli.ts` — router de comenzi + flag parsing
- `cli-utils.ts` — session loading, id truncation, JSON output helpers
- `cli-auth.ts` — register/login/logout, scrie `~/.takt/config.json`

### Server Layer (`src/src/`)
- `db.ts` — schema SQLite + migrations (folosește `bun:sqlite` direct)
- `routes.ts` — Hono routes per entitate
- `index.ts` — server entry

### Event System
```
event-types.ts      # typed event definitions (discriminated unions)
event-bus.ts        # emit / subscribe, synchronous dispatch
activity-subscriber.ts    # scrie log activitate în DB
notification-subscriber.ts # generează notificări utilizator
trigger-engine.ts   # execută automatizări declarate
sse-manager.ts      # push events către browser via SSE
ws-manager.ts       # duplex WebSocket channel
```

Emiterea e synchronous; fiecare handler e independent. Adding a feature = adăugare event type + subscriber.

### UI Layer (`src/src/ui/`)
React 19 SPA. Nu folosește Vite — probabil servit direct prin Hono + JSX runtime Bun.

**Componente principale:**
- `App.tsx` — root router
- `BoardList.tsx` — lista boards user
- `BoardView.tsx` — Kanban board cu drag-drop
- `CalendarView.tsx` — calendar day/week cu drag-drop + polish
- `CardModal.tsx` — edit detaliat card
- `QuickCreatePopover.tsx` — create rapid
- `BoardArtifacts.tsx` — gestiune attachments
- `TriggerManager.tsx` — UI pentru automation rules
- `NotificationBell.tsx` — bell icon cu live updates
- `LoginPage.tsx` — auth form
- `api.ts` — client HTTP către routes

**Utilities:**
- `board-utils.ts`, `card-utils.ts` — pure helpers
- `render-inline.tsx` — inline edit patterns
- `social-interactions.test.ts` — business logic testabil

## Data Model (inferat)

```
boards     (id, name, ownerId, createdAt)
columns    (id, boardId, name, position)
cards      (id, columnId, title, description, position, dueDate, createdAt)
labels     (id, boardId, name, color)
card_labels (cardId, labelId)
comments   (id, cardId, userId, body, createdAt)
artifacts  (id, cardId, name, contentType, data, createdAt)
notifications (id, userId, type, payload, read, createdAt)
activity   (id, actorId, entityType, entityId, action, createdAt)
triggers   (id, boardId, event, conditions, actions, enabled)
users      (id, username, passwordHash, createdAt)
```

## Session Management

`~/.takt/config.json`:
```json
{
  "userId": "user_xxxxx",
  "username": "alice",
  "dbPath": "/absolute/path/to/data/kanban.db"
}
```

DB resolution priority:
1. Local project `data/kanban.db` (dacă rulezi în repo)
2. `dbPath` din session (dacă rulezi în altă parte)
3. Error dacă niciunul

Auth enforcement în `cli-utils.ts` — comenzile protejate verifică session înainte de orice DB access.

## Event Flow (exemplu: card move)

```
CLI: takt card move <cardId> --column <newColId>
  ↓ cli-card.ts → db.updateCardColumn()
  ↓ eventBus.emit({ type: 'card.moved', cardId, from, to })
  ↓
  ├─ activitySubscriber → insert activity row
  ├─ notificationSubscriber → notify watchers
  ├─ triggerEngine → check matching triggers → execute actions
  ├─ sseManager → push to open browser tabs
  └─ wsManager → push via WS channel

Parallel din Web:
HTTP: PATCH /api/cards/:id/move → routes.ts → same db.updateCardColumn()
  ↓ same eventBus.emit
  ↓ same subscribers fire
```

Pattern-ul elimină drift între CLI și HTTP — orice schimbare în business logic trăiește într-un singur loc.

## Trigger Engine

Declarative. Un trigger:
```json
{
  "boardId": "...",
  "event": "card.moved",
  "conditions": [{ "field": "to.name", "op": "eq", "value": "Done" }],
  "actions": [{ "type": "notify", "target": "owner" }]
}
```

Engine-ul ascultă event bus-ul, matcheză triggers per eveniment, execută actions.

## Real-Time Channels

**SSE manager** — unidirectional (server → browser), uses for general push.
**WS manager** — bidirectional, pentru collaboration cases (typing indicators, live cursors — infrastructure deja prezentă).

Ambele sunt subscribers pe event bus — nu știu de business logic, doar propagă evenimente tipizate către clients conectați.

## Testing Strategy

Co-located `*.test.ts` lângă fiecare modul:
- `cli-board.test.ts`, `cli-card.test.ts`, `cli-column.test.ts`, `cli-misc.test.ts`
- `routes.test.ts` + specializate (card-detail, card-labels, date-validation, labels, search-reorder, triggers)
- `event-bus.test.ts`, `trigger-engine.test.ts`, `sse-manager.test.ts`, `ws-manager.test.ts`
- UI: `BoardView.test.tsx`, `CalendarView.test.tsx` + variante (week, weekdrag, dragdrop, polish)
- Temp dirs `/tmp/brn-test-*` pentru I/O isolation

Rulat cu `bun test`. TypeCheck separat cu `bunx tsc --noEmit`.

## Build & Distribution

- `bun install && bun link` → `takt` command global
- `bun run serve` → dev server
- `build.ts` present — potențial compile la single binary via `bun build --compile`
- Nu publicat pe npm încă (`private: true` în package.json)

## BRN Integration

Repo-ul găzduiește și framework-ul BRN (`.brn/`):
- `specs/` — feature specs (status: ready/active/done)
- `vault/` — knowledge compounding (patterns, anti-patterns, decisions)
- `history/` — per-run narrative + metadata
- `nightshift.sh` — loop autonomous Thinker (Opus) → Builder

Aproape tot codul takt a fost produs prin acest loop. Commit history conține mesaje ca `feat(events-triggers): complete AC1 — event bus integration` care reflectă gate-urile BRN (acceptance criteria, per-step commits).
