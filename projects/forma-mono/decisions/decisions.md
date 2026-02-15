---
parent: "[[forma-mono/forma-mono|Forma]]"
type: decisions
---

# Forma - Decizii

| Decizie | Rațiune |
|---------|---------|
| Zero-dependency core | Maximum portability, no supply chain risk |
| Fluent builder API | DX excelent, discoverable, chainable |
| Frozen schemas (Object.freeze) | Immutability prevents accidental mutation |
| Machine-readable error codes | Agents can programmatically interpret and fix errors |
| FormatRegistry (pluggable) | Extensibil fără modificare core |
| Romanian locale pack | Contzo needs CUI/CNP validation |
| Discriminated union for validation results | Type-safe handling of success/failure |
| Hono for server | Lightweight, Bun-compatible |
| StorageAdapter interface | Pluggable backends (memory, SQLite, Postgres) |
| Defer @forma/agent-sdk | Ship core + server first, SDK later |
