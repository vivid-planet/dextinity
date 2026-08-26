import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker";
import { ProductListBlock } from "@src/products/blocks/product-list.block";
import { ProductType } from "@src/products/entities/product-type.enum";

@Injectable()
export class ProductListBlockFixtureService {
    constructor() {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof ProductListBlock>> {
        return {
            types: faker.helpers.arrayElements(Object.values(ProductType)),
        };
    }
}
