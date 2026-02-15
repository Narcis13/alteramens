---
parent: "[[davidup/davidup|DavidUp]]"
type: doc
---

# DavidUp (GameMotion) - Arhitectură

## Overview

GameMotion este un JSON-to-video rendering pipeline. Un video este descris ca un VideoSpec JSON → rendered frame-by-frame pe Canvas API → encoded cu FFmpeg → output MP4.

## Pipeline

```
User/AI → VideoSpec JSON → Validation (Zod) → Scene Renderer (Canvas) → Frame Export → FFmpeg → MP4
```

## Key Schemas (Zod)

### VideoSpec
- Width, height, fps, duration
- Scenes array (each scene has elements, duration, transitions)
- Elements: text, shapes, images with position, style, animations

### Animation System
- 13 easing functions (linear, easeIn, easeOut, bounce, elastic, etc.)
- Keyframe-based property animations (x, y, rotation, scaleX, scaleY, opacity)
- Preset animations (fade, slide, scale, bounce)
- Scene transitions (fade, slide, zoom)

### Templates
- Platform presets: TikTok (1080x1920), YouTube (1920x1080), Instagram (1080x1080)
- Template variables (text, url, color) with defaults
- AI generation via Claude: description + platform + style → VideoSpec

## API (Hono.js)

- Auth via API Key (Bearer token, in-memory store)
- Plan tiers: free / pro
- Template generation endpoint (Claude-powered)
- Video rendering endpoint
- Template library (built-in templates)

## Studio UI (React)

- Chat interface for AI template generation
- Template browser with previews
- Video library with thumbnails
- Preview player
