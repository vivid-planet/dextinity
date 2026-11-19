import { MailDividerBlock } from "@src/mail/blocks/MailDividerBlock";
import { MailRendererDecorator } from "@src/storybook/MailRendererDecorator";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof MailDividerBlock> = {
    title: "Blocks/Mail/MailDividerBlock",
    component: MailDividerBlock,
    decorators: [MailRendererDecorator],
    args: {
        data: {},
    },
};

export default meta;
type Story = StoryObj<typeof MailDividerBlock>;

export const Default: Story = {};
