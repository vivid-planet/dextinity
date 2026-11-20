import { RequiredPermission } from "@dextinity/cms-api";
import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { Product } from "./entities/product.entity.js";
import { ProductColor } from "./entities/product-color.entity.js";

@Resolver(() => ProductColor)
@RequiredPermission(["products"], { skipScopeCheck: true })
export class ProductColorResolver {
    @ResolveField(() => Product)
    async product(
        @Parent()
        productColor: ProductColor,
    ): Promise<Product> {
        return productColor.product.loadOrFail();
    }
}
