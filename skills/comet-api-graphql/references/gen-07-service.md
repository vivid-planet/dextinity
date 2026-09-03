# Services — Conditional, Two Kinds

The resolver contains the full CRUD logic (see [gen-00-resolver.md](gen-00-resolver.md)). A service is generated **only when needed** — a plain scalar entity (no position field, no business validation) gets **no service at all**. There are two kinds:

| Kind                               | File                                  | Class (naming)           | When to generate                                              |
| ---------------------------------- | ------------------------------------- | ------------------------ | ------------------------------------------------------------- |
| **Position helpers service**       | `{entity-names}.service.ts` (plural)  | `ProductVariantsService` | Entity has a `position: number` field                         |
| **Business-logic (hooks) service** | `{entity-name}.service.ts` (singular) | `ProductVariantService`  | Create/update needs validation or side effects (hand-written) |

## Naming Convention

| Source            | Position helpers (plural)                                    | Business-logic (singular)                                |
| ----------------- | ------------------------------------------------------------ | -------------------------------------------------------- |
| `Product`         | `ProductsService` / `products.service.ts`                    | `ProductService` / `product.service.ts`                  |
| `ProductCategory` | `ProductCategoriesService` / `product-categories.service.ts` | `ProductCategoryService` / `product-category.service.ts` |

## Kind 1: Position helpers service — `{entity-names}.service.ts`

Generated only when the entity has a `position` field. It contains **only** the position helper methods — no CRUD methods. The resolver calls these helpers inline in its create/update/delete mutations (see [feature-01-position.md](feature-01-position.md)).

Example for position grouped by a `product` relation:

```typescript
import { EntityManager, FilterQuery, raw } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import { ProductVariant } from "../entities/product-variant.entity";

@Injectable()
export class ProductVariantsService {
    constructor(protected readonly entityManager: EntityManager) {}

    async incrementPositions(
        group: {
            product: string;
        },
        lowestPosition: number,
        highestPosition?: number,
    ) {
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

    async decrementPositions(
        group: {
            product: string;
        },
        lowestPosition: number,
        highestPosition?: number,
    ) {
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
        return {
            product: group.product,
        };
    }
}
```

When position is global (no grouping), drop the `group` parameter and `getPositionGroupCondition`:

```typescript
import { EntityManager, raw } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import { ProductCategory } from "../entities/product-category.entity";

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

## Kind 2: Business-logic (hooks) service — `{entity-name}.service.ts`

Hand-written (never overwritten by regeneration), lives next to the entity's folder. It implements the `CrudGeneratorHooksService` interface from `@comet/cms-api` and hosts validation and side-effect logic plus the GraphQL error type. The resolver calls `validateCreateInput`/`validateUpdateInput` at the start of its create/update mutations and returns a payload with the errors (see [feature-02-validation.md](feature-02-validation.md) for the full pattern including payload types).

```typescript
import type { CrudGeneratorHooksService, CurrentUser, MutationError } from "@comet/cms-api";
import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";

import type { ProductVariant } from "./entities/product-variant.entity";
import type { ProductVariantInput, ProductVariantUpdateInput } from "./dto/product-variant.input";

enum ProductVariantMutationErrorCode {
    nameTooShort = "nameTooShort",
}
registerEnumType(ProductVariantMutationErrorCode, {
    name: "ProductVariantMutationErrorCode",
    valuesMap: {
        nameTooShort: {
            description: "Name must be at least 3 characters long",
        },
    },
});

@ObjectType()
export class ProductVariantMutationError implements MutationError {
    @Field({ nullable: true })
    field?: string;

    @Field(() => ProductVariantMutationErrorCode)
    code: ProductVariantMutationErrorCode;
}

export class ProductVariantService implements CrudGeneratorHooksService {
    async validateCreateInput(
        input: ProductVariantInput,
        options: { currentUser: CurrentUser; args: { product: string } },
    ): Promise<ProductVariantMutationError[]> {
        if (input.name.length < 3) {
            return [
                {
                    code: ProductVariantMutationErrorCode.nameTooShort,
                    field: "name",
                },
            ];
        }
        return [];
    }

    async validateUpdateInput(
        input: ProductVariantUpdateInput,
        options: { currentUser: CurrentUser; entity: ProductVariant },
    ): Promise<ProductVariantMutationError[]> {
        if (input.name !== undefined && input.name.length < 3) {
            return [
                {
                    code: ProductVariantMutationErrorCode.nameTooShort,
                    field: "name",
                },
            ];
        }
        return [];
    }
}
```

When validation needs database access (e.g. uniqueness checks), add `@Injectable()` and inject `EntityManager` in the constructor.

## Rules

- **No service for plain scalar entities** — the resolver alone handles all CRUD. Never generate an empty pass-through service.
- **Position helpers service**: plural naming, `@Injectable()`, injects `EntityManager`, contains **only** `incrementPositions`/`decrementPositions`/`getLastPosition` (plus `getPositionGroupCondition` when position is grouped). No `create`/`update`/`delete`/`find` methods.
- **Business-logic service**: singular naming, `implements CrudGeneratorHooksService` (import as `type` from `@comet/cms-api`), hook methods return `{Entity}MutationError[]` (empty array = valid).
- **`{Entity}MutationError`** is an `@ObjectType()` implementing the `MutationError` interface from `@comet/cms-api`, with a `registerEnumType`'d `{Entity}MutationErrorCode` enum — defined and exported from the business-logic service file.
- **No `@Args()`, `@Query()`, `@Mutation()`** in services — those are resolver concerns.
- **Register** every generated service in the module's `providers` array.
