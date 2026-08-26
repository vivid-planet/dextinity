import { AnchorBlock, ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker";

@Injectable()
export class AnchorBlockFixtureService {
    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof AnchorBlock>> {
        return {
            name: faker.word.words(3),
        };
    }
}
