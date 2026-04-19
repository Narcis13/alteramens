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

## [2026-04-09] query → synthesis | Knowledge-Driven Platform Paradigm

- Source: conversation:2026-04-09
- Guided ingest: yes — brainstorm on SaaS paradigm shift, filtered by user (meta-trap concept excluded)
- Concepts created: emergent-schema, executable-wiki, ambient-computation, knowledge-first-development
- Concepts updated: world-model (added related), conversational-interface (added related), internal-to-product (added related), skill-era (added related), encoded-judgment (added related), agent-fleet-architecture (added related)
- Synthesis created: knowledge-driven-platform-paradigm
- Sources consulted: 4 (skill-era-article, eric-siu-world-intelligence, nbrain-concept, workscript-decisions)
- Concepts involved: 13 (skill-era, world-model, encoded-judgment, conversational-interface, emergent-schema, executable-wiki, ambient-computation, knowledge-first-development, internal-to-product, distribution-over-product, validate-before-build, compounding-games, agent-fleet-architecture)
- Entities involved: 5 (alteramens, nbrain, workscript, single-brain, single-grain)
- Query: "How does the SaaS paradigm shift from rigid database wrappers to AI-driven knowledge platforms?"
- **Totals: 0 sources, 0 entities, 4 concepts = 5 new + 6 updated**

## [2026-04-09] query → synthesis | Personal Brand Strategy — Narcis, AI Builder
- Query: "Ce strategie să adopt pentru a-mi crea un brand personal Narcis, specialist în AI cu aplicare în programare și ed-tech"
- Synthesis created: personal-brand-strategy
- Sources consulted: 4 (nbrain-social-strategy, naval-framework, ai-marketing-distribution, brainstorm-ai-tutor-medicina)
- Concepts involved: 10 (productize-yourself, specific-knowledge, building-in-public, accountability, authentic-creation, leverage, answer-engine-optimization, distribution-over-product, skill-era, viral-artifacts)
- Entities involved: 4 (nbrain, alteramens, naval-ravikant, mihai-brindusescu)
- Key output: 5 content pillars, platform matrix (LinkedIn/GitHub/Blog/X/TikTok), brand architecture (Narcis = umbrella, products underneath), 5-step launch sequence, anti-patterns
- **Totals: 0 sources, 0 entities, 0 concepts, 1 synthesis = 1 new page**

## [2026-04-09] lint | Health Check
- Issues: 2 high (phantom vault links + parser false positives in faber-sqlite-index), 15 medium (4 orphan syntheses + 11 missing wikilinks), 45+ low (24 thin pages + backlink-poor)
- Temporal layer: clean (0 mismatches, 0 phantom log refs, 0 stale concepts)
- Suggestions: 5 (2 parser fixes: vault-link classification + code-block escaping; 3 content: cross-link orphan syntheses, add missing wikilinks, enrich thin entities)

## [2026-04-14] seed | Marketing Skills Catalog Pass
- Processed 35 marketing skills in `.claude/skills/` (excluding faber-*, email, frontend-slides, knowledge-capture, session-sync)
- Strategy: lightweight catalog — pointer-only, not full concept extraction. See reasoning in synthesis page.
- Skills indexed by cluster: CRO (6), SEO (5), Content & Copy (4), Paid (3), Lifecycle (4), Strategy (6), Distribution (2), Sales/RevOps (5)
- Syntheses created: marketing-skills-catalog
- Sources created: (none — skills are local artifacts, source of truth is SKILL.md)
- Entities created: (none)
- Concepts created: (none — deep extraction deferred to lazy-ingest on project application)
- Concepts involved: 5 (encoded-judgment, specific-knowledge, skill-era, leverage, distribution-over-product)
- Entities involved: 1 (alteramens)
- Rationale: SKILL.md files are already encoded judgment; paraphrasing them into concepts would duplicate canonical content. Concept pages will be created when a skill is applied to a real project and produces non-obvious learnings.
- **Totals: 0 sources, 0 entities, 0 concepts, 1 synthesis = 1 new page**

