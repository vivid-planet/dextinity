import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { Button } from "../Button";
import tokens from "../Button.tokens.scss?raw";

const iconOptions = {
    Favorite: <Icon name="favorite" />,
    ArrowRight: <Icon name="arrow-right" />,
};

const meta = {
    component: Button,
    title: "Building blocks/Button",
    parameters: {
        tokens,
        rules: {
            dos: [
                "Label as a verb: Save, Publish.",
                "One primary action per area; all other actions are secondary or text buttons.",
                "For long actions, show `loading`. The button stays in place.",
            ],
            donts: [
                "Two primary buttons next to each other.",
                "Disabled buttons without explanation – show the validation instead.",
                "“OK” or “Yes” as the label.",
            ],
        },
    },
    decorators: [themeDecorator],
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

export const Secondary: Story = {
    args: {
        color: "secondary",
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
            <Button startIcon={<Icon name="favorite" />}>Start only</Button>
            <Button endIcon={<Icon name="arrow-right" />}>End only</Button>
            <Button startIcon={<Icon name="favorite" />} endIcon={<Icon name="arrow-right" />}>
                Both
            </Button>
        </div>
    ),
};
