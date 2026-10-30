import type { BlockTransformerServiceInterface } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import { Product } from "../entities/product.entity.js";
import type { ProductPriceBlockData } from "./product-price.block.js";

type TransformResponse = {
    product?: {
        id: string;
        title: string;
        price?: number;
    };
};

@Injectable()
export class ProductPriceBlockTransformerService implements BlockTransformerServiceInterface<ProductPriceBlockData, TransformResponse> {
    constructor(private readonly entityManager: EntityManager) {}

    async transformToPlain(block: ProductPriceBlockData) {
        if (!block.productId) {
            return {};
        }

        const product = await this.entityManager.findOneOrFail(Product, block.productId);

        return {
            product: {
                id: product.id,
                title: product.title,
                price: product.price,
            },
        };
    }
}
