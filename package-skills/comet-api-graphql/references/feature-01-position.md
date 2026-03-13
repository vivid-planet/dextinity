# Feature: Position Ordering

Apply when entity has a `position: number` field. Position can be global (no grouping) or grouped by some fields (e.g. variants ordered within a product, ordered products within scope).

Position logic is handled entirely in the **service**.

## Service Changes

The CRUD service includes private position helper methods and integrates position management into the CRUD methods.

### Without groupByFields (global ordering)

```typescript
import { gqlArgsToMikroOrmQuery, gqlSortToMikroOrmOrderBy } from "@comet/cms-api";
import { EntityManager, FindOptions, raw } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import { PaginatedProductCategories } from "./dto/paginated-product-categories";
import { ProductCategoryInput, ProductCategoryUpdateInput } from "./dto/product-category.input";
import { ProductCategoriesArgs } from "./dto/product-categories.args";
import { ProductCategory } from "./entities/product-category.entity";

@Injectable()
export class ProductCategoriesService {
    constructor(private readonly entityManager: EntityManager) {}

    async findOneById(id: string): Promise<ProductCategory> {
        return this.entityManager.findOneOrFail(ProductCategory, id);
    }

    async findAll({ search, filter, sort, offset, limit }: ProductCategoriesArgs): Promise<PaginatedProductCategories> {
        const where = gqlArgsToMikroOrmQuery({ search, filter }, this.entityManager.getMetadata(ProductCategory));
        const options: FindOptions<ProductCategory> = { offset, limit };
        if (sort) {
            options.orderBy = gqlSortToMikroOrmOrderBy(sort);
        }
        const [entities, totalCount] = await this.entityManager.findAndCount(ProductCategory, where, options);
        return new PaginatedProductCategories(entities, totalCount);
    }

    async create(input: ProductCategoryInput): Promise<ProductCategory> {
        const lastPosition = await this.getLastPosition();
        let position = input.position;
        if (position !== undefined && position < lastPosition + 1) {
            await this.incrementPositions(position);
        } else {
            position = lastPosition + 1;
        }

        const productCategory = this.entityManager.create(ProductCategory, { ...input, position });
        await this.entityManager.flush();
        return productCategory;
    }

    async update(id: string, input: ProductCategoryUpdateInput): Promise<ProductCategory> {
        const productCategory = await this.entityManager.findOneOrFail(ProductCategory, id);

        if (input.position !== undefined) {
            const lastPosition = await this.getLastPosition();
            if (input.position > lastPosition) {
                input.position = lastPosition;
            }
            if (productCategory.position < input.position) {
                await this.decrementPositions(productCategory.position, input.position);
            } else if (productCategory.position > input.position) {
                await this.incrementPositions(input.position, productCategory.position);
            }
        }

        productCategory.assign({ ...input });
        await this.entityManager.flush();
        return productCategory;
    }

    async delete(id: string): Promise<boolean> {
        const productCategory = await this.entityManager.findOneOrFail(ProductCategory, id);
        this.entityManager.remove(productCategory);
        await this.decrementPositions(productCategory.position);
        await this.entityManager.flush();
        return true;
    }

    private async incrementPositions(lowestPosition: number, highestPosition?: number) {
        await this.entityManager.nativeUpdate(
            ProductCategory,
            { position: { $gte: lowestPosition, ...(highestPosition ? { $lt: highestPosition } : {}) } },
            { position: raw("position + 1") },
        );
    }

    private async decrementPositions(lowestPosition: number, highestPosition?: number) {
        await this.entityManager.nativeUpdate(
            ProductCategory,
            { position: { $gt: lowestPosition, ...(highestPosition ? { $lte: highestPosition } : {}) } },
            { position: raw("position - 1") },
        );
    }

    private async getLastPosition() {
        return this.entityManager.count(ProductCategory, {});
    }
}
```

### With groupByFields (e.g. `position: { groupByFields: ["product"] }`)

