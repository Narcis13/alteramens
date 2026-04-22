# Semnal Capture — Obsidian plugin

Hotkey capture al textului selectat (sau prompted) din orice notă Obsidian,
direct în `workshop/x-queue/inbox.md`. Complementar cu `semnal` CLI.

## Activare (o singură dată)

1. Obsidian → Settings → Community plugins → **Turn on community plugins**
   (dacă nu e deja activ).
2. Restart Obsidian (sau Cmd+R în app) pentru ca plugin-ul să fie detectat.
3. Settings → Community plugins → lista **Installed** → activează
   **Semnal Capture**.
4. Opțional: Settings → Hotkeys → caută "Semnal" → confirmă că
   `Cmd+Shift+X` e setat (default).

## Utilizare

### Cu selecție
1. În orice notă, selectează text.
2. `Cmd+Shift+X`.
3. Modal apare cu textul pre-populat + suggested pilon (pe baza keyword-urilor).
4. Click pe un pilon (sau `Alt+1/2/3` pentru P1/P2/P3, `Alt+0` pentru unassigned)
   → se scrie în inbox.

### Fără selecție
1. `Cmd+Shift+X` oriunde în vault.
2. Tastezi textul direct în modal.
3. Opțional adaugi note (unghi / pattern-tag).
4. Click pilon → capture.

## Ce se scrie în inbox

La primul capture se creează automat secțiunea:

```markdown
## Raw captures (Obsidian)

> *Append-only from Obsidian hotkey (`Cmd+Shift+X`)...*
```

Fiecare entry arată așa:

```markdown
### 2026-04-22 14:35 — [[owner/Who am i]] — pilon: P2 — 51-year-old builder

> textul capturat, quoted

**Note:** unghiul meu despre asta
```

- **Source** e wikilink către nota activă (sau `external` dacă nu ești într-o notă).
- **Timestamp** local.
- **Pilon** din setări (default: P1/P2/P3 ca în `pillars.md`).

## Separare față de CLI

Plugin-ul scrie sub `## Raw captures (Obsidian)`, în timp ce CLI-ul `semnal capture`
scrie sub `## Raw captures (CLI)`. Ambele sunt append-only, amândouă fără frontmatter
touch. Structura pe piloni (S001, S002...) din capul fișierului rămâne neatinsă.

## Setări

- **Inbox path** — default `workshop/x-queue/inbox.md` (dacă nu există, se creează
  stub cu frontmatter minimal).
- **Section header** — default `## Raw captures (Obsidian)`.
- **Pillars** — hardcoded default (P1/P2/P3). Pentru custom: editează
  `.obsidian/plugins/semnal-capture/data.json` manual și restart plugin.

## Out of scope

- Screenshot (vezi `semnal capture --shot` CLI).
- Promovare din inbox → `ready/` — manual sau via `/semnal-draft`.
- Metrici, scheduling, sync — vezi roadmap `workshop/drafts/semnal-x-growth-system.md` §9.

## Cum funcționează tehnic

Pur JavaScript, zero build step. Un singur fișier `main.js` + `manifest.json`.
Folosește `obsidian.Modal`, `obsidian.Setting`, `vault.read/modify/create`.
Cross-platform (desktop + mobile), deși fluxul principal e gândit pentru desktop.
