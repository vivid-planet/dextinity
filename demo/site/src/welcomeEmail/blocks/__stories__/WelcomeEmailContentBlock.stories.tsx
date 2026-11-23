import type { MailTwoColumnsContentBlockData, WelcomeEmailContentBlockData } from "@src/blocks.generated";
import { createMailButton, createMailHeading, createMailText } from "@src/mail/blocks/__stories__/mailBlockFixtures";
import { createBlocksItems, createListItems, createPixelImage } from "@src/storybook/blockFixtures";
import { MailRendererDecorator } from "@src/storybook/MailRendererDecorator";
import { WelcomeEmailContentBlock } from "@src/welcomeEmail/blocks/WelcomeEmailContentBlock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

function createColumn(title: string, seed: string): MailTwoColumnsContentBlockData {
    return {
        blocks: createBlocksItems<MailTwoColumnsContentBlockData["blocks"][number]["props"]>([
            { type: "image", props: createPixelImage({ seed }) },
            { type: "heading", props: createMailHeading(title, "header") },
            { type: "text", props: createMailText() },
        ]),
    };
}

const meta: Meta<typeof WelcomeEmailContentBlock> = {
    title: "Blocks/WelcomeEmail/WelcomeEmailContentBlock",
    component: WelcomeEmailContentBlock,
    decorators: [MailRendererDecorator],
    args: {
        content: {
            blocks: createBlocksItems<WelcomeEmailContentBlockData["blocks"][number]["props"]>([
                { type: "heading", props: createMailHeading("Welcome!") },
                { type: "text", props: createMailText() },
                { type: "image", props: { image: createPixelImage({ seed: "welcome" }), fullWidth: true, aspectRatio: "2x1" } },
                { type: "spacer", props: { spacing: "medium" } },
                {
                    type: "twoColumns",
                    props: {
                        layout: "1-1",
                        columns: createListItems([createColumn("Get started", "welcome-1"), createColumn("Get help", "welcome-2")], "column"),
                    },
                },
                { type: "spacer", props: { spacing: "medium" } },
                { type: "button", props: createMailButton({ text: "Go to your account", align: "center" }) },
                { type: "divider", props: {} },
            ]),
        },
    },
};

export default meta;
type Story = StoryObj<typeof WelcomeEmailContentBlock>;

export const Default: Story = {};
