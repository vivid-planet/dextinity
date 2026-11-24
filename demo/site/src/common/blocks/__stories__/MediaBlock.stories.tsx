import { MediaBlock } from "@src/common/blocks/MediaBlock";
import { createImageMedia, createPixelImage, createYouTubeMedia, emptyMedia } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const vimeoProps = { vimeoIdentifier: "76979871", showControls: true, previewImage: createPixelImage({ seed: "vimeo" }) };

const meta: Meta<typeof MediaBlock> = {
    title: "Blocks/Common/MediaBlock",
    component: MediaBlock,
    args: {
        data: createImageMedia(),
        aspectRatio: "16x9",
    },
};

export default meta;
type Story = StoryObj<typeof MediaBlock>;

export const Image: Story = {};

export const YouTubeVideo: Story = {
    args: { data: createYouTubeMedia() },
};

export const VimeoVideo: Story = {
    args: {
        data: {
            attachedBlocks: [{ type: "vimeoVideo", props: vimeoProps }],
            activeType: "vimeoVideo",
            block: { type: "vimeoVideo", props: vimeoProps },
        },
    },
};

export const Empty: Story = {
    args: { data: emptyMedia },
};
