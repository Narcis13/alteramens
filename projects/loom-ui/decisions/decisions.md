---
parent: "[[loom-ui/loom-ui|Loom UI]]"
type: decisions
---

# Loom UI - Decizii

| Decizie | Ratiune | Outcome |
|---------|---------|---------|
| Agents ca primary consumer, humans ca editor-reviewers | Design system mai simplu (no dynamic styleguide), output optimizat pentru LLM parsing | Active |
| Zero runtime dependencies în output | Orice proiect poate folosi componente fără a adăuga npm dependencies | Active |
| CLI-distributed (`npx @loom-ui/cli`) | Fără instalare locală, agent poate genera componente în orice proiect | Active |
| Attribute Protocol (5 data-* atribute) | DOM contract stabil și machine-readable; CSS targetează atribute, nu clase | Active |
| JSON manifeste per componentă | Documentație machine-readable: slots, variants, states, tokens | Active |
| `data-state` e SINGURUL atribut modificat de JS | Separare clară: styling prin CSS, state prin atribut, no class toggling | Active |
| Pure HTML + CSS + vanilla JS în output | Orice agent sau om poate citi, înțelege și modifica outputul fără toolchain | Active |
| Audit + repair engine | Agenții greșesc; verificarea și auto-fixul contractului e un superpower | Active |
| `loom context` generează `.loom/context.json` | Un singur fișier care agregă toate manifeste pentru agent context injection | Active |
| Token system cu CSS custom properties | Tema se schimbă prin re-definirea variabilelor, fără modificarea componentelor | Active |
| Bun ca runtime pentru CLI | Consistent cu restul Alteramens stack | Active |
| `happy-dom` pentru testing | Testare DOM manipulation fără browser real | Active |
