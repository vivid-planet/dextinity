---
description: NestJS service/controller layering, MikroORM, GraphQL, ACL
applyTo: "**/api/**/*.ts"
paths:
    - "**/api/**/*.ts"
globs:
    - "**/api/**/*.ts"
alwaysApply: false
---

# API (NestJS / MikroORM / GraphQL) Rules

## Layers

- **Controller / Resolver** = HTTP or GraphQL layer only. Thin: translate input, delegate to services, translate output.
- **Service** = business logic. Must be decoupled from the transport layer:
    - Do not accept GraphQL `InputType`s directly — accept plain objects / entities.
    - Prefer passing the entire **entity** over passing just an ID (avoids re-fetching and ID-vs-object confusion).
    - Services must be unit-testable and reusable from console jobs.
- Don't create a service just for pass-through methods. Introduce one only when business logic is reused or when the controller/resolver becomes messy.
- Utility files are fine if they are **pure, stateless functions**. They must not consume other services or repositories. Name them specifically — no generic `utils/` catch-all folders.

## Access control (ACL)

- Put ACL logic in a dedicated service (e.g. `products.acl.service.ts`) or inline in the controller/resolver for per-action checks.
- **Never** perform ACL checks inside shared business services — console jobs run without a user and would either fail or accidentally double-check.
- ACL logic must have unit tests.

## Dependency injection & config

- Use **constructor-based** injection. Property-based injection only when technically required.
- Do **not** read `process.env` inside services/controllers. It's untestable, unvalidated, and uncentralized. Exception: app entry points (`main.ts`, `bootstrap.ts`).

## Logging

- By default log **warnings and errors only**. Put debug / info / trace behind a flag or env-configured toggle. Logs cost money in Kubernetes — see [kubernetes.instructions.md](kubernetes.instructions.md).
- Use the built-in [NestJS Logger](https://docs.nestjs.com/techniques/logger).

## MikroORM

- Inject `EntityManager` directly. Do **not** inject repositories via `@InjectRepository` / `EntityRepository` — repositories are thin wrappers and add no value while complicating DI.

    ```ts
    // Good
    constructor(private readonly entityManager: EntityManager) {}

    async product(id: string) { return this.entityManager.findOneOrFail(Product, id); }
    ```

- Prefer `entityManager.create(Entity, data)` over `new Entity()` — `create` forces a complete data object.
- Down migrations are not required. Use `throw new Error("Unsupported")` in the `down` method. Issues are fixed forward via new deployments, never rollbacks.

## Entity column types

- IDs: `type: "uuid"` (see [postgresql.instructions.md](postgresql.instructions.md)).
- Strings: always `columnType: "text"` — never `varchar(n)`.
- JSON: prefer `jsonb` over `json`.
- Timestamps: `columnType: "timestamp with time zone"`.

## DB defaults

Avoid DB-level defaults — they aren't available before insert and falsify the entity's TS types. Set the default in TS instead.

```ts
// Bad
@Property({ default: false })
@Field()
visible: boolean;

// Good (GraphQL field — also provide a default in the InputType)
@Property()
@Field()
visible: boolean;

// Good (non-GraphQL property)
@Property()
visible: boolean = false;
```

Exception: the upsert pattern may additionally use `defaultRaw`/`onUpdate` as a fallback, on top of the TS default.

## GraphQL

### GraphQL enums

- Keys **must equal** values; both use camelCase, same as TS-only enums in [typescript.instructions.md](typescript.instructions.md#enums).

    ```ts
    enum Category {
        main = "main",
        secondary = "secondary",
    }
    ```

    Reason: Admin and Site consume the GraphQL schema (which exposes keys). If keys and values diverge, the API gets the wrong value at runtime.

### Int vs Float

TypeScript has only one `number`. Be explicit in GraphQL — otherwise Float (less strict) is chosen:

```ts
@Field(() => Int)
position: number;

@Field(() => Float)
price: number;
```
