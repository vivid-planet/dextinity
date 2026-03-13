# Feature: Validation

Apply when create/update operations need business logic validation beyond what DTO decorators (`@IsNotEmpty`, `@IsUUID`, etc.) can express. Examples: uniqueness checks, cross-field constraints, permission-based restrictions, or external service lookups.

## What changes

1. Service defines a `{EntityName}ValidationError` ObjectType and private validation methods
2. Service `create`/`update` methods call validation before persisting and return **payload objects** (entity + errors) instead of the entity directly
3. Resolver returns **payload types** instead of the entity for create/update mutations
4. Resolver injects `@GetCurrentUser() user: CurrentUser` and passes it to the service

## ValidationError ObjectType (in service file)

Define the error type in the service file alongside the service class:

```typescript
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ProductVariantValidationError {
    @Field({ nullable: true })
    field?: string;

    @Field()
    code: string;
}
```

> This follows the `ValidationError` interface shape from `@comet/cms-api` (`{ field?: string; code: string }`) but as a GraphQL ObjectType.

## Service — validation methods and CRUD changes

Validation methods are `private` in the CRUD service. They return an array of errors (empty = valid).

```typescript
import { CurrentUser } from "@comet/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { Field, ObjectType } from "@nestjs/graphql";

import { ProductVariantInput, ProductVariantUpdateInput } from "./dto/product-variant.input";
import { ProductVariant } from "./entities/product-variant.entity";

@ObjectType()
export class ProductVariantValidationError {
    @Field({ nullable: true })
    field?: string;

    @Field()
    code: string;
}

@Injectable()
export class ProductVariantsService {
    constructor(private readonly entityManager: EntityManager) {}

    // ... findOneById, findAll, delete same as base pattern ...

    async create(
        input: ProductVariantInput,
        user: CurrentUser,
    ): Promise<{ productVariant?: ProductVariant; errors: ProductVariantValidationError[] }> {
        const errors = await this.validateCreateInput(input, { currentUser: user });
        if (errors.length > 0) {
            return { errors };
        }

        const productVariant = this.entityManager.create(ProductVariant, { ...input });
        await this.entityManager.flush();
        return { productVariant, errors: [] };
    }

    async update(
        id: string,
        input: ProductVariantUpdateInput,
        user: CurrentUser,
    ): Promise<{ productVariant?: ProductVariant; errors: ProductVariantValidationError[] }> {
        const productVariant = await this.entityManager.findOneOrFail(ProductVariant, id);

        const errors = await this.validateUpdateInput(input, { currentUser: user, entity: productVariant });
        if (errors.length > 0) {
            return { errors };
        }

        productVariant.assign({ ...input });
        await this.entityManager.flush();
        return { productVariant, errors: [] };
    }

    private async validateCreateInput(input: ProductVariantInput, context: { currentUser: CurrentUser }): Promise<ProductVariantValidationError[]> {
        const errors: ProductVariantValidationError[] = [];

        // Example: uniqueness check
        const existing = await this.entityManager.findOne(ProductVariant, { sku: input.sku });
        if (existing) {
            errors.push({ field: "sku", code: "SKU_ALREADY_EXISTS" });
        }

        // Example: cross-field constraint
        if (input.minQuantity && input.maxQuantity && input.minQuantity > input.maxQuantity) {
            errors.push({ field: "minQuantity", code: "MIN_EXCEEDS_MAX" });
        }

        return errors;
    }

    private async validateUpdateInput(
        input: ProductVariantUpdateInput,
        context: { currentUser: CurrentUser; entity: ProductVariant },
    ): Promise<ProductVariantValidationError[]> {
        const errors: ProductVariantValidationError[] = [];

        // Example: uniqueness check (exclude current entity)
        if (input.sku !== undefined) {
            const existing = await this.entityManager.findOne(ProductVariant, {
                sku: input.sku,
                id: { $ne: context.entity.id },
            });
            if (existing) {
                errors.push({ field: "sku", code: "SKU_ALREADY_EXISTS" });
            }
        }

        return errors;
    }
}
```

### With dedicatedResolverArg

When the entity has a dedicated resolver arg, pass it through to validation:

```typescript
async create(
    product: string,
    input: ProductVariantInput,
    user: CurrentUser,
): Promise<{ productVariant?: ProductVariant; errors: ProductVariantValidationError[] }> {
    const errors = await this.validateCreateInput(input, { currentUser: user, args: { product } });
    if (errors.length > 0) {
        return { errors };
    }
    // ... create with product reference ...
}

private async validateCreateInput(
    input: ProductVariantInput,
    context: { currentUser: CurrentUser; args?: { product: string } },
): Promise<ProductVariantValidationError[]> {
    // Can access context.args.product for parent-scoped validation
}
```

## Payload Types (in resolver file)

Payload types are GraphQL ObjectTypes and belong in the resolver file:

```typescript
import { Field, ObjectType } from "@nestjs/graphql";
import { ProductVariantValidationError } from "./product-variants.service";
import { ProductVariant } from "./entities/product-variant.entity";

@ObjectType()
class CreateProductVariantPayload {
    @Field(() => ProductVariant, { nullable: true })
    productVariant?: ProductVariant;

    @Field(() => [ProductVariantValidationError], { nullable: false })
    errors: ProductVariantValidationError[];
}

@ObjectType()
class UpdateProductVariantPayload {
    @Field(() => ProductVariant, { nullable: true })
    productVariant?: ProductVariant;

    @Field(() => [ProductVariantValidationError], { nullable: false })
    errors: ProductVariantValidationError[];
}
```

## Resolver — thin, passes user to service

```typescript
import { CurrentUser, GetCurrentUser } from "@comet/cms-api";

@Mutation(() => CreateProductVariantPayload)
async createProductVariant(
    @Args("input", { type: () => ProductVariantInput })
    input: ProductVariantInput,
    @GetCurrentUser()
    user: CurrentUser,
): Promise<CreateProductVariantPayload> {
    return this.productVariantsService.create(input, user);
}

@Mutation(() => UpdateProductVariantPayload)
@AffectedEntity(ProductVariant)
async updateProductVariant(
    @Args("id", { type: () => ID }) id: string,
    @Args("input", { type: () => ProductVariantUpdateInput }) input: ProductVariantUpdateInput,
    @GetCurrentUser() user: CurrentUser,
): Promise<UpdateProductVariantPayload> {
    return this.productVariantsService.update(id, input, user);
}
```

## Rules

- validation logic lives directly in the CRUD service as `private` methods.
- **ValidationError ObjectType** is defined in the service file and exported for the resolver to import.
- **Payload types** are defined in the resolver file (they're GraphQL return types).
- **`CurrentUser`** is extracted via `@GetCurrentUser()` in the resolver and passed to the service — the service never uses GraphQL decorators.
- Only apply this pattern when business logic validation is needed. Standard DTO validation (`@IsNotEmpty`, `@IsUUID`, `@Min`, etc.) covers most cases.
- The `delete` method is not affected — it stays the same (no validation payload needed, just returns `boolean`).
