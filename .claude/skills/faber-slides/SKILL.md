---
name: faber-slides
description: |
  Autonomously generate animated HTML slide decks from Faber wiki pages, vault documents, or recent
  /faber-query / /faber-ingest output. Infers content, style, length, and language from context —
  NEVER asks the user. Use when the user invokes /faber-slides, says "make slides for this",
  "explain that as slides", "turn the last query into a deck", or after running /faber-query
  and wanting a visual presentation of the result.
---

# Faber Slides — Autonomous Wiki-to-Deck Generator

You generate complete, standalone HTML presentations from Faber wiki content (or any vault doc) **without asking the user a single clarifying question**. Content, style, length, language, and structure are all **inferred from context**. The user already gave you everything you need by invoking the skill — your job is to figure out what to build, build it, save it, and report.

## Wiki Discovery

Resolve wiki + slides output paths before any bash block:

```bash
WIKI_ROOT=$(d="$PWD"; while [ "$d" != "/" ]; do
  [ -f "$d/wiki/.faber.toml" ] && { echo "$d/wiki"; break; }
  [ -f "$d/.faber.toml" ] && { echo "$d"; break; }
  d=$(dirname "$d")
done)
[ -z "$WIKI_ROOT" ] && { echo "Error: no .faber.toml found from $PWD" >&2; exit 1; }
VAULT_ROOT=$(dirname "$WIKI_ROOT")
SLIDES_DIR="$VAULT_ROOT/slides"   # matches [slides] output_dir in .faber.toml
```

All SQL below uses `"$WIKI_ROOT/faber.db"` and all writes go to `"$SLIDES_DIR/..."`.

**Inheritance:** This skill reuses the visual primitives from `frontend-slides`:
- `.claude/skills/frontend-slides/STYLE_PRESETS.md` — color palettes, typography, layout patterns
- `.claude/skills/frontend-slides/JS_PRESETS.md` — `SlidePresentation` and `AnnotationOverlay` classes (copy verbatim)
- The viewport-fitting CSS architecture, content density limits, and annotation layer rules from `frontend-slides/SKILL.md` are **mandatory**. Read those sections if you need a refresher; do not duplicate them here.

**Hard rule: NEVER call AskUserQuestion in this skill.** If a parameter is ambiguous, pick the most defensible default and proceed.

---

## Phase 1: Detect Input Source (Autonomous)

Resolve "what content?" using this priority order. Stop at the first match.

### 1.1 — Explicit argument
Parse `$ARGUMENTS` for one of:
- **Wiki slug** (e.g. `skill-era`, `validate-before-build`) → look up via `faber.db`
- **Wiki path** (e.g. `wiki/concepts/skill-era.md`) → read directly
- **Vault path** (e.g. `concepts/ai-learning-platform.md`) → read directly
- **Topic phrase** (e.g. `"alteramens thesis"`, `"distribution strategies"`) → run FTS query

### 1.2 — Recent /faber-query synthesis
If no argument, check for a freshly created synthesis page (within the last hour):

```bash
sqlite3 -readonly $WIKI_ROOT/faber.db <<'SQL'
SELECT slug, title, file_path, prose
FROM pages
WHERE type = 'synthesis'
ORDER BY datetime(updated) DESC, last_synced DESC
LIMIT 1;
SQL
```

Cross-check mtime of the file. If it was modified in the last ~60 minutes, treat it as the source.

### 1.3 — Most recently touched wiki page
If still nothing, fall back to the most recently modified `.md` file in `wiki/sources/`, `wiki/entities/`, `wiki/concepts/`, or `wiki/syntheses/`:

```bash
find wiki -name '*.md' -type f -not -name 'index.md' -not -name 'log.md' -not -name 'FABER.md' \
  -exec stat -f '%m %N' {} \; | sort -rn | head -5
```

### 1.4 — Inline conversation content
If the user just received a `/faber-query` answer in the conversation but it wasn't filed as a synthesis, capture that text from the most recent assistant turn and treat it as the source content (use the user's question as the title).

### 1.5 — Last resort
Only if all the above fail (no DB, no recent activity, empty argument, no recent query): emit a one-line message asking for a slug or topic. Do NOT use AskUserQuestion — just print one sentence and stop.

---

## Phase 2: Load & Classify Content

Once the source is identified, load the full content and classify it. Use `faber.db` for metadata when available.

```bash
sqlite3 -readonly $WIKI_ROOT/faber.db <<'SQL'
.mode list
.separator '|'
SELECT type, title, category, maturity, confidence, word_count, prose
FROM pages WHERE slug = 'SLUG';

-- Related pages (for "Connections" slide)
SELECT to_slug, relation_type FROM page_relations WHERE from_slug = 'SLUG';
SELECT from_slug, relation_type FROM page_relations WHERE to_slug = 'SLUG';

-- Sources backing this page (citations)
SELECT to_slug FROM page_relations
WHERE from_slug = 'SLUG' AND relation_type IN ('has_source','consulted_source');
SQL
```

For non-wiki vault docs, parse YAML frontmatter manually and treat type as `vault-doc`.

