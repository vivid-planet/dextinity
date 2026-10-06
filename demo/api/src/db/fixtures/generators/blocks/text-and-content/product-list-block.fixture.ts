import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker.js";
import type { ProductListBlock } from "@src/products/blocks/product-list.block.js";
import { ProductType } from "@src/products/entities/product-type.enum.js";

@Injectable()
export class ProductListBlockFixtureService {
    constructor() {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof ProductListBlock>> {
        return {
            types: faker.helpers.arrayElements(Object.values(ProductType)),
        };
    }
}
