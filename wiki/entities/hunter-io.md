---
title: "Hunter.io"
type: entity
category: tool
aliases: [Hunter]
first_seen: severino-claude-sales-system
sources: [severino-claude-sales-system]
related_entities: [simon-severino]
related_concepts: [ai-collaborator-army, deliver-dont-promise]
vault_refs: []
status: active
---

# Hunter.io

Email prospecting and outreach platform. Finds professional email addresses, builds lead lists, and manages email campaigns.

## Why It Matters

Claude Code can write directly to Hunter's API — build campaigns, find leads matching ICP criteria, enrich/verify emails, and send sequences. This makes it a key piece of the automated prospecting stack described by [[simon-severino]].

Alternatives: Apollo, Instantly. Hunter was chosen because of strong Claude Code integration (direct API writes for campaign creation and list building).

## In Practice

1. Claude builds a lead list in Hunter matching the ICP
2. Claude enriches the list (verify emails, remove duplicates)
3. Claude creates A/B tested email campaigns
4. Human reviews drafts and approves sending
