import { PageContentStandaloneRichTextBlock, StandaloneRichTextBlock } from "@src/common/blocks/StandaloneRichTextBlock";
import { createRichText, loremIpsum } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const richText = createRichText({ text: "Standalone rich text", type: "header-three" }, loremIpsum);

const meta: Meta<typeof StandaloneRichTextBlock> = {
    title: "Blocks/Common/StandaloneRichTextBlock",
    component: StandaloneRichTextBlock,
    args: {
        data: { richText, textAlignment: "left" },
    },
};

export default meta;
type Story = StoryObj<typeof StandaloneRichTextBlock>;

export const AlignedLeft: Story = {};

export const AlignedCenter: Story = {
    args: { data: { richText, textAlignment: "center" } },
};

export const AlignedRight: Story = {
    args: { data: { richText, textAlignment: "right" } },
};

export const Justified: Story = {
    args: { data: { richText: createRichText(`${loremIpsum} ${loremIpsum}`), textAlignment: "justify" } },
};

export const InPageContent: Story = {
    render: (args) => <PageContentStandaloneRichTextBlock {...args} />,
};
