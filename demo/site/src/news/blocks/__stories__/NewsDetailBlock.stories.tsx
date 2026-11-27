import { NewsDetailBlock } from "@src/news/blocks/NewsDetailBlock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof NewsDetailBlock> = {
    title: "Blocks/News/NewsDetailBlock",
    component: NewsDetailBlock,
    parameters: {
        docs: {
            description: {
                component: "The block loader loads the selected news on the server. Stories pass the loaded news as `data.loaded`.",
            },
        },
    },
    args: {
        data: { id: "news-1", loaded: { title: "Dextinity 10 released" } },
    },
};

export default meta;
type Story = StoryObj<typeof NewsDetailBlock>;

export const Default: Story = {};
