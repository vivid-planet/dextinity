import type { LinkBlockData } from "@src/blocks.generated";
import { createExternalLink, createInternalLink } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { LinkBlock } from "../LinkBlock";

function createLink(type: string, props: LinkBlockData["attachedBlocks"][number]["props"]): LinkBlockData {
    return { attachedBlocks: [{ type, props }], activeType: type, block: { type, props } };
}

const meta: Meta<typeof LinkBlock> = {
    title: "Blocks/Common/LinkBlock",
    component: LinkBlock,
    parameters: {
        docs: {
            description: {
                component: "Renders the link type selected in the admin: internal, external, news, file download, email or phone.",
            },
        },
    },
    args: {
        children: "Link",
    },
};

export default meta;
type Story = StoryObj<typeof LinkBlock>;

export const Internal: Story = {
    args: { data: createInternalLink("/about-us") },
};

export const External: Story = {
    args: { data: createExternalLink("https://www.dextinity.com") },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("link", { name: "Link" })).toHaveAttribute("href", "https://www.dextinity.com");
    },
};

export const News: Story = {
    args: {
        data: createLink("news", { id: "news-1", news: { id: "news-1", slug: "dextinity-released", scope: { domain: "main", language: "en" } } }),
    },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("link", { name: "Link" })).toHaveAttribute("href", "/en/news/dextinity-released");
    },
};

export const FileDownload: Story = {
    args: {
        data: createLink("damFileDownload", {
            openFileType: "Download",
            file: { id: "brochure", name: "brochure.pdf", fileUrl: "/brochure.pdf", size: 1250000, mimetype: "application/pdf" },
        }),
    },
};

export const Email: Story = {
    args: { data: createLink("email", { email: "hello@example.com" }) },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("link", { name: "Link" })).toHaveAttribute("href", "mailto:hello@example.com");
    },
};

export const Phone: Story = {
    args: { data: createLink("phone", { phone: "+43123456789" }) },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("link", { name: "Link" })).toHaveAttribute("href", "tel:+43123456789");
    },
};
