import type { ContentGroupBlockData } from "@src/blocks.generated";
import { ContentGroupBlock } from "@src/documents/pages/blocks/ContentGroupBlock";
import { createBlocksItems, createCallToActionList, createHeading, createListItems, createRichText, loremIpsum } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { createKeyFactsItem } from "./pageBlockFixtures";

function createContentGroup(backgroundColor: ContentGroupBlockData["backgroundColor"]): ContentGroupBlockData {
    return {
        backgroundColor,
        content: {
            blocks: createBlocksItems([
                { type: "heading", props: { heading: createHeading({ headline: "Content group" }), textAlignment: "left" } },
                { type: "richtext", props: { richText: createRichText(loremIpsum, loremIpsum), textAlignment: "left" } },
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
                {
                    type: "callToActionList",
                    props: { callToActionList: createCallToActionList({ text: "Get in touch", variant: "contained" }), alignment: "left" },
                },
            ]),
        },
    };
}

const meta: Meta<typeof ContentGroupBlock> = {
    title: "Blocks/Pages/ContentGroupBlock",
    component: ContentGroupBlock,
    parameters: { layout: "fullscreen" },
    args: {
        data: createContentGroup("default"),
    },
};

export default meta;
type Story = StoryObj<typeof ContentGroupBlock>;

export const DefaultBackground: Story = {};

export const LightGrayBackground: Story = {
    args: { data: createContentGroup("lightGray") },
};

export const DarkGrayBackground: Story = {
    args: { data: createContentGroup("darkGray") },
};
