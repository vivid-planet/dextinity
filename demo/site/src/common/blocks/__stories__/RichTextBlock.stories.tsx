import { PageContentRichTextBlock, RichTextBlock } from "@src/common/blocks/RichTextBlock";
import {
    createBulletList,
    createExternalLink,
    createOrderedList,
    createParagraph,
    createRichText,
    createRichTextHeading,
    emptyRichText,
    loremIpsum,
} from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof RichTextBlock> = {
    title: "Blocks/Common/RichTextBlock",
    component: RichTextBlock,
    args: {
        data: createRichText(
            createRichTextHeading("Rich text", 2),
            loremIpsum,
            {
                type: "textBlock",
                attrs: { textBlock: "paragraph" },
                content: [
                    { type: "text", text: "Bold", marks: [{ type: "bold" }] },
                    { type: "text", text: ", " },
                    { type: "text", text: "italic", marks: [{ type: "italic" }] },
                    { type: "text", text: " and " },
                    { type: "text", text: "struck through", marks: [{ type: "strike" }] },
                    { type: "text", text: " text." },
                ],
            },
            {
                type: "textBlock",
                attrs: { textBlock: "paragraph" },
                content: [
                    { type: "text", text: "A paragraph with a link to " },
                    { type: "text", text: "dextinity.com", marks: [{ type: "link", attrs: { data: createExternalLink() } }] },
                    { type: "text", text: "." },
                ],
            },
            createParagraph("A small paragraph.", "paragraph200"),
            createBulletList("Unordered list item", "Another unordered list item"),
            createOrderedList("Ordered list item", "Another ordered list item"),
        ),
    },
};

export default meta;
type Story = StoryObj<typeof RichTextBlock>;

export const Default: Story = {};

export const Headings: Story = {
    args: {
        data: createRichText(
            { type: "textBlock", attrs: { textBlock: "display" }, content: [{ type: "text", text: "Display" }] },
            createRichTextHeading("Heading 1", 1),
            createRichTextHeading("Heading 2", 2),
            createRichTextHeading("Heading 3", 3),
            createRichTextHeading("Heading 4", 4),
            createRichTextHeading("Heading 5", 5),
        ),
    },
};

export const TextAlignment: Story = {
    args: {
        data: createRichText(
            ...(["left", "center", "right", "justify"] as const).map((textAlign) => ({
                type: "textBlock",
                attrs: { textBlock: "paragraph", textAlign },
                content: [{ type: "text", text: `${textAlign}: ${loremIpsum}` }],
            })),
        ),
    },
};

export const WithProductPrice: Story = {
    args: {
        data: createRichText({
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

export const WithoutLastBottomSpacing: Story = {
    args: { data: createRichText(loremIpsum, loremIpsum), disableLastBottomSpacing: true },
};

export const Empty: Story = {
    args: { data: emptyRichText },
};

export const InPageContent: Story = {
    render: (args) => <PageContentRichTextBlock {...args} />,
};
