import type { ColumnsContentBlockData } from "@src/blocks.generated";
import { ColumnsBlock } from "@src/documents/pages/blocks/ColumnsBlock";
import { createBlocksItems, createHeading, createImageMedia, createListItems, createRichText, loremIpsum } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

function createColumn(headline: string, seed: string): ColumnsContentBlockData {
    return {
        blocks: createBlocksItems([
            { type: "heading", props: { heading: createHeading({ headline }), textAlignment: "left" } },
            { type: "richtext", props: { richText: createRichText(loremIpsum, loremIpsum), textAlignment: "left" } },
            { type: "media", props: { media: createImageMedia({ seed }), aspectRatio: "16x9" } },
        ]),
    };
}

const twoColumns = createListItems([createColumn("First column", "columns-1"), createColumn("Second column", "columns-2")], "column");
const oneColumn = createListItems([createColumn("Single column", "columns-1")], "column");

const meta: Meta<typeof ColumnsBlock> = {
    title: "Blocks/Pages/ColumnsBlock",
    component: ColumnsBlock,
    args: {
        data: { layout: "9-9", columns: twoColumns },
    },
};

export default meta;
type Story = StoryObj<typeof ColumnsBlock>;

export const Layout9To9: Story = {};

export const Layout12To6: Story = {
    args: { data: { layout: "12-6", columns: twoColumns } },
};

export const Layout6To12: Story = {
    args: { data: { layout: "6-12", columns: twoColumns } },
};

export const OneColumn4To16To4: Story = {
    args: { data: { layout: "4-16-4", columns: oneColumn } },
};

export const OneColumn6To12To6: Story = {
    args: { data: { layout: "6-12-6", columns: oneColumn } },
};
