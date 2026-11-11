import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../IconButton";
import tokens from "../IconButton.tokens.scss?raw";

const iconOptions = {
    Favorite: <Icon name="favorite" />,
    Delete: <Icon name="delete" />,
};

const meta = {
    component: IconButton,
    title: "Building blocks/IconButton",
    parameters: {
        tokens,
        rules: {
            dos: [
                "Always with a tooltip and an `aria-label` that names the action.",
                "One icon per meaning – the globe always means scope or global.",
                "Show the keyboard shortcut in the tooltip, if there is one.",
            ],
            donts: [
                "Icons as the only information for a status.",
                "An icon button for an action whose icon isn't clear without a label.",
                "Mixing filled and outlined icons.",
            ],
        },
    },
    decorators: [themeDecorator],
    args: {
        "aria-label": "Add to favorites",
        children: <Icon name="favorite" />,
        onClick: fn(),
    },
    argTypes: {
        variant: {
            control: "radio",
            options: ["contained", "outlined", "text"],
        },
        color: {
            control: "select",
            options: ["primary", "secondary", "error", "success"],
        },
        size: {
            control: "radio",
            options: ["default", "small"],
        },
        children: {
            control: "select",
            options: Object.keys(iconOptions),
            mapping: iconOptions,
        },
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Outlined: Story = {
    args: {
        variant: "outlined",
    },
};

export const Text: Story = {
    args: {
        variant: "text",
    },
};

export const Secondary: Story = {
    args: {
        color: "secondary",
    },
};

export const Error: Story = {
    args: {
        color: "error",
        "aria-label": "Delete",
        children: <Icon name="delete" />,
    },
};

export const Success: Story = {
    args: {
        color: "success",
    },
};

export const Small: Story = {
    args: {
        size: "small",
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
    },
};

export const Loading: Story = {
    args: {
        loading: true,
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button"));
        await expect(args.onClick).not.toHaveBeenCalled();
    },
};
