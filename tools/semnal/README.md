# semnal CLI

Capturi rapide în `workshop/x-queue/inbox.md`. Zero dependențe (bash + macOS screencapture).

## Setup (o singură dată)

Alege una din variante:

**(a) Alias în `~/.zshrc`:**

```bash
echo 'alias semnal="$HOME/DEV/alteramens/tools/semnal/semnal"' >> ~/.zshrc
source ~/.zshrc
```

**(b) Symlink în `/usr/local/bin/` (funcționează global, indiferent de shell):**

```bash
sudo ln -sf "$HOME/DEV/alteramens/tools/semnal/semnal" /usr/local/bin/semnal
```

**(c) Rulare directă fără setup:**

```bash
./tools/semnal/semnal capture "..."
```

Notă: `semnal` detectează vault-ul căutând `wiki/.faber.toml` walking-up de la CWD.
Funcționează corect oriunde ești în interiorul `alteramens/`.

## Utilizare

```bash
semnal capture "pattern-ul ăsta cu skills trebuie spus"
semnal capture "experimentul tocmai a mers la prima rulare" --shot
semnal capture "reply interesant de riff-uit" -s   # -s e alias pentru --shot
semnal --help
```

### `--shot`
Rulează `screencapture -i` (area select, ca `Cmd+Shift+4`).
PNG-ul e salvat în `workshop/x-queue/attachments/YYYY-MM-DD-HHMMSS.png` și
referențiat inline în entry-ul din inbox (`![shot](attachments/...)`).

Dacă apeși `Esc` pe crosshair → nimic nu se scrie în inbox (exit 2).

## Unde ajunge capture-ul

`workshop/x-queue/inbox.md` → secțiunea `## Raw captures (CLI)` (auto-creată la
prima utilizare, la finalul fișierului). Structura existentă pe piloni (S001-S010
etc.) nu e atinsă — capturile CLI vin separat, le organizăm/draftăm manual cu
`/semnal-draft`.

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | succes |
| 1 | args invalizi |
| 2 | screenshot anulat (Esc) |
| 3 | vault root negăsit |

## Out of scope (azi)

`queue`, `schedule`, `publish`, `engage`, `sync`, `reflect` — vezi roadmap în
`workshop/drafts/semnal-x-growth-system.md` §9. Când MVP bash devine insuficient
(state, SQLite, X API), migrăm la TypeScript + Bun (stack declarat în PRD §6).