## [2026-04-14] ingest | CRO Skills Suite — Deep Ingest (Cluster 1 din Catalog)
- Source: .claude/skills/{page-cro,signup-flow-cro,onboarding-cro,form-cro,popup-cro,paywall-upgrade-cro}/SKILL.md
- Strategy: 6 skill-uri ingerate ca un singur source (suite coordonat, vocabular partajat), 6 concepts cross-cutting extrase, 1 synthesis aplicat pentru proiecte Alteramens
- Language: conținut în română, slugs în engleză (convention-consistent cu wiki existent)
- Source page created: cro-skills-suite
- Entities created: (none — skill-urile sunt expertiză generică, nu persoane/companii)
- Entities updated: (none)
- Concepts created: value-before-ask, friction-cost, progressive-commitment, aha-moment, escape-hatch-principle, context-aware-interrupt
- Concepts updated: (none — toate 6 sunt noi în wiki)
- Syntheses created: cro-framework-alteramens
- Syntheses updated: marketing-skills-catalog (Cluster 1 marcat deep-ingested cu cross-refs)
- Key insight: cele 6 skill-uri împărtășesc un vocabular comun (friction, aha moment, progressive commitment, value-first, escape hatch). Extragerea concepts-urilor ca atomi reutilizabili permite querying pattern-urilor fără duplicare.
- **Totals: 1 source, 0 entities, 6 concepts, 1 synthesis = 8 new + 1 updated**
- Guided ingest: false — Narcis a autorizat deep ingest direct, fără Q&A intermediar (per directive: "treci direct la primul cluster")

## [2026-04-14] ingest | SEO Skills Suite — Deep Ingest (Cluster 2 din Catalog)
- Source: .claude/skills/{seo-audit,ai-seo,schema-markup,programmatic-seo,site-architecture}/SKILL.md
- Strategy: 5 skill-uri ingerate ca un singur source (suite cu cross-referencing activ), 5 concepts noi extrase, 2 concepts existente actualizate substanțial (promovate de la seed la developing), 1 synthesis aplicat
- Language: conținut în română pentru pagini noi; updates la concepts existente ca secțiuni separate dated (păstrează conținutul englez original per Faber convention "ADD, don't replace")
- Source page created: seo-skills-suite
- Entities created: (none — skill-urile sunt expertiză generică)
- Entities updated: (none)
- Concepts created: extractable-content, third-party-signal, machine-readable-structure, hub-and-spoke-architecture, agent-readable-web
- Concepts updated: answer-engine-optimization (seed → developing, adăugat Princeton GEO research, cei 3 piloni, platform differences, statistici critice, monitoring tools, AI bots crawl control, machine-readable files, content types citation share), programmatic-seo (seed → developing, adăugat cele 12 playbooks, ierarhia defensibilității datelor, quality-over-quantity principle, URL structure, implementation framework)
- Syntheses created: seo-framework-alteramens
- Syntheses updated: marketing-skills-catalog (Cluster 2 marcat deep-ingested cu cross-refs)
- Key insights:
  - Web-ul se despică în human-readable și agent-readable layer — concepte precum agent-readable-web (`/pricing.md`, `/llms.txt`) devin leverage asimetric pentru solo builders
  - Princeton GEO research (KDD 2024) oferă o primă măsurătoare riguroasă a efectului tacticilor AI SEO: +40% pentru citing sources, -10% pentru keyword stuffing
  - Third-party presence (Wikipedia, Reddit, G2) este 6.5x mai impactantă decât propriul site pentru AI citations
- **Totals: 1 source, 0 entities, 5 concepts, 1 synthesis = 7 new + 3 updated**
- Guided ingest: false — continuation directive from previous cluster ("treci la clusterul urmator")

