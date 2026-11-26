import { MailHeadingBlock } from "@src/mail/blocks/MailHeadingBlock";
import { MailRendererDecorator } from "@src/storybook/MailRendererDecorator";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { createMailHeading } from "./mailBlockFixtures";

const meta: Meta<typeof MailHeadingBlock> = {
    title: "Blocks/Mail/MailHeadingBlock",
    component: MailHeadingBlock,
    decorators: [MailRendererDecorator],
    args: {
        data: createMailHeading("Title"),
    },
};

export default meta;
type Story = StoryObj<typeof MailHeadingBlock>;

export const Title: Story = {};

export const Header: Story = {
    args: { data: createMailHeading("Header", "header") },
};
