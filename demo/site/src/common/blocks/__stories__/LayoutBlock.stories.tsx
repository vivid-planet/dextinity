import type { LayoutBlockData } from "@src/blocks.generated";
import { LayoutBlock } from "@src/common/blocks/LayoutBlock";
import { createImageMedia, createRichText, loremIpsum } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

function createLayout(layout: LayoutBlockData["layout"]): LayoutBlockData {
    return {
        layout,
        media1: createImageMedia({ seed: "layout-1" }),
        text1: createRichText({ text: "First text", type: "header-three" }, loremIpsum),
        media2: createImageMedia({ seed: "layout-2" }),
        text2: createRichText({ text: "Second text", type: "header-three" }, loremIpsum),
    };
}

const meta: Meta<typeof LayoutBlock> = {
    title: "Blocks/Common/LayoutBlock",
    component: LayoutBlock,
    args: {
        data: createLayout("layout1"),
    },
};

export default meta;
type Story = StoryObj<typeof LayoutBlock>;

export const Layout1: Story = {};

export const Layout2: Story = {
    args: { data: createLayout("layout2") },
};

export const Layout3: Story = {
    args: { data: createLayout("layout3") },
};

export const Layout4: Story = {
    args: { data: createLayout("layout4") },
};

export const Layout5: Story = {
    args: { data: createLayout("layout5") },
};

export const Layout6: Story = {
    args: { data: createLayout("layout6") },
};

export const Layout7: Story = {
    args: { data: createLayout("layout7") },
};
