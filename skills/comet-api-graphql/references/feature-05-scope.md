# Feature: Scoped Entities

Two scope modes. **Most entities are scoped** — use `@ScopedEntity` with a callback that returns the scope from the entity's flat fields.

## Mode A — @ScopedEntity (preferred)

Entity has scope fields as **flat properties** (e.g. `domain`, `language`) directly on the entity, and uses the `@ScopedEntity` decorator with a callback that returns the scope object. The callback receives the entity instance and must return an object matching the project's `ContentScope` shape. The framework uses this for permission checks.

### When to use

Use `@ScopedEntity` when:

- The entity is scoped (most entities in this project are)
- The entity has scope fields like `domain` and `language` as flat `@Property` fields

### Scope Input DTO file — `dto/{entity-name}-scope.input.ts`

A plain InputType class used for passing scope in GraphQL args. This is only a GraphQL input/output type.

```typescript
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString } from "class-validator";

@ObjectType()
@InputType("NewsScopeInput")
export class NewsScope {
    @Field()
    @IsString()
    domain: string;

    @Field()
    @IsString()
    language: string;
}
```

> **Naming**: `{EntityName}Scope` for the class, `"{EntityName}ScopeInput"` for the `@InputType` alias.
> **Fields**: Match the project's `ContentScope` shape (typically `domain` + `language`). Check `app.module.ts` for the `ContentScope` declaration.

### Entity — flat scope fields with @ScopedEntity callback

Scope fields are regular `@Property` / `@Field` on the entity. The `@ScopedEntity` decorator takes a callback `(entity) => scope` that extracts the content scope from the entity's flat fields.

```typescript
import { ScopedEntity } from "@comet/cms-api";
import { BaseEntity, Entity, OptionalProps, PrimaryKey, Property } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsString } from "class-validator";
import { v4 as uuid } from "uuid";

@Entity()
@ObjectType()
@ScopedEntity((news) => ({
    domain: news.domain,
    language: news.language,
}))
export class News extends BaseEntity {
    [OptionalProps]?: "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = uuid();

    @Property({ type: "text" })
    @Field()
    @IsString()
    domain: string;

    @Property({ type: "text" })
    @Field()
    @IsString()
    language: string;

    // ... other fields

    @Property({ type: "timestamp with time zone" })
    @Field()
    createdAt: Date = new Date();

    @Property({ type: "timestamp with time zone", onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();
}
```

### @RequiredPermission — NO skipScopeCheck

```typescript
@RequiredPermission(["news"])
```

### Args DTO — add scope as required first field

```typescript
import { NewsScope } from "./news-scope.input";

@ArgsType()
export class NewsListArgs extends OffsetBasedPaginationArgs {
    @Field(() => NewsScope)
    @ValidateNested()
    @Type(() => NewsScope)
    scope: NewsScope;

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    search?: string;
    // ...
}
```

### Service — spread flat scope fields in findAll and create

```typescript
@Injectable()
export class NewsService {
    constructor(private readonly entityManager: EntityManager) {}

    async findOneById(id: string): Promise<News> {
        return this.entityManager.findOneOrFail(News, id);
    }

    async findAll({ scope, search, filter, sort, offset, limit }: NewsListArgs): Promise<PaginatedNews> {
        const where = gqlArgsToMikroOrmQuery({ search, filter }, this.entityManager.getMetadata(News));
        Object.assign(where, scope); // spread flat scope fields into where
        const options: FindOptions<News> = { offset, limit };
        if (sort) {
            options.orderBy = gqlSortToMikroOrmOrderBy(sort);
        }
        const [entities, totalCount] = await this.entityManager.findAndCount(News, where, options);
        return new PaginatedNews(entities, totalCount);
    }

    async create(scope: NewsScope, input: NewsInput): Promise<News> {
        const news = this.entityManager.create(News, {
            ...input,
            ...scope, // spread flat scope fields
        });
        await this.entityManager.flush();
        return news;
    }

    async update(id: string, input: NewsUpdateInput): Promise<News> {
        const news = await this.entityManager.findOneOrFail(News, id);
        news.assign({ ...input });
        await this.entityManager.flush();
        return news;
    }

    async delete(id: string): Promise<boolean> {
        const news = await this.entityManager.findOneOrFail(News, id);
        this.entityManager.remove(news);
        await this.entityManager.flush();
        return true;
    }
}
```

### Resolver — thin, passes scope to service

```typescript
@Resolver(() => News)
@RequiredPermission(["news"])
export class NewsResolver {
    constructor(private readonly newsService: NewsService) {}

    @Query(() => News)
    @AffectedEntity(News)
    async news(@Args("id", { type: () => ID }) id: string): Promise<News> {
        return this.newsService.findOneById(id);
    }

    @Query(() => PaginatedNews)
    async newsList(@Args() args: NewsListArgs): Promise<PaginatedNews> {
        return this.newsService.findAll(args);
    }

    @Mutation(() => News)
    async createNews(
        @Args("scope", { type: () => NewsScope }) scope: NewsScope,
        @Args("input", { type: () => NewsInput }) input: NewsInput,
    ): Promise<News> {
        return this.newsService.create(scope, input);
    }

    @Mutation(() => News)
    @AffectedEntity(News)
    async updateNews(
        @Args("id", { type: () => ID }) id: string,
        @Args("input", { type: () => NewsUpdateInput }) input: NewsUpdateInput,
    ): Promise<News> {
        return this.newsService.update(id, input);
    }

    @Mutation(() => Boolean)
    @AffectedEntity(News)
    async deleteNews(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
        return this.newsService.delete(id);
    }
}
```

