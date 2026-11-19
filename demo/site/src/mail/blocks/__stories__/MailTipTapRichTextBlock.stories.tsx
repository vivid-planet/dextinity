import { MailTipTapRichTextBlock } from "@src/mail/blocks/MailTipTapRichTextBlock";
import { createTipTapBulletList, createTipTapParagraph, createTipTapRichText, loremIpsum } from "@src/storybook/blockFixtures";
import { MailRendererDecorator } from "@src/storybook/MailRendererDecorator";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof MailTipTapRichTextBlock> = {
    title: "Blocks/Mail/MailTipTapRichTextBlock",
    component: MailTipTapRichTextBlock,
    decorators: [MailRendererDecorator],
    args: {
        data: createTipTapRichText(
            createTipTapParagraph("Title", "title"),
            createTipTapParagraph("Header", "header"),
            createTipTapParagraph(loremIpsum),
            createTipTapParagraph("Small text", "small"),
            createTipTapBulletList(["List item", "Another list item"]),
        ),
    },
};

export default meta;
type Story = StoryObj<typeof MailTipTapRichTextBlock>;

export const Default: Story = {};
