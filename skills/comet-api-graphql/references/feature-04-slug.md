# Feature: Slug Query

Apply when entity has a `slug` string field with `unique: true`.

## Service — findBySlug method

Add a `findBySlug` method to the service:

```typescript
async findBySlug(slug: string): Promise<ProductCategory | null> {
    const productCategory = await this.entityManager.findOne(ProductCategory, { slug });
    return productCategory ?? null;
}
```

When the entity is scoped and uses a `scope` arg (embedded or flat scope fields), also accept scope:

```typescript
async findBySlug(scope: NewsScope, slug: string): Promise<News | null> {
    const news = await this.entityManager.findOne(News, { slug, scope });
    return news ?? null;
}
```

## Resolver — additional query

The resolver delegates to the service:

```typescript
@Query(() => ProductCategory, { nullable: true })
async productCategoryBySlug(
    @Args("slug")
    slug: string,
): Promise<ProductCategory | null> {
    return this.productCategoriesService.findBySlug(slug);
}
```

When scoped:

```typescript
@Query(() => News, { nullable: true })
async newsBySlug(
    @Args("scope", { type: () => NewsScope }) scope: NewsScope,
    @Args("slug") slug: string,
): Promise<News | null> {
    return this.newsService.findBySlug(scope, slug);
}
```

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
