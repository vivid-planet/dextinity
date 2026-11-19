import { MailRichTextBlock } from "@src/mail/blocks/MailRichTextBlock";
import { createExternalLink, createRichText, loremIpsum } from "@src/storybook/blockFixtures";
import { MailRendererDecorator } from "@src/storybook/MailRendererDecorator";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof MailRichTextBlock> = {
    title: "Blocks/Mail/MailRichTextBlock",
    component: MailRichTextBlock,
    decorators: [MailRendererDecorator],
    args: {
        data: createRichText(
            { text: "Title", type: "title" },
            { text: "Header", type: "header" },
            { text: loremIpsum, type: "copy", inlineStyleRanges: [{ offset: 0, length: 11, style: "BOLD" }] },
            { text: "A paragraph with a link.", type: "copy", link: { offset: 17, length: 4, data: createExternalLink() } },
            { text: "List item", type: "unordered-list-item" },
            { text: "Another list item", type: "unordered-list-item" },
        ),
    },
};

export default meta;
type Story = StoryObj<typeof MailRichTextBlock>;

export const Default: Story = {};
