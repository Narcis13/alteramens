---
parent: "[[contzo/contzo|Contzo]]"
type: doc
---

# Contzo - Arhitectură (Planificată)

## Overview

Modular monolith cu 3 subdomenii (contzo.com, app.contzo.com, api.contzo.com) + Docker Compose cu 5 servicii.

## Docker Compose Services

| Service | Role |
|---------|------|
| `postgres` | PostgreSQL 17 + pgvector |
| `minio` | S3-compatible object storage |
| `backend` | Bun.js/Hono.js API server |
| `cron-worker` | Periodic jobs (ANAF sync, notifications) |
| `nginx` | Reverse proxy + SSL + frontend static |

## Module Interne

| Modul | Funcționalitate |
|-------|----------------|
| Auth | JWT (httpOnly cookies), RBAC (admin/accountant/client), RS512 keys |
| Client | CRUD firme client, CUI lookup via ANAF public API |
| ANAF | OAuth2 flow, token lifecycle, rate limiting, retry with backoff |
| Invoice | Listing, upload, XML UBL validation, status tracking, PDF conversion |
| AI Agent | Claude Agent SDK, MCP server, SSE streaming, RAG cu pgvector |
| Document | MinIO presigned URLs, versioning, categories |
| Messaging | Threaded messages, attachments, read receipts |
| Notification | Priority-based in-app notifications |

## ANAF Integration Points

- **OAuth2** - non-standard behavior, USB token for initial auth
- **e-Factura API** - upload/download XML UBL invoices
- **SPV** - Virtual private space per company
- **Validation** - CIUS-RO schematron rules, EN16931 compliance

## Cross-Subdomain

- Auth cookies pe `.contzo.com` (leading dot) cu SameSite=Lax + Secure
- CORS pe api.contzo.com permite ambele origini
- Marketing site reads cookie client-side: "Go to Dashboard" vs "Join Waitlist"
