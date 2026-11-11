import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { Chip } from "../Chip";
import tokens from "../Chip.tokens.scss?raw";

const iconOptions = {
    Calendar: <Icon name="calendar" />,
    ChevronDown: <Icon name="chevron-down" />,
};

const meta = {
    component: Chip,
    title: "Building blocks/Chip",
    parameters: {
        tokens,
        rules: {
            dos: [
                "Status words from the system: Published, Unpublished, Archived.",
                "Badges only for real exceptions.",
                "A short label on one line.",
            ],
            donts: ["A status only as a color.", "More than one badge per element."],
        },
    },
    decorators: [themeDecorator],
    args: {
        children: "Label",
    },
    argTypes: {
        variant: {
            control: "radio",
            options: ["contained", "outlined"],
        },
        color: {
            control: "select",
            options: ["primary", "secondary", "info", "warning", "error", "success"],
        },
        size: {
            control: "radio",
            options: ["default", "small"],
        },
        startIcon: {
            control: "select",
            options: Object.keys(iconOptions),
            mapping: iconOptions,
        },
        endIcon: {
            control: "select",
            options: Object.keys(iconOptions),
            mapping: iconOptions,
        },
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
        ref: { control: false },
        render: { control: false },
    },
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Outlined: Story = {
    args: {
        variant: "outlined",
    },
};

export const Secondary: Story = {
    args: {
        color: "secondary",
    },
};

export const Info: Story = {
    args: {
        color: "info",
    },
};

export const Warning: Story = {
    args: {
        color: "warning",
    },
};

export const Error: Story = {
    args: {
        color: "error",
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
        onClear: fn(),
        clearLabel: "Remove filter: Label",
    },
};

export const WithIcons: Story = {
    args: {
        startIcon: <Icon name="calendar" />,
        endIcon: <Icon name="chevron-down" />,
    },
};

export const WithClearButton: Story = {
    args: {
        onClear: fn(),
        clearLabel: "Remove filter: Label",
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Remove filter: Label" }));
        await expect(args.onClear).toHaveBeenCalledOnce();
    },
};
