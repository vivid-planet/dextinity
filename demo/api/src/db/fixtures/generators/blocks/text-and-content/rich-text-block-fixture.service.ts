import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { RichTextBlock } from "@src/common/blocks/rich-text.block";
import { faker } from "@src/db/fixtures/faker";

@Injectable()
export class RichTextBlockFixtureService {
    async generateBlockInput(
        lineCount = 3,
        blocks?: ExtractBlockInputFactoryProps<typeof RichTextBlock>["draftContent"]["blocks"],
    ): Promise<ExtractBlockInputFactoryProps<typeof RichTextBlock>> {
        const possibleTypes = ["textMedium", "textSmall", "textXSmall"];

        const defaultBlocks: ExtractBlockInputFactoryProps<typeof RichTextBlock>["draftContent"]["blocks"] = [];

        if (!blocks) {
            for (let i = 0; i < faker.number.int({ min: 1, max: 3 }); i++) {
                defaultBlocks.push({
                    key: faker.string.uuid(),
                    text: faker.lorem.paragraph(),
                    type: faker.helpers.arrayElement(possibleTypes),
                    depth: 0,
                    inlineStyleRanges: [],
                    entityRanges: [],
                    data: {},
                });
            }
        }

        return {
            draftContent: {
                blocks: faker.helpers.arrayElements(blocks ?? defaultBlocks, lineCount),
                entityMap: {},
            },
        };
    }
}
