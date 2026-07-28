import { AffectedEntity, RequiredPermission } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Args, ID, Query, Resolver } from "@nestjs/graphql";

import { Product } from "./entities/product.entity";

@Resolver(() => Product)
@RequiredPermission("products", { skipScopeCheck: true })
export class ExtendedProductResolver {
    constructor(private readonly entityManager: EntityManager) {}

    @Query(() => [Product])
    @AffectedEntity(Product, { idArg: "ids" })
    async productsByIds(@Args("ids", { type: () => [ID] }) ids: string[]): Promise<Product[]> {
        const products = await this.entityManager.find(Product, { id: { $in: ids } });

        if (products.length !== ids.length) {
            throw new Error("Failed to load all requested products");
        }

        return products.sort((productA, productB) => ids.indexOf(productA.id) - ids.indexOf(productB.id));
    }
}
