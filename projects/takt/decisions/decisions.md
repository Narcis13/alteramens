---
parent: "[[takt/takt|Takt]]"
type: decisions
---

# Takt - Decizii

| Decizie | Rațiune | Outcome |
|---------|---------|---------|
| CLI + Web peste aceeași DB | Elimină drift între interfețe; o singură sursă de business logic | Active |
| SQLite direct prin `bun:sqlite`, fără ORM | Zero dependency overhead, control complet pe queries, potrivit pentru single-file app | Active |
| Event bus typed ca coloană vertebrală | Orice feature nou = event + subscriber; zero touch pe codul existent | Active |
| Synchronous event dispatch | Simplu de raționat; handlers independenti; fără queue infrastructure pentru MVP | Active |
| SSE + WS paralel | SSE pentru push generic, WS pentru collab viitoare; ambele pe același bus | Active |
| Session în `~/.takt/config.json` cu dbPath | Permite `takt` global după login; DB resolution portabilă | Active |
| ID-uri nanoid, truncate la 8 chars by default | Readable în terminal, `--full-ids` când ai nevoie | Active |
| Drag-drop pe calendar view (nu doar board) | Diferențiator față de Trello; task management cu deadline real | Active |
| Trigger engine declarativ (JSON) | Users pot defini automations fără cod; aliniat cu declarative-schema philosophy | Active |
| React 19 | Latest, no build step via Bun JSX runtime | Active |
| Bun link pentru distribuție locală | Dev-friendly; binary compile ulterior | Active |
| Fără ORM (Drizzle, Prisma, etc.) | Query-urile SQL sunt simple; ORM ar fi adăugat 100KB+ fără beneficiu | Active |
| Repo partajat cu BRN framework | Takt e testbed-ul real pentru agent autonom; knowledge-ul BRN crește cu fiecare feature | Active |
| TypeScript strict, zero `any`/`@ts-ignore` | Moștenit din CLAUDE.md BRN rules; forțează type discipline | Active |
| Test co-location (`foo.test.ts` lângă `foo.ts`) | Ușor de găsit testul; forțează gândirea testabilă | Active |
| TDD per step via BRN | Thinker cere tests first; gate-uri automate de `bun test` + `tsc` | Active |
| Multi-user per-DB deferred | Single-user keeps scope mic; multi-user = rethink auth + row-level access | Pending |
| Mobile UI deferred | Calendar drag-drop nu e fezabil pe mobil în MVP actual | Pending |
| Publicare npm deferred | `private: true` în package.json; scope-ul nu e "product", e "showcase BRN" | Pending |
| Positioning takt ca produs separat | Dacă takt devine real SaaS, repo trebuie split de BRN | Open |