## [2026-04-14] ingest | Content & Copy Skills Suite — Deep Ingest (Cluster 3 din Catalog)
- Source: .claude/skills/{copywriting,copy-editing,content-strategy,lead-magnets}/SKILL.md
- Strategy: 4 skill-uri ingerate ca un singur source (suite coordonat care leagă SEO de CRO prin layer-ul de mesaj), 5 concepts noi cross-cutting extrase, 1 synthesis aplicat
- Language: conținut în română, slugs în engleză (convention-consistent)
- Source page created: content-copy-skills-suite
- Entities created: (none — skill-urile sunt expertiză generică)
- Entities updated: alteramens (added new source ref)
- Concepts created: searchable-vs-shareable, seven-sweeps-editing, voice-of-customer, content-pillars, buyer-stage-mapping
- Concepts updated: (none — toate 5 sunt noi)
- Syntheses created: content-copy-framework-alteramens
- Key insights:
  - Suite-ul Content & Copy se așează în mijloc între SEO (atrage) și CRO (convertește) — "mesajul" e layer-ul lipsă pe care celelalte două îl presupun dar nu îl fabrică
  - Seven Sweeps Editing e judgment encodat în formă pură: o procedură reproductibilă care înlocuiește ani de mentorat editorial (1 dimensiune per pas + loop-back)
  - Searchable-vs-Shareable e regula de prioritizare care elimină 60-70% din ideile de blog post-uri în mod sistematic
  - Voice of Customer e materia primă a copy-ului (nu element decorativ); sursa primă = interviuri 1:1 + reviews + support tickets, nu LLM-generated
  - Cele 4 skill-uri sunt expresii ale Skill Era: pentru un solo builder cu 10h/săpt, multiplicatorul real nu e viteza, ci consistența calității deciziei strategice (stadiu, format, trigger)
- **Totals: 1 source, 0 entities, 5 concepts, 1 synthesis = 7 new + 1 updated**
- Guided ingest: true — Narcis a confirmat plan-ul (5 concepte + synthesis paralel + emfasă pe Skill Era) înainte de scriere

## [2026-04-14] ingest | Paid Acquisition Skills Suite — Deep Ingest (Cluster 4 din Catalog)
- Source: .claude/skills/{paid-ads,ad-creative,ab-test-setup}/SKILL.md
- Strategy: 3 skill-uri ingerate ca un singur source (suite coordonat: ipoteză → producție creative → măsurare statistică), 5 concepts noi cross-cutting extrase, 1 synthesis aplicat cu accent pe "experimentation as compounding asset"
- Language: conținut în română, slugs în engleză (convention-consistent)
- Source page created: paid-acquisition-skills-suite
- Entities created: (none — skill-urile sunt expertiză generică)
- Entities updated: alteramens (added new source ref)
- Concepts created: hypothesis-driven-experimentation, ice-prioritization, angle-diversification, performance-data-loop, paid-acquisition-economics
- Concepts updated: (none — toate 5 sunt noi)
- Syntheses created: paid-acquisition-framework-alteramens
- Key insights:
  - Pentru solo builder, paid ads devine compounding asset (nu cost continuu) DACĂ rulezi performance-data-loop cu capture religios. 12-16 experiments/lună × 25% win rate = 30-60 patterns/an capturate în playbook. Playbook-ul devine specific knowledge (Naval) — imposibil de copiat pentru că e derivat din date proprii.
  - ICE Prioritization e cel mai transferabil din cele 5: aplică la experiments, features, proiecte, content — orice context cu multe opțiuni și timp limitat. Standalone framework.
  - Angle diversification e distinct de voice-of-customer (limbaj) și buyer-stage-mapping (timing). 8 categorii validate (pain/outcome/social proof/curiosity/comparison/urgency/identity/contrarian) — 3-5 per campanie e sweet spot.
  - Paid acquisition economics impune decision tree strict: "should I run ads at all" are 5 pre-condiții non-negociabile. Pentru nbrAIn în stadiul curent: paid OFF; build organic foundation first.
  - Cele 3 skill-uri compresează experiment time de la 6-9h/experiment la 2.5-3h/experiment → velocity 4x → compounding real pentru 10h/săpt bucket
