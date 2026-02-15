---
parent: "[[cct2/cct2|CCT2]]"
type: doc
---

# CCT2 - Arhitectură

## Overview

Next.js App Router application cu Remotion pentru server-side video rendering. Dark theme, purple accent color.

## Stack

```
Next.js (App Router)
├── Client Components ("use client")
│   ├── AffirmationInput     # Text input pentru afirmații
│   ├── TemplateBrowser      # Grid cu template-uri vizuale
│   ├── SettingsPanel        # Visual settings (opacity, font, color)
│   │                        # Audio settings (enabled, volume)
│   └── GenerateButton       # State machine: idle → loading → download/error
├── Server Route
│   └── api/generate/        # Remotion rendering pipeline
├── Templates
│   └── registry.ts          # Template definitions cu thumbnailColor, duration
└── Remotion
    └── Compositions          # Video composition definitions
```

## Video Generation Flow

1. Client sends: affirmations + templateId + visual settings + audio settings
2. Server: Remotion bundles composition
3. Server: Renders frame-by-frame with affirmation text overlays
4. Server: Encodes to MP4
5. Client: Receives download URL

## UI Components

- **AffirmationInput**: Textarea pentru afirmații personalizate
- **TemplateBrowser**: Grid 3 coloane cu preview (gradient + initial letter)
- **SettingsPanel**: Opacity slider, font size select, color picker (6 presets), audio toggle + volume
- **GenerateButton**: 4 states - ready, loading (progress bar), download, error (retry)

## Next.js Config

Remotion packages sunt marcate ca `serverExternalPackages` pentru a evita bundling issues (compositor binaries per-platform).
