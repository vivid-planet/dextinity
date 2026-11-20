import { RequiredPermission } from "@dextinity/cms-api";
import { Parent, ResolveField, Resolver } from "@nestjs/graphql";

import { Product } from "./entities/product.entity.js";
import { ProductTag } from "./entities/product-tag.entity.js";
import { ProductToTag } from "./entities/product-to-tag.entity.js";

@Resolver(() => ProductToTag)
@RequiredPermission(["products"], { skipScopeCheck: true })
export class ProductToTagResolver {
    @ResolveField(() => Product)
    async product(
        @Parent()
        productToTag: ProductToTag,
    ): Promise<Product> {
        return productToTag.product.loadOrFail();
    }
    @ResolveField(() => ProductTag)
    async tag(
        @Parent()
        productToTag: ProductToTag,
    ): Promise<ProductTag> {
        return productToTag.tag.loadOrFail();
    }
}
