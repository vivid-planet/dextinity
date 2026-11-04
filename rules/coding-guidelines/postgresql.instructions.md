---
description: UUID IDs, column types, forward-only migrations, DB defaults
applyTo: "**/*.entity.ts,**/entities/**/*.ts,**/migrations/**/*.ts,**/*.sql"
paths:
    - "**/*.entity.ts"
    - "**/entities/**/*.ts"
    - "**/migrations/**/*.ts"
    - "**/*.sql"
globs:
    - "**/*.entity.ts"
    - "**/entities/**/*.ts"
    - "**/migrations/**/*.ts"
    - "**/*.sql"
alwaysApply: false
---

# PostgreSQL Rules

## IDs

- Use **UUIDs** for primary keys, not auto-incrementing integers.
    - Sequential IDs leak counts and invite enumeration attacks (`/users/1` → `/users/2`).
    - UUIDs can be generated on the client before insert (used by page-tree documents).
    - UUIDs let data migrate between environments without ID collisions.

## Column types

See [api-nestjs.instructions.md](api-nestjs.instructions.md#entity-column-types) for the full list used with MikroORM:

- Strings → `columnType: "text"` (never `varchar(n)`).
- JSON → `jsonb`, not `json`.
- Timestamps → `columnType: "timestamp with time zone"`.

## Migrations

- Forward-only. Do not implement `down` migrations — `throw new Error("Unsupported")` is the standard. Problems get fixed by the next deploy, not rolled back.

## DB defaults

- Avoid DB-level defaults on columns exposed via the entity — they break the entity's TS types and aren't available before insert. Use TS-level defaults instead. Exception: upsert pattern, see [api-nestjs.instructions.md](api-nestjs.instructions.md#db-defaults).
