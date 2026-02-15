---
status: prototype
type: digital-product
repo: https://github.com/Narcis13/cct2
stack: Next.js, TypeScript, Remotion, Tailwind CSS
version: v0.1
tags: [digital-product, video, subliminal, self-improvement, b2c]
created: 2026-02-01
updated: 2026-02-15
---

# CCT2 (SubliVid)

**Subliminal video generator - Create personalized subliminal affirmation videos.**

> **Notă:** "CCT2" = "Claude Code Test 2" - proiectul a fost creat ca test al sistemului cc-master (AI agent orchestration). Produsul se numește **SubliVid**.

## Ce este

SubliVid este o aplicație web Next.js care generează videoclipuri cu afirmații subliminale. Utilizatorul introduce afirmații text, alege un template vizual, configurează setări vizuale (opacitate, font, culoare) și audio (subliminal whisper via ElevenLabs TTS), iar aplicația generează un video MP4 downloadable folosind Remotion.

Mecanism subliminal: textul apare pe exact fiecare al 60-lea frame (1 frame/secundă la 60fps) cu opacitate 5-15%.

## Value Proposition

- **Personalized subliminal videos** - text propriu, nu template-uri generice
- **Multiple templates** - stiluri vizuale diferite
- **Customizable** - opacitate, font size, culoare, durata
- **Audio subliminal** - AI voice synthesis ca soft whisper
- **Download instant** - MP4 generat server-side cu Remotion

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.1.6 (App Router) |
| Language | TypeScript 5 |
| Video Rendering | Remotion 4.0.422 |
| TTS / Audio | ElevenLabs API (whisper voice) |
| Audio Processing | FFmpeg via fluent-ffmpeg |
| Validation | Zod 3.22 |
| Styling | Tailwind CSS 4 |

## Arhitectură

```
src/
├── app/
│   ├── page.tsx              # Main page - orchestrator
│   └── api/generate/         # Server-side video generation endpoint
├── components/
│   ├── AffirmationInput.tsx  # Text input for affirmations
│   ├── TemplateBrowser.tsx   # Template selection grid
│   ├── SettingsPanel.tsx     # Visual + audio settings
│   └── GenerateButton.tsx    # Generate/download/retry states
├── templates/
│   └── registry.ts           # Template definitions + rendering
└── remotion/
    └── ...                   # Remotion composition definitions
```

## User Flow

1. Introdu afirmații text (ce vrei să-ți spui subliminal)
2. Alege template vizual (grid cu preview-uri)
3. Configurează setări vizuale (opacitate, font, culoare)
4. Configurează audio (on/off, volum 5-15%)
5. Click "Generate Subliminal Video"
6. Download MP4

## Templates (3 procedural, fără assets externe)

1. **Motivational Sunrise** - animated sunrise, rising sun, light rays (30s)
2. **Calm Ocean Waves** - 4-layer SVG waves, floating bubbles (45s)
3. **Focus Energy** - expanding rings, orbital particles, pulsing gradient (30s)

## Stare Curentă

- **MVP complet** - toate 5 requirements (REQ-001 to REQ-005) verified
- Built in ~1 oră cu cc-master (10 workers: 5 implementation + 5 verification, 0 failures)
- **2 commits** ("Initial commit from Create Next App", "impressive")
- 3 fully procedural video templates (React + CSS animations, no external assets)
- ElevenLabs TTS integration pentru audio whisper
- FFmpeg audio mixing pipeline
- Async job queue (in-memory Map, lost on restart)
- No auth, no payments, no database, no deployment

## Legături

- [[cct2/docs/architecture|Arhitectură detaliată]]
- [[cct2/decisions/decisions|Log decizii]]
- [[cct2/learnings/learnings|Ce am învățat]]

## Next Steps

- [ ] Validare concept - are piață pentru subliminal videos?
- [ ] Template-uri adiționale (procedural)
- [ ] Persistent job storage (database instead of in-memory Map)
- [ ] Deploy pe Vercel sau similar
- [ ] Monetizare: freemium (1 video free, paid for more)
- [ ] ElevenLabs API key management (currently needs env var)
