---
title: "Building in Public"
type: concept
category: pattern
sources: [nbrain-social-strategy, alteramens-manifest, brainstorm-ai-tutor-medicina, semnal-x-growth-system]
entities: [nbrain, alteramens, mihai-brindusescu]
related: [accountability, authentic-creation, leverage, dogfood-as-content, human-in-loop-publishing]
maturity: developing
confidence: medium
contradictions: []
applications: ["strategies/social-media-plan.md", "projects/ai-tutor-admitere/decisions.md", "workshop/drafts/semnal-x-growth-system.md"]
---

# Building in Public

Sharing the journey of building a product openly — progress, failures, decisions, learnings. Both an [[accountability]] mechanism and a marketing strategy.

## Why It Works

1. **Accountability** — Public commitment forces follow-through
2. **Marketing** — Each update is content that attracts potential users
3. **Trust** — Transparency builds credibility
4. **Feedback** — Community provides early signals
5. **[[leverage]]** — Content compounds (every post is a permanent asset)

## nbrAIn's Approach

- **Positioning:** "The economist who automates accounting with AI"
- **Platforms:** LinkedIn (professionals) + TikTok (younger entrepreneurs)
- **Content pillars:** Behind-the-scenes, education, AI in business, founder challenges, public validation
- **Constraint:** No face-on-camera initially (screen recordings, voiceover, text)

## Status

Currently at `seed` maturity — the social media plan exists but execution hasn't started publicly. The LinkedIn profile setup and first post are planned but not yet shipped.

## Risk

Building in public about building (meta-building) instead of actually building the product. The content must serve the product, not replace it.

## Maximum-Stake Variant: Founder Building For Their Own Family

In the AI tutor for Carol Davila admission product (see [[brainstorm-ai-tutor-medicina]]), build-in-public operates at maximum possible stake: Narcis is constructing the instrument his own son [[mihai-brindusescu]] uses to prepare for an irreversible high-stakes admission. The public narrative culminates in the actual exam outcome.

This variant has properties no other build-in-public play matches:
- **Skin in the game is structural, not rhetorical** — the founder cannot exit before the user (his child) finishes the run
- **The eventual outcome is binary and public** — admitted vs not admitted, with no spin available
- **Trust signal is at ceiling** — competitors cannot replicate "I built this for my own kid"
- **Content cadence is automatic** — daily reality of a child's exam prep generates the narrative without extra effort

The risk profile is also unique: privacy must be explicit and revocable, the public narrative cannot become surveillance, and an honest reckoning is required if the outcome is not what was promised. This is [[accountability]] at maximum, not as marketing.

## Self-Referential Variant: Building the Distribution Tool Itself

A second distinctive variant, from [[semnal-x-growth-system]]: when the tool being built IS the solopreneur's distribution system, building it publicly becomes self-starting. The build produces content that feeds the exact channel the tool is designed to serve. See [[dogfood-as-content]] for the full treatment of the pattern.

Contrast with the vanilla variant: most building-in-public plays talk about a product that exists elsewhere (SaaS, physical product, service). The self-referential variant collapses that distance — the product's output and the account's output are the same stream. This is stronger for cold-start distribution but has a specific failure mode: "meta-building without shipping" (talking about the build without actually building), covered in dogfood-as-content's anti-patterns.

Guardrails for this variant:
- **Shipping cadence must dominate narration cadence** — more "I shipped X" than "I am planning Y"
- **Human-in-loop publishing is mandatory** (see [[human-in-loop-publishing]]) — the whole credibility play collapses if the account looks automated
- **Authority earned by data, not claims** — wait for follower growth / bookmark ratio to justify tool-effectiveness claims
