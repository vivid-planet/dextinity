import { MailTwoListSizesRichTextBlock } from "@src/mail/blocks/MailTwoListSizesRichTextBlock";
import { createRichText, loremIpsum } from "@src/storybook/blockFixtures";
import { MailRendererDecorator } from "@src/storybook/MailRendererDecorator";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof MailTwoListSizesRichTextBlock> = {
    title: "Blocks/Mail/MailTwoListSizesRichTextBlock",
    component: MailTwoListSizesRichTextBlock,
    decorators: [MailRendererDecorator],
    args: {
        data: createRichText(
            { text: loremIpsum, type: "copy" },
            { text: "List item", type: "unordered-list-item" },
            { text: "Another list item", type: "unordered-list-item" },
            { text: loremIpsum, type: "copy-small" },
            { text: "Small list item", type: "unordered-list-item-small" },
            { text: "Another small list item", type: "unordered-list-item-small" },
            { text: "Small ordered list item", type: "ordered-list-item-small" },
            { text: "Another small ordered list item", type: "ordered-list-item-small" },
        ),
    },
};

export default meta;
type Story = StoryObj<typeof MailTwoListSizesRichTextBlock>;

export const Default: Story = {};
