import { FullWidthImageBlock } from "@src/documents/pages/blocks/FullWidthImageBlock";
import { createDamImage, createRichText, loremIpsum } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof FullWidthImageBlock> = {
    title: "Blocks/Pages/FullWidthImageBlock",
    component: FullWidthImageBlock,
    parameters: { layout: "fullscreen" },
    args: {
        data: {
            image: createDamImage({ seed: "full-width" }),
            content: { visible: true, block: createRichText({ text: "Text on the image", type: "header-three" }, loremIpsum) },
        },
    },
};

export default meta;
type Story = StoryObj<typeof FullWidthImageBlock>;

export const WithContent: Story = {};

export const WithoutContent: Story = {
    args: { data: { image: createDamImage({ seed: "full-width" }), content: { visible: false } } },
};
