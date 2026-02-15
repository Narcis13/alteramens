---
parent: "[[bunbase/bunbase|BunBase]]"
type: decisions
---

# BunBase - Decizii

| Decizie | Rațiune | Outcome |
|---------|---------|---------|
| Schema-in-database | Flexibilitate runtime, collections definite de user | Good |
| nanoid pentru IDs | URL-safe, 21 chars, fără hyphens | Good |
| Bun.serve() routes | Declarative, fast, built-in | Good |
| PocketBase-style hooks | Pattern familiar, cancellable | Good |
| Tailwind CSS v4 | CSS-based config, setup simplu | Good |
| shadcn/ui copy-paste | Fără npm dependency | Good |
| Auth rules: null=admin, ''=public | PocketBase-compatible | Good |
| Token rotation on refresh | Security - old token revocat | Good |
| 5-min SSE inactivity timeout | Cleanup connections stale | Good |
| Permission-filtered broadcasting | Events doar la subscribers autorizați | Good |
| Local filesystem storage | Simplu, fără dependențe externe | Good |
| Single binary compile | Portabilitate maximă | Good |
