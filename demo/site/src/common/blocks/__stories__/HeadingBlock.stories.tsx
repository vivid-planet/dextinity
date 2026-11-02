import { createHeading, createRichText } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { HeadingBlock } from "../HeadingBlock";

const meta: Meta<typeof HeadingBlock> = {
    title: "Blocks/Common/HeadingBlock",
    component: HeadingBlock,
    args: {
        data: createHeading({ eyebrow: "Eyebrow", headline: "Headline" }),
    },
};

export default meta;
type Story = StoryObj<typeof HeadingBlock>;

export const Default: Story = {};

export const WithoutEyebrow: Story = {
    args: { data: createHeading({ headline: "Headline without eyebrow" }) },
};

export const HtmlTag: Story = {
    args: { data: createHeading({ headline: "Rendered as h1", htmlTag: "h1" }) },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("heading", { level: 1, name: "Rendered as h1" })).toBeInTheDocument();
    },
};

export const AllHeadlineStyles: Story = {
    args: {
        data: {
            ...createHeading({ headline: "" }),
            headline: createRichText(
                { text: "Header one", type: "header-one" },
                { text: "Header two", type: "header-two" },
                { text: "Header three", type: "header-three" },
                { text: "Header four", type: "header-four" },
                { text: "Header five", type: "header-five" },
                { text: "Header six", type: "header-six" },
            ),
        },
    },
};