- **Totals: 1 source, 0 entities, 5 concepts, 1 synthesis = 7 new + 1 updated**
- Guided ingest: true — Narcis a confirmat plan-ul (5 concepte recomandate + accent pe "experimentation as compounding asset" + continuă Skill Era) înainte de scriere

## [2026-04-14] ingest | Lifecycle & Retention Skills Suite — Deep Ingest (Cluster 5 din Catalog)
- Source: .claude/skills/{email-sequence,cold-email,churn-prevention,referral-program}/SKILL.md
- Strategy: 4 skill-uri ingerate ca un singur source (suite coordonat: activare → outbound → prevenție churn → viralitate), 6 concepts noi cross-cutting extrase, 1 synthesis aplicat cu accent pe "retention ca compounding game + revenue protection before growth"
- Language: conținut în română, slugs în engleză (convention-consistent)
- Source page created: lifecycle-retention-skills-suite
- Entities created: (none — skill-urile sunt expertiză generică; tools rămân în tools/REGISTRY.md)
- Entities updated: (none)
- Concepts created: dynamic-save-offer, voluntary-vs-involuntary-churn, dunning-stack, churn-health-score, referral-loop, peer-voice-outreach
- Concepts updated: value-before-ask (added lifecycle source + 2 related links), aha-moment (added lifecycle source + 2 related links), friction-cost (added lifecycle source + 2 related links)
- Syntheses created: lifecycle-retention-framework-alteramens
- Syntheses updated: marketing-skills-catalog (marked Cluster 5 as ingested with cross-links)
- Key insights:
  - Voluntary vs involuntary churn taxonomy e primul layer — 50-70% / 30-50% split. Dunning stack (involuntary) e adesea cel mai mare ROI quick-win pentru solo builders ($500-2000 valoare, 1-2 zile muncă, 40-60% recovery pe toate generațiile viitoare de customers).
  - Dynamic save offer: match offer la cancel reason — same offer pentru toate reason-urile pierde 50-80% din save-uri. Pattern generalizabil: "diagnostichează cauza, intervine specific".
  - Churn health score e Fază 3 (100-500 paying customers), nu premature. Înainte de asta, dunning + cancel flow minim.
  - Referral loop cere aha moment definit. Cererea înainte de aha = invite spam. Trigger moments high-intent: post-aha, post-milestone, post-excellent-support, post-renewal.
  - Peer voice outreach e universal (cold email, LinkedIn DM, Twitter replies, community DMs). Framework-ul nu e problema — vocea aplicată peste framework e.
  - Retention e compounding game: 1% reduction în monthly churn = ~12% increase LTV long-term. Pentru solo builder cu 10h/săpt, cel mai mare levier (mai mare decât features noi sau paid ads).
  - Skill Era aplicație specifică pentru Alteramens: retention skills ca produs (/setup-dunning-stripe, /design-cancel-flow, /referral-program-launch) — encoded judgment pur, ce costă $500-2000 cu consultant astăzi, invocabil în 15 min. Prototip potențial la Fază 3 Alteramens.
- **Totals: 1 source, 0 entities, 6 concepts, 1 synthesis = 8 new + 4 updated**
- Guided ingest: true — Narcis a aprobat plan-ul (6 concepte recomandate + synthesis cu accent pe Skill Era + retention-before-growth) înainte de scriere

