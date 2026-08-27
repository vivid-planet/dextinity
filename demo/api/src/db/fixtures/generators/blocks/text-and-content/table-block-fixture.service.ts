import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { RichTextBlock } from "@src/common/blocks/rich-text.block";
import { faker } from "@src/db/fixtures/faker";
import { LinkBlockFixtureService } from "@src/db/fixtures/generators/blocks/navigation/link-block-fixture.service";

import { DescriptionCellContent, TableBlockFixtureBase } from "./table-block-fixture-base";

type RichTextInput = ExtractBlockInputFactoryProps<typeof RichTextBlock>;

@Injectable()
export class TableBlockFixtureService extends TableBlockFixtureBase<RichTextInput> {
    constructor(linkBlockFixtureService: LinkBlockFixtureService) {
        super(linkBlockFixtureService);
    }

    protected createSimpleCellRichText(text: string): RichTextInput {
        return {
            draftContent: {
                blocks: [
                    {
                        key: faker.string.uuid(),
                        text,
                        type: "paragraph-standard",
                        depth: 0,
                        inlineStyleRanges: [],
                        entityRanges: [],
                        data: {},
                    },
                ],
                entityMap: {},
            },
        };
    }

    protected createDescriptionCellRichText({ jobTitle, textBeforeLink, linkText, textAfterLink, link }: DescriptionCellContent): RichTextInput {
        return {
            draftContent: {
                blocks: [
                    {
                        key: faker.string.uuid(),
                        text: jobTitle,
                        type: "paragraph-standard",
                        depth: 0,
                        inlineStyleRanges: [],
                        entityRanges: [],
                        data: {},
                    },
                    {
                        key: faker.string.uuid(),
                        text: `${textBeforeLink}${linkText}${textAfterLink}`,
                        type: "paragraph-small",
                        depth: 0,
                        inlineStyleRanges: [],
                        entityRanges: [
                            {
                                offset: textBeforeLink.length,
                                length: linkText.length,
                                key: 0,
                            },
                        ],
                        data: {},
                    },
                ],
                entityMap: {
                    "0": {
                        type: "LINK",
                        mutability: "MUTABLE",
                        data: link,
                    },
                },
            },
        };
    }
}