**Detect language** from prose: if >40% of words match a Romanian word frequency heuristic (diacritics ăâîșț + common words `și`, `pentru`, `este`, `cu`, `la`), tag as `ro`. Otherwise `en`. Generate slide copy in the detected language.

---

## Phase 3: Infer Slide Spec (No User Input)

### 3.1 — Length inference

| Source type | Word count | Slide count |
|---|---|---|
| concept (seed) | <300 | 6-8 |
| concept (developing/mature) | 300-700 | 8-12 |
| synthesis | 700-2000 | 12-18 |
| synthesis | 2000+ | 18-24 (split sections) |
| entity | any | 6-10 |
| source | any | 8-12 |
| vault doc | any | proportional, 8-15 |
| inline query result | n/a | 6-10 |

### 3.2 — Style inference

Pick **one** preset deterministically based on content type + tags + topic. Do not show options. The selection table:

| Trigger | Preset | Why |
|---|---|---|
| `type=synthesis` AND maturity=mature | **Dark Botanical** | Sophisticated, thoughtful, premium feel for cross-cutting analyses |
| `type=synthesis` AND maturity≠mature | **Paper & Ink** | Literary, exploratory tone fits developing syntheses |
| `type=concept` AND category contains "decision" or "framework" | **Swiss Modern** | Minimal precision for operational principles |
| `type=concept` AND category contains "mental-model" | **Notebook Tabs** | Editorial, organized — fits taxonomies |
| `type=entity` (person) | **Vintage Editorial** | Personality-driven for individual humans |
| `type=entity` (company/tool) | **Bold Signal** | High-impact for orgs/products |
| `type=source` | **Notebook Tabs** | Editorial fits article summaries |
| Topic mentions AI/agent/skill/MCP/code | **Neon Cyber** | Tech aesthetic |
| Topic mentions design/marketing/brand | **Creative Voltage** | Energetic creative pitch |
| Topic in Romanian education/learning | **Pastel Geometry** | Friendly, approachable |
| Topic mentions Rails/Ruby/devtools | **Terminal Green** | Developer-focused |
| `type=vault-doc` no category | **Electric Studio** | Clean, neutral default |
| Fallback | **Swiss Modern** | Safe default |

Read the full preset definition (typography, colors, signature elements) from `.claude/skills/frontend-slides/STYLE_PRESETS.md`.

### 3.3 — Slide structure templates

Apply the matching template based on content type. Each row maps a content section → a slide.

**Template: `concept`**
1. Title slide — concept name + category + maturity badge
2. The Big Idea — 1-paragraph definition (from first prose paragraph)
3. Why It Matters — extracted from "Why" / "Importance" sections, or generated from context
4. Key Distinction — table or comparison (e.g. API vs Skill)
5. Examples — 2-3 example slides if examples exist
6. Connections — graph of related concepts (use `page_relations`)
7. Sources — citation slide
8. End slide — call to action: "Read more in `wiki/concepts/{slug}.md`"

**Template: `synthesis`**
1. Title slide — the synthesis question
2. The Convergence — setup paragraph
3-7. Thesis points (3-5 slides, one per major section in the prose)
8. Evidence / case study (if external validation section exists)
9. Risk / Tension slide
10. Conclusion
11. Sources consulted
12. End slide

**Template: `entity` (person)**
1. Title — name + one-line role
2. Quick facts (table)
3. Why they matter
4. Key contributions (3-4 bullets)
5. Notable quote
6. Connections (related concepts/sources)
7. End slide

**Template: `entity` (company/tool)**
1. Title — name + tagline
2. What it is
3. Key features / what it enables
4. Why it matters now
5. Connections
6. End slide

**Template: `source`**
1. Title — source title + author
2. The big idea
3-6. Key claims (from `key_claims` table, one per slide if substantive)
7. Critique / what's missing
8. Connections to other sources
9. End slide

**Template: `vault-doc`**
1. Title — doc title
2. Context (from frontmatter or first paragraph)
3-N. One slide per H2 section (collapse short sections)
N+1. Decisions (if `decisions` section exists)
N+2. Next steps
N+3. End

**Template: `inline-query`**
1. Title — the user's question
2. TL;DR — 3-bullet answer
3-5. Evidence cards
6. Sources cited
7. Implications
8. End

### 3.4 — Density enforcement

Apply the density limits from `frontend-slides/SKILL.md` (max 4-6 bullets, max 6 cards, max 8-10 lines of code, etc.). If a section overflows, split into "Section A" and "Section A (cont.)" slides automatically. **Never ask the user to trim — just split.**

---

## Phase 4: Generate HTML (No Previews)

Skip the entire "show 3 previews and pick one" flow from `frontend-slides`. Go directly to a single full presentation.

### 4.1 — Output path

```
slides/{type}-{slug}-{YYYYMMDD}.html
```

Examples:
- `slides/concept-skill-era-20260407.html`
- `slides/synthesis-alteramens-thesis-20260407.html`
- `slides/inline-query-20260407-1442.html` (use HHMM suffix for ad-hoc queries)

Create `slides/` directory if missing. If a file with the same name exists, append `-v2`, `-v3`, etc.

