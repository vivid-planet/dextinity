import type { MailTwoColumnsContentBlockData, WelcomeEmailContentBlockData } from "@src/blocks.generated";
import { createMailButton } from "@src/mail/blocks/__stories__/mailBlockFixtures";
import { createBlocksItems, createListItems, createPixelImage, createRichText, loremIpsum } from "@src/storybook/blockFixtures";
import { MailRendererDecorator } from "@src/storybook/MailRendererDecorator";
import { WelcomeEmailContentBlock } from "@src/welcomeEmail/blocks/WelcomeEmailContentBlock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

function createColumn(title: string, seed: string): MailTwoColumnsContentBlockData {
    return {
        blocks: createBlocksItems<MailTwoColumnsContentBlockData["blocks"][number]["props"]>([
            { type: "image", props: createPixelImage({ seed }) },
            { type: "text", props: createRichText({ text: title, type: "header" }, { text: loremIpsum, type: "copy" }) },
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
                { type: "text", props: createRichText({ text: "Welcome!", type: "title" }, { text: loremIpsum, type: "copy" }) },
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
