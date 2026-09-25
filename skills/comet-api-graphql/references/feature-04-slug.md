# Feature: Slug Query

Apply when entity has a `slug` string field with `unique: true`.

## Resolver — additional query

The resolver gets an additional `{entityName}BySlug` query that looks the entity up directly via `EntityManager`:

```typescript
@Query(() => ProductCategory, { nullable: true })
async productCategoryBySlug(
    @Args("slug")
    slug: string,
): Promise<ProductCategory | null> {
    const productCategory = await this.entityManager.findOne(ProductCategory, { slug });
    return productCategory ?? null;
}
```

When the entity is scoped (embedded scope field), also accept and filter by scope:

```typescript
@Query(() => News, { nullable: true })
async newsBySlug(
    @Args("slug")
    slug: string,
    @Args("scope", { type: () => NewsContentScope })
    scope: NewsContentScope,
): Promise<News | null> {
    const news = await this.entityManager.findOne(News, { slug, scope });
    return news ?? null;
}
```

With flat scope fields, spread the scope into the query condition instead: `{ slug, ...scope }`.

## Input Validator

Use `@IsSlug()` from `@comet/cms-api` instead of `@IsString()`:

```typescript
import { IsSlug } from "@comet/cms-api";

@IsNotEmpty()
@IsSlug()
@Field()
slug: string;
```

## Rules

- The slug query uses `findOne` (not `findOneOrFail`) and returns `null` if not found.
- No `@AffectedEntity` on the slug query.
- If the entity is scoped, the slug query should also accept and filter by scope.
