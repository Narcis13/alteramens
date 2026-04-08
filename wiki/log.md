---
title: Faber Log
type: meta
---

# Faber Log

Chronological record of wiki operations. Append-only.

## [2026-04-05] init | Faber Created
- Schema written: wiki/FABER.md
- Directory structure created: sources/, entities/, concepts/, syntheses/
- Index and log initialized
- Six Claude Code skills created: faber-ingest, faber-query, faber-lint, faber-status, faber-seed, faber-link

## [2026-04-05] seed | Vault Seeding — First Pass
- Processed 8 vault documents: Foundation.md, MANIFEST.md, workshop/drafts/Articol interesant.md, workshop/drafts/agentic-business-platform.md, workshop/drafts/ai-learning-platform.md (skipped — low overlap with current focus), strategies/social-media-plan.md, projects/workscript/decisions.md, workshop/ideas/API + CLI.md (skipped — captured via entity references)
- Sources created: naval-framework, skill-era-article, alteramens-manifest, nbrain-concept, nbrain-social-strategy, workscript-decisions
- Entities created: naval-ravikant, nbrain, alteramens, workscript, anaf
- Concepts created: productize-yourself, specific-knowledge, leverage, judgment, accountability, compounding-games, skill-era, encoded-judgment, work-as-play, authentic-creation, validate-before-build, kill-fast, building-in-public, conversational-interface
- Syntheses created: alteramens-thesis, nbrain-market-intelligence
- **Totals: 6 sources, 5 entities, 14 concepts, 2 syntheses = 27 pages**
- All seeded pages marked `guided: false`
- Cross-references built across all pages

## [2026-04-05] ingest | How to Practically Deploy Jack Dorsey's 'World Intelligence' Today
- Source: https://x.com/ericosiu/status/2040543007716553088
- Entities created: eric-siu, jack-dorsey, single-grain, block-inc, single-brain
- Entities updated: (none)
- Concepts created: ai-native-org-design, world-model, agent-fleet-architecture, data-compounding-moat, dri-with-agents, internal-to-product
- Concepts updated: skill-era, leverage, compounding-games, encoded-judgment
- Synthesis updated: alteramens-thesis (added external validation section)
- **Totals: 1 source, 5 entities, 6 concepts = 12 new pages + 5 pages updated**
- Guided ingest: discussed takeaways with Narcis before proceeding

## [2026-04-06] ingest | Making $$ with AI Marketing — 7 Distribution Strategies
- Source: https://x.com/startupideaspod/status/2038697353855787133
- Entities created: (none — skipped per user direction)
- Concepts created: distribution-over-product, programmatic-seo, answer-engine-optimization, mcp-as-distribution, viral-artifacts
- Concepts updated: skill-era (added distribution section + new source), leverage (added distribution-as-leverage section + new source), validate-before-build (added distribution angle + new source)
- Synthesis: none
- **Totals: 1 source, 5 concepts = 6 new pages + 3 pages updated**
- Guided ingest: discussed takeaways with Narcis, emphasis on Programmatic SEO

## [2026-04-06] ingest | Claude Code as Sales & Marketing Engine — Simon Severino Interview
- Source: inbox/clippings/saas marketing (video transcript)
- Entities created: simon-severino, hunter-io
- Concepts created: ai-collaborator-army, deliver-dont-promise, seven-critics-loop
- Concepts updated: leverage (added collaborator army section + new source), skill-era (added new source + related), distribution-over-product (added new source + related)
- Synthesis: none
- **Totals: 1 source, 2 entities, 3 concepts = 6 new pages + 3 pages updated**
- Guided ingest: focused on actionable patterns, skipped promotional content

## [2026-04-06] build | Faber SQLite Index Layer
- Created: `wiki/faber_sync.py` — Python script to parse all .md files → populate faber.db
- Created: `/faber-sync` skill — rebuild DB on demand or after ingest/seed
- Updated: `/faber-ingest` — duplicate detection via SQL, auto-sync at end
- Updated: `/faber-lint` — SQL views replace file reads for structural checks
- Updated: `/faber-query` — FTS5 full-text search + relation traversal
- Updated: `/faber-status` — dashboard queries via SQL views
- Updated: `/faber-seed` — auto-sync at end instead of manual index generation
- Updated: `wiki/FABER.md` — documented SQLite layer, directory structure, agent consumption
- Refactored: `wiki/index.md` — now auto-generated compact dashboard (not manual catalog)
- Added: `wiki/faber.db` to `.gitignore`
- **DB stats:** 40 pages, 318 relations, 127 wikilinks, 30ms sync time

