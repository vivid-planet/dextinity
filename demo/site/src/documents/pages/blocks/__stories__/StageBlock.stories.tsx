import { StageBlock } from "@src/documents/pages/blocks/StageBlock";
import { createListItems } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { createBasicStage } from "./pageBlockFixtures";

const meta: Meta<typeof StageBlock> = {
    title: "Blocks/Pages/StageBlock",
    component: StageBlock,
    parameters: { layout: "fullscreen" },
    args: {
        data: { blocks: createListItems([createBasicStage()]) },
    },
};

export default meta;
type Story = StoryObj<typeof StageBlock>;

export const Default: Story = {};
