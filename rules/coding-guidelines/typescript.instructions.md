---
description: TypeScript style — options objects, named exports, async/await, enums
applyTo: "**/*.ts,**/*.tsx"
paths:
    - "**/*.{ts,tsx}"
globs:
    - "**/*.{ts,tsx}"
alwaysApply: false
---

# TypeScript Rules

## Function signatures

- If a function takes **more than 2** parameters, use a single options object. This makes call sites self-documenting and avoids argument-order mistakes.

    ```ts
    // Bad
    getSortedJobs("createdAt", true, 20);

    // Good
    getSortedJobs({ orderBy: "createdAt", includeSoftDeleted: true, limit: 20 });
    ```

- Use default argument values (`function f(name = "X")`) instead of `name || "X"` or conditional fallbacks inside the body.
- Prefer `param?: T` over `param: T | undefined` — the optional form does not require callers to explicitly pass `undefined`.

## Imports / exports

- Use **named exports only**. Default exports are allowed only when technically required (e.g. a framework demands it).
- Use relative imports only for **sibling or child** files within the same module. Everything else uses the `@src/…` alias.
    - This only applies to projects that define the `@src/…` path alias. Library packages compiled with plain `tsc` can't use it, because `tsc` doesn't rewrite path aliases in its output, so they use relative imports, including for ancestor files.

## Async & iteration

- Prefer `async/await` over raw callbacks or `.then()` chains.
- Prefer `for…of` over `Array.prototype.forEach` — it supports `await`, `break`, `continue`, and all iterables.

## Enums

- Enum **keys** and **values** use `camelCase`, and keys must equal their values.

    ```ts
    enum Direction {
        north = "north",
        northEast = "northEast",
        // …
    }
    ```

- GraphQL-exposed enums follow a different rule — see [api-nestjs.instructions.md](api-nestjs.instructions.md#graphql-enums).
