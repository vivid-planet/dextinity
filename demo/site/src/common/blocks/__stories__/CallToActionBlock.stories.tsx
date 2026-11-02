import { createExternalLink, createInternalLink, createTextLink, emptyLink } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

import { CallToActionBlock } from "../CallToActionBlock";

const meta: Meta<typeof CallToActionBlock> = {
    title: "Blocks/Common/CallToActionBlock",
    component: CallToActionBlock,
    args: {
        data: { textLink: createTextLink("Call to action"), variant: "contained" },
    },
};

export default meta;
type Story = StoryObj<typeof CallToActionBlock>;

export const Contained: Story = {};

export const Outlined: Story = {
    args: { data: { textLink: createTextLink("Call to action"), variant: "outlined" } },
};

export const Text: Story = {
    args: { data: { textLink: createTextLink("Call to action"), variant: "text" } },
};

export const InternalLink: Story = {
    args: { data: { textLink: createTextLink("About us", createInternalLink("/about-us")), variant: "contained" } },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).getByRole("link", { name: "About us" })).toHaveAttribute("href", "/en/about-us");
    },
};

export const FileDownload: Story = {
    args: {
        data: {
            variant: "outlined",
            textLink: createTextLink("Download brochure", {
                attachedBlocks: [],
                activeType: "damFileDownload",
                block: {
                    type: "damFileDownload",
                    props: {
                        openFileType: "Download",
                        file: { id: "brochure", name: "brochure.pdf", fileUrl: "/brochure.pdf", size: 1250000, mimetype: "application/pdf" },
                    },
                },
            }),
        },
    },
};

export const HiddenWithoutLink: Story = {
    args: { data: { textLink: createTextLink("Invisible", emptyLink), variant: "contained" } },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).queryByText("Invisible")).not.toBeInTheDocument();
    },
};

export const ExternalLink: Story = {
    args: { data: { textLink: createTextLink("Visit dextinity.com", createExternalLink("https://www.dextinity.com")), variant: "contained" } },
};
