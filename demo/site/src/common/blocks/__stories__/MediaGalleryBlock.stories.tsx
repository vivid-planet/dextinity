import { createImageMedia, createListItems } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { MediaGalleryBlock, PageContentMediaGalleryBlock } from "../MediaGalleryBlock";

const meta: Meta<typeof MediaGalleryBlock> = {
    title: "Blocks/Common/MediaGalleryBlock",
    component: MediaGalleryBlock,
    args: {
        data: {
            aspectRatio: "16x9",
            items: {
                blocks: createListItems([
                    { media: createImageMedia({ seed: "gallery-1" }), caption: "First image" },
                    { media: createImageMedia({ seed: "gallery-2" }), caption: "Second image" },
                    { media: createImageMedia({ seed: "gallery-3" }), caption: "Third image" },
                ]),
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof MediaGalleryBlock>;

export const Default: Story = {};

export const InPageContent: Story = {
    render: (args) => <PageContentMediaGalleryBlock {...args} />,
};

export const Navigation: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.getByText("1 of 3")).toBeInTheDocument();
        await userEvent.click(canvas.getByRole("button", { name: "Next slide" }));
        await expect(await canvas.findByText("2 of 3")).toBeInTheDocument();
    },
};
