import { StandaloneMediaBlock } from "@src/common/blocks/StandaloneMediaBlock";
import { createImageMedia, createYouTubeMedia } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof StandaloneMediaBlock> = {
    title: "Blocks/Common/StandaloneMediaBlock",
    component: StandaloneMediaBlock,
    args: {
        data: { media: createImageMedia(), aspectRatio: "16x9" },
    },
};

export default meta;
type Story = StoryObj<typeof StandaloneMediaBlock>;

export const Image: Story = {};

export const SquareImage: Story = {
    args: { data: { media: createImageMedia(), aspectRatio: "1x1" } },
};

export const YouTubeVideo: Story = {
    args: { data: { media: createYouTubeMedia(), aspectRatio: "16x9" } },
};
