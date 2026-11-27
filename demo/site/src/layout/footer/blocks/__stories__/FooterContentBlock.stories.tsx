import { FooterContentBlock } from "@src/layout/footer/blocks/FooterContentBlock";
import {
    createBlocksItems,
    createInternalLink,
    createRichText,
    createSvgDamImage,
    createTextLink,
    emptyDamImage,
    loremIpsum,
} from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";

const meta: Meta<typeof FooterContentBlock> = {
    title: "Blocks/Layout/FooterContentBlock",
    component: FooterContentBlock,
    parameters: { layout: "fullscreen" },
    args: {
        data: {
            text: createRichText({ text: "Dextinity", type: "header-four" }, loremIpsum),
            image: createSvgDamImage(),
            caption: "Image caption",
            linkList: {
                blocks: createBlocksItems([
                    { type: "link", props: createTextLink("Imprint", createInternalLink("/imprint")) },
                    { type: "link", props: createTextLink("Privacy policy", createInternalLink("/privacy-policy")) },
                    { type: "link", props: createTextLink("Dextinity website") },
                ]),
            },
            copyrightNotice: "© Dextinity",
        },
    },
};

export default meta;
type Story = StoryObj<typeof FooterContentBlock>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const navigation = within(within(canvasElement).getByRole("navigation"));

        await expect(navigation.getByRole("link", { name: "Imprint" })).toHaveAttribute("href", "/en/imprint");
        await expect(navigation.getByRole("link", { name: "Dextinity website" })).toHaveAttribute("href", "https://www.dextinity.com");
    },
};

export const Minimal: Story = {
    args: {
        data: {
            text: createRichText(loremIpsum),
            image: emptyDamImage,
            caption: "",
            linkList: { blocks: [] },
            copyrightNotice: "",
        },
    },
    play: async ({ canvasElement }) => {
        await expect(within(canvasElement).queryByRole("navigation")).not.toBeInTheDocument();
    },
};
