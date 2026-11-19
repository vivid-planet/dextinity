import { MailTwoListSizesTipTapRichTextBlock } from "@src/mail/blocks/MailTwoListSizesTipTapRichTextBlock";
import { createTipTapBulletList, createTipTapParagraph, createTipTapRichText, loremIpsum } from "@src/storybook/blockFixtures";
import { MailRendererDecorator } from "@src/storybook/MailRendererDecorator";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof MailTwoListSizesTipTapRichTextBlock> = {
    title: "Blocks/Mail/MailTwoListSizesTipTapRichTextBlock",
    component: MailTwoListSizesTipTapRichTextBlock,
    decorators: [MailRendererDecorator],
    args: {
        data: createTipTapRichText(
            createTipTapParagraph(loremIpsum),
            createTipTapBulletList(["List item", "Another list item"]),
            createTipTapParagraph(loremIpsum, "small"),
            createTipTapBulletList(["Small list item", "Another small list item"], "small"),
        ),
    },
};

export default meta;
type Story = StoryObj<typeof MailTwoListSizesTipTapRichTextBlock>;

export const Default: Story = {};
