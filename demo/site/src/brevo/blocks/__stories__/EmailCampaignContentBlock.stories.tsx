import type { EmailCampaignContentBlockData } from "@src/blocks.generated";
import { EmailCampaignContentBlock } from "@src/brevo/blocks/EmailCampaignContentBlock";
import { createMailButton, createMailHeading, createMailText } from "@src/mail/blocks/__stories__/mailBlockFixtures";
import { createBlocksItems, createPixelImage } from "@src/storybook/blockFixtures";
import { MailRendererDecorator } from "@src/storybook/MailRendererDecorator";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof EmailCampaignContentBlock> = {
    title: "Blocks/Brevo/EmailCampaignContentBlock",
    component: EmailCampaignContentBlock,
    decorators: [MailRendererDecorator],
    args: {
        content: {
            blocks: createBlocksItems<EmailCampaignContentBlockData["blocks"][number]["props"]>([
                { type: "salutation", props: {} },
                { type: "heading", props: createMailHeading("Our newsletter") },
                { type: "text", props: createMailText() },
                { type: "image", props: { image: createPixelImage({ seed: "newsletter" }), fullWidth: false, aspectRatio: "16x9" } },
                { type: "spacer", props: { spacing: "medium" } },
                { type: "text", props: createMailText() },
                { type: "button", props: createMailButton({ text: "Read more" }) },
                { type: "divider", props: {} },
                { type: "text", props: createMailText() },
            ]),
        },
    },
};

export default meta;
type Story = StoryObj<typeof EmailCampaignContentBlock>;

export const Default: Story = {};
