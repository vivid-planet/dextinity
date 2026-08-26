import { type CrudGeneratorHooksService, type CurrentUser, MutationError } from "@dextinity/cms-api";
import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";

import type { ProductInput } from "./generated/dto/product.input";

enum ProductMutationErrorCode {
    titleTooShort = "titleTooShort",
}
registerEnumType(ProductMutationErrorCode, {
    name: "ProductMutationErrorCode",
    valuesMap: {
        titleTooShort: {
            description: "Title must be at least 3 characters long when creating a product, except for foo",
        },
    },
});

@ObjectType()
export class ProductMutationError implements MutationError {
    @Field({ nullable: true })
    field?: string;

    @Field(() => ProductMutationErrorCode)
    code: ProductMutationErrorCode;
}

export class ProductService implements CrudGeneratorHooksService {
    async validateCreateInput(input: ProductInput, options: { currentUser: CurrentUser }): Promise<ProductMutationError[]> {
        if (input.title.length < 3 && options.currentUser.email !== "foo@example.com") {
            return [
                {
                    code: ProductMutationErrorCode.titleTooShort,
                    field: "title",
                },
            ];
        }
        return [];
    }
}