## [2026-04-06] query → synthesis | SaaS Launch Manifest
- Query: "Generează un manifest și plan de acțiune pentru a începe corect un proiect SaaS"
- Synthesis created: saas-launch-manifest
- Sources consulted: 7 (alteramens-manifest, naval-framework, skill-era-article, ai-marketing-distribution, severino-claude-sales-system, eric-siu-world-intelligence, nbrain-concept)
- Concepts involved: 14 (validate-before-build, kill-fast, encoded-judgment, skill-era, distribution-over-product, mcp-as-distribution, deliver-dont-promise, viral-artifacts, leverage, productize-yourself, compounding-games, internal-to-product, data-compounding-moat, programmatic-seo)
- **Cross-wiki synthesis:** combines operational principles (manifest), philosophical foundations (Naval + Skill Era), distribution tactics (marketing sources), and practical patterns (Severino) into actionable weekly sequence

## [2026-04-07] link | workshop/drafts/ai-learning-platform.md
- Added 4 vault→wiki links: validate-before-build, encoded-judgment, kill-fast, skill-era
- Added 3 wiki→vault references: validate-before-build.applications, kill-fast.applications, encoded-judgment.applications
- Document promoted from "skipped — low overlap" (2026-04-05 seed) to actively linked

## [2026-04-08] ingest | AI Tutor Admitere — Strategic Decoupling + Competitive Intel
- Source: conversation:2026-04-08 (deferred deliberations from prior session)
- Entities created: eduboom, centrul-excelenta-carol-davila
- Entities updated: carol-davila-umf (added competitor relations + competitive landscape section)
- Concepts created: (none)
- Concepts updated: (none — strategic resolution, not new patterns)
- Sources updated: brainstorm-ai-tutor-medicina (added competitor entities to frontmatter, added Resolution section to Risk flagged, expanded See also)
- Synthesis updated: ai-tutor-admitere-strategic-frame (resolved 1K MRR open question, added competitive landscape section, bumped updated date)
- Vault doc updated: workshop/drafts/ai-learning-platform.md (PIVOT marker at top, two new rows in Decizii table, status → pivoted)
- Vault doc updated: projects/ai-tutor-admitere/decisions.md (Decision 5 — decoupling from 1K MRR, Note 5a — AIDIDACT brand proposal, Note 5b — competitor intel, Open decisions list refreshed)
- **Totals: 2 entities, 1 wiki source updated, 1 synthesis updated, 2 vault docs updated**
- Strategic resolution: the 1K MRR / 6-month tension flagged as "most important open question" in the 2026-04-07 brainstorm is now resolved — Path A chosen (decouple, play 18-24 month compounding game, full implementation flexibility)
- Brand proposal recorded: AIDIDACT (autodidact + AI), not yet ratified
- Portfolio-level question raised: does the 1K MRR / 6 month goal stay active for Alteramens via a different vehicle? — deferred to a separate portfolio strategy session

