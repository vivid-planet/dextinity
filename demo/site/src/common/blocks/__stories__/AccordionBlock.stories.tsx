import type { AccordionItemBlockData } from "@src/blocks.generated";
import { createBlocksItems, createListItems, createRichText, loremIpsum } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { AccordionBlock, PageContentAccordionBlock } from "../AccordionBlock";

function createAccordionItem(title: string, openByDefault = false): AccordionItemBlockData {
    return {
        title,
        titleHtmlTag: "h3",
        openByDefault,
        content: { blocks: createBlocksItems([{ type: "richtext", props: createRichText(loremIpsum, loremIpsum) }]) },
    };
}

const meta: Meta<typeof AccordionBlock> = {
    title: "Blocks/Common/AccordionBlock",
    component: AccordionBlock,
    args: {
        data: {
            blocks: createListItems([
                createAccordionItem("What is Dextinity?", true),
                createAccordionItem("How do I create a page?"),
                createAccordionItem("Can I add my own blocks?"),
            ]),
        },
    },
};

export default meta;
type Story = StoryObj<typeof AccordionBlock>;

export const Default: Story = {};

export const AllClosed: Story = {
    args: {
        data: { blocks: createListItems([createAccordionItem("First item"), createAccordionItem("Second item")]) },
    },
};

export const InPageContent: Story = {
    render: (args) => <PageContentAccordionBlock {...args} />,
};

export const Toggle: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole("button", { name: "How do I create a page?" });

        await expect(button).toHaveAttribute("aria-expanded", "false");
        await userEvent.click(button);
        await expect(button).toHaveAttribute("aria-expanded", "true");
    },
};
