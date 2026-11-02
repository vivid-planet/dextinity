import type { TableBlockData } from "@src/blocks.generated";
import { TableBlock } from "@src/common/blocks/TableBlock";
import { createRichText } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const columnIds = ["product", "price", "availability"];

const table: TableBlockData["table"] = {
    columns: columnIds.map((id) => ({ id, size: "standard", highlighted: id === "price" })),
    rows: [
        ["Product", "Price", "Availability"],
        ["Product A", "€ 19.99", "In stock"],
        ["Product B", "€ 29.99", "Sold out"],
        ["Product C", "€ 39.99", "In stock"],
    ].map((cells, rowIndex) => ({
        id: `row${rowIndex}`,
        highlighted: rowIndex === 0,
        cellValues: cells.map((text, columnIndex) => ({ columnId: columnIds[columnIndex], value: createRichText(text) })),
    })),
};

const meta: Meta<typeof TableBlock> = {
    title: "Blocks/Common/TableBlock",
    component: TableBlock,
    args: {
        data: { table, responsiveBehavior: "scrollSideways" },
    },
};

export default meta;
type Story = StoryObj<typeof TableBlock>;

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
