import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button, type ButtonVariant } from "../Button";

const meta: Meta<typeof Button> = {
    title: "Components/Button",
    component: Button,
    argTypes: {
        variant: {
            control: "select",
            options: ["contained", "outlined", "text"] satisfies ButtonVariant[],
        },
    },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Contained: Story = {
    args: {
        variant: "contained",
        children: "Contained Button",
    },
};

export const Outlined: Story = {
    args: {
        variant: "outlined",
        children: "Outlined Button",
    },
};

export const Text: Story = {
    args: {
        variant: "text",
        children: "Text Button",
    },
};

export const Disabled: Story = {
    args: {
        variant: "contained",
        children: "Disabled Button",
        disabled: true,
    },
};

// The `play` function runs as a test in CI (via @storybook/addon-vitest): it drives the rendered story and asserts
// on the result.
export const Clickable: Story = {
    args: {
        variant: "contained",
        children: "Click me",
        onClick: fn(),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const button = canvas.getByRole("button", { name: "Click me" });

        await expect(button).toBeInTheDocument();

        await userEvent.click(button);
        await expect(args.onClick).toHaveBeenCalledOnce();
    },
};
