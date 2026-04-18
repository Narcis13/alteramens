---
status: active
type: saas
repo: https://github.com/Narcis13/brn
stack: Bun, TypeScript, Hono, React 19, SQLite, Nanoid
version: v0.1.0
tags: [saas, kanban, trello-clone, cli, web, dual-interface, real-time, event-driven, brn-built]
license: MIT
created: 2026-03-17
updated: 2026-04-18
---

# Takt

**Trello-style Kanban board — CLI + web din aceeași bază de cod, construit autonom cu framework-ul BRN.**

## Ce este

Takt este un clon Trello self-hosted cu două interfețe concurente peste aceeași bază de date SQLite:
- **CLI** (`takt`) — operează direct pe DB, fără server pornit
- **Web** (`takt serve`) — Hono backend + React 19 frontend, real-time via SSE + WebSocket

Notă importantă: repo-ul se numește `brn` pentru că găzduiește **și** framework-ul BRN (autonomous coding agent), care a fost folosit pentru a construi takt. Takt e aplicația; BRN e metoda.

## Ce NU este

- Nu e multi-workspace SaaS cu billing — e single-tenant, self-host
- Nu e mobile app — web + CLI, nimic native
- Nu e real-time collaboration cu CRDT — last-write-wins, notificări via SSE/WS
- Nu e doar un demo — are feature depth neașteptată (triggers, calendar view, artifacts, labels, comments)

## Value Proposition

- **Dual interface** — CLI pentru power users + automatizare, Web pentru vizualizare/drag-drop
- **Zero-setup** — SQLite single file, `bun link` și ai `takt` global
- **Event-driven core** — event bus tipizat cu subscribers (activity, notification); foundation pentru triggers/automations
- **Triggers engine** — automatizări declarative pe evenimente (`on card move → do X`)
- **Calendar view** — alternativă la board view, cu drag-drop pe săptămână/zi
- **Artifacts** — files/content atașat de carduri, exportabile
- **Real-time updates** — SSE manager + WS manager pentru UI reactiv la schimbări CLI

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun (no Node, no npm) |
| Language | TypeScript (strict) |
| HTTP | Hono |
| Database | SQLite (`bun:sqlite`, direct — no ORM) |
| Frontend | React 19 + react-dom 19 |
| IDs | nanoid |
| Real-time | SSE + WebSocket (dual channels) |
| Testing | `bun test` (co-located `*.test.ts`) |
| Build | Bun native |

## Arhitectura

```
brn/ (repo)
├── src/                  # CLI layer — direct SQLite access
│   ├── cli.ts            # Entry point (bin: takt)
│   ├── cli-auth.ts       # register / login / whoami / logout
│   ├── cli-board.ts      # board CRUD
│   ├── cli-column.ts     # column CRUD + reorder
│   ├── cli-card.ts       # card CRUD + move
│   ├── cli-label.ts      # labels per board
│   ├── cli-comment.ts    # comments on cards
│   ├── cli-notification.ts
│   ├── cli-search.ts     # cross-board card search
│   ├── cli-artifact.ts   # file/content attachments
│   ├── cli-trigger.ts    # automation triggers
│   └── cli-utils.ts      # session, id truncation, flag parsing
├── src/src/              # Server + web app
│   ├── db.ts             # SQLite schema + migrations
│   ├── routes.ts         # Hono HTTP routes
│   ├── event-bus.ts      # typed event bus
│   ├── event-types.ts    # event shape definitions
│   ├── activity-subscriber.ts
│   ├── notification-subscriber.ts
│   ├── sse-manager.ts    # server-sent events
│   ├── ws-manager.ts     # websocket channel
│   ├── trigger-engine.ts # automation executor
│   ├── date-utils.ts
│   └── ui/               # React 19 SPA
│       ├── App.tsx, index.tsx
│       ├── BoardView.tsx, BoardList.tsx
│       ├── CalendarView.tsx (day/week + drag-drop)
│       ├── CardModal.tsx, QuickCreatePopover.tsx
│       ├── BoardArtifacts.tsx
│       ├── TriggerManager.tsx
│       ├── NotificationBell.tsx
│       ├── LoginPage.tsx
│       └── api.ts
├── .brn/                 # BRN agent framework state
│   ├── specs/, vault/, history/, archive/
│   ├── nightshift.sh     # autonomous two-phase loop
│   └── thinker.md
├── TAKT_CLI_GUIDE.md     # CLI reference
└── CLAUDE.md             # BRN coding rules
```

