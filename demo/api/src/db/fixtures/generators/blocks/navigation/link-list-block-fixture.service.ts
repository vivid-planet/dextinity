import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import type { LinkListBlock } from "@src/common/blocks/link-list.block.js";
import { faker } from "@src/db/fixtures/faker.js";
import { TextLinkBlockFixtureService } from "@src/db/fixtures/generators/blocks/navigation/text-link-block-fixture.service.js";
import { UserGroup } from "@src/user-groups/user-group.js";

@Injectable()
export class LinkListBlockFixtureService {
    constructor(private readonly textLinkBlockFixtureService: TextLinkBlockFixtureService) {}

    async generateBlockInput(min = 1, max = 4): Promise<ExtractBlockInputFactoryProps<typeof LinkListBlock>> {
        const blockAmount = faker.number.int({ min, max });
        const blocks = [];

        for (let i = 0; i < blockAmount; i++) {
            blocks.push({
                key: faker.string.uuid(),
                visible: true,
                props: await this.textLinkBlockFixtureService.generateBlockInput(),
                userGroup: UserGroup.all,
            });
        }

        return {
            blocks: blocks,
        };
    }
}
