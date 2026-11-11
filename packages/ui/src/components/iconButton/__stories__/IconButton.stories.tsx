import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../IconButton";
import tokens from "../IconButton.tokens.scss?raw";
import styles from "./iconButton.module.scss";

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
            control: "select",
            options: ["primary", "secondary", "ghost", "danger"],
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

export const Primary: Story = {
    args: {
        variant: "primary",
    },
};

export const Secondary: Story = {
    args: {
        variant: "secondary",
    },
};

export const Danger: Story = {
    args: {
        "aria-label": "Delete",
        children: <Icon name="delete" />,
        variant: "danger",
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
 * Shows that the menu or panel that the icon button opens is open, through `aria-expanded`.
 */
export const Open: Story = {
    args: {
        "aria-label": "More actions",
        "aria-expanded": true,
        children: <Icon name="more-vertical" />,
    },
};

/**
 * Every look in both sizes, at rest, disabled, and loading. Switch the color scheme, the brand, and the density in the toolbar.
 */
export const Overview: Story = {
    render: () => (
        <div className={styles.grid}>
            {(["ghost", "secondary", "primary", "danger"] as const).map((variant) =>
                (["default", "small"] as const).map((size) => (
                    <div key={`${variant}-${size}`} className={styles.row}>
                        <IconButton aria-label={`${variant} ${size}`} variant={variant} size={size}>
                            <Icon name="favorite" />
                        </IconButton>
                        <IconButton aria-label={`${variant} ${size} disabled`} variant={variant} size={size} disabled>
                            <Icon name="favorite" />
                        </IconButton>
                        <IconButton aria-label={`${variant} ${size} loading`} variant={variant} size={size} loading>
                            <Icon name="favorite" />
                        </IconButton>
                    </div>
                )),
            )}
        </div>
    ),
};
