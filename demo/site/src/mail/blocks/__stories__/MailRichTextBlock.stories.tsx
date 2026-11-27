import { MailRichTextBlock } from "@src/mail/blocks/MailRichTextBlock";
import { createTipTapBulletList, createTipTapParagraph, createTipTapRichText, loremIpsum } from "@src/storybook/blockFixtures";
import { MailRendererDecorator } from "@src/storybook/MailRendererDecorator";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof MailRichTextBlock> = {
    title: "Blocks/Mail/MailRichTextBlock",
    component: MailRichTextBlock,
    decorators: [MailRendererDecorator],
    args: {
        data: createTipTapRichText(
            createTipTapParagraph("Title", "title"),
            createTipTapParagraph("Header", "header"),
            createTipTapParagraph(loremIpsum),
            createTipTapBulletList(["List item", "Another list item"]),
            createTipTapParagraph(loremIpsum, "small"),
            createTipTapBulletList(["Small list item", "Another small list item"], "small"),
        ),
    },
};

export default meta;
type Story = StoryObj<typeof MailRichTextBlock>;

export const Default: Story = {};
