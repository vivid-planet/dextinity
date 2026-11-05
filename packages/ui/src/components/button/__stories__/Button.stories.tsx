import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import buttonTokens from "../_tokens.scss?raw";
import { Button } from "../Button";

const iconOptions = {
    Check: <Icon name="check" />,
    ArrowRight: <Icon name="arrow-right" />,
    Trash: <Icon name="trash" />,
};

const meta = {
    component: Button,
    title: "Building blocks/Buttons/Button",
    decorators: [themeDecorator],
    parameters: { tokens: buttonTokens },
    args: {
        children: "Button",
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
    },
} satisfies Meta<typeof Button>;

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

/**
 * Further actions: `outlined` with `color="secondary"`.
 */
export const Secondary: Story = {
    args: {
        variant: "outlined",
        color: "secondary",
    },
};

/**
 * Destructive actions: `outlined` with `color="error"`.
 */
export const Danger: Story = {
    args: {
        variant: "outlined",
        color: "error",
        startIcon: <Icon name="trash" />,
        children: "Delete",
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

/**
 * `startIcon` and `endIcon` accept any `ReactNode`.
 */
export const WithIcons: Story = {
    render: () => (
        <div style={{ display: "flex", gap: "1rem" }}>
            <Button startIcon={<Icon name="check" />}>Start only</Button>
            <Button endIcon={<Icon name="arrow-right" />}>End only</Button>
            <Button startIcon={<Icon name="check" />} endIcon={<Icon name="arrow-right" />}>
                Both
            </Button>
        </div>
    ),
};

/**
 * With `href`, the button renders as a link.
 */
export const AsLink: Story = {
    args: {
        href: "#",
        variant: "outlined",
        color: "secondary",
        endIcon: <Icon name="external-link" />,
    },
};
