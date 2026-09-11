import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { SpaceBlock, Spacing } from "@src/common/blocks/space.block";
import { faker } from "@src/db/fixtures/faker";

@Injectable()
export class SpaceBlockFixtureService {
    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof SpaceBlock>> {
        return { spacing: faker.helpers.arrayElement(Object.values(Spacing)) };
    }
}
