import { EmailCampaignSalutationBlock } from "@src/brevo/blocks/EmailCampaignSalutationBlock";
import { emptyRichText } from "@src/storybook/blockFixtures";
import { MailRendererDecorator } from "@src/storybook/MailRendererDecorator";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof EmailCampaignSalutationBlock> = {
    title: "Blocks/Brevo/EmailCampaignSalutationBlock",
    component: EmailCampaignSalutationBlock,
    decorators: [MailRendererDecorator],
    args: {
        data: emptyRichText,
    },
};

export default meta;
type Story = StoryObj<typeof EmailCampaignSalutationBlock>;

export const Default: Story = {};
