---
title: "Capture at Source — Meet Thought Where It Happens"
type: concept
category: pattern
sources: [semnal-x-growth-system]
entities: []
related: [friction-cost, human-in-loop-publishing, dogfood-as-content]
maturity: seed
confidence: high
contradictions: []
applications: ["workshop/drafts/semnal-x-growth-system.md"]
---

# Capture at Source — Meet Thought Where It Happens

**An idea captured in the wrong tool is an idea that decays.** Every context switch between "I had a thought" and "I wrote it down" imposes cognitive tax and leaks signal. The capture layer of a personal publishing system must appear in whatever tool the thinker is already using — not impose a separate "capture app."

## The Principle

For a builder whose thinking happens across multiple environments, there is no single correct capture surface. The correct surface is **whichever one is in focus when the idea arrives.**

| Where thought happens | Correct capture surface |
|---|---|
| Writing code / in terminal | CLI command (`semnal capture "text"`) |
| Reading own notes / in Obsidian | Hotkey that appends selection + context |
| Reading X or articles / in browser | Browser extension with selection → seed |
| Phone / mobile context | Share sheet → inbox file (via Git sync or similar) |
| Voice / walking | Voice memo → transcription pipeline |

Each surface drops the raw seed into the **same destination** (`inbox.md` or equivalent), so the later drafting step reads from one queue regardless of capture origin.

## Why It Matters

A single unified "capture app" sounds clean but creates friction every time thought occurs outside that app. The switch costs more than the capture is worth, so most seeds never get captured. Empirically, this is the failure mode of most personal PKM systems: they assume thinking will route *through* the system. Thinking routes through whatever is in focus.

Capture-at-source inverts the architecture: the system routes toward thinking, not thinking toward the system. This is a direct application of [[friction-cost]] to the personal-publishing funnel — every context switch is an invisible field added to the form, and forms with more fields collect fewer submissions.

## Design Implementations

1. **Multiple entry points, single destination** — every capture surface writes to the same inbox file
2. **Consistent metadata contract** — each entry records source context (file path, URL, timestamp, selection context) so downstream drafting has everything it needs
3. **<60 second ship target** — from "I have an idea" to "it's in the queue" must beat the threshold where the writer decides to "do it later" (the point at which it gets lost)
4. **Zero review at capture time** — capture is write-only; editing/drafting is a separate step. Mixing them reintroduces friction.
5. **Sync by default** — inbox file lives in a git-versioned vault so captures from any device reach the same queue

## Anti-Pattern

**"Open a capture app, categorize while you type, file under the right pillar."** This sounds organized and is fatal. Every pre-capture decision is friction that kills shipping. Capture first, classify later.

## Contraexemple

- **Enterprise knowledge bases with strict taxonomies** — categorization at capture is a feature, not friction, because retrieval across large orgs requires it
- **Clinical / legal / regulated documentation** — fields and classification are externally required, not self-imposed
- **Teams with dedicated editorial roles** — the capturer and the classifier are different people; separation of concerns changes the math

The rule applies where **the same person captures, drafts, and ships, and where missing a capture has outsized cost (like not posting for a week because the idea got lost).**

## Applied in Semnal

[[workshop/drafts/semnal-x-growth-system.md|Semnal]] implements capture-at-source via three surfaces (Obsidian hotkey, CLI, Chrome extension), all writing to `workshop/x-queue/inbox.md`. The design target is <60 seconds from idea to queue across any surface.
