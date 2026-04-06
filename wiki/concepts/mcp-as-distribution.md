---
title: "MCP as Distribution — Agent Plugins as Sales Channel"
type: concept
category: pattern
sources: [ai-marketing-distribution]
entities: []
related: [skill-era, encoded-judgment, distribution-over-product, leverage]
maturity: seed
confidence: medium
contradictions: []
applications: []
---

# MCP as Distribution — Agent Plugins as Sales Channel

MCP (Model Context Protocol) servers and AI assistant plugins as a zero-cost customer acquisition channel. Instead of marketing to humans, you embed your product directly into AI workflows.

## The Mechanism

1. Build an MCP server / AI plugin that provides genuine value
2. AI assistants (Claude, ChatGPT, etc.) discover and invoke your tool
3. Users interact with your product through the AI — no landing page, no signup flow
4. Conversion happens inside the agent workflow, not through traditional funnels

## Why This Is Distribution-Native

Traditional distribution: build product → create marketing → drive traffic → convert visitors
MCP distribution: build tool → AI calls it → users get value → some convert to paid

The distribution IS the product. There's no separate marketing layer. This is the [[skill-era]] applied to go-to-market.

## Connection to Skill Era

This is the practical implementation of the Skill Era's distribution thesis:

> Distribution = being part of the agent's workflow, not dashboards humans click.

An MCP server encoding [[encoded-judgment]] has a built-in distribution channel: every AI agent that can invoke it.

## Implications for Alteramens

Every tool Alteramens builds should consider MCP as a primary distribution channel:
- Build the MCP server first, the dashboard second (or never)
- Encode judgment in the tool's responses — [[encoded-judgment]] makes the tool sticky
- The flywheel: useful MCP tool → AI recommends it → more users → more data → better tool

## Open Questions

- How do AI assistants discover and prioritize MCP servers? Is there a "ranking" like SEO?
- What's the conversion model? Freemium MCP → paid features?
- How do you measure attribution when the user never visits your site?
