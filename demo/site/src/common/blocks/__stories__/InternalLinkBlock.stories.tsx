import { InternalLinkBlock } from "@src/common/blocks/InternalLinkBlock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

const targetPage = { id: "about-us", name: "About us", path: "/about-us", scope: { domain: "main", language: "en" }, documentType: "Page" };

const meta: Meta<typeof InternalLinkBlock> = {
    title: "Blocks/Common/InternalLinkBlock",
    component: InternalLinkBlock,
    args: {
        data: { targetPage },
        children: "Link to a page",
    },
};

export default meta;
type Story = StoryObj<typeof InternalLinkBlock>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("link", { name: "Link to a page" })).toHaveAttribute("href", "/en/about-us");
    },
};

export const WithAnchor: Story = {
    args: { data: { targetPage, targetPageAnchor: "contact" } },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("link", { name: "Link to a page" })).toHaveAttribute("href", "/en/about-us#contact");
    },
};

export const WithoutTargetPage: Story = {
    args: { data: {} },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).queryByRole("link")).not.toBeInTheDocument();
    },
};
