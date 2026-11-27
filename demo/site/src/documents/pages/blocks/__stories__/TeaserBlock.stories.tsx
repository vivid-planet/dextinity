import { TeaserBlock } from "@src/documents/pages/blocks/TeaserBlock";
import { createListItems } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { createTeaserItem } from "./pageBlockFixtures";

const meta: Meta<typeof TeaserBlock> = {
    title: "Blocks/Pages/TeaserBlock",
    component: TeaserBlock,
    args: {
        data: {
            blocks: createListItems([
                createTeaserItem("First teaser", "teaser-1"),
                createTeaserItem("Second teaser", "teaser-2"),
                createTeaserItem("Third teaser", "teaser-3"),
                createTeaserItem("Fourth teaser", "teaser-4"),
            ]),
        },
    },
};

export default meta;
type Story = StoryObj<typeof TeaserBlock>;

export const Default: Story = {};

export const TwoItems: Story = {
    args: {
        data: { blocks: createListItems([createTeaserItem("First teaser", "teaser-1"), createTeaserItem("Second teaser", "teaser-2")]) },
    },
};
