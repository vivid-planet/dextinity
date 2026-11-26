import { NewsLinkBlock } from "@src/news/blocks/NewsLinkBlock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

const meta: Meta<typeof NewsLinkBlock> = {
    title: "Blocks/News/NewsLinkBlock",
    component: NewsLinkBlock,
    args: {
        data: { id: "news-1", news: { id: "news-1", slug: "dextinity-10-released", scope: { domain: "main", language: "en" } } },
        children: "Link to a news",
    },
};

export default meta;
type Story = StoryObj<typeof NewsLinkBlock>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("link", { name: "Link to a news" })).toHaveAttribute("href", "/en/news/dextinity-10-released");
    },
};

export const WithoutNews: Story = {
    args: { data: {} },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).queryByRole("link")).not.toBeInTheDocument();
    },
};
