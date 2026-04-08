---
title: "Validate Before Build"
type: concept
category: decision-framework
sources: [alteramens-manifest, workscript-decisions, nbrain-concept, ai-marketing-distribution]
entities: [alteramens, nbrain, workscript]
related: [kill-fast, judgment, productize-yourself, distribution-over-product]
maturity: mature
confidence: high
contradictions: []
applications: ["MANIFEST.md", "projects/workscript/decisions.md", "workshop/drafts/ai-learning-platform.md"]
---

# Validate Before Build

Before writing code, validate that the problem exists and someone would pay to solve it. This is the most important operational principle in Alteramens.

## The Anti-Pattern

Building in a vacuum. Zero conversations with potential clients. Technical migrations as "comfortable code" avoiding "uncomfortable selling." Polishing tools nobody asked for.

> "Migrations are comfortable code vs uncomfortable selling." — WorkScript decisions

## The Principle

1. Talk to real people who have the problem
2. Confirm they'd pay to solve it
3. Build the minimum thing that tests the hypothesis
4. Only then invest in technical infrastructure

## Applied to nbrAIn

The correct sequence:
1. Interview wife (done — confirmed pain)
2. Talk to 2-3 of her clients (next)
3. Build Wizard of Oz demo with existing engine
4. Get first payment
5. THEN migrate to PostgreSQL, NextJS, etc.

## The Manifest's Version

- "Before code, validate the problem. Talk to people, look for signs someone would pay."
- "MVP must be embarrassingly simple"
- "If no signs of life after 2-3 weeks → archive and next" (see [[kill-fast]])

## Why It's Hard

Building feels productive. Selling feels vulnerable. The temptation to hide in code is strong, especially for developers. This principle forces confrontation with the market.

## The Distribution Angle

The [[ai-marketing-distribution]] source reinforces this from the distribution side: with 200K+ projects launching daily, building is no longer the hard part. [[distribution-over-product]] is the current reality. Validate Before Build now means: validate that you have a distribution strategy, not just a product idea.
