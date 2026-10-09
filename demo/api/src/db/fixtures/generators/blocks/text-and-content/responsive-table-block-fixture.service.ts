import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { ResponsiveBehavior, ResponsiveTableBlock } from "@src/common/blocks/responsive-table.block";
import { faker } from "@src/db/fixtures/faker";

import { TipTapTableBlockFixtureService } from "./tip-tap-table-block-fixture.service";

@Injectable()
export class ResponsiveTableBlockFixtureService {
    constructor(private readonly tipTapTableBlockFixtureService: TipTapTableBlockFixtureService) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof ResponsiveTableBlock>> {
        return {
            table: await this.tipTapTableBlockFixtureService.generateBlockInput(),
            responsiveBehavior: faker.helpers.arrayElement(Object.values(ResponsiveBehavior)),
        };
    }
}
