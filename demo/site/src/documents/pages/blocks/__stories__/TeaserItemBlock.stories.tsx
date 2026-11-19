import { TeaserItemBlock } from "@src/documents/pages/blocks/TeaserItemBlock";
import { createTextLink, emptyLink } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { createTeaserItem } from "./pageBlockFixtures";

const meta: Meta<typeof TeaserItemBlock> = {
    title: "Blocks/Pages/TeaserItemBlock",
    component: TeaserItemBlock,
    decorators: [
        (Story) => (
            <div style={{ maxWidth: 400 }}>
                <Story />
            </div>
        ),
    ],
    args: {
        data: createTeaserItem("Teaser title", "teaser-item"),
    },
};

export default meta;
type Story = StoryObj<typeof TeaserItemBlock>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("link")).toHaveAttribute("href", "/en/about-us");
    },
};

export const WithoutLink: Story = {
    args: { data: { ...createTeaserItem("Teaser without link", "teaser-item"), link: createTextLink("Read more", emptyLink) } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.queryByRole("link")).not.toBeInTheDocument();
        await expect(canvas.queryByText("Read more")).not.toBeInTheDocument();
    },
};
