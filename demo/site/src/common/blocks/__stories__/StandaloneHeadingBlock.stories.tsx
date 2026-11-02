import { PageContentStandaloneHeadingBlock, StandaloneHeadingBlock } from "@src/common/blocks/StandaloneHeadingBlock";
import { createHeading } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const heading = createHeading({ eyebrow: "Eyebrow", headline: "Standalone heading" });

const meta: Meta<typeof StandaloneHeadingBlock> = {
    title: "Blocks/Common/StandaloneHeadingBlock",
    component: StandaloneHeadingBlock,
    args: {
        data: { heading, textAlignment: "left" },
    },
};

export default meta;
type Story = StoryObj<typeof StandaloneHeadingBlock>;

export const AlignedLeft: Story = {};

export const AlignedCenter: Story = {
    args: { data: { heading, textAlignment: "center" } },
};

export const InPageContent: Story = {
    render: (args) => <PageContentStandaloneHeadingBlock {...args} />,
};