## [2026-04-08] build | Faber Temporal Layer — log.md → SQL + new views + /faber-brief
- Created: temporal layer in `wiki/faber_sync.py` — log.md is now parsed into structured `log_events` + `log_event_pages` junction
- Created: 10 new SQL views — v_recent_activity, v_log_integrity, v_log_mismatches, v_page_activity, v_recently_touched_pages, v_recent_pages, v_stale_concepts, v_ingest_velocity, v_daily_activity, v_phantom_log_refs, v_backlinks
- Created: 2 new FTS5 virtual tables — fts_claims (search across all key claims), fts_log (search across all log entries body+title)
- Created: skill `/faber-brief` — single-SQL session wake-up briefing for fresh Claude sessions
- Updated: skill `/faber-status` — adds recent activity, recently touched pages, ingest velocity, daily activity, log mismatches, phantom log refs sections
- Updated: skill `/faber-query` — supports temporal filters (--since, --recent), FTS log search, combined topic+temporal queries, page-history traversal via log_event_pages
- Updated: skill `/faber-lint` — adds log integrity checks, phantom log refs, stale concepts (via log activity), orphaned ingest events
- Updated: `wiki/FABER.md` — formalizes the log.md format as a parsing contract (header regex, label table, reconciliation rules), documents both DB layers (knowledge graph + temporal), updates Agent Consumption section
- Updated: `wiki/index.md` — auto-generated, now includes "Recent Activity" and "Recently Touched Pages" sections
- Added: temporal indexes on `pages.updated`, `pages.created`, `pages.ingested`, `pages.type`, `pages.maturity`
- Added: source-slug reconciliation — ingest events matching `pages.source_ref` against `Source: <url>` lines automatically
- Added: claimed-vs-actual integrity checks (claimed_sources_created etc. on log_events)
- Added: sync_log history is now preserved across rebuilds (was previously dropped)
- **DB stats:** 65 pages, 539 relations, 331 wikilinks, 11 log events parsed, 0 mismatches, 0 phantom log refs, ~120ms sync
- **Why:** Faber was a static knowledge graph — knew *what* exists but not *how it evolved*. log.md captured the evolution but was 100% write-only. Now the DB has temporal awareness: "what did I work on last week", "show me everything touching concept X over time", "ingest velocity per week" all answerable in one SQL query
- **Compounding angle:** every future ingest, lint, or query operation will be automatically structured into log_events on the next sync — the wiki is now self-aware about its own history

## [2026-04-07] ingest | Brainstorm — AI Tutor pentru Admitere Carol Davila
- Source: conversation:2026-04-07 (Narcis ↔ Claude brainstorm)
- Source page created: brainstorm-ai-tutor-medicina
- Entities created: carol-davila-umf, mihai-brindusescu
- Concepts created: bounded-problem-wedge, longitudinal-user-model, calibration-over-content, agentic-curriculum, bootcamp-pricing, reverse-time-planning
- Concepts updated: data-compounding-moat (added per-user variant + new source), building-in-public (added maximum-stake variant + entities), authentic-creation (added max-stake application + entities), specific-knowledge (added healthcare/AI/pedagogy intersection)
- Synthesis created: ai-tutor-admitere-strategic-frame (5-layer stack: wedge → mechanism → pricing → authenticity → compounding)
- Vault project doc created: projects/ai-tutor-admitere/decisions.md (4 decisions logged + open questions)
- **Totals: 1 source, 2 entities, 6 concepts, 1 synthesis = 10 new wiki pages + 4 concepts updated + 1 vault doc**
- Pivot: this brainstorm reframes the earlier vault concept [[workshop/drafts/ai-learning-platform]] from generic ed-tech to bounded "AI tutor for Carol Davila admission, biology, 2027 cohort"
- Guided ingest: extraction plan confirmed by Narcis before writing

## [2026-04-08] query → project artifact | AI Tutor Admitere — PRD Alpha v0.1
- Query: "schiță versiune alpha de PRD pentru platforma de învățare admitere Carol Davila 2027"
- Source pages consulted: brainstorm-ai-tutor-medicina, ai-tutor-admitere-strategic-frame, agentic-curriculum, calibration-over-content, longitudinal-user-model, reverse-time-planning, bounded-problem-wedge, bootcamp-pricing, building-in-public, authentic-creation, encoded-judgment, eduboom, centrul-excelenta-carol-davila, carol-davila-umf, mihai-brindusescu, specific-knowledge
- Project artifact created: projects/ai-tutor-admitere/prd-alpha.md (alpha v0.1, 20 sections + 2 anexe)
- New material vs existing wiki: 6-module breakdown with acceptance criteria, MVP cut for autumn 2026, 4-tier success metrics, content validation pipeline, architectural property requirements, gated roadmap, 8 new open decisions proposed for decisions.md
- No new wiki pages created (this is a project-level artifact, not knowledge promotion)
- Decoupled from 1K MRR / 6 month goal per Decision 5 (2026-04-08)
