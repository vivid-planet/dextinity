import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { Button } from "../Button";
import tokens from "../Button.tokens.scss?raw";
import styles from "./button.module.scss";

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
                "One primary action per area; all other actions are secondary or ghost buttons.",
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
            control: "select",
            options: ["primary", "secondary", "ghost", "danger"],
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

export const Secondary: Story = {
    args: {
        variant: "secondary",
    },
};

export const Ghost: Story = {
    args: {
        variant: "ghost",
    },
};

export const Danger: Story = {
    args: {
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
 * `startIcon` and `endIcon` accept any `ReactNode`.
 */
export const WithIcons: Story = {
    render: () => (
        <div className={styles.row}>
            <Button startIcon={<Icon name="check" />}>Save</Button>
            <Button variant="secondary" endIcon={<Icon name="arrow-right" />}>
                Next
            </Button>
            <Button variant="danger" startIcon={<Icon name="delete" />}>
                Delete
            </Button>
        </div>
    ),
};

/**
 * Every look in both sizes, at rest, disabled, and loading. Hover and press them to see their feedback, and switch the color scheme,
 * the brand, and the density in the toolbar.
 */
export const Overview: Story = {
    render: () => (
        <div className={styles.grid}>
            {(["primary", "secondary", "ghost", "danger"] as const).map((variant) =>
                (["default", "small"] as const).map((size) => (
                    <div key={`${variant}-${size}`} className={styles.row}>
                        <Button variant={variant} size={size}>
                            {variant}
                        </Button>
                        <Button variant={variant} size={size} disabled>
                            Disabled
                        </Button>
                        <Button variant={variant} size={size} loading>
                            Loading
                        </Button>
                    </div>
                )),
            )}
        </div>
    ),
};