## [2026-04-15] ingest | Strategy & Foundations Skills Suite — Deep Ingest (Cluster 6 din Catalog)
- Source: .claude/skills/{product-marketing-context,marketing-psychology,customer-research,pricing-strategy,launch-strategy,marketing-ideas}/SKILL.md
- Strategy: 6 skill-uri ingerate ca un singur source (suite upstream: contextul care configurează toate celelalte clustere — nu execută, configurează). 7 concepts noi cross-cutting + 1 concept existent promovat. 1 synthesis aplicat cu accent pe "configurație înainte de execuție" pentru solo operator AI-augmented cu timp limitat.
- Language: conținut în română, slugs în engleză (convention-consistent)
- Guided ingest: true — Narcis a aprobat plan-ul complet ("ship all")
- Source page created: strategy-foundations-skills-suite
- Entities created: (none — skill-urile sunt expertiză generică)
- Entities updated: alteramens (adăugat strategy-foundations-skills-suite + lifecycle-retention-skills-suite în sources list — lipsea lifecycle de la ingest-ul precedent)
- Concepts created: product-marketing-context, jobs-to-be-done, orb-channel-framework, phased-launch, value-based-pricing, good-better-best-pricing
- Concepts updated: voice-of-customer (added strategy-foundations-skills-suite source + 2 related links [product-marketing-context, jobs-to-be-done] + 2 noi secțiuni [two modes + confidence tiers + sample bias + JTBD linkage]; promoted developing → mature)
- Syntheses created: strategy-foundations-framework-alteramens
- Syntheses updated: marketing-skills-catalog (marked Cluster 6 as deep-ingested with cross-links)
- Key insights:
  - product-marketing-context e root-skill-ul: creează `.agents/product-marketing-context.md` pe care toate celelalte 30+ skills îl citesc ca prim pas. Pattern skill-era aplicat intern — encoded judgment recursiv, output-ul unui skill devine input pentru toate celelalte.
  - Cluster 6 NU face execuție; face configurație. Diferit calitativ de Clusters 1–5. "Configurația bună bate execuția bună pentru AI-augmented solo operator."
  - JTBD Four Forces (Push/Pull/Habit/Anxiety) operaționalizează switching dynamics. Marketing bun reduce Habit+Anxiety la fel cât amplifică Pull+Push (nu doar Pull).
  - ORB framework central rule: all roads lead to Owned. Rented/Borrowed dau atenție, doar Owned o păstrează (compounding).
  - Value-based pricing: preț între next best alternative și perceived value. Cost e doar baseline, NU basis. 3 axe (packaging × metric × price point) se decid împreună.
  - Good-Better-Best cu Better ca țintă, 2–3× între Better și Best e sweet spot. Anchoring + decoy + contrast simultan.
  - "Launch again and again" — fiecare feature = mini-launch. 5-phase approach (Internal → Alpha → Beta → Early Access → Full). Single "big bang" launch = anti-pattern.
  - Confidence tiers + recency window (12 luni) + min 5 data points per segment = research guardrails; nu fabrica persoanas din < 5 surse.
  - 4-star G2 reviews = cea mai bună sursă pentru competitive intel (3★=zgomot, 5★=fan, 4★=critică constructivă).
  - Pentru Alteramens (solo, AI-augmented, 1K MRR target): investiția în Cluster 6 (~10h) e ROI-ul cel mai mare per oră pentru că multiplică toate celelalte skills.
- **Totals: 1 source, 0 entities, 6 concepts, 1 synthesis = 8 new + 2 updated**

