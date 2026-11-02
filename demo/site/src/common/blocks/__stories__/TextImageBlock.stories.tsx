import { createDamImage, createRichText, loremIpsum } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PageContentTextImageBlock, TextImageBlock } from "../TextImageBlock";

const text = createRichText({ text: "Text and image", type: "header-three" }, loremIpsum, loremIpsum);

const meta: Meta<typeof TextImageBlock> = {
    title: "Blocks/Common/TextImageBlock",
    component: TextImageBlock,
    args: {
        data: { text, image: createDamImage(), imagePosition: "right", imageAspectRatio: "16x9" },
    },
};

export default meta;
type Story = StoryObj<typeof TextImageBlock>;

export const ImageRight: Story = {};

export const ImageLeft: Story = {
    args: { data: { text, image: createDamImage(), imagePosition: "left", imageAspectRatio: "16x9" } },
};

export const SquareImage: Story = {
    args: { data: { text, image: createDamImage(), imagePosition: "right", imageAspectRatio: "1x1" } },
};

export const InPageContent: Story = {
    render: (args) => <PageContentTextImageBlock {...args} />,
};
