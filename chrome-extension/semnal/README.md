# Semnal — Chrome Extension

Chrome MV3 extension cu două funcții:

1. **Capture de pe orice site** — selectezi text (sau nimic) → overlay cu pilon → salvezi în buffer + copy markdown.
2. **Reply Radar pe X.com** — highlight-ează posturi din `targets.md` pe timeline, cu badge de pilon + buton „Draft reply" care generează comanda `/semnal-reply` pentru Claude Code.

Complementar cu pluginul Obsidian `semnal-capture` și CLI-ul `semnal`. Scrie **separate section** (`## Raw captures (Browser)`) la export, ca să nu se amestece cu celelalte canale.

## Instalare (o singură dată)

1. Chrome → `chrome://extensions` → toggle **Developer mode** (dreapta-sus).
2. Click **Load unpacked** → selectează directorul `chrome-extension/semnal/` din repo.
3. (Opțional, recomandat) `chrome://extensions/shortcuts` → confirmă:
   - **Semnal — capture**: `Cmd+Shift+Y`
   - **Semnal — toggle radar**: `Alt+Shift+R`
4. Click icon-ul Semnal din bara de extensii → **Settings** → verifică lista de targets.

> Hotkey-ul `Cmd+Shift+Y` e distinct de `Cmd+Shift+X` (pluginul Obsidian) ca să poată rula simultan fără conflict.

## Utilizare — Capture

### Overlay inline (recomandat)
1. Pe orice site, selectează text (sau nu).
2. `Cmd+Shift+Y` → overlay cu:
   - quote pre-populat (selecția)
   - câmp pentru gândul tău (RO/EN/mix)
   - 3 butoane pilon + unassigned
   - suggested pilon (bazat pe keywords)
3. Alege pilon → capture se adaugă la buffer + markdown-ul e copiat în clipboard.
4. Paste în `workshop/x-queue/inbox.md` sub `## Raw captures (Browser)` când revii în Obsidian.

Alternativă: **click dreapta → Semnal: capture selection** (context menu).

### Popup din bara de extensii
Pentru pagini protejate (chrome://, Web Store) sau când preferi UI-ul clasic:
1. Click icon-ul Semnal.
2. Editezi / scrii quote + thought.
3. Alege pilon → capture.

### Buffer + Export
Capture-urile stau în `chrome.storage.local` până le exporți:
- **Export .md** — download fișier `semnal-captures-YYYY-MM-DD.md` cu secțiunea completă gata de lipit.
- **Copy all** — copiază toate entry-urile concatenate în clipboard.
- **Clear** — golește buffer-ul (după ce ai promovat totul în inbox).

## Utilizare — Reply Radar

Pe `x.com` sau `twitter.com`:
1. Extensia scanează timeline-ul (home, list, profile, search — orice vedere cu tweets).
2. Când detectează un post de la un handle din `targets.md` → **highlight vertical** (culoare per pilon) + badge cu pilon/angle + indicator HOT/WARM dacă e în fereastra critică (post <60min + >100 likes + <50 replies = HOT; <3h + >50 likes + <100 replies = WARM).
3. Sub fiecare post match apare buton **✎ Draft reply**.
4. Click → drawer lateral cu:
   - URL-ul postului
   - Text-ul original (pentru context)
   - Semnale (age, likes, replies)
   - Input pentru gândul tău RO
   - **Comanda `/semnal-reply <url> <thought>`** auto-generată
5. **Copy /semnal-reply** → lipește în Claude Code → skill-ul îți dă 3 variante.
6. Alegi varianta, editezi, postezi manual pe X. (Extensia nu postează nimic singur — anti-feature.)

### Codare vizuală piloni
- **P1** (AI-native craft) — indigo `#4F46E5`
- **P2** (51yo builder) — orange `#EA580C`
- **P3** (unsexy problems) — emerald `#10B981`

### Toggle
- `Alt+Shift+R` — ON/OFF rapid.
- HUD jos-dreapta arată count-ul de hit-uri vizibile și starea (⦿ on / ⦾ off).
- Settings → Radar state — persistent.

## Settings

- **Pillars** — editare cheie, label, hints (keywords auto-suggest).
- **Targets** — adaugi handle + pilon + angle; **Import from markdown** parsează secțiuni `## Pilon N —` + linii cu `@handle` din `targets.md` și le merge-uiește.
- **Buffer** — count + export + clear.
- **Shortcuts** — link la `chrome://extensions/shortcuts` pentru rebinding.

## Arhitectură

```
chrome-extension/semnal/
├── manifest.json             # MV3
├── background/
│   └── service-worker.js     # commands, context menu, storage, export
├── popup/                    # toolbar UI
├── options/                  # settings page (pillars, targets, buffer)
├── content/
│   ├── capture-overlay.*     # injected overlay pe <all_urls>
│   └── radar.*               # injected pe x.com + twitter.com
├── lib/
│   ├── pillars.js            # keyword heuristics
│   ├── formatter.js          # markdown entry format
│   └── storage.js            # chrome.storage wrappers (ES module)
└── icons/                    # 16/48/128 PNG
```

**Zero backend.** Totul local. Capture-urile NU se trimit nicăieri decât local + în clipboard (tu decizi unde le pui).

## Format markdown la export

Aceeași convenție ca pluginul Obsidian + CLI, dar cu header distinct:

```markdown
---

## Raw captures (Browser)

> *Append-only from Chrome extension `Semnal`. Rafinate manual...*

### 2026-04-22 14:35 — [Titlu pagină](https://example.com/article) — pilon: P1 — AI-native craft

> text selectat, quoted, dacă a existat selecție

**Thought:** gândul tău, dacă l-ai adăugat
```

Sursa e `[title](url)` în format markdown (faptul că a fost citat din web, nu wikilink). Timestamp local.

## Troubleshooting

**Overlay nu apare pe o pagină** → probabil e `chrome://` sau Web Store (content scripts nu au voie). Folosește popup-ul.

**Radar nu detectează tweet-uri** → verifică că ești pe `x.com` sau `twitter.com`, deschide DevTools și caută `[semnal radar]` warnings. X schimbă selectorii din când în când — update la `extractTweet()` în `content/radar.js`.

**Shortcut conflict cu Obsidian** → `Cmd+Shift+Y` e pentru Chrome extension, `Cmd+Shift+X` pentru Obsidian. Ambele pot coexista.

**Nu vezi icon-ul în bara de extensii** → Chrome o ține default ascuns. Click pe puzzle 🧩 → pin Semnal.

## Out of scope (acum)

- Auto-post / auto-reply (**anti-feature pentru totdeauna**)
- Sync cu filesystem-ul direct (fără native messaging host → folosim clipboard + download .md)
- Metrics pull din X (treaba skill-ului `/semnal-reflect` + X API, nu a extensiei)
- Screenshot capture inline (folosește `semnal capture --shot` CLI)

## Roadmap

- [ ] Native-messaging host care scrie direct în `workshop/x-queue/inbox.md` (elimină paste-step-ul)
- [ ] Integrare cu `/semnal-reply` peste HTTP local (Claude Code expune endpoint → extensia trimite request, primește 3 variante, le pune în drawer)
- [ ] Radar learnings: log de ce handles au fost skipped / engaged, pentru `/semnal-reflect`
- [ ] Filters radar: afișează doar HOT, doar P1, etc.

## Linking în vault

Referință: [[workshop/drafts/semnal-x-growth-system#5.4 Reply Radar]], [[workshop/x-queue/targets]].
