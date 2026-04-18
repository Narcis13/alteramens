---
parent: "[[takt/takt|Takt]]"
type: learnings
---

# Takt - Ce am învățat

## Design & Architecture

- O singură DB pe disk cu două interfețe (CLI + HTTP) elimină întreaga clasă de bugs "feature merge în HTTP dar nu în CLI". Business logic-ul trăiește sub ambele.
- Event bus tipizat e o investiție disproporționat de bună: fiecare feature adăugat (triggers, notifications, activity log, SSE push) s-a conectat fără să modifice cod existent.
- Synchronous event dispatch e suficient pentru single-node app. Nu ai nevoie de queues până n-ai load real — evită overhead-ul.
- CLI care accesează DB direct (fără HTTP) e un multiplicator pentru debugging și scripting — poți automatiza orice workflow fără serverul pornit.
- Dual real-time channels (SSE + WS) sunt utile pentru scenarii diferite: SSE pentru "server → client push simplu", WS pentru "client → client via server".

## Implementation

- `bun:sqlite` direct e suficient de ergonomic dacă query-urile nu sunt complexe — un ORM e overkill pentru schemă de 10 tabele.
- `nanoid` cu truncation la 8 chars în UI terminal e UX win: IDs sunt copy-paste-able dar nu ocupă ecran.
- Session în fișier local (`~/.takt/config.json`) cu DB path absolut permite `takt` global după primul login din repo.
- Drag-drop pe calendar view a fost feature sofisticat care a cerut polish multiplu (vezi commits `CalendarView.polish`, `CalendarView.weekdrag`, `CalendarView.dragdrop`). Drag + recurrent dates + week boundaries nu se livrează într-un singur pass.
- React 19 + Bun JSX runtime fără build step accelerează dev loop-ul dramatic — edit și refresh.

## BRN-Driven Development

- TDD forțat per step (write tests → run → green → commit) produce o bază de cod cu coverage bună by default, nu by effort separat.
- Vault-ul BRN acumulează patterns anti-patterns care se aplică la features viitoare — a treia oară când dai de aceeași clasă de problemă, ai soluția în vault.
- "Never use `any`/`@ts-ignore`" ca regulă hard e inconfortabil scurt-term, dar elimina tech debt pe termen mediu.
- Granularitatea "per step per acceptance criterion" în commits face git history un log al deciziilor, nu doar al codului.
- Claude ca orchestrator (nu ca executor asistat) cere prompt engineering matur: Thinker (Opus) care scrie prompts pentru Builder, cu context din vault + state — `.brn/thinker.md` devine o piesă la fel de importantă ca codul.
- Autonomous loop funcționează când există gate-uri mecanice între pași (tests, tsc, commit). Fără ele, agentul driftează.

## Process

- Feature specs scurte cu acceptance criteria numerate (AC1, AC2, AC3) sunt vastly mai bune decât specs free-form — se poate marca progres granular.
- "Events + triggers" ca feature e point-in-time unde aplicația pivotează din CRUD în platform — foundation pentru toate automation viitoare.
- Co-locarea testelor cu codul (`foo.test.ts` lângă `foo.ts`) reduce frictiunea psihologică de a scrie teste.
- Temp dirs (`/tmp/brn-test-*`) cu cleanup forțat previn cross-test pollution în I/O tests.

## Product Positioning (to explore)

- Takt nu e clar poziționat ca "produs" sau "showcase BRN" — decizia afectează GTM, roadmap și dacă repo-ul trebuie split.
- Dacă takt rămâne showcase, atunci valoarea e în narative ("construit autonom în X zile") — artifact de marketing pentru BRN, nu SaaS.
- Dacă takt devine produs, lipsă multi-user și mobile sunt blockers — nu low-priority polish.