## [2026-04-15] ingest | Sales & Revenue Ops Skills Suite — Deep Ingest (Cluster 8 din Catalog)
- Source: .claude/skills/{sales-enablement,revops,analytics-tracking,competitor-alternatives,free-tool-strategy}/SKILL.md
- Strategy: 5 skill-uri ingerate ca un singur source (suite revenue-accountability: cluster-ul care închide loop-ul de la marketing la deal închis). 7 concepts cross-cutting noi + 1 synthesis aplicat pentru small-team AI-augmented solo cu 1K MRR target.
- Language: conținut în română, slugs în engleză (convention-consistent)
- Guided ingest: true — Narcis a aprobat 5–7 concepts, nothing to skip
- Source page created: sales-revenue-ops-skills-suite
- Entities created: (none — skill-urile sunt expertiză generică)
- Entities updated: alteramens (adăugat sales-revenue-ops-skills-suite în sources list)
- Concepts created: speed-to-lead, lead-lifecycle-funnel, fit-plus-engagement-scoring, engineering-as-marketing, honest-competitive-positioning, tracking-plan-as-contract, revenue-attribution-loop
- Concepts updated: (none — all 7 are new territory)
- Syntheses created: sales-revenue-ops-framework-alteramens
- Syntheses updated: marketing-skills-catalog (marked Cluster 8 as deep-ingested with cross-links — catalogul întreg acum 100% deep-ingested pe toate 8 clustere)
- Key insights:
  - Cluster 8 e revenue-accountability layer: nu creează demand (asta fac Clusters 1–7), ci conectează demand la closed revenue. Singurul cluster care duce măsurarea până la ARR.
  - Speed-to-lead e cel mai subestimat factor: <5min = 21× conversion vs baseline; >30min = 10× drop. La scale mic automatizarea (push notifications, auto-reply cu Calendly) rezolvă SLA-ul fără staffing.
  - MQL requires BOTH fit AND engagement — niciunul singur nu e suficient. Perfect fit fără engagement = lead neservibil. Engagement fără fit = time waste. Scoring-ul operaționalizează acest AND.
  - Revenue attribution loop = Analytics → RevOps → Sales-Enablement → feedback. Dacă feedback loop-ul e rupt, modelul de scoring se deprecia silently și calitatea leads scade. Compounding engine.
  - Engineering as marketing (free tools) = unfair advantage pentru AI-augmented solo: un tool care lua 2-4 săptămâni ia acum 3-5 zile. Compoundează SEO + brand + lead capture. 8-factor scorecard (25+ strong) ca decision filter.
  - Honest competitive positioning beats trash-the-competitor pentru underdog: cititorii verifică claims în 4 minute. Acknowledge competitor strengths = trust moat. 4-star G2 reviews sunt aurul research-ului.
  - Tracking plan as contract: events decision-first, NOT data-first. object_action naming (lowercase, underscores). Context în properties, nu în event name. Fără tracking plan disciplinat, AI-augmented analytics workflow nu scalează.
  - Pentru 1K MRR Alteramens: loop-ul simplified (spreadsheet scoring, markdown collateral, 5 essential events, 3 comparison pages) e mai important, nu mai puțin. Small-team dacă ratează un lead = 1% lunar impact. Cluster 8 discipline = între 15% și 25% close rate diferență pe aceeași pipeline.
- **Totals: 1 source, 0 entities, 7 concepts, 1 synthesis = 9 new + 2 updated**

## [2026-04-15] lint | Health Check
- Phantoms: 14 (2 vault-ref syntax, 5 `[[concepts]]` as folder pointer, 3 skill-name wiki-links, 4 false positives in faber-sqlite-index doc examples)
- Log integrity: clean (0 mismatches, 0 phantom log refs, 0 orphaned ingest events)
- Orphans: 4 synthesis pages (expected — leaf nodes)
- Stale concepts: 0 (everything log-touched in <30 days)
- Backlink-poor: dri-with-agents (0), alteramens entity (1 — suspiciously low)
- Issues: 14 high, 4 medium, ~10 low
- Suggestions: 6

