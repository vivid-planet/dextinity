import { RichTextBlock } from "@src/common/blocks/RichTextBlock";
import { createExternalLink, createRichText, emptyRichText, loremIpsum } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof RichTextBlock> = {
    title: "Blocks/Common/RichTextBlock",
    component: RichTextBlock,
    args: {
        data: createRichText(
            { text: "Rich text", type: "header-two" },
            loremIpsum,
            {
                text: "Bold, italic and struck through text.",
                inlineStyleRanges: [
                    { offset: 0, length: 4, style: "BOLD" },
                    { offset: 6, length: 6, style: "ITALIC" },
                    { offset: 17, length: 14, style: "STRIKETHROUGH" },
                ],
            },
            { text: "A paragraph with a link to dextinity.com.", link: { offset: 27, length: 13, data: createExternalLink() } },
            { text: "A small paragraph.", type: "paragraph-small" },
            { text: "Unordered list item", type: "unordered-list-item" },
            { text: "Another unordered list item", type: "unordered-list-item" },
            { text: "Ordered list item", type: "ordered-list-item" },
            { text: "Nested ordered list item", type: "ordered-list-item", depth: 1 },
            { text: "Another ordered list item", type: "ordered-list-item" },
        ),
    },
};

export default meta;
type Story = StoryObj<typeof RichTextBlock>;

export const Default: Story = {};

export const Headings: Story = {
    args: {
        data: createRichText(
            { text: "Header one", type: "header-one" },
            { text: "Header two", type: "header-two" },
            { text: "Header three", type: "header-three" },
            { text: "Header four", type: "header-four" },
            { text: "Header five", type: "header-five" },
            { text: "Header six", type: "header-six" },
        ),
    },
};

export const WithoutLastBottomSpacing: Story = {
    args: { data: createRichText(loremIpsum, loremIpsum), disableLastBottomSpacing: true },
};

export const Empty: Story = {
    args: { data: emptyRichText },
};
