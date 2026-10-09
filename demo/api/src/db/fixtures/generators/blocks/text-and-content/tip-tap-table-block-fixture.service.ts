import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { TipTapRichTextBlock } from "@src/common/blocks/tip-tap-rich-text.block";
import { LinkBlockFixtureService } from "@src/db/fixtures/generators/blocks/navigation/link-block-fixture.service";

import { DescriptionCellContent, TableBlockFixtureBase } from "./table-block-fixture-base";

export type TipTapRichTextInput = ExtractBlockInputFactoryProps<typeof TipTapRichTextBlock>;

const standardParagraphStyle = "paragraph300";
const smallParagraphStyle = "paragraph200";

/** Cell content of a TipTap table: a single paragraph of plain text. */
export function createTipTapCellRichText(text: string, { isBold }: { isBold?: boolean } = {}): TipTapRichTextInput {
    return {
        tipTapContent: {
            type: "doc",
            content: [
                {
                    type: "textBlock",
                    attrs: { textBlock: "paragraph", textBlockStyle: standardParagraphStyle },
                    content: [isBold ? { type: "text", marks: [{ type: "bold" }], text } : { type: "text", text }],
                },
            ],
        },
    };
}

@Injectable()
export class TipTapTableBlockFixtureService extends TableBlockFixtureBase<TipTapRichTextInput> {
    constructor(linkBlockFixtureService: LinkBlockFixtureService) {
        super(linkBlockFixtureService);
    }

    protected createSimpleCellRichText(text: string): TipTapRichTextInput {
        return createTipTapCellRichText(text);
    }

    protected createDescriptionCellRichText({
        jobTitle,
        textBeforeLink,
        linkText,
        textAfterLink,
        link,
    }: DescriptionCellContent): TipTapRichTextInput {
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