## [2026-04-16] query → synthesis | CRM Real Estate Exclusive — Launch Strategy
- Question: "Strategie completă de lansare pentru platformă CRM agenți imobiliari specializați în contracte de reprezentare exclusivă"
- Synthesis created: crm-real-estate-exclusive-launch
- Sources consulted: saas-launch-manifest, strategy-foundations-framework-alteramens, alteramens-manifest
- Concepts referenced: bounded-problem-wedge, phased-launch, validate-before-build, kill-fast, orb-channel-framework, value-based-pricing, good-better-best-pricing, jobs-to-be-done, voice-of-customer, engineering-as-marketing, deliver-dont-promise, programmatic-seo, third-party-signal, peer-voice-outreach, compounding-games, productize-yourself, encoded-judgment, skill-era, specific-knowledge, internal-to-product, data-compounding-moat, distribution-over-product, leverage
- Key insights:
  - Wedge bounded = "agent imobiliar cu mandat exclusiv", NU "agent imobiliar generic" — elimină competiție cu HubSpot/Salesforce/Imoapp/KW Command
  - Judgment encodat = Weekly Seller Report + Objection Playbook + Listing Presentation, NU doar CRUD pe contacte — feature-urile pot fi clonate, metodologia + corpus verbatim RO nu
  - Red flag autenticitate: Narcis nu vine din real estate → necesită co-pilot insider sau 30+ interviuri ca să închidă gap-ul de specific knowledge
  - Wiki gap identificat: 0 pagini Faber despre real estate / vertical SaaS → recomandat ingest 3-5 surse (REMAX Approach, Mike Ferry, Gary Keller SHIFT) înainte de validare
  - Pricing: Good €29 / Better €69 (ținta) / Best €149; trial 14 zile fără card, NU freemium (agenții nu sunt price-sensitive la ROI vizibil)
  - Target 1K MRR = ~15 Pro clienți — fezabil în nișa RO de agenți exclusivi dacă distribuția începe în ziua 1
  - Kill criteria explicite: <3 interviuri cu durere intensă la săpt 2 → stop; <€300 MRR la luna 4 → revalidare wedge
- Maturity: seed (awaiting validation with 10 real-estate-agent interviews)
- **Totals: 0 sources, 0 entities, 0 concepts, 1 synthesis = 1 new**

## [2026-04-18] ingest | Pat Walls — $1T Agent-First Startup Opportunity Thread
- Source: conversation:2026-04-18 (thread pasted by Narcis, attributed to Pat Walls / @startupideaspod)
- Guided ingest: yes (Narcis directed emphasis on vertical-operator-edge + media-plus-agents + outcome-based-pricing; no skips)
- Source page created: pat-walls-agent-first-1t-thread
- Entities created: pat-walls, sam-parr, roy-lee, salesforce, hubspot, workday, startup-ideas-podcast
- Entities updated: (none)
- Concepts created: agent-native-startup, headless-saas-thesis, outcome-based-pricing, vertical-operator-edge, media-plus-agents-distribution, agent-replaces-implementation
- Concepts updated: specific-knowledge (added operator-edge angle + Pat Walls source), distribution-over-product (added agent-native era sharpening + media+agents link), skill-era (added founder-opportunity angle + 4 new related concepts), mcp-as-distribution (added agent-native era context + headless-saas + media+agents links), value-based-pricing (added outcome-based specialization note), ai-native-org-design (added external-facing agent-native-startup version), agent-fleet-architecture (added when-it-becomes-a-product note)
- Syntheses created: agent-native-vertical-playbook
- Syntheses updated: alteramens-thesis (added "Sharpened: Agent-Native Vertical Playbook" section with 4 adjustments)
- Key insights:
  - Pat Walls thread compresses Alteramens strategy into a 4-leg stool: vertical-operator-edge + agent-native product + outcome-based pricing + media+agents distribution
  - Distribution is the weakest leg for Alteramens today — LinkedIn cadence must start immediately (12-24mo compounding window)
  - nBrain architecture pressure-test: is it truly wrapping Romanian accounting backends (SAGA, CielInfo, ANAF) or building yet another DB? Former is more defensible per headless-saas-thesis
  - Outcome measurement must be instrumented from v1 even if pricing stays flat at 50 EUR/month — retrofit cost is 10x
  - Naval's specific-knowledge = Pat Walls' vertical-operator-edge (same idea, cycle-specific expression); both Alteramens intersections (accounting + healthcare IT) pass all 4 operator-edge tests
  - "Silicon Valley goes all influencer" validates personal-brand-strategy investment rather than treating it as nice-to-have
