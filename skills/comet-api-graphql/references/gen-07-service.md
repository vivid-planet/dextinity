# Service — Base Pattern

The service is the **single source of business logic**. All entity access (find, create, update, delete) goes through the service. Resolvers MUST NOT use `EntityManager` directly.

## Naming Convention

| Source            | Service Class              | Instance                   | File                            |
| ----------------- | -------------------------- | -------------------------- | ------------------------------- |
| `Product`         | `ProductsService`          | `productsService`          | `products.service.ts`           |
| `ProductCategory` | `ProductCategoriesService` | `productCategoriesService` | `product-categories.service.ts` |
| `News`            | `NewsService`              | `newsService`              | `news.service.ts`               |

The CRUD service always uses **plural** naming.

## File: `{entity-names}.service.ts`

This is the **minimal base** for an entity with only scalar fields (no relations, no blocks, no position). For relation/block handling, see [field-03-relation.md](field-03-relation.md) and [field-04-block.md](field-04-block.md).

### Full CRUD service (default)

```typescript
import { gqlArgsToMikroOrmQuery, gqlSortToMikroOrmOrderBy } from "@comet/cms-api";
import { EntityManager, FindOptions } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import { PaginatedProducts } from "./dto/paginated-products";
import { ProductInput, ProductUpdateInput } from "./dto/product.input";
import { ProductsArgs } from "./dto/products.args";
import { Product } from "./entities/product.entity";

@Injectable()
export class ProductsService {
    constructor(private readonly entityManager: EntityManager) {}

    async findOneById(id: string): Promise<Product> {
        return this.entityManager.findOneOrFail(Product, id);
    }

    async findAll({ search, filter, sort, offset, limit }: ProductsArgs): Promise<PaginatedProducts> {
        const where = gqlArgsToMikroOrmQuery({ search, filter }, this.entityManager.getMetadata(Product));
        const options: FindOptions<Product> = { offset, limit };
        if (sort) {
            options.orderBy = gqlSortToMikroOrmOrderBy(sort);
        }
        const [entities, totalCount] = await this.entityManager.findAndCount(Product, where, options);
        return new PaginatedProducts(entities, totalCount);
    }

    async create(input: ProductInput): Promise<Product> {
        const product = this.entityManager.create(Product, { ...input });
        await this.entityManager.flush();
        return product;
    }

    async update(id: string, input: ProductUpdateInput): Promise<Product> {
        const product = await this.entityManager.findOneOrFail(Product, id);
        product.assign({ ...input });
        await this.entityManager.flush();
        return product;
    }

    async delete(id: string): Promise<boolean> {
        const product = await this.entityManager.findOneOrFail(Product, id);
        this.entityManager.remove(product);
        await this.entityManager.flush();
        return true;
    }
}
```

### Read-only service

When the API is read-only, the service only contains `findOneById` and `findAll`. No input imports, no `create`, `update`, or `delete` methods.

```typescript
import { gqlArgsToMikroOrmQuery, gqlSortToMikroOrmOrderBy } from "@comet/cms-api";
import { EntityManager, FindOptions } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import { PaginatedProducts } from "./dto/paginated-products";
import { ProductsArgs } from "./dto/products.args";
import { Product } from "./entities/product.entity";

@Injectable()
export class ProductsService {
    constructor(private readonly entityManager: EntityManager) {}

    async findOneById(id: string): Promise<Product> {
        return this.entityManager.findOneOrFail(Product, id);
    }

    async findAll({ search, filter, sort, offset, limit }: ProductsArgs): Promise<PaginatedProducts> {
        const where = gqlArgsToMikroOrmQuery({ search, filter }, this.entityManager.getMetadata(Product));
        const options: FindOptions<Product> = { offset, limit };
        if (sort) {
            options.orderBy = gqlSortToMikroOrmOrderBy(sort);
        }
        const [entities, totalCount] = await this.entityManager.findAndCount(Product, where, options);
        return new PaginatedProducts(entities, totalCount);
    }
}
```

## Adding relations or blocks

When the entity has relations (`@ManyToOne`, `@OneToMany`, `@ManyToMany`) or block fields (`@RootBlock`), the service needs additional code. See the field-type references for details. Summary of changes:

