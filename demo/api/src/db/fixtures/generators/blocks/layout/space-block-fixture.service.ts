import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { type SpaceBlock, Spacing } from "@src/common/blocks/space.block.js";
import { faker } from "@src/db/fixtures/faker.js";

@Injectable()
export class SpaceBlockFixtureService {
    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof SpaceBlock>> {
        return { spacing: faker.helpers.arrayElement(Object.values(Spacing)) };
    }
}
