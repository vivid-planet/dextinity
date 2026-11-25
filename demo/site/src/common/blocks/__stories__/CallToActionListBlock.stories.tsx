import { CallToActionListBlock } from "@src/common/blocks/CallToActionListBlock";
import { createCallToActionList } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof CallToActionListBlock> = {
    title: "Blocks/Common/CallToActionListBlock",
    component: CallToActionListBlock,
    args: {
        data: createCallToActionList(
            { text: "Primary action", variant: "contained" },
            { text: "Secondary action", variant: "outlined" },
            { text: "Tertiary action", variant: "text" },
        ),
    },
};

export default meta;
type Story = StoryObj<typeof CallToActionListBlock>;

export const Default: Story = {};
