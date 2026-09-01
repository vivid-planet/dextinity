---
"@dextinity/cms-api": patch
---

Throw a validation error for malformed UUID id args in `@AffectedEntity`

The permission check loads affected entities before input validation (e.g., `@IsUUID()`) runs, because guards execute before pipes. A malformed UUID therefore reached PostgreSQL, which failed with `invalid input syntax for type uuid` and surfaced as an internal server error.

Now id args for entities with a UUID primary key (and `pageTreeNodeIdArg` values) are validated upfront, and a `DextinityValidationException` is thrown for malformed UUIDs.
