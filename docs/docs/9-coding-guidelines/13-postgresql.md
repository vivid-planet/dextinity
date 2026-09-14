---
title: PostgreSQL
---

## Prefer UUIDs for IDs

Prefer UUIDs for IDs instead of auto-incrementing integers.

Reasons:

- Sequential IDs can be guessed. For example, a URL https://example.com/users/1 implies that there may be a URL https://example.com/users/2 as well
- UUIDs can be generated on the client before storing them in the database (this is done for page tree documents)
- UUIDs are unique, which allows migrating data across different environments
