import { BasicStageBlock } from "@src/documents/pages/blocks/BasicStageBlock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { createBasicStage } from "./pageBlockFixtures";

const meta: Meta<typeof BasicStageBlock> = {
    title: "Blocks/Pages/BasicStageBlock",
    component: BasicStageBlock,
    parameters: { layout: "fullscreen" },
    args: {
        data: createBasicStage(),
    },
};

export default meta;
type Story = StoryObj<typeof BasicStageBlock>;

export const AlignedLeft: Story = {};

export const AlignedCenter: Story = {
    args: { data: createBasicStage({ alignment: "center" }) },
};

export const WithoutOverlay: Story = {
    args: { data: createBasicStage({ overlay: 0 }) },
};
