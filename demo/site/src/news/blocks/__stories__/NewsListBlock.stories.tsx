import { NewsListBlock } from "@src/news/blocks/NewsListBlock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

const scope = { domain: "main", language: "en" };

const meta: Meta<typeof NewsListBlock> = {
    title: "Blocks/News/NewsListBlock",
    component: NewsListBlock,
    parameters: {
        docs: {
            description: {
                component: "The block loader loads the selected news on the server. Stories pass the loaded news as `data.loaded`.",
            },
        },
    },
    args: {
        data: {
            ids: ["news-1", "news-2", "news-3"],
            loaded: [
                { id: "news-1", title: "Dextinity 10 released", slug: "dextinity-10-released", scope },
                { id: "news-2", title: "New blocks for the demo", slug: "new-blocks-for-the-demo", scope },
                { id: "news-3", title: "Storybook for the site", slug: "storybook-for-the-site", scope },
            ],
        },
    },
};

export default meta;
type Story = StoryObj<typeof NewsListBlock>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("link", { name: "Dextinity 10 released" })).toHaveAttribute(
            "href",
            "/en/news/dextinity-10-released",
        );
    },
};

export const Empty: Story = {
    args: { data: { ids: [], loaded: [] } },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).queryByRole("list")).not.toBeInTheDocument();
    },
};
