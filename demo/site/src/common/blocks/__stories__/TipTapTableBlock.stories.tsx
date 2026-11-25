import type { TipTapTableBlockData } from "@src/blocks.generated";
import { TipTapTableBlock } from "@src/common/blocks/TipTapTableBlock";
import { createDamImage, createTipTapParagraph, createTipTapRichText } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const columnIds = ["product", "price", "availability", "image"];

type CellValue = TipTapTableBlockData["table"]["rows"][number]["cellValues"][number]["value"];

function createRichTextCell(text: string): CellValue {
    const props = createTipTapRichText(createTipTapParagraph(text));
    return { attachedBlocks: [{ type: "richText", props }], activeType: "richText", block: { type: "richText", props } };
}

function createImageCell(): CellValue {
    const props = createDamImage();
    return { attachedBlocks: [{ type: "image", props }], activeType: "image", block: { type: "image", props } };
}

const table: TipTapTableBlockData["table"] = {
    columns: columnIds.map((id) => ({ id, size: "standard", highlighted: id === "price" })),
    rows: [
        ["Product", "Price", "Availability", "Image"],
        ["Product A", "€ 19.99", "In stock", null],
        ["Product B", "€ 29.99", "Sold out", null],
        ["Product C", "€ 39.99", "In stock", null],
    ].map((cells, rowIndex) => ({
        id: `row${rowIndex}`,
        highlighted: rowIndex === 0,
        cellValues: cells.map((text, columnIndex) => ({
            columnId: columnIds[columnIndex],
            value: text === null ? createImageCell() : createRichTextCell(text),
        })),
    })),
};

const meta: Meta<typeof TipTapTableBlock> = {
    title: "Blocks/Common/TipTapTableBlock",
    component: TipTapTableBlock,
    args: {
        data: { table, responsiveBehavior: "scrollSideways" },
    },
};

export default meta;
type Story = StoryObj<typeof TipTapTableBlock>;

export const ScrollSideways: Story = {};

export const ListByRow: Story = {
    args: { data: { table, responsiveBehavior: "listByRow" } },
};

export const ListByColumn: Story = {
    args: { data: { table, responsiveBehavior: "listByColumn" } },
};

export const NoResponsiveBehavior: Story = {
    args: { data: { table, responsiveBehavior: "none" } },
};
