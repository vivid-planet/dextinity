# Resolver — Thin Pattern

Resolvers are **thin** — they handle GraphQL concerns (decorators, argument parsing, field resolution) and delegate all business logic to the service. Resolvers MUST NOT inject `EntityManager` directly.

## Naming Convention

| Source            | Singular          | Plural                            | Instance          | File               |
| ----------------- | ----------------- | --------------------------------- | ----------------- | ------------------ |
| `Product`         | `Product`         | `Products`                        | `product`         | `product`          |
| `ProductCategory` | `ProductCategory` | `ProductCategories`               | `productCategory` | `product-category` |
| `News`            | `News`            | `NewsList` (when singular=plural) | `news`            | `news`             |

When plural equals singular (e.g. `News`), suffix list query and args with `List` (e.g. `newsList`, `NewsListArgs`).

## @ResolveField — REQUIRED for Every Relation and Block

**CRITICAL: Every relation (`@ManyToOne`, `@OneToMany`, `@ManyToMany`) and every block (`@RootBlock`) on the entity MUST have a `@ResolveField` method in the resolver.** This is not optional — it is a mandatory part of resolver generation.

`@ResolveField` ensures GraphQL only loads relations when the client requests them. For single-entity queries this uses lazy loading (`loadOrFail()`, `loadItems()`). For list queries, the resolver extracts requested fields via `extractGraphqlFields` and passes them to the service, which conditionally populates relations to avoid N+1 queries (see [gen-07-service.md](gen-07-service.md)).

### Relations — lazy load via entity property

```typescript
import { Parent, ResolveField } from "@nestjs/graphql";

// Required ManyToOne
@ResolveField(() => Category)
async category(@Parent() product: Product): Promise<Category> {
    return product.category.loadOrFail();
}

// Nullable ManyToOne
@ResolveField(() => Category, { nullable: true })
async category(@Parent() product: Product): Promise<Category | undefined> {
    return product.category?.loadOrFail();
}

// ManyToMany
@ResolveField(() => [Tag])
async tags(@Parent() product: Product): Promise<Tag[]> {
    return product.tags.loadItems();
}

// OneToMany
@ResolveField(() => [Comment])
async comments(@Parent() product: Product): Promise<Comment[]> {
    return product.comments.loadItems();
}
```

### Blocks — delegate transformation to service

Block fields require `BlocksTransformerService`, which lives in the service. The resolver delegates:

```typescript
import { RootBlockDataScalar, DamImageBlock } from "@comet/cms-api";

@ResolveField(() => RootBlockDataScalar(DamImageBlock))
async mainImage(@Parent() product: Product): Promise<object> {
    return this.productsService.transformToPlain(product.mainImage);
}
```

### List query — conditional populate for performance

When the entity has relations with `@ResolveField`, add conditional populate in the list query to avoid N+1 queries. The resolver extracts the requested fields from `@Info()` and passes them to the service:

```typescript
import { extractGraphqlFields } from "@comet/cms-api";
import { Info } from "@nestjs/graphql";
import { GraphQLResolveInfo } from "graphql";

@Query(() => PaginatedProducts)
async products(
    @Args()
    args: ProductsArgs,
    @Info() info: GraphQLResolveInfo,
): Promise<PaginatedProducts> {
    const fields = extractGraphqlFields(info, { root: "nodes" });
    return this.productsService.findAll(args, fields);
}
```

The service uses `fields` to conditionally populate — see [gen-07-service.md](gen-07-service.md).

> **When no relations/blocks exist**: omit `@Info()`, `extractGraphqlFields`, `GraphQLResolveInfo`, and pass `args` directly without `fields`.

## File: `{entity-name}.resolver.ts`

### Full CRUD resolver (default)

Full example for an entity with a ManyToMany relation (`tags`) and a block field (`mainImage`):

