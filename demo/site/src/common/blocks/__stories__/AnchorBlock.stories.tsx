import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect } from "storybook/test";

import { AnchorBlock } from "../AnchorBlock";

const meta: Meta<typeof AnchorBlock> = {
    title: "Blocks/Common/AnchorBlock",
    component: AnchorBlock,
    parameters: {
        docs: {
            description: {
                component: "Renders an invisible element with the anchor's name as `id`, so links can jump to it.",
            },
        },
    },
    args: {
        data: { name: "contact" },
    },
};

export default meta;
type Story = StoryObj<typeof AnchorBlock>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        await expect(canvasElement.querySelector("#contact")).toBeInTheDocument();
    },
};
