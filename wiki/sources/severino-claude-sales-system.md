---
title: "Claude Code as Sales & Marketing Engine — Simon Severino Interview"
type: source
format: transcript
origin: vault
source_ref: "inbox/clippings/saas marketing"
ingested: 2026-04-06
guided: true
entities: [simon-severino, hunter-io]
concepts: [ai-collaborator-army, deliver-dont-promise, seven-critics-loop]
key_claims:
  - "45 AI collaborators replace admin work for a 5-person team — tasks that took 8 hours now take 10 minutes"
  - "Humans should do strategy (new combinations), AI should do everything that needs row compute"
  - "Cold outreach that delivers value upfront (don't promise, deliver) reverses the dynamic to inbound-like"
  - "Before sending any copy, run it through 7 hostile reader personas to catch failure modes"
  - "ICP should be 15 levels deep with 3 exclusions per inclusion for precision targeting"
  - "Claude Code + Obsidian + Notion + Hunter is a working stack for fully automated prospecting"
confidence: medium
---

# Claude Code as Sales & Marketing Engine — Simon Severino Interview

YouTube interview transcript — Simon Severino (CEO, [[simon-severino|Strategy Sprints]]) interviewed by Haider Malik, a software engineering YouTuber. Simon demos his system for running marketing and sales almost entirely through Claude Code.

## Core Setup

**Stack:** Claude Code (3 terminals always running) + Obsidian + Granola (meeting transcription → markdown) + Notion (processes/CRM) + [[hunter-io|Hunter.io]] (prospecting/campaigns).

**Philosophy:** 5 humans + 45 AI "collaborators." ~12 in marketing, ~20 in sales, ~12 in ops/delivery. Each collaborator is a Claude Code skill or agent with a specific job. The human team focuses on strategy and relationships; everything else is delegated.

Key architectural choice: **Obsidian + Granola for knowledge** (markdown files = portable, not locked into vendor), **Notion for processes** (structured, auto-updated every 10 minutes by agents).

## Actionable Patterns

### 1. ICP Depth Protocol

Prompt: *"Interview me about who is my ICP and anti-ICP until you have full clarity and can write a 15 levels deep page about it."*

Key rule: **for every inclusion, add 3 exclusions.** "I work with CEOs" → exclude HR, legal, IT. This sharpness makes lead lists and email copy dramatically more targeted.

### 2. Prospecting Workflow

1. Define ICP (deep, with exclusions) → saved to Notion + CLAUDE.md
2. Claude builds lead list in [[hunter-io|Hunter]] (e.g., 200 people matching ICP)
3. Claude enriches/cleans list (remove duplicates, verify emails) → ~175 clean leads
4. Claude writes A/B tested email campaigns (change ONE variable per test — subject line OR CTA, never both)
5. Emails saved as Gmail drafts → human reviews and sends
6. Weekly A/B test review automated to Slack (Wednesday reports with results + improvement suggestions + new copy to test)

### 3. Deliver-Don't-Promise Outreach

See [[deliver-dont-promise]]. Instead of "book a call" or "I promise you X," **deliver immediate value:**
- Analyze prospect's website positioning
- Give 2 concrete improvements (headline, button copy, conversion suggestions)
- Withhold the 3rd improvement → they ask for it → conversation started

This reverses the dynamic: you become the expert they want to talk to, not another cold emailer asking for time.

### 4. Seven Critics Quality Control

See [[seven-critics-loop]]. Before any copy goes out, it passes through 7 hostile reader personas:
1. The burned skeptic (been scammed by gurus)
2. The time-crunched reader ("say it faster")
3. The AI-allergic reader
4. The lurker (watches, never buys)
5. The visual learner ("not visual enough")
6. The lead-seller detector ("another one trying to sell me leads")
7. The detail-oriented critic

This catches "21 ways to fail" before copy reaches prospects.

### 5. Morning Briefing System

A `/today` skill aggregates Calendar + Gmail + Slack + CRM, then proposes:
- What's completed, in progress, stuck
- Prioritized tasks based on available time windows
- Pre-meeting briefings (who they are, why they're on your calendar, what they expect)

## Strategic Insight

> "Strategy is breaking through the wall and doing something forward that nobody yet did. It's a new combination of existing things that has never been done. That is strategy. AI can only recombine what's known."

The division: **humans = strategy (novel combinations), AI = execution (row compute).** Even with 45 agents, the human decides direction, validates output, and does the creative strategic thinking. The agents handle research, writing, nurturing, scheduling, data entry, CRM maintenance.

## Relevance to Alteramens

- The "45 collaborators" is a concrete, working implementation of [[leverage]] and [[skill-era]] for a small team
- Validates the Alteramens thesis: small team (5 people) with massive AI leverage
- The skills/repos pattern (20+ repos on GitHub, each = one collaborator) maps to "skills as products" — exactly what [[encoded-judgment]] describes
- The ICP + exclusion technique is directly applicable to any Alteramens B2B project
