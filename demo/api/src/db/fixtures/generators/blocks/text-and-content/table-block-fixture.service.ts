import type { DamImageBlock, ExtractBlockInputFactoryProps } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import type { PriceCellBlock } from "@src/common/blocks/table/price-cell.block.js";
import { TableCellBadge } from "@src/common/blocks/table/table-cell-badge.enum.js";
import type { TableCellRichTextBlock } from "@src/common/blocks/table/table-cell-rich-text.block.js";
import type { TextCellBlock } from "@src/common/blocks/table/text-cell.block.js";
import { faker } from "@src/db/fixtures/faker.js";
import { DamImageBlockFixtureService } from "@src/db/fixtures/generators/blocks/media/dam-image-block-fixture.service.js";
import { LinkBlockFixtureService } from "@src/db/fixtures/generators/blocks/navigation/link-block-fixture.service.js";

import { type DescriptionCellContent, TableBlockFixtureBase } from "./table-block-fixture-base.js";

type RichTextInput = ExtractBlockInputFactoryProps<typeof TableCellRichTextBlock>;
type TextCellInput = ExtractBlockInputFactoryProps<typeof TextCellBlock>;
type PriceCellInput = ExtractBlockInputFactoryProps<typeof PriceCellBlock>;
type ImageCellInput = ExtractBlockInputFactoryProps<typeof DamImageBlock>;

type CellInput = {
    attachedBlocks: Array<
        { type: "text"; props: TextCellInput } | { type: "price"; props: PriceCellInput } | { type: "image"; props: ImageCellInput }
    >;
    activeType: "text" | "price" | "image";
};

const standardParagraphStyle = "paragraph300";
const smallParagraphStyle = "paragraph200";

@Injectable()
export class TableBlockFixtureService extends TableBlockFixtureBase<CellInput> {
    constructor(
        linkBlockFixtureService: LinkBlockFixtureService,
        private readonly damImageBlockFixtureService: DamImageBlockFixtureService,
    ) {
        super(linkBlockFixtureService);
    }

    protected createSimpleCellRichText(text: string): CellInput {
        return createTextCell({
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
        return createTextCell(
            {
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
            },
            generateBadges(),
        );
    }

    protected createPriceCell(amount: number): CellInput {
        return { attachedBlocks: [{ type: "price", props: { amount, bold: false, badges: generateBadges() } }], activeType: "price" };
    }

    protected async createImageCell(): Promise<CellInput> {
        return { attachedBlocks: [{ type: "image", props: await this.damImageBlockFixtureService.generateBlockInput() }], activeType: "image" };
    }
}

function createTextCell(text: RichTextInput, badges: TableCellBadge[] = []): CellInput {
    return { attachedBlocks: [{ type: "text", props: { text, badges } }], activeType: "text" };
}

function generateBadges(): TableCellBadge[] {
    return faker.helpers.arrayElements(Object.values(TableCellBadge), { min: 0, max: 1 });
}
