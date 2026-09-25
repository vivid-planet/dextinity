import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker";
import { ProductTypesBlock } from "@src/products/blocks/product-types.block";
import { ProductType } from "@src/products/entities/product-type.enum";

@Injectable()
export class ProductTypesBlockFixtureService {
    constructor() {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof ProductTypesBlock>> {
        return {
            types: faker.helpers.arrayElements(Object.values(ProductType)),
        };
    }
}
