import { MailImageBlock } from "@src/mail/blocks/MailImageBlock";
import { createPixelImage } from "@src/storybook/blockFixtures";
import { MailRendererDecorator } from "@src/storybook/MailRendererDecorator";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof MailImageBlock> = {
    title: "Blocks/Mail/MailImageBlock",
    component: MailImageBlock,
    decorators: [MailRendererDecorator],
    args: {
        data: { image: createPixelImage({ seed: "mail" }), fullWidth: false, aspectRatio: "16x9" },
    },
};

export default meta;
type Story = StoryObj<typeof MailImageBlock>;

export const Default: Story = {};

export const FullWidth: Story = {
    args: { data: { image: createPixelImage({ seed: "mail" }), fullWidth: true, aspectRatio: "16x9" } },
};

export const SquareImage: Story = {
    args: { data: { image: createPixelImage({ seed: "mail" }), fullWidth: false, aspectRatio: "1x1" } },
};
