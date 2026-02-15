---
parent: "[[forma-mono/forma-mono|Forma]]"
type: doc
---

# Forma - Arhitectură

## Overview

Bun workspace monorepo cu 2 packages: `@forma/core` (zero deps) și `@forma/server` (Hono).

## Core Data Flow

```
FormBuilder.create("id")
  .describe("...")
  .text("field", opts)
  .build()
    → FormSchema (frozen)
      → FormValidator.validate(schema, data)     → { valid, data/errors }
      → FormIntrospector.describe(schema)         → agent-readable summary
      → ToolSchemaGenerator.claude(schema)        → Claude tool_use definition
      → ToolSchemaGenerator.openai(schema)        → OpenAI function calling definition
```

## Key Abstractions

### FormSchema
Central data structure: id, version, name, description, instructions (for agents), fields[], rules[], metadata.

### FormBuilder (Fluent API)
Chainable methods: `.text()`, `.number()`, `.boolean()`, `.email()`, `.select()`, `.multiSelect()`, `.group()`, `.array()`, `.rule()`, `.metadata()`, `.build()`.

### FormValidator
Sync validation. Returns discriminated union: `{ valid: true, data }` or `{ valid: false, errors[] }`. Error codes: `REQUIRED`, `INVALID_TYPE`, `INVALID_OPTION`, `INVALID_FORMAT`, etc.

### FormatRegistry
Pluggable format validators. Built-in: email, url, uuid, date, datetime, phone. Romanian locale: CUI, CNP, phone-ro.

### ToolSchemaGenerator
Transforms FormSchema → LLM tool definition. Two outputs:
- `.claude(schema)` → `{ name, description, input_schema }` (direct tool_use)
- `.openai(schema)` → OpenAI function calling envelope

## Server (Hono)

REST API cu StorageAdapter interface. Doar InMemoryStorage implementat. Endpoints: CRUD forms, describe, tool-schema, validate, submit, list submissions.
