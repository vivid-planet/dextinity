import type { CrudGeneratorHooksService, CurrentUser, MutationError } from "@dextinity/cms-api";
import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";

import type { ProductVariant } from "./entities/product-variant.entity";
import type { ProductVariantInput, ProductVariantUpdateInput } from "./generated/dto/product-variant.input";

enum ProductVariantMutationErrorCode {
    nameTooShort = "nameTooShort",
}
registerEnumType(ProductVariantMutationErrorCode, {
    name: "ProductVariantMutationErrorCode",
    valuesMap: {
        nameTooShort: {
            description: "Name must be at least 3 characters long, except for foo",
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
        if (input.name.length < 3 && options.currentUser.email !== "foo@example.com") {
            return [
                {
                    code: ProductVariantMutationErrorCode.nameTooShort,
                    field: "name",
                },
            ];
        }
        // we could access options.args.product here if needed
        return [];
    }
    async validateUpdateInput(
        input: ProductVariantUpdateInput,
        options: { currentUser: CurrentUser; entity: ProductVariant },
    ): Promise<ProductVariantMutationError[]> {
        if (input.name !== undefined && input.name.length < 3 && options.currentUser.email !== "foo@example.com") {
            return [
                {
                    code: ProductVariantMutationErrorCode.nameTooShort,
                    field: "name",
                },
            ];
        }
        // we could access options.entity here if needed
        return [];
    }
}
