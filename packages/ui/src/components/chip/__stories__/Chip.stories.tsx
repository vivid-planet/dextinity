import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import chipTokens from "../_tokens.scss?raw";
import { Chip } from "../Chip";
import styles from "./Chip.stories.module.scss";

const iconOptions = {
    Calendar: <Icon name="calendar" />,
    ChevronDown: <Icon name="chevron-down" />,
};

const meta = {
    component: Chip,
    title: "Building blocks/Status, tags & badges/Chip",
    decorators: [themeDecorator],
    parameters: { tokens: chipTokens },
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

const variants = ["contained", "outlined"] as const;
const colors = ["primary", "secondary", "info", "warning", "error", "success"] as const;

/**
 * Every variant in every color.
 *
 * **Rules**
 *
 * - Use `info`, `success`, `warning`, and `error` only where the color carries meaning, e.g. a status.
 * - Use `secondary` for neutral values such as tags.
 */
export const Colors: Story = {
    render: (args) => (
        <div className={styles.grid}>
            {variants.map((variant) =>
                colors.map((color) => (
                    <Chip key={`${variant}-${color}`} {...args} variant={variant} color={color}>
                        {color}
                    </Chip>
                )),
            )}
        </div>
    ),
};

/**
 * A chip that toggles a filter renders as a button through `render`, with `aria-pressed`.
 */
export const AsToggle: Story = {
    render: function Render(args) {
        const [pressed, setPressed] = useState(false);
        return (
            <Chip
                {...args}
                variant={pressed ? "contained" : "outlined"}
                color="secondary"
                render={<button type="button" aria-pressed={pressed} onClick={() => setPressed(!pressed)} />}
            >
                Published
            </Chip>
        );
    },
    play: async ({ canvas }) => {
        const chip = canvas.getByRole("button", { name: "Published" });
        await userEvent.click(chip);
        await expect(chip).toHaveAttribute("aria-pressed", "true");
    },
};
