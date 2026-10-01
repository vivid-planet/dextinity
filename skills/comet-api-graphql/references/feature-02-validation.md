# Feature: Validation (Business-Logic Hooks)

Apply when create/update operations need business logic validation beyond what DTO decorators (`@IsNotEmpty`, `@IsUUID`, etc.) can express. Examples: uniqueness checks, cross-field constraints, permission-based restrictions, or external service lookups.

## What changes

1. A hand-written **business-logic service** `{EntityName}Service` (singular, see [gen-07-service.md](gen-07-service.md)) implements the `CrudGeneratorHooksService` interface from `@comet/cms-api` with `validateCreateInput`/`validateUpdateInput` methods
2. The service file defines a `{EntityName}MutationErrorCode` enum (registered via `registerEnumType`) and a `{EntityName}MutationError` ObjectType implementing the `MutationError` interface from `@comet/cms-api`
3. The resolver defines **payload types** (entity + errors) and returns them from create/update mutations instead of the entity directly
4. The resolver injects the business-logic service and `@GetCurrentUser() user: CurrentUser`, calls the validate hooks first, and returns `{ errors }` early when validation fails

## Business-logic service — `{entity-name}.service.ts`

Error code enum, error ObjectType, and hook methods live together in the service file. Hook methods return an array of errors (empty = valid).

```typescript
import type { CrudGeneratorHooksService, CurrentUser, MutationError } from "@comet/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";

import type { ProductVariant } from "./entities/product-variant.entity";
import type { ProductVariantInput, ProductVariantUpdateInput } from "./dto/product-variant.input";

enum ProductVariantMutationErrorCode {
    skuAlreadyExists = "skuAlreadyExists",
    minExceedsMax = "minExceedsMax",
}
registerEnumType(ProductVariantMutationErrorCode, {
    name: "ProductVariantMutationErrorCode",
    valuesMap: {
        skuAlreadyExists: {
            description: "A variant with this SKU already exists",
        },
        minExceedsMax: {
            description: "minQuantity must not exceed maxQuantity",
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

@Injectable()
export class ProductVariantService implements CrudGeneratorHooksService {
    constructor(private readonly entityManager: EntityManager) {}

    async validateCreateInput(input: ProductVariantInput, options: { currentUser: CurrentUser }): Promise<ProductVariantMutationError[]> {
        const errors: ProductVariantMutationError[] = [];

        // Example: uniqueness check
        const existing = await this.entityManager.findOne(ProductVariant, { sku: input.sku });
        if (existing) {
            errors.push({ field: "sku", code: ProductVariantMutationErrorCode.skuAlreadyExists });
        }

        // Example: cross-field constraint
        if (input.minQuantity && input.maxQuantity && input.minQuantity > input.maxQuantity) {
            errors.push({ field: "minQuantity", code: ProductVariantMutationErrorCode.minExceedsMax });
        }

        return errors;
    }

    async validateUpdateInput(
        input: ProductVariantUpdateInput,
        options: { currentUser: CurrentUser; entity: ProductVariant },
    ): Promise<ProductVariantMutationError[]> {
        const errors: ProductVariantMutationError[] = [];

        // Example: uniqueness check (exclude current entity)
        if (input.sku !== undefined) {
            const existing = await this.entityManager.findOne(ProductVariant, {
                sku: input.sku,
                id: { $ne: options.entity.id },
            });
            if (existing) {
                errors.push({ field: "sku", code: ProductVariantMutationErrorCode.skuAlreadyExists });
            }
        }

        return errors;
    }
}
```

> `@Injectable()` and the `EntityManager` are only needed when validation requires database access. For pure input checks, a plain class without a constructor is enough (it still goes into the module's `providers`).

### With dedicatedResolverArg

When the entity has a dedicated resolver arg (see [feature-03-dedicated-arg.md](feature-03-dedicated-arg.md)), the resolver passes it in `options.args`:

```typescript
async validateCreateInput(
    input: ProductVariantInput,
    options: { currentUser: CurrentUser; args: { product: string } },
): Promise<ProductVariantMutationError[]> {
    // Can access options.args.product for parent-scoped validation
}
```

## Payload Types (in resolver file)

Payload types are GraphQL ObjectTypes and belong in the resolver file:

```typescript
import { Field, ObjectType } from "@nestjs/graphql";
import { ProductVariantMutationError } from "./product-variant.service";
import { ProductVariant } from "./entities/product-variant.entity";

@ObjectType()
class CreateProductVariantPayload {
    @Field(() => ProductVariant, { nullable: true })
    productVariant?: ProductVariant;

    @Field(() => [ProductVariantMutationError], { nullable: false })
    errors: ProductVariantMutationError[];
}

@ObjectType()
class UpdateProductVariantPayload {
    @Field(() => ProductVariant, { nullable: true })
    productVariant?: ProductVariant;

    @Field(() => [ProductVariantMutationError], { nullable: false })
    errors: ProductVariantMutationError[];
}
```

## Resolver — validate first, then create/update inline

The resolver injects the business-logic service, calls the validate hook at the start of the mutation, and returns early on errors. The CRUD logic itself stays inline in the resolver:

```typescript
import { CurrentUser, GetCurrentUser } from "@comet/cms-api";

@Mutation(() => CreateProductVariantPayload)
async createProductVariant(
    @Args("input", { type: () => ProductVariantInput })
    input: ProductVariantInput,
    @GetCurrentUser()
    user: CurrentUser,
): Promise<CreateProductVariantPayload> {
    const errors = await this.productVariantService.validateCreateInput(input, { currentUser: user });
    if (errors.length > 0) {
        return { errors };
    }
    const productVariant = this.entityManager.create(ProductVariant, {
        ...input,
    });
    await this.entityManager.flush();
    return { productVariant, errors: [] };
}

@Mutation(() => UpdateProductVariantPayload)
@AffectedEntity(ProductVariant)
async updateProductVariant(
    @Args("id", { type: () => ID }) id: string,
    @Args("input", { type: () => ProductVariantUpdateInput }) input: ProductVariantUpdateInput,
    @GetCurrentUser() user: CurrentUser,
): Promise<UpdateProductVariantPayload> {
    const productVariant = await this.entityManager.findOneOrFail(ProductVariant, id);
    const errors = await this.productVariantService.validateUpdateInput(input, { currentUser: user, entity: productVariant });
    if (errors.length > 0) {
        return { errors };
    }
    productVariant.assign({
        ...input,
    });
    await this.entityManager.flush();
    return { productVariant, errors: [] };
}
```

## Rules

- Validation logic lives in the hand-written **business-logic service** (singular `{EntityName}Service`), never inline in the resolver.
- **`{Entity}MutationError`** implements the `MutationError` interface from `@comet/cms-api` (import as `type`) and is defined + exported in the service file. Its `code` field is typed with the `registerEnumType`'d `{Entity}MutationErrorCode` enum — never a plain `string`.
- **Payload types** are defined in the resolver file (they're GraphQL return types) with an optional entity field and a non-nullable `errors` array.
- **`CurrentUser`** is extracted via `@GetCurrentUser()` in the resolver and passed to the hooks in the `options` object.
- For updates, pass the loaded entity in `options.entity`; for creates with a dedicated resolver arg, pass it in `options.args`.
- Only apply this pattern when business logic validation is needed. Standard DTO validation (`@IsNotEmpty`, `@IsUUID`, `@Min`, etc.) covers most cases.
- The `delete` mutation is not affected — it stays the same (no validation payload needed, just returns `boolean`).
