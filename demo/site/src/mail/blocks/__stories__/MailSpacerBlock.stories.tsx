import { MailSpacerBlock } from "@src/mail/blocks/MailSpacerBlock";
import { MailRendererDecorator } from "@src/storybook/MailRendererDecorator";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof MailSpacerBlock> = {
    title: "Blocks/Mail/MailSpacerBlock",
    component: MailSpacerBlock,
    decorators: [MailRendererDecorator],
    args: {
        data: { spacing: "medium" },
    },
};

export default meta;
type Story = StoryObj<typeof MailSpacerBlock>;

export const Small: Story = {
    args: { data: { spacing: "small" } },
};

export const Medium: Story = {};

export const Large: Story = {
    args: { data: { spacing: "large" } },
};