1. **Constructor** — add `BlocksTransformerService` if entity has blocks.
2. **Destructure** relation/block fields from input before spreading: `const { category: categoryInput, image: imageInput, ...assignInput } = input;`
3. **Populate** — in `findAll`, accept optional `fields?: string[]` param and build conditional populate for relations that have a `@ResolveField` in the resolver.
4. **transformToPlain** — if entity has blocks, expose a method for the resolver's `@ResolveField` to call.

### findAll with populate

When the entity has relations with `@ResolveField` in the resolver, the service accepts a `fields` parameter to conditionally populate:

> **IMPORTANT:** Never pass the `fields` array directly to MikroORM's `populate` (e.g. `options.populate = fields`). The `fields` array from `extractGraphqlFields` contains **all** requested GraphQL fields, including computed `@ResolveField`s (like `variantCount`) that are not actual entity properties or relations. Passing these to `populate` causes MikroORM to throw `"Entity does not have property X"`. Always use explicit field-by-field checks as shown below.

```typescript
async findAll({ search, filter, sort, offset, limit }: ProductsArgs, fields?: string[]): Promise<PaginatedProducts> {
    const where = gqlArgsToMikroOrmQuery({ search, filter }, this.entityManager.getMetadata(Product));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: FindOptions<Product, any> = { offset, limit };
    if (sort) {
        options.orderBy = gqlSortToMikroOrmOrderBy(sort);
    }
    const populate: string[] = [];
    if (fields?.includes("category")) {
        populate.push("category");
    }
    if (fields?.includes("tags")) {
        populate.push("tags");
    }
    if (populate.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (options as any).populate = populate;
    }
    const [entities, totalCount] = await this.entityManager.findAndCount(Product, where, options);
    return new PaginatedProducts(entities, totalCount);
}
```

### create with relations and blocks

```typescript
async create(input: ProductInput): Promise<Product> {
    const { category: categoryInput, image: imageInput, ...assignInput } = input;
    const product = this.entityManager.create(Product, {
        ...assignInput,
        category: Reference.create(await this.entityManager.findOneOrFail(Category, categoryInput)),
        image: imageInput.transformToBlockData(),
    });
    await this.entityManager.flush();
    return product;
}
```

### update with relations and blocks

```typescript
async update(id: string, input: ProductUpdateInput): Promise<Product> {
    const product = await this.entityManager.findOneOrFail(Product, id);
    const { category: categoryInput, image: imageInput, ...assignInput } = input;
    product.assign({ ...assignInput });
    if (categoryInput !== undefined) {
        product.category = categoryInput
            ? Reference.create(await this.entityManager.findOneOrFail(Category, categoryInput))
            : undefined;
    }
    if (imageInput) {
        product.image = imageInput.transformToBlockData();
    }
    await this.entityManager.flush();
    return product;
}
```

### Block transform helper

When the entity has block fields, add `BlocksTransformerService` to the constructor and expose a transform method for the resolver's `@ResolveField`:

```typescript
import { BlocksTransformerService } from "@comet/cms-api";

constructor(
    private readonly entityManager: EntityManager,
    private readonly blocksTransformer: BlocksTransformerService,
) {}

async transformToPlain(blockData: object): Promise<object> {
    return this.blocksTransformer.transformToPlain(blockData);
}
```

## Rules

- **Always `@Injectable()`**.
- **Naming**: Always plural (`ProductsService`, `WeatherStationsService`).
- **Constructor**: Always inject `EntityManager`. Add `BlocksTransformerService` if entity has blocks.
- **The service is the single source of business logic** — resolvers MUST NOT use `EntityManager` directly.
- **All entity access** (find, create, update, delete) goes through the service.
- **No `@Args()`, `@Query()`, `@Mutation()`** in the service — those are resolver concerns.
- **Destructure** relation and block fields from input before spreading, same as described in [field-03-relation.md](field-03-relation.md) and [field-04-block.md](field-04-block.md).
- **Nullable ManyToOne in update**: Check `if (relationInput !== undefined)` to distinguish "not provided" from "set to null".
- When entity has no relations with `@ResolveField`, omit the `fields` parameter from `findAll`.
