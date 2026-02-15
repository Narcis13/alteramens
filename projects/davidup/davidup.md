---
status: active
type: saas
repo: https://github.com/Narcis13/davidup
stack: Node.js, TypeScript, Hono.js, React 19, @napi-rs/canvas, FFmpeg, SQLite
version: v0.2
tags: [saas, video, ai, content-creation]
created: 2026-01-24
updated: 2026-02-15
---

# DavidUp (GameMotion)

**JSON-to-Video rendering engine cu AI template generation.**

## Ce este

GameMotion/DavidUp este un motor de randare video care transformă specificații JSON în videoclipuri. Include un API REST (Hono.js), un sistem de animații cu keyframes și easing, template-uri AI-generated, și un studio web pentru editare.

Targetează creatorii de conținut pentru platforme sociale (TikTok, YouTube, Instagram).

## Value Proposition

- **Programmatic video creation** - descrii video-ul în JSON, motorul îl randează
- **AI template generation** - descrie ce vrei, AI-ul generează specificația video
- **Platform presets** - dimensiuni optime pentru TikTok, YouTube, Instagram
- **Studio UI** - chat interface pentru generare + template library + preview

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ (ESM) |
| API Framework | Hono 4.x |
| Rendering | @napi-rs/canvas (Skia-based, native) |
| Encoding | FFmpeg (H.264, via ffmpeg-static) |
| Database | SQLite (better-sqlite3, WAL mode) |
| Job Queue | p-queue (in-memory, concurrency=2) |
| Frontend | React 19 + Vite 7 + Tailwind v4 + shadcn/ui |
| State | Zustand (UI) + TanStack Query (server) |
| AI | OpenRouter API (Claude Sonnet 4) |
| Auth | API Key (Bearer token, free/pro tiers) |
| Validation | Zod 3.x |
| Testing | Vitest 2.x |

## Arhitectură

```
JSON VideoSpec → Zod Validation → @napi-rs/canvas (frame generation)
  → Animation interpolation (keyframes) → FFmpeg stdin pipe → MP4
  → Audio muxing (optional) → Thumbnail extraction
```

**Rendering pipeline:** Plugin-style RendererRegistry cu TextRenderer, ImageRenderer, ShapeRenderer.

**3 element types:** text (fonts, shadows, wrapping), image (fit modes, border radius), shape (rect, circle, ellipse, line, gradients).

**Database:** SQLite cu 5 tabele - conversations, messages, studio_templates, template_versions, videos.

**7 built-in templates:** before-after, countdown-timer, instagram-story-promo, quote-card, social-announcement, tiktok-product-showcase, youtube-intro.

## Stare Curentă

- **~10,000 linii TypeScript**
- **v0.1 MVP shipped** (6 faze, 30 requirements, 42 plans)
- **v0.2 Studio shipped** (4 faze, 30 requirements)
- Cumulative: 10 faze, 42 plans, 70 requirements
- Milestone audit passed: 100% (v0.1: 40/40, v0.2: 30/30)

## Milestones

| Version | Nume | Faze | Plans | Status |
|---------|------|------|-------|--------|
| v0.1 | MVP | 1-6 | 30 | Shipped (2026-01-26) |
| v0.2 | Studio | 7-10 | 12 | Shipped (2026-01-28) |
| v0.3 | TBD | - | - | Not started |

## Legături

- [[davidup/docs/architecture|Arhitectură detaliată]]
- [[davidup/decisions/decisions|Log decizii]]
- [[davidup/learnings/learnings|Ce am învățat]]

## Next Steps

- [ ] Definire v0.3 milestone (`/gsd:new-milestone`)
- [ ] Fix thumbnail path hardcoded .jpg (VideoCard.tsx)
- [ ] Fix backend encoder type errors (inherited from v0.1)
- [ ] Human verification for UI interactions
