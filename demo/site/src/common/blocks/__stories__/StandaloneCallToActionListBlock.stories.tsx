import { createCallToActionList } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PageContentStandaloneCallToActionListBlock, StandaloneCallToActionListBlock } from "../StandaloneCallToActionListBlock";

const callToActionList = createCallToActionList({ text: "Primary action", variant: "contained" }, { text: "Secondary action", variant: "outlined" });

const meta: Meta<typeof StandaloneCallToActionListBlock> = {
    title: "Blocks/Common/StandaloneCallToActionListBlock",
    component: StandaloneCallToActionListBlock,
    args: {
        data: { callToActionList, alignment: "left" },
    },
};

export default meta;
type Story = StoryObj<typeof StandaloneCallToActionListBlock>;

export const AlignedLeft: Story = {};

export const AlignedCenter: Story = {
    args: { data: { callToActionList, alignment: "center" } },
};

export const AlignedRight: Story = {
    args: { data: { callToActionList, alignment: "right" } },
};

export const InPageContent: Story = {
    render: (args) => <PageContentStandaloneCallToActionListBlock {...args} />,
};
