import { MailButtonBlock } from "@src/mail/blocks/MailButtonBlock";
import { MailRendererDecorator } from "@src/storybook/MailRendererDecorator";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { createMailButton } from "./mailBlockFixtures";

const meta: Meta<typeof MailButtonBlock> = {
    title: "Blocks/Mail/MailButtonBlock",
    component: MailButtonBlock,
    decorators: [MailRendererDecorator],
    args: {
        data: createMailButton(),
    },
};

export default meta;
type Story = StoryObj<typeof MailButtonBlock>;

export const Filled: Story = {};

export const Outlined: Story = {
    args: { data: createMailButton({ variant: "outlined" }) },
};

export const AlignedCenter: Story = {
    args: { data: createMailButton({ align: "center" }) },
};

export const AlignedRight: Story = {
    args: { data: createMailButton({ align: "right" }) },
};
