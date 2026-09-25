import { BlockTransformerServiceInterface } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import { Product } from "../entities/product.entity";
import { ProductLinkBlockData } from "./product-link.block";

type TransformResponse = {
    product?: {
        id: string;
        slug: string;
    };
};

@Injectable()
export class ProductLinkBlockTransformerService implements BlockTransformerServiceInterface<ProductLinkBlockData, TransformResponse> {
    constructor(private readonly entityManager: EntityManager) {}

    async transformToPlain(block: ProductLinkBlockData) {
        if (!block.id) {
            return {};
        }

        const product = await this.entityManager.findOneOrFail(Product, block.id);

        return {
            product: {
                id: product.id,
                slug: product.slug,
            },
        };
    }
}