### Slug query — filter by flat scope fields

```typescript
// In service:
async findBySlug(scope: NewsScope, slug: string): Promise<News | null> {
    const news = await this.entityManager.findOne(News, { slug, ...scope });
    return news ?? null;
}

// In resolver:
@Query(() => News, { nullable: true })
async newsBySlug(
    @Args("scope", { type: () => NewsScope }) scope: NewsScope,
    @Args("slug") slug: string,
): Promise<News | null> {
    return this.newsService.findBySlug(scope, slug);
}
```

## Mode A2 — @ScopedEntity via parent relation (sub-entities)

When a sub-entity derives its scope from a parent entity (e.g. `ProductVariant` → `Product`), the entity does **not** have flat scope fields. Instead, the `@ScopedEntity` callback must load the parent relation to access the scope. The callback **must be async** because `Ref<T>` requires `loadOrFail()` — using `getEntity()` will throw `"Reference not initialized"`.

### Entity — async @ScopedEntity with loadOrFail

```typescript
import { ScopedEntity } from "@comet/cms-api";
import { BaseEntity, Entity, ManyToOne, PrimaryKey, Property, Ref } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { Product } from "@src/products/entities/product.entity";
import { v4 as uuid } from "uuid";

@Entity()
@ObjectType()
@ScopedEntity(async (productVariant) => {
    const product = await productVariant.product.loadOrFail();
    return { domain: product.domain, language: product.language };
})
export class ProductVariant extends BaseEntity {
    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = uuid();

    @ManyToOne(() => Product, { ref: true })
    @Field(() => Product)
    product: Ref<Product>;

    // ... other fields (no domain/language on this entity)
}
```

> **IMPORTANT:** Never use `getEntity()` in a `@ScopedEntity` callback on a `Ref<T>` relation — it only works when the reference is already loaded in the identity map, which is not guaranteed (especially after `em.create()` + `em.flush()`). Always use the async pattern with `loadOrFail()`.

### Key differences from Mode A

| Aspect                   | Mode A (flat scope)                        | Mode A2 (parent scope)                                                               |
| ------------------------ | ------------------------------------------ | ------------------------------------------------------------------------------------ |
| Scope fields on entity   | Yes (`domain`, `language`)                 | No — derived from parent                                                             |
| `@ScopedEntity` callback | Sync: `(e) => ({ domain: e.domain, ... })` | **Async**: `async (e) => { const p = await e.parent.loadOrFail(); return { ... }; }` |
| Scope DTO                | Has own scope input                        | No scope input — uses parent's scope via dedicated arg (Rule R2)                     |
| Service create           | Spreads `...scope`                         | Uses `Reference.create(parentEntity)`                                                |
| Args                     | `scope` as first field                     | `parent` ID as first field (see [feature-03](feature-03-dedicated-arg.md))           |

## Mode B — No scope

Entity has no scope fields and no `@ScopedEntity`.

```typescript
@RequiredPermission(["products"], { skipScopeCheck: true })
```

No further changes needed. Service and resolver follow the base patterns.

## Comparison table

| Aspect                         | Mode A (@ScopedEntity flat)                                                                                   | Mode A2 (@ScopedEntity via parent)                                                           | Mode B (no scope)             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------- |
| Entity                         | `@ScopedEntity((row) => ({ domain: row.domain, language: row.language }))` + flat scope fields as `@Property` | `@ScopedEntity(async (row) => { const p = await row.parent.loadOrFail(); return { ... }; })` | No scope fields, no decorator |
| When to use                    | Entity is scoped (most entities)                                                                              | Sub-entity deriving scope from parent relation                                               | Entity needs no scope         |
| Scope DTO                      | Generates `{entity}-scope.input.ts` (plain InputType)                                                         | None — uses parent's scope                                                                   | None                          |
| Args                           | `scope: ScopeInput` as first field                                                                            | `parent` ID as first field (dedicated arg)                                                   | Standard args                 |
| Service findAll                | `Object.assign(where, scope)` — spreads flat scope fields                                                     | `where.parent = parentId`                                                                    | Standard where                |
| Service create                 | Accepts `scope` param, spreads into create via `...scope`                                                     | `Reference.create(parentEntity)`                                                             | Standard create               |
| @AffectedEntity on list/create | Not needed on list                                                                                            | `@AffectedEntity(Parent, { idArg })` on list + create                                        | Not needed                    |
| @RequiredPermission            | Permission of entity itself, NO `skipScopeCheck`                                                              | Shares parent's permission, NO `skipScopeCheck`                                              | `skipScopeCheck: true`        |
