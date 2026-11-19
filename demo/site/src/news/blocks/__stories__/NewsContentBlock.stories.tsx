import type { NewsContentBlockData } from "@src/blocks.generated";
import { NewsContentBlock } from "@src/news/blocks/NewsContentBlock";
import { createBlocksItems, createDamImage, createHeading, createRichText, loremIpsum } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof NewsContentBlock> = {
    title: "Blocks/News/NewsContentBlock",
    component: NewsContentBlock,
    args: {
        data: {
            blocks: createBlocksItems<NewsContentBlockData["blocks"][number]["props"]>([
                { type: "heading", props: createHeading({ headline: "Dextinity 10 released", htmlTag: "h1" }) },
                { type: "richText", props: createRichText(loremIpsum, loremIpsum) },
                { type: "image", props: createDamImage({ seed: "news" }) },
                {
                    type: "textImage",
                    props: {
                        text: createRichText({ text: "What's new", type: "header-three" }, loremIpsum),
                        image: createDamImage({ seed: "news-text-image" }),
                        imagePosition: "left",
                        imageAspectRatio: "16x9",
                    },
                },
            ]),
        },
    },
};

export default meta;
type Story = StoryObj<typeof NewsContentBlock>;

export const Default: Story = {};
