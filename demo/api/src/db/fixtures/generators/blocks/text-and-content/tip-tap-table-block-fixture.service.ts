import { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { TipTapRichTextBlock } from "@src/common/blocks/tip-tap-rich-text.block";
import { TipTapTableCellBlock } from "@src/common/blocks/tip-tap-table-cell.block";
import { DamImageBlockFixtureService } from "@src/db/fixtures/generators/blocks/media/dam-image-block-fixture.service";
import { LinkBlockFixtureService } from "@src/db/fixtures/generators/blocks/navigation/link-block-fixture.service";

import { DescriptionCellContent, TableBlockFixtureBase } from "./table-block-fixture-base";

type TipTapRichTextInput = ExtractBlockInputFactoryProps<typeof TipTapRichTextBlock>;
type TipTapTableCellInput = ExtractBlockInputFactoryProps<typeof TipTapTableCellBlock>;

const standardParagraphStyle = "paragraph300";
const smallParagraphStyle = "paragraph200";

@Injectable()
export class TipTapTableBlockFixtureService extends TableBlockFixtureBase<TipTapTableCellInput> {
    constructor(
        linkBlockFixtureService: LinkBlockFixtureService,
        private readonly damImageBlockFixtureService: DamImageBlockFixtureService,
    ) {
        super(linkBlockFixtureService);
    }

    protected async createImageCell(): Promise<TipTapTableCellInput> {
        return { attachedBlocks: [{ type: "image", props: await this.damImageBlockFixtureService.generateBlockInput() }], activeType: "image" };
    }

    protected createSimpleCellRichText(text: string): TipTapTableCellInput {
        return createRichTextCell({
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
        });
    }

    protected createDescriptionCellRichText({
        jobTitle,
        textBeforeLink,
        linkText,
        textAfterLink,
        link,
    }: DescriptionCellContent): TipTapTableCellInput {
        return createRichTextCell({
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
        });
    }
}

function createRichTextCell(richText: TipTapRichTextInput): TipTapTableCellInput {
    return { attachedBlocks: [{ type: "richText", props: richText }], activeType: "richText" };
}