### 4.2 — Build the HTML

Single self-contained `.html` file with:

1. **Inline `<style>`** containing:
   - The viewport-fitting base CSS from `frontend-slides/SKILL.md` (mandatory block, copy verbatim)
   - The chosen preset's CSS variables, typography, signature elements (from `STYLE_PRESETS.md`)
   - Reveal animations (`.reveal`, `.visible .reveal`, stagger delays)

2. **`<body>`** containing:
   - Optional progress bar
   - Optional nav dots
   - One `<section class="slide" data-slide="N">` per slide (zero-indexed `data-slide` is **mandatory** for AnnotationOverlay)
   - Keyboard hint: `← → space · scroll · E annotate`

3. **Inline `<script>`** containing:
   - `SlidePresentation` class **verbatim** from `frontend-slides/JS_PRESETS.md → CORE`
   - `AnnotationOverlay` class **verbatim** from `frontend-slides/JS_PRESETS.md → Annotation Overlay (Presenter Toolbox)`
   - Optional enhancement classes from `JS_PRESETS.md → OPTIONAL ENHANCEMENTS` if the chosen preset needs them (e.g. ParticleBackground for Neon Cyber, CustomCursor for Dark Botanical)
   - DOMContentLoaded init:
     ```js
     document.addEventListener('DOMContentLoaded', () => {
         new SlidePresentation();
         new AnnotationOverlay({ accentColor: '#ACCENT_HEX_FROM_PRESET' });
     });
     ```

### 4.3 — Content rendering rules

- **Pull copy directly from wiki prose.** Don't paraphrase unless density requires it.
- **Preserve wikilinks** as plain text or styled badges (not active hrefs — they're internal vault references that won't resolve in browser).
- **Cite sources** by slug at the bottom of relevant slides (e.g. `Source: skill-era-article`).
- **Render tables** from prose tables faithfully — don't flatten to bullets.
- **Quote blocks** become hero quote slides if substantive (>40 chars).
- **Code blocks** become code slides with syntax-friendly typography (use a monospace from the preset).
- **Romanian content** → keep all generated copy in Romanian (slide labels, nav hint, etc.).

### 4.4 — Mandatory checklist before writing the file

Before calling Write, verify mentally:

1. Every `.slide` has `data-slide="N"` (0-indexed)
2. Viewport-fitting base CSS is present
3. All font sizes use `clamp()`
4. `AnnotationOverlay` is included and initialized after `SlidePresentation`
5. Density limits respected on every slide
6. Slide count matches the inferred range from §3.1
7. Language matches the source content
8. Output path follows §4.1 convention
9. No `AskUserQuestion` calls anywhere in the workflow

---

## Phase 5: Save & Report

1. **Write the file** to the path from §4.1.

2. **Print a 5-line report** (this is the only output to the user):
   ```
   Generat: slides/concept-skill-era-20260407.html
   Sursă: wiki/concepts/skill-era.md (concept · mature · 612 words)
   Stil: Swiss Modern (inferred from category=mental-model)
   Slide-uri: 10 · Limbă: en
   Deschide: open slides/concept-skill-era-20260407.html
   ```

3. **Do NOT auto-open** the file unless the user explicitly told you to. Just print the `open` command so they can run it.

4. **No follow-up questions.** No "want me to adjust?". The user will tell you if they want changes.

---

## Examples of Autonomous Resolution

| User says | Resolution |
|---|---|
| `/faber-slides skill-era` | Loads `wiki/concepts/skill-era.md`, picks Notebook Tabs (mental-model), generates 10 EN slides |
| `/faber-slides alteramens-thesis` | Loads synthesis, picks Dark Botanical, generates 14 EN slides |
| `/faber-slides naval-ravikant` | Loads entity (person), picks Vintage Editorial, generates 7 slides |
| `/faber-slides "distribution"` | FTS query, picks top match, generates from that page |
| `/faber-slides` (after /faber-query about `nbrAIn`) | Detects recent query, generates from inline result, picks Bold Signal |
| `/faber-slides workshop/drafts/ai-learning-platform.md` | Reads vault doc, RO detected, picks Pastel Geometry (Romanian education), 12 RO slides |
| `/faber-slides` (no recent activity) | Picks the most recently mtime'd wiki .md file |

## Rules

- **NEVER** use AskUserQuestion. The whole point is autonomy.
- **NEVER** ask about content, style, length, language, output path, or anything else.
- **NEVER** show 3 style previews. Pick one and ship.
- **NEVER** generate placeholder lorem ipsum — pull real content from the source.
- **NEVER** invent wiki content that isn't in the source. If a section template expects content that doesn't exist, drop the slide silently.
- **ALWAYS** include the AnnotationOverlay (mandatory per `frontend-slides`).
- **ALWAYS** respect viewport-fitting and density rules.
- **ALWAYS** match output language to source language.
- **ALWAYS** keep the report under 6 lines.
- If the user explicitly says "ask me first" or "let me pick the style", redirect them to `/frontend-slides` instead — that's the interactive variant. This skill is autonomous by design.