- **Totals: 1 source, 7 entities, 6 concepts, 1 synthesis = 15 new + 8 updated**

## [2026-04-19] query → synthesis | Altera OS — Framework Fit & Honest Gaps
- Query: "analizează ideea Altera OS în contextul conceptelor din wiki — generăm concepte noi sau trece filtrele Skill Era + agent-native era?"
- Source: workshop/ideas/altera-os.md (v1.2, 2103 linii)
- Guided ingest: yes (Narcis a cerut explicit filing + drafturi pentru concepte noi)
- Synthesis created: altera-os-framework-fit
- Concepts created: sovereign-ai-tokenization, dual-orchestrator-pattern, ai-native-operational-platform
- Sources consulted: 5 (skill-era-article, pat-walls-agent-first-1t-thread, eric-siu-world-intelligence, naval-framework, alteramens-manifest)
- Concepts involved: 22 (skill-era, encoded-judgment, agent-native-startup, vertical-operator-edge, internal-to-product, emergent-schema, executable-wiki, ambient-computation, conversational-interface, headless-saas-thesis, data-compounding-moat, compounding-games, specific-knowledge, productize-yourself, bounded-problem-wedge, validate-before-build, outcome-based-pricing, media-plus-agents-distribution, mcp-as-distribution, sovereign-ai-tokenization, dual-orchestrator-pattern, ai-native-operational-platform)
- Entities involved: 3 (alteramens, nbrain, pat-walls)
- Key insights:
  - Altera OS este cea mai completă materializare a fundamentului Alteramens — 15 concepte wiki instanțiate simultan
  - Trece filtrul Skill Era maximal (judgment encodat, leverage, compounding, internal-to-product)
  - Trece parțial filtrul agent-native — 4 fisuri identificate: hibrid UI+chat vs pur agent-native, rebuild vs wrap incumbent, distribuție absentă, outcome-based pricing absent
  - Tensiune explicită cu bounded-problem-wedge: build plan de 14 packages pentru 1 MVP use-case; risc platform-before-wedge antipattern
  - Spec-ul expune 3 pattern-uri novel merite concepte dedicate: sovereign tokenization ca regulatory moat, dual orchestrator (runtime+dev-time), ai-native operational platform ca a treia categorie lângă agent-native-startup și headless-saas-thesis
  - Ai-native-operational-platform creează contradictions explicite cu agent-native-startup și bounded-problem-wedge — flagged în frontmatter pentru viitor pressure-test
  - Recomandări prioritare: Sprint 0 = LinkedIn cadence; decide explicit categoria; instrumentează outcomes din Sprint 1; gate Phase 3 pe signal real nu calendar
- Maturity synthesis: developing
- **Totals: 0 sources, 0 entities, 3 concepts, 1 synthesis = 4 new + 0 updated**

## [2026-04-20] ingest | Marketing as Coding — The Reframe
- Source: conversation:2026-04-20 (article pasted by Narcis)
- Source page created: marketing-as-coding-reframe
- Concepts created: marketing-as-coding
- Concepts updated: engineering-as-marketing (added new source + cross-link), hypothesis-driven-experimentation (added new source + cross-link + section), compounding-games (added cross-link)
- Synthesis created: dev-native-marketing-stack-alteramens
- Guided ingest: discussed key takeaways with Narcis; he confirmed creating concept + synthesis
- Insight: reframe acts as umbrella over engineering-as-marketing, hypothesis-driven-experimentation, compounding-games — unifies 8 alteramens framework pages into a single dev-native repo architecture
- **Totals: 1 sources, 0 entities, 1 concepts = 3 new + 3 updated**
