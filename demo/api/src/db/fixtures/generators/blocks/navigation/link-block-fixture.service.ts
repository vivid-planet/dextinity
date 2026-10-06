import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import type { LinkBlock } from "@src/common/blocks/link.block.js";
import { faker } from "@src/db/fixtures/faker.js";

const urls = ["https://vivid-planet.com/", "https://github.com/", "https://gitlab.com", "https://stackoverflow.com/"];

@Injectable()
export class LinkBlockFixtureService {
    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof LinkBlock>> {
        return {
            attachedBlocks: [
                {
                    type: "external",
                    props: {
                        targetUrl: faker.helpers.arrayElement(urls),
                        openInNewWindow: faker.datatype.boolean(),
                        noFollow: faker.datatype.boolean(),
                    },
                },
            ],
            activeType: "external",
        };
    }
}
