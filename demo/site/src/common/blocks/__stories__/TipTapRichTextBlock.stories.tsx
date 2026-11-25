import { PageContentTipTapRichTextBlock, TipTapRichTextBlock } from "@src/common/blocks/TipTapRichTextBlock";
import {
    createExternalLink,
    createTipTapBulletList,
    createTipTapHeading,
    createTipTapParagraph,
    createTipTapRichText,
    loremIpsum,
} from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof TipTapRichTextBlock> = {
    title: "Blocks/Common/TipTapRichTextBlock",
    component: TipTapRichTextBlock,
    args: {
        data: createTipTapRichText(
            createTipTapHeading("TipTap rich text", 2),
            createTipTapParagraph(loremIpsum),
            {
                type: "textBlock",
                attrs: { textBlock: "paragraph" },
                content: [
                    { type: "text", text: "A paragraph with " },
                    { type: "text", text: "bold", marks: [{ type: "bold" }] },
                    { type: "text", text: ", " },
                    { type: "text", text: "italic", marks: [{ type: "italic" }] },
                    { type: "text", text: " text and a " },
                    { type: "text", text: "link", marks: [{ type: "link", attrs: { data: createExternalLink() } }] },
                    { type: "text", text: "." },
                ],
            },
            createTipTapParagraph("A small paragraph.", "paragraph200"),
            createTipTapBulletList("List item", "Another list item"),
        ),
    },
};

export default meta;
type Story = StoryObj<typeof TipTapRichTextBlock>;

export const Default: Story = {};

export const Headings: Story = {
    args: {
        data: createTipTapRichText(
            { type: "textBlock", attrs: { textBlock: "display" }, content: [{ type: "text", text: "Display" }] },
            createTipTapHeading("Heading 1", 1),
            createTipTapHeading("Heading 2", 2),
            createTipTapHeading("Heading 3", 3),
            createTipTapHeading("Heading 4", 4),
            createTipTapHeading("Heading 5", 5),
        ),
    },
};

export const WithProductPrice: Story = {
    args: {
        data: createTipTapRichText({
            type: "textBlock",
            attrs: { textBlock: "paragraph" },
            content: [
                { type: "text", text: "Product A costs " },
                {
                    type: "cmsInlineBlock",
                    attrs: { blockType: "productPrice", data: { product: { id: "product-a", title: "Product A", price: 19.99 } } },
                },
                { type: "text", text: "." },
            ],
        }),
    },
};

export const InPageContent: Story = {
    render: (args) => <PageContentTipTapRichTextBlock {...args} />,
};
