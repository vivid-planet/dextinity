# Resolver — CRUD Pattern

Resolvers are the **CRUD layer** — they inject `EntityManager` directly and contain the full create/update/delete logic inline, matching what `@comet/api-generator` emits. A separate service exists only in two cases: position helpers for entities with a `position` field, and a hand-written business-logic service for validation/side effects (see [gen-07-service.md](gen-07-service.md)).

## Naming Convention

| Source            | Singular          | Plural                            | Instance          | File               |
| ----------------- | ----------------- | --------------------------------- | ----------------- | ------------------ |
| `Product`         | `Product`         | `Products`                        | `product`         | `product`          |
| `ProductCategory` | `ProductCategory` | `ProductCategories`               | `productCategory` | `product-category` |
| `News`            | `News`            | `NewsList` (when singular=plural) | `news`            | `news`             |

When plural equals singular (e.g. `News`), suffix list query and args with `List` (e.g. `newsList`, `NewsListArgs`).

## @ResolveField — REQUIRED for Every Relation and Block

**CRITICAL: Every relation (`@ManyToOne`, `@OneToMany`, `@ManyToMany`) and every block (`@RootBlock`) on the entity MUST have a `@ResolveField` method in the resolver.** This is not optional — it is a mandatory part of resolver generation.

`@ResolveField` ensures GraphQL only loads relations when the client requests them, via lazy loading (`loadOrFail()`, `loadItems()`). Never eagerly load relations via `.init()` or hardcoded `populate` in queries — rely solely on `@ResolveField` lazy loading.

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

### Blocks — transform via BlocksTransformerService

Block fields require `BlocksTransformerService`, injected in the resolver constructor:

```typescript
import { BlocksTransformerService, DamImageBlock, RootBlockDataScalar } from "@comet/cms-api";

@ResolveField(() => RootBlockDataScalar(DamImageBlock))
async mainImage(@Parent() product: Product): Promise<object> {
    return this.blocksTransformer.transformToPlain(product.mainImage);
}
```

## File: `{entity-name}.resolver.ts`

### Full CRUD resolver (default)

Full example for an entity with a ManyToMany relation (`tags`) and a block field (`mainImage`):

```typescript
import {
    AffectedEntity,
    BlocksTransformerService,
    DamImageBlock,
    gqlArgsToMikroOrmQuery,
    gqlSortToMikroOrmOrderBy,
    RequiredPermission,
    RootBlockDataScalar,
} from "@comet/cms-api";
import { EntityManager, FindOptions, Reference } from "@mikro-orm/postgresql";
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";

import { PaginatedProducts } from "./dto/paginated-products";
import { ProductInput, ProductUpdateInput } from "./dto/product.input";
import { ProductsArgs } from "./dto/products.args";
import { Product } from "./entities/product.entity";
import { Tag } from "@src/tags/entities/tag.entity";

@Resolver(() => Product)
@RequiredPermission(["products"], { skipScopeCheck: true })
export class ProductResolver {
    constructor(
        protected readonly entityManager: EntityManager,
        private readonly blocksTransformer: BlocksTransformerService,
    ) {}

    @Query(() => Product)
    @AffectedEntity(Product)
    async product(
        @Args("id", { type: () => ID })
        id: string,
    ): Promise<Product> {
        const product = await this.entityManager.findOneOrFail(Product, id);
        return product;
    }

    @Query(() => PaginatedProducts)
    async products(
        @Args()
        { search, filter, sort, offset, limit }: ProductsArgs,
    ): Promise<PaginatedProducts> {
        const where = gqlArgsToMikroOrmQuery({ search, filter }, this.entityManager.getMetadata(Product));
        const options: FindOptions<Product> = { offset, limit };
        if (sort) {
            options.orderBy = gqlSortToMikroOrmOrderBy(sort);
        }
        const [entities, totalCount] = await this.entityManager.findAndCount(Product, where, options);
        return new PaginatedProducts(entities, totalCount);
    }

    @Mutation(() => Product)
    async createProduct(
        @Args("input", { type: () => ProductInput })
        input: ProductInput,
    ): Promise<Product> {
        const { tags: tagsInput, mainImage: mainImageInput, ...assignInput } = input;
        const product = this.entityManager.create(Product, {
            ...assignInput,
            mainImage: mainImageInput.transformToBlockData(),
        });
        if (tagsInput) {
            const tags = await this.entityManager.find(Tag, { id: tagsInput });
            if (tags.length !== tagsInput.length) throw new Error("Couldn't find all tags that were passed as input");
            await product.tags.loadItems();
            product.tags.set(tags.map((tag) => Reference.create(tag)));
        }
        await this.entityManager.flush();
        return product;
    }

    @Mutation(() => Product)
    @AffectedEntity(Product)
    async updateProduct(
        @Args("id", { type: () => ID })
        id: string,
        @Args("input", { type: () => ProductUpdateInput })
        input: ProductUpdateInput,
    ): Promise<Product> {
        const product = await this.entityManager.findOneOrFail(Product, id);
        const { tags: tagsInput, mainImage: mainImageInput, ...assignInput } = input;
        product.assign({
            ...assignInput,
        });
        if (tagsInput) {
            const tags = await this.entityManager.find(Tag, { id: tagsInput });
            if (tags.length !== tagsInput.length) throw new Error("Couldn't find all tags that were passed as input");
            await product.tags.loadItems();
            product.tags.set(tags.map((tag) => Reference.create(tag)));
        }
        if (mainImageInput) {
            product.mainImage = mainImageInput.transformToBlockData();
        }
        await this.entityManager.flush();
        return product;
    }

    @Mutation(() => Boolean)
    @AffectedEntity(Product)
    async deleteProduct(
        @Args("id", { type: () => ID })
        id: string,
    ): Promise<boolean> {
        const product = await this.entityManager.findOneOrFail(Product, id);
        this.entityManager.remove(product);
        await this.entityManager.flush();
        return true;
    }

    // --- @ResolveField: REQUIRED for every relation and block ---

    @ResolveField(() => [Tag])
    async tags(@Parent() product: Product): Promise<Tag[]> {
        return product.tags.loadItems();
    }

    @ResolveField(() => RootBlockDataScalar(DamImageBlock))
    async mainImage(@Parent() product: Product): Promise<object> {
        return this.blocksTransformer.transformToPlain(product.mainImage);
    }
}
```

