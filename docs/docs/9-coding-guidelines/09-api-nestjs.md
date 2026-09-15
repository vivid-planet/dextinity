---
title: API (NestJS)
sidebar_position: -5
---

## General

For new requirements, always check the [documentation](https://docs.nestjs.com/) first. There are already established techniques or patterns for many common problems.

> NestJS is agnostic in many ways, and one of them is communication. It provides wrappers (or allows us to create our own) for third-party libraries.

See: [What is the NestJS Runtime - Trilon Consulting](https://trilon.io/blog/what-is-the-nestjs-runtime)

## Logging

- Only log **warnings and errors** by default.
- Additional logs (for debugging/profiling) should be toggleable via flags/settings.

:::note
**Recommendation:** Use the built-in [NestJS Logger](https://docs.nestjs.com/techniques/logger).
:::

## Services vs. Controller/Resolver

- **Controller/Resolver:** Represent the HTTP or GraphQL layer.
- **Service:** Represents the **business logic** layer.

### Service Best Practices

- Services should be **decoupled from the HTTP/GraphQL layer** (e.g., avoid using `InputTypes` directly).
    - This allows them to be reused (e.g., in console jobs) without mocking types.
- Prefer passing the entire **entity** rather than just the ID.
- Services should be **easily testable**. ([Using MikroORM with NestJS framework](https://mikro-orm.io/docs/usage-with-nestjs#testing))
- Use **Dependency Injection (DI)** to control access to services and enforce clear module boundaries/interfaces.

### Service FAQs

- **Is a service always required?**  
  No — don’t create pass-through methods just for the sake of it.  
  Yes — if business logic is reused or the HTTP layer becomes messy.

- **Can I create utility files?**  
  Yes, as long as they are **stateless helper functions**.  
  Do **not** consume other services or repositories within them.
  :::note
  Give them specific names — avoid generic `utils` dump folders.
  :::

### Access Control Lists (ACL) / Authorization Checks

- Place ACL logic in a **dedicated ACL service** (e.g., `products.acl.service.ts`) or inline in the controller/resolver for specific permission checks.
- **Do not** perform ACL checks in shared services: Console jobs, for instance, have no authenticated user and may lead to double-checking permissions.
- ACLs should be **covered by unit tests**.

## Avoid Using `process.env` Directly

Directly accessing environment variables in the code has downsides:

- Not testable (no dependency injection)
- No central place to manage environment variables
- No validation

**Exception:** It's technically necessary in some cases, such as in app entry points (`main.ts`, `bootstrap.ts`).

## Dependency Injection

**Constructor-based** injection is preferred over **property-based** injection (see: [Documentation | NestJS - A progressive Node.js framework](https://docs.nestjs.com/providers#property-based-injection)).  
Use property injection only when technically necessary.

## ORM / Database

### Use EntityManager Instead of Repository Injection

Prefer injecting the `EntityManager` directly over using `@InjectRepository` / `EntityRepository`.

Repositories in MikroORM are thin wrappers around the `EntityManager` and do not add meaningful value. Using the `EntityManager` directly:

- Is the [recommended approach in the MikroORM docs](https://mikro-orm.io/docs/repositories#why-use-repositories)
- Is context-aware and ensures proper request-scoped and transactional behavior
- Keeps NestJS DI simpler — no need for `MikroOrmModule.forFeature()` in the module

:::warning Bad

```ts
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";

@Injectable()
export class ProductsResolver {
    constructor(
        private readonly entityManager: EntityManager,
        @InjectRepository(Product) private readonly repository: EntityRepository<Product>,
    ) {}

    async product(id: string): Promise<Product> {
        return this.repository.findOneOrFail(id);
    }

    async createProduct(input: ProductInput): Promise<Product> {
        const product = this.repository.create(input);
        await this.entityManager.flush();
        return product;
    }
}
```

:::

:::tip Good

```ts
import { EntityManager } from "@mikro-orm/postgresql";

@Injectable()
export class ProductsResolver {
    constructor(private readonly entityManager: EntityManager) {}

    async product(id: string): Promise<Product> {
        return this.entityManager.findOneOrFail(Product, id);
    }

    async createProduct(input: ProductInput): Promise<Product> {
        const product = this.entityManager.create(Product, input);
        await this.entityManager.flush();
        return product;
    }
}
```

:::

### Repository

Prefer `entityManager.create(Entity, data)` over `new Entity()` since `create` expects a complete data object.

### Migrations

Down migrations are not required – using `throw new Error("Unsupported")` is sufficient.

We do not use rollbacks; issues are resolved with a new deployment.

### Data Types

- Prefer `type: "uuid"` for IDs. See [Prefer UUIDs for IDs](/docs/coding-guidelines/postgresql#prefer-uuids-for-ids).
- Always use `columnType: text` for strings. Explanation: See [Don't Do This - PostgreSQL wiki.](https://wiki.postgresql.org/wiki/Don%27t_Do_This#Don.27t_use_varchar.28n.29_by_default)
- Prefer `jsonb` over `json`. Explanation: See [8.14. JSON Types](https://www.postgresql.org/docs/current/datatype-json.html)
- For timestamps, always use `columnType: "timestamp with time zone"`.

### DB Defaults

Avoid using DB defaults as they are not available before inserting/updating. This also falsifies the types of the entity.

:::warning Bad

```ts
@Property({ default: false })
@Field()
visible: boolean;
```

:::

:::tip Good

```ts
@Property()
@Field()
visible: boolean;
```

:::

(if GQL Field → provide default value for InputType)

:::tip Good

```ts
@Property()
visible: boolean = false;
```

:::

(if not a GQL Field)

:::info
If you are using the Upsert-Pattern, you may use DB defaults **additionally**

```ts
@Field()
@Property({
    columnType: "timestamp with time zone",
    onUpdate: () => new Date(),
    defaultRaw: "now()", // fallback for upsert
})
updatedAt: Date = new Date();
```

:::

## GraphQL

### Enum Keys = Values

Enum keys and values must be identical.

:::warning Bad

```ts
enum Category {
  MAIN = "main"
  SECONDARY = "secondary"
}
```

:::

:::tip Good

```ts
enum Category {
  Main = "Main"
  Secondary = "Secondary"
}
```

:::

Reason: Admin and Site only know the GraphQL schema, where the enum keys are used. Therefore, queries and mutations also send the keys. If the values differ from the keys, this causes API errors because the wrong values are used for the enum.

Regarding naming conventions, see also [TypeScript | Enums](./typescript).

### TypeScript number vs GraphQL Int/Float

TypeScript has only one number type, but GraphQL distinguishes between Int and Float, so the type must be specified manually, otherwise, Float is the less strict default.

```ts
class Product {
    @Field(() => Int)
    position: number;

    @Field(() => Float)
    price: number;
}
```
