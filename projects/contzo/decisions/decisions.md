---
parent: "[[contzo/contzo|Contzo]]"
type: decisions
---

# Contzo - Decizii

| Decizie | Rațiune |
|---------|---------|
| Modular monolith (not microservices) | Solo developer, nu justifică complexitatea microservices |
| PostgreSQL + pgvector | Nevoie de vector search pentru RAG (AI agent) |
| Drizzle ORM | Type-safe, lightweight, Bun-compatible |
| Hono.js (not Express) | Modern, fast, Bun-first |
| Claude Agent SDK (pinned 0.2.37) | Pre-1.0 SDK, breaking changes expected - pin version |
| MinIO for storage | S3-compatible, self-hosted, no cloud vendor lock |
| Docker Compose | Simple orchestration for 5 services |
| Astro for marketing (separate repo) | SPA = bad SEO; Astro = static HTML, Lighthouse 100 |
| TanStack Router (not React Router) | Type-safe routing, better DX |
| decimal.js for VAT | JavaScript number precision issues cu ANAF rounding |
| httpOnly cookies (not localStorage) | XSS protection for auth tokens |
