import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { faker } from "@src/db/fixtures/faker";
import { StageBlock } from "@src/documents/pages/blocks/stage.block";

import { BasicStageBlockFixtureService } from "./blocks/stage/basic-stage-block-fixture.service";

@Injectable()
export class StageBlockFixtureService {
    constructor(private readonly basicStageBlockFixtureService: BasicStageBlockFixtureService) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof StageBlock>> {
        const blocks: ExtractBlockInputFactoryProps<typeof StageBlock>["blocks"] = [];

        blocks.push({
            key: faker.string.uuid(),
            visible: true,
            props: await this.basicStageBlockFixtureService.generateBlockInput(),
        });

        return {
            blocks: blocks,
        };
    }
}
