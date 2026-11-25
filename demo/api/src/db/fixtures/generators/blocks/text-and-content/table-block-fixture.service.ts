import type { ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import type { PriceCellBlock } from "@src/common/blocks/table/price-cell.block.js";
import type { TableCellRichTextBlock } from "@src/common/blocks/table/table-cell-rich-text.block.js";
import { LinkBlockFixtureService } from "@src/db/fixtures/generators/blocks/navigation/link-block-fixture.service.js";

import { type DescriptionCellContent, TableBlockFixtureBase } from "./table-block-fixture-base.js";

type RichTextInput = ExtractBlockInputFactoryProps<typeof TableCellRichTextBlock>;
type PriceCellInput = ExtractBlockInputFactoryProps<typeof PriceCellBlock>;

type CellInput = {
    attachedBlocks: Array<{ type: "richText"; props: RichTextInput } | { type: "price"; props: PriceCellInput }>;
    activeType: "richText" | "price";
};

const standardParagraphStyle = "paragraph300";
const smallParagraphStyle = "paragraph200";

@Injectable()
export class TableBlockFixtureService extends TableBlockFixtureBase<CellInput> {
    constructor(linkBlockFixtureService: LinkBlockFixtureService) {
        super(linkBlockFixtureService);
    }

    protected createSimpleCellRichText(text: string): CellInput {
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

    protected createDescriptionCellRichText({ jobTitle, textBeforeLink, linkText, textAfterLink, link }: DescriptionCellContent): CellInput {
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

    protected createPriceCell(amount: number): CellInput {
        return { attachedBlocks: [{ type: "price", props: { amount, bold: false } }], activeType: "price" };
    }
}

function createRichTextCell(props: RichTextInput): CellInput {
    return { attachedBlocks: [{ type: "richText", props }], activeType: "richText" };
}
