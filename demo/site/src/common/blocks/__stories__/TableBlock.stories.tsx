import type { TableBlockData } from "@src/blocks.generated";
import { TableBlock } from "@src/common/blocks/TableBlock";
import { createRichText } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

type TableCell = TableBlockData["table"]["rows"][number]["cellValues"][number]["value"];
type CellBlock = NonNullable<TableCell["block"]>;

const createCell = (block: CellBlock): TableCell => ({ attachedBlocks: [block], activeType: block.type, block });
const createTextCell = (text: string) => createCell({ type: "text", props: { text: createRichText(text), badges: [] } });
const createPriceCell = (amount: number) => createCell({ type: "price", props: { amount, bold: false, badges: [] } });

const columnIds = ["product", "price", "availability"];

const table: TableBlockData["table"] = {
    columns: columnIds.map((id) => ({ id, settings: { size: "standard", highlighted: id === "price" } })),
    rows: [
        [createTextCell("Product"), createTextCell("Price"), createTextCell("Availability")],
        [createTextCell("Product A"), createPriceCell(19.99), createTextCell("In stock")],
        [createTextCell("Product B"), createPriceCell(29.99), createTextCell("Sold out")],
        [createTextCell("Product C"), createPriceCell(39.99), createTextCell("In stock")],
    ].map((cells, rowIndex) => ({
        id: `row${rowIndex}`,
        settings: { highlighted: rowIndex === 0 },
        cellValues: cells.map((value, columnIndex) => ({ columnId: columnIds[columnIndex], value })),
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
