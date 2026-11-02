import { ContactFormBlock } from "@src/common/blocks/ContactFormBlock";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

const meta: Meta<typeof ContactFormBlock> = {
    title: "Blocks/Common/ContactFormBlock",
    component: ContactFormBlock,
    args: {
        data: {},
    },
};

export default meta;
type Story = StoryObj<typeof ContactFormBlock>;

export const Default: Story = {};

export const ValidationErrors: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));

        await expect(await canvas.findByText("Please enter your name")).toBeInTheDocument();
        await expect(canvas.getByText("Please enter your email address")).toBeInTheDocument();
        await expect(canvas.getByText("You must agree to the privacy policy to continue")).toBeInTheDocument();
    },
};
