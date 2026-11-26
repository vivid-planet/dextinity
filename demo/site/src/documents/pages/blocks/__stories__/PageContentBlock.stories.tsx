import type { PageContentBlockData } from "@src/blocks.generated";
import { PageContentBlock } from "@src/documents/pages/blocks/PageContentBlock";
import {
    createBlocksItems,
    createCallToActionList,
    createDamImage,
    createHeading,
    createImageMedia,
    createListItems,
    createRichText,
    createSpace,
    loremIpsum,
} from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { createKeyFactsItem, createTeaserItem } from "./pageBlockFixtures";

const meta: Meta<typeof PageContentBlock> = {
    title: "Blocks/Pages/PageContentBlock",
    component: PageContentBlock,
    parameters: {
        layout: "fullscreen",
        docs: {
            description: {
                component: "The content of a page, composed of the blocks an editor can add to it.",
            },
        },
    },
    args: {
        data: {
            blocks: createBlocksItems<PageContentBlockData["blocks"][number]["props"]>([
                { type: "heading", props: { heading: createHeading({ headline: "Page headline", htmlTag: "h1" }), textAlignment: "left" } },
                { type: "richtext", props: { richText: createRichText(loremIpsum, loremIpsum), textAlignment: "left" } },
                { type: "space", props: createSpace("d200") },
                {
                    type: "teaser",
                    props: {
                        blocks: createListItems([
                            createTeaserItem("First teaser", "page-teaser-1"),
                            createTeaserItem("Second teaser", "page-teaser-2"),
                            createTeaserItem("Third teaser", "page-teaser-3"),
                        ]),
                    },
                },
                { type: "space", props: createSpace("d200") },
                {
                    type: "billboardTeaser",
                    props: {
                        media: createImageMedia({ seed: "page-billboard" }),
                        heading: createHeading({ headline: "Billboard teaser" }),
                        text: createRichText(loremIpsum),
                        overlay: 50,
                        callToActionList: createCallToActionList({ text: "Discover more", variant: "contained" }),
                    },
                },
                { type: "space", props: createSpace("d200") },
                {
                    type: "keyFacts",
                    props: {
                        blocks: createListItems([
                            createKeyFactsItem({ fact: "250+", label: "Projects" }),
                            createKeyFactsItem({ fact: "20", label: "Years of experience" }),
                            createKeyFactsItem({ fact: "99%", label: "Uptime" }),
                        ]),
                    },
                },
                { type: "space", props: createSpace("d200") },
                {
                    type: "textImage",
                    props: {
                        text: createRichText({ text: "Text and image", type: "header-three" }, loremIpsum),
                        image: createDamImage({ seed: "page-text-image" }),
                        imagePosition: "right",
                        imageAspectRatio: "16x9",
                    },
                },
                { type: "space", props: createSpace("d200") },
                {
                    type: "fullWidthImage",
                    props: { image: createDamImage({ seed: "page-full-width" }), content: { visible: false } },
                },
            ]),
        },
    },
};

export default meta;
type Story = StoryObj<typeof PageContentBlock>;

export const Default: Story = {};