Add a `group` parameter to position helpers and CRUD methods:

```typescript
@Injectable()
export class ProductVariantsService {
    constructor(private readonly entityManager: EntityManager) {}

    // ... findOneById, findAll same as base ...

    async create(product: string, input: ProductVariantInput): Promise<ProductVariant> {
        const lastPosition = await this.getLastPosition({ product });
        let position = input.position;
        if (position !== undefined && position < lastPosition + 1) {
            await this.incrementPositions({ product }, position);
        } else {
            position = lastPosition + 1;
        }

        const productVariant = this.entityManager.create(ProductVariant, {
            ...input,
            position,
            product: Reference.create(await this.entityManager.findOneOrFail(Product, product)),
        });
        await this.entityManager.flush();
        return productVariant;
    }

    async update(id: string, input: ProductVariantUpdateInput): Promise<ProductVariant> {
        const productVariant = await this.entityManager.findOneOrFail(ProductVariant, id);
        const group = { product: productVariant.product.id };

        if (input.position !== undefined) {
            const lastPosition = await this.getLastPosition(group);
            if (input.position > lastPosition) {
                input.position = lastPosition;
            }
            if (productVariant.position < input.position) {
                await this.decrementPositions(group, productVariant.position, input.position);
            } else if (productVariant.position > input.position) {
                await this.incrementPositions(group, input.position, productVariant.position);
            }
        }

        productVariant.assign({ ...input });
        await this.entityManager.flush();
        return productVariant;
    }

    async delete(id: string): Promise<boolean> {
        const productVariant = await this.entityManager.findOneOrFail(ProductVariant, id);
        const group = { product: productVariant.product.id };
        this.entityManager.remove(productVariant);
        await this.decrementPositions(group, productVariant.position);
        await this.entityManager.flush();
        return true;
    }

    private async incrementPositions(group: { product: string }, lowestPosition: number, highestPosition?: number) {
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

    private async decrementPositions(group: { product: string }, lowestPosition: number, highestPosition?: number) {
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

    private async getLastPosition(group: { product: string }) {
        return this.entityManager.count(ProductVariant, this.getPositionGroupCondition(group));
    }

    private getPositionGroupCondition(group: { product: string }): FilterQuery<ProductVariant> {
        return { product: group.product };
    }
}
```

## Resolver Changes

The resolver stays thin — no position logic. It simply delegates to service methods:

```typescript
@Resolver(() => ProductCategory)
@RequiredPermission(["productCategories"], { skipScopeCheck: true })
export class ProductCategoryResolver {
    constructor(private readonly productCategoriesService: ProductCategoriesService) {}

    @Query(() => ProductCategory)
    @AffectedEntity(ProductCategory)
    async productCategory(@Args("id", { type: () => ID }) id: string): Promise<ProductCategory> {
        return this.productCategoriesService.findOneById(id);
    }

    @Query(() => PaginatedProductCategories)
    async productCategories(@Args() args: ProductCategoriesArgs): Promise<PaginatedProductCategories> {
        return this.productCategoriesService.findAll(args);
    }

    @Mutation(() => ProductCategory)
    async createProductCategory(@Args("input", { type: () => ProductCategoryInput }) input: ProductCategoryInput): Promise<ProductCategory> {
        return this.productCategoriesService.create(input);
    }

    @Mutation(() => ProductCategory)
    @AffectedEntity(ProductCategory)
    async updateProductCategory(
        @Args("id", { type: () => ID }) id: string,
        @Args("input", { type: () => ProductCategoryUpdateInput }) input: ProductCategoryUpdateInput,
    ): Promise<ProductCategory> {
        return this.productCategoriesService.update(id, input);
    }

    @Mutation(() => Boolean)
    @AffectedEntity(ProductCategory)
    async deleteProductCategory(@Args("id", { type: () => ID }) id: string): Promise<boolean> {
        return this.productCategoriesService.delete(id);
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
