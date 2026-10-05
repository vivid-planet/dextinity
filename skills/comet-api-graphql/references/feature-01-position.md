# Feature: Position Ordering

Apply when entity has a `position: number` field. Position can be global (no grouping) or grouped by some fields (e.g. variants ordered within a product, ordered products within scope).

The **position helpers service** holds the increment/decrement/last-position helpers (see [gen-07-service.md](gen-07-service.md)); the **resolver** calls them inline in its create/update/delete mutations.

## Service — position helpers only

The service contains only the position helper methods — no CRUD methods.

### Without groupByFields (global ordering)

```typescript
import { EntityManager, raw } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import { ProductCategory } from "./entities/product-category.entity";

@Injectable()
export class ProductCategoriesService {
    constructor(protected readonly entityManager: EntityManager) {}

    async incrementPositions(lowestPosition: number, highestPosition?: number) {
        // Increment positions between newPosition (inclusive) and oldPosition (exclusive)
        await this.entityManager.nativeUpdate(
            ProductCategory,
            { position: { $gte: lowestPosition, ...(highestPosition ? { $lt: highestPosition } : {}) } },
            { position: raw("position + 1") },
        );
    }

    async decrementPositions(lowestPosition: number, highestPosition?: number) {
        // Decrement positions between oldPosition (exclusive) and newPosition (inclusive)
        await this.entityManager.nativeUpdate(
            ProductCategory,
            { position: { $gt: lowestPosition, ...(highestPosition ? { $lte: highestPosition } : {}) } },
            { position: raw("position - 1") },
        );
    }

    async getLastPosition() {
        return this.entityManager.count(ProductCategory, {});
    }
}
```

### With groupByFields (e.g. position grouped by `product`)

Add a `group` parameter to the helpers and a `getPositionGroupCondition` method:

```typescript
import { EntityManager, FilterQuery, raw } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import { ProductVariant } from "./entities/product-variant.entity";

@Injectable()
export class ProductVariantsService {
    constructor(protected readonly entityManager: EntityManager) {}

    async incrementPositions(group: { product: string }, lowestPosition: number, highestPosition?: number) {
        // Increment positions between newPosition (inclusive) and oldPosition (exclusive)
        await this.entityManager.nativeUpdate(
            ProductVariant,
            {
                $and: [
                    { position: { $gte: lowestPosition, ...(highestPosition ? { $lt: highestPosition } : {}) } },
                    this.getPositionGroupCondition(group),
                ],
            },
            { position: raw("position + 1") },
        );
    }

    async decrementPositions(group: { product: string }, lowestPosition: number, highestPosition?: number) {
        // Decrement positions between oldPosition (exclusive) and newPosition (inclusive)
        await this.entityManager.nativeUpdate(
            ProductVariant,
            {
                $and: [
                    { position: { $gt: lowestPosition, ...(highestPosition ? { $lte: highestPosition } : {}) } },
                    this.getPositionGroupCondition(group),
                ],
            },
            { position: raw("position - 1") },
        );
    }

    async getLastPosition(group: { product: string }) {
        return this.entityManager.count(ProductVariant, this.getPositionGroupCondition(group));
    }

    getPositionGroupCondition(group: { product: string }): FilterQuery<ProductVariant> {
        return { product: group.product };
    }
}
```

## Resolver Changes

The resolver injects the position helpers service alongside `EntityManager` and integrates the position logic inline in create/update/delete (global ordering shown; for grouped ordering pass the group object, e.g. `{ product: productVariant.product.id }`, to every helper call):

```typescript
@Resolver(() => ProductCategory)
@RequiredPermission(["productCategories"], { skipScopeCheck: true })
export class ProductCategoryResolver {
    constructor(
        protected readonly entityManager: EntityManager,
        protected readonly productCategoriesService: ProductCategoriesService,
    ) {}

    // ... single + list queries same as base pattern ...

    @Mutation(() => ProductCategory)
    async createProductCategory(
        @Args("input", { type: () => ProductCategoryInput })
        input: ProductCategoryInput,
    ): Promise<ProductCategory> {
        const lastPosition = await this.productCategoriesService.getLastPosition();
        let position = input.position;
        if (position !== undefined && position < lastPosition + 1) {
            await this.productCategoriesService.incrementPositions(position);
        } else {
            position = lastPosition + 1;
        }
        const productCategory = this.entityManager.create(ProductCategory, {
            ...input,
            position,
        });
        await this.entityManager.flush();
        return productCategory;
    }

    @Mutation(() => ProductCategory)
    @AffectedEntity(ProductCategory)
    async updateProductCategory(
        @Args("id", { type: () => ID })
        id: string,
        @Args("input", { type: () => ProductCategoryUpdateInput })
        input: ProductCategoryUpdateInput,
    ): Promise<ProductCategory> {
        const productCategory = await this.entityManager.findOneOrFail(ProductCategory, id);
        if (input.position !== undefined) {
            const lastPosition = await this.productCategoriesService.getLastPosition();
            if (input.position > lastPosition) {
                input.position = lastPosition;
            }
            if (productCategory.position < input.position) {
                await this.productCategoriesService.decrementPositions(productCategory.position, input.position);
            } else if (productCategory.position > input.position) {
                await this.productCategoriesService.incrementPositions(input.position, productCategory.position);
            }
        }
        productCategory.assign({
            ...input,
        });
        await this.entityManager.flush();
        return productCategory;
    }

    @Mutation(() => Boolean)
    @AffectedEntity(ProductCategory)
    async deleteProductCategory(
        @Args("id", { type: () => ID })
        id: string,
    ): Promise<boolean> {
        const productCategory = await this.entityManager.findOneOrFail(ProductCategory, id);
        this.entityManager.remove(productCategory);
        await this.productCategoriesService.decrementPositions(productCategory.position);
        await this.entityManager.flush();
        return true;
    }
}
```

## Input changes

Position is optional in input with `@Min(1)`:

```typescript
@IsOptional()
@Min(1)
@IsInt()
@Field(() => Int, { nullable: true })
position?: number;
```

## Default sort

Change default sort in Args to `position ASC` instead of `createdAt ASC`.
