import type { MailTwoColumnsContentBlockData } from "@src/blocks.generated";
import { MailTwoColumnsBlock } from "@src/mail/blocks/MailTwoColumnsBlock";
import { createBlocksItems, createListItems, createPixelImage } from "@src/storybook/blockFixtures";
import { MailRendererDecorator } from "@src/storybook/MailRendererDecorator";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { createMailButton, createMailHeading, createMailText } from "./mailBlockFixtures";

function createColumn(title: string, seed: string): MailTwoColumnsContentBlockData {
    return {
        blocks: createBlocksItems<MailTwoColumnsContentBlockData["blocks"][number]["props"]>([
            { type: "image", props: createPixelImage({ seed }) },
            { type: "spacer", props: { spacing: "small" } },
            { type: "heading", props: createMailHeading(title, "header") },
            { type: "text", props: createMailText() },
            { type: "button", props: createMailButton({ text: "Read more" }) },
        ]),
    };
}

const meta: Meta<typeof MailTwoColumnsBlock> = {
    title: "Blocks/Mail/MailTwoColumnsBlock",
    component: MailTwoColumnsBlock,
    decorators: [MailRendererDecorator],
    args: {
        data: {
            layout: "1-1",
            columns: createListItems([createColumn("First column", "mail-column-1"), createColumn("Second column", "mail-column-2")], "column"),
        },
    },
};

export default meta;
type Story = StoryObj<typeof MailTwoColumnsBlock>;

export const Default: Story = {};