## Session & DB Resolution

Takt rezolvă DB-ul astfel:
1. Dacă rulezi din rădăcina proiectului → `data/kanban.db` local
2. Altfel → `dbPath` din `~/.takt/config.json` (setat la login)

Sesiunea: `~/.takt/config.json` cu `{ userId, username, dbPath }`.

## CLI Commands

```bash
takt auth register <username> <password>
takt auth login <username> <password>
takt auth whoami | logout

takt board list|create|show|delete
takt column list <boardId> | create | reorder
takt card create <boardId> --column <columnId> --title "..."
takt card list|show|move|delete
takt label list|create|attach
takt comment add <cardId> "..."
takt search <boardId> "query"
takt artifact add|list|export
takt trigger list|create|delete
takt serve --port 3000
```

Global flags: `--json`, `--quiet`, `--full-ids`, `--yes`, `--help`, `--version`.

## Features Livrate

- Boards, columns, cards cu drag-drop
- Labels multi-culoare per board
- Comments pe carduri
- Artifacts (attach content + export)
- Search cross-column pe board
- Notifications (bell UI + persist)
- Trigger engine (automation pe evenimente)
- Calendar view (day + week, drag-drop pe zile)
- Quick-create popover
- Auth local cu session persist
- Event bus + subscribers (activity log + notifications)
- SSE + WebSocket pentru real-time UI

## Event-Driven Architecture

```
CLI/HTTP action
      ↓
   Service
      ↓
  event-bus.emit(TypedEvent)
      ↓
  ┌──────┬───────────────┬─────────┐
  ▼      ▼               ▼         ▼
activity  notification  trigger   sse/ws
subscriber subscriber   engine    managers
  ↓          ↓            ↓         ↓
DB log   DB notif    automation  UI push
```

## Stare Curentă

- **v0.1.0 active** — ~30 commits, dezvoltare activă
- ~825K TypeScript + 75K CSS
- ~15 CLI comenzi, ~20 React components
- Test coverage decent (`*.test.ts` co-located, routes + components acoperite)
- Ultimul merge: `feat/events-triggers` (evenimente + triggers)
- Construit autonom cu BRN (Thinker Opus → Builder cycles)

## Interconexiuni Alteramens

- **BRN framework** — același repo; takt e testbed-ul real pentru agent-ul autonom. Fiecare feature din takt a fost spec-uit și livrat prin `/next` + `/nightshift`.
- **BunBase** — overlap conceptual (Bun + SQLite + API auto-generat); BunBase ar putea deveni backend-ul takt-ului ulterior.
- **Robun** — takt-ul poate fi acționat via Robun (Telegram bot comandă `takt card create`).
- **Loom UI / docraftr** — UI-ul React actual e vanilla; potențial refactor cu componente Loom.

## Filtru Fundament

- **Skill Era?** Medium — takt în sine e funcționalitate, dar **procesul de construire cu BRN** e exact Skill Era: judgment encodat în Thinker prompts + vault knowledge.
- **Specific Knowledge?** Parțial — Kanban e commodity; însă triggers + event bus + dual CLI/Web interface = pattern-uri transferabile.
- **Leverage?** Da — o DB schema → CLI + HTTP + Real-time UI simultan.
- **Compound?** Da — vault-ul BRN acumulează învățături; fiecare feature livrat face următorul mai rapid.
- **Accountability?** Medium — repo public, nume real, dar fără GTM explicit pentru takt ca produs.

## Legături

- [[takt/docs/architecture|Arhitectură detaliată]]
- [[takt/decisions/decisions|Log decizii]]
- [[takt/learnings/learnings|Ce am învățat]]

## Next Steps

- [ ] Clarificare positioning: takt ca produs vs takt ca showcase BRN
- [ ] Deployment guide (Docker / single binary via `bun build --compile`)
- [ ] Multi-user collab (azi e single-user per DB)
- [ ] Mobile-friendly UI (calendar view dificil pe mobil)
- [ ] Robun integration (create card din Telegram)
- [ ] Potențial: publicare `takt` ca binary standalone pe GitHub Releases
