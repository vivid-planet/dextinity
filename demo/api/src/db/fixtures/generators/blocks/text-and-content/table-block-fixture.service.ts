import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import type { RichTextBlock } from "@src/common/blocks/rich-text.block.js";
import { LinkBlockFixtureService } from "@src/db/fixtures/generators/blocks/navigation/link-block-fixture.service.js";

import { type DescriptionCellContent, TableBlockFixtureBase } from "./table-block-fixture-base.js";

type RichTextInput = ExtractBlockInputFactoryProps<typeof RichTextBlock>;

const standardParagraphStyle = "paragraph300";
const smallParagraphStyle = "paragraph200";

@Injectable()
export class TableBlockFixtureService extends TableBlockFixtureBase<RichTextInput> {
    constructor(linkBlockFixtureService: LinkBlockFixtureService) {
        super(linkBlockFixtureService);
    }

    protected createSimpleCellRichText(text: string): RichTextInput {
        return {
            tipTapContent: {
                type: "doc",
                content: [
                    {
                        type: "textBlock",
                        attrs: { textBlock: "paragraph", textBlockStyle: standardParagraphStyle },
                        content: [{ type: "text", text }],
                    },
                ],
            },
        };
    }

    protected createDescriptionCellRichText({ jobTitle, textBeforeLink, linkText, textAfterLink, link }: DescriptionCellContent): RichTextInput {
        return {
            tipTapContent: {
                type: "doc",
                content: [
                    {
                        type: "textBlock",
                        attrs: { textBlock: "paragraph", textBlockStyle: standardParagraphStyle },
                        content: [{ type: "text", text: jobTitle }],
                    },
                    {
                        type: "textBlock",
                        attrs: { textBlock: "paragraph", textBlockStyle: smallParagraphStyle },
                        content: [
                            { type: "text", text: textBeforeLink },
                            { type: "text", marks: [{ type: "link", attrs: { data: link } }], text: linkText },
                            { type: "text", text: textAfterLink },
                        ],
                    },
                ],
            },
        };
    }
}