```typescript
import { AffectedEntity, extractGraphqlFields, RequiredPermission, RootBlockDataScalar, DamImageBlock } from "@comet/cms-api";
import { Args, ID, Info, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { GraphQLResolveInfo } from "graphql";

import { PaginatedProducts } from "./dto/paginated-products";
import { ProductInput, ProductUpdateInput } from "./dto/product.input";
import { ProductsArgs } from "./dto/products.args";
import { Product } from "./entities/product.entity";
import { Tag } from "@src/tags/entities/tag.entity";
import { ProductsService } from "./products.service";

@Resolver(() => Product)
@RequiredPermission(["products"], { skipScopeCheck: true })
export class ProductResolver {
    constructor(private readonly productsService: ProductsService) {}

    @Query(() => Product)
    @AffectedEntity(Product)
    async product(
        @Args("id", { type: () => ID })
        id: string,
    ): Promise<Product> {
        return this.productsService.findOneById(id);
    }

    @Query(() => PaginatedProducts)
    async products(
        @Args()
        args: ProductsArgs,
        @Info() info: GraphQLResolveInfo,
    ): Promise<PaginatedProducts> {
        const fields = extractGraphqlFields(info, { root: "nodes" });
        return this.productsService.findAll(args, fields);
    }

    @Mutation(() => Product)
    async createProduct(
        @Args("input", { type: () => ProductInput })
        input: ProductInput,
    ): Promise<Product> {
        return this.productsService.create(input);
    }

    @Mutation(() => Product)
    @AffectedEntity(Product)
    async updateProduct(
        @Args("id", { type: () => ID })
        id: string,
        @Args("input", { type: () => ProductUpdateInput })
        input: ProductUpdateInput,
    ): Promise<Product> {
        return this.productsService.update(id, input);
    }

    @Mutation(() => Boolean)
    @AffectedEntity(Product)
    async deleteProduct(
        @Args("id", { type: () => ID })
        id: string,
    ): Promise<boolean> {
        return this.productsService.delete(id);
    }

    // --- @ResolveField: REQUIRED for every relation and block ---

    @ResolveField(() => [Tag])
    async tags(@Parent() product: Product): Promise<Tag[]> {
        return product.tags.loadItems();
    }

    @ResolveField(() => RootBlockDataScalar(DamImageBlock))
    async mainImage(@Parent() product: Product): Promise<object> {
        return this.productsService.transformToPlain(product.mainImage);
    }
}
```

### Read-only resolver

When the API is read-only, the resolver only contains queries and `@ResolveField` methods. No `@Mutation` methods, no input imports.

```typescript
import { AffectedEntity, extractGraphqlFields, RequiredPermission, RootBlockDataScalar, DamImageBlock } from "@comet/cms-api";
import { Args, ID, Info, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { GraphQLResolveInfo } from "graphql";

import { PaginatedProducts } from "./dto/paginated-products";
import { ProductsArgs } from "./dto/products.args";
import { Product } from "./entities/product.entity";
import { Tag } from "@src/tags/entities/tag.entity";
import { ProductsService } from "./products.service";

@Resolver(() => Product)
@RequiredPermission(["products"], { skipScopeCheck: true })
export class ProductResolver {
    constructor(private readonly productsService: ProductsService) {}

    @Query(() => Product)
    @AffectedEntity(Product)
    async product(
        @Args("id", { type: () => ID })
        id: string,
    ): Promise<Product> {
        return this.productsService.findOneById(id);
    }

    @Query(() => PaginatedProducts)
    async products(
        @Args()
        args: ProductsArgs,
        @Info() info: GraphQLResolveInfo,
    ): Promise<PaginatedProducts> {
        const fields = extractGraphqlFields(info, { root: "nodes" });
        return this.productsService.findAll(args, fields);
    }

    // --- @ResolveField: REQUIRED for every relation and block ---

    @ResolveField(() => [Tag])
    async tags(@Parent() product: Product): Promise<Tag[]> {
        return product.tags.loadItems();
    }

    @ResolveField(() => RootBlockDataScalar(DamImageBlock))
    async mainImage(@Parent() product: Product): Promise<object> {
        return this.productsService.transformToPlain(product.mainImage);
    }
}
```

## Rules

- **Resolvers MUST be thin** — no `EntityManager`, no business logic, no data transformation.
- **Constructor**: Only inject the service. Never inject `EntityManager` or `BlocksTransformerService` in the resolver.
- **All CRUD operations**: Delegate to service methods (`findOneById`, `findAll`, `create`, `update`, `delete`).
- **EVERY relation and block MUST have a `@ResolveField`** — no exceptions. Never eagerly load relations via `.init()` or hardcoded `populate` in queries.
- **@ResolveField for relations**: Use `entity.relation.loadOrFail()` (ManyToOne) or `entity.relation.loadItems()` (ManyToMany/OneToMany).
- **@ResolveField for blocks**: Delegate transformation to `service.transformToPlain()`.
- **@AffectedEntity**: Add on single query, update, and delete mutations. NOT on list query (unless scoped — see feature-05-scope.md).
- **@RequiredPermission**: Use `skipScopeCheck: true` when entity has no scope (scope mode a).