### Read-only resolver

When the API is read-only, the resolver only contains queries and `@ResolveField` methods. No `@Mutation` methods, no input imports.

```typescript
import {
    AffectedEntity,
    BlocksTransformerService,
    DamImageBlock,
    gqlArgsToMikroOrmQuery,
    gqlSortToMikroOrmOrderBy,
    RequiredPermission,
    RootBlockDataScalar,
} from "@comet/cms-api";
import { EntityManager, FindOptions } from "@mikro-orm/postgresql";
import { Args, ID, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";

import { PaginatedProducts } from "./dto/paginated-products";
import { ProductsArgs } from "./dto/products.args";
import { Product } from "./entities/product.entity";
import { Tag } from "@src/tags/entities/tag.entity";

@Resolver(() => Product)
@RequiredPermission(["products"], { skipScopeCheck: true })
export class ProductResolver {
    constructor(
        protected readonly entityManager: EntityManager,
        private readonly blocksTransformer: BlocksTransformerService,
    ) {}

    @Query(() => Product)
    @AffectedEntity(Product)
    async product(
        @Args("id", { type: () => ID })
        id: string,
    ): Promise<Product> {
        const product = await this.entityManager.findOneOrFail(Product, id);
        return product;
    }

    @Query(() => PaginatedProducts)
    async products(
        @Args()
        { search, filter, sort, offset, limit }: ProductsArgs,
    ): Promise<PaginatedProducts> {
        const where = gqlArgsToMikroOrmQuery({ search, filter }, this.entityManager.getMetadata(Product));
        const options: FindOptions<Product> = { offset, limit };
        if (sort) {
            options.orderBy = gqlSortToMikroOrmOrderBy(sort);
        }
        const [entities, totalCount] = await this.entityManager.findAndCount(Product, where, options);
        return new PaginatedProducts(entities, totalCount);
    }

    // --- @ResolveField: REQUIRED for every relation and block ---

    @ResolveField(() => [Tag])
    async tags(@Parent() product: Product): Promise<Tag[]> {
        return product.tags.loadItems();
    }

    @ResolveField(() => RootBlockDataScalar(DamImageBlock))
    async mainImage(@Parent() product: Product): Promise<object> {
        return this.blocksTransformer.transformToPlain(product.mainImage);
    }
}
```

### With position and/or business-logic services

When the entity has a `position` field, additionally inject the position helpers service and call its helpers inline in create/update/delete (see [feature-01-position.md](feature-01-position.md)). When the entity needs validation/side effects, additionally inject the business-logic service and call its `validateCreateInput`/`validateUpdateInput` hooks at the start of the mutations (see [feature-02-validation.md](feature-02-validation.md)):

```typescript
constructor(
    protected readonly entityManager: EntityManager,
    protected readonly productVariantsService: ProductVariantsService, // position helpers
    protected readonly productVariantService: ProductVariantService, // business-logic hooks
) {}
```

## Rules

- **Resolvers ARE the CRUD layer** — inject `EntityManager` directly and implement create/update/delete inline.
- **Constructor**: Always inject `EntityManager`. Add `BlocksTransformerService` when the entity has blocks, the position helpers service when it has a `position` field, and the business-logic service when validation hooks are needed.
- **List query**: Build `where` via `gqlArgsToMikroOrmQuery({ search, filter }, this.entityManager.getMetadata(Entity))`, apply `sort` via `gqlSortToMikroOrmOrderBy`, and return `new Paginated{EntityPlural}(entities, totalCount)`.
- **Destructure** relation and block fields from input before spreading: `const { tags: tagsInput, ...assignInput } = input;`
- **EVERY relation and block MUST have a `@ResolveField`** — no exceptions. Never eagerly load relations via `.init()` or hardcoded `populate` in queries — rely on `@ResolveField` lazy loading.
- **@ResolveField for relations**: Use `entity.relation.loadOrFail()` (ManyToOne) or `entity.relation.loadItems()` (ManyToMany/OneToMany).
- **@ResolveField for blocks**: Use `this.blocksTransformer.transformToPlain(entity.blockField)`.
- **@AffectedEntity**: Add on single query, update, and delete mutations. NOT on list query (unless scoped or with a dedicated parent arg — see [feature-05-scope.md](feature-05-scope.md) and [feature-03-dedicated-arg.md](feature-03-dedicated-arg.md)).
- **@RequiredPermission**: Use `skipScopeCheck: true` when entity has no scope. See [feature-05-scope.md](feature-05-scope.md).
