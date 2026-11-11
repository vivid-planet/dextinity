import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { Button } from "../Button";
import buttonTokens from "../Button.tokens.scss?raw";
import styles from "./Button.stories.module.scss";

const iconOptions = {
    Favorite: <Icon name="favorite" />,
    Check: <Icon name="check" />,
    ArrowRight: <Icon name="arrow-right" />,
    Trash: <Icon name="delete" />,
};

const meta = {
    component: Button,
    title: "Building blocks/Buttons/Button",
    decorators: [themeDecorator],
    parameters: {
        tokens: buttonTokens,
        rules: {
            do: [
                "Label with a verb that names the action: Save, Publish.",
                "One primary button per area; everything else is secondary or ghost.",
                "Show loading for long actions; the button stays in place.",
            ],
            dont: [
                "Two primary buttons next to each other.",
                "A disabled button without saying why; show the failed check instead.",
                '"OK" or "Yes" as the label.',
            ],
        },
    },
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

/**
 * The primary action: one per area.
 */
export const Default: Story = {};

/**
 * Each variant with the actions it's for.
 */
export const Variants: Story = {
    render: (args) => (
        <div className={styles.overview}>
            <div className={styles.overviewItem}>
                <Button {...args} startIcon={<Icon name="check" />}>
                    Save
                </Button>
                <span>
                    Primary: <code>contained</code>, one per area
                </span>
            </div>
            <div className={styles.overviewItem}>
                <Button {...args} variant="outlined" color="secondary">
                    Preview
                </Button>
                <span>
                    Secondary: <code>outlined</code> + <code>secondary</code>, further actions
                </span>
            </div>
            <div className={styles.overviewItem}>
                <Button {...args} variant="text" color="secondary">
                    Cancel
                </Button>
                <span>
                    Ghost: <code>text</code> + <code>secondary</code>, quiet actions
                </span>
            </div>
            <div className={styles.overviewItem}>
                <Button {...args} variant="outlined" color="error" startIcon={<Icon name="delete" />}>
                    Delete
                </Button>
                <span>
                    Danger: <code>outlined</code> + <code>error</code>, destructive actions
                </span>
            </div>
            <div className={styles.overviewItem}>
                <Button {...args} variant="outlined" color="secondary" size="small">
                    Change
                </Button>
                <span>
                    Small: <code>size="small"</code>, in rows and panels
                </span>
            </div>
        </div>
    ),
};

/**
 * The primary and the secondary button when default, disabled, and loading. Hover, focus with the keyboard, and press them to see
 * the other states.
 */
export const States: Story = {
    render: (args) => (
        <div className={styles.states}>
            <Button {...args}>Save</Button>
            <Button {...args} disabled>
                Save
            </Button>
            <Button {...args} loading>
                Save
            </Button>
            <Button {...args} variant="outlined" color="secondary">
                Preview
            </Button>
            <Button {...args} variant="outlined" color="secondary" disabled>
                Preview
            </Button>
            <Button {...args} variant="outlined" color="secondary" loading>
                Preview
            </Button>
        </div>
    ),
};

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
 * Quiet actions such as Cancel: `text` with `color="secondary"`.
 */
export const Ghost: Story = {
    args: {
        variant: "text",
        color: "secondary",
        children: "Cancel",
    },
};

export const Secondary: Story = {
    args: {
        color: "secondary",
    },
};

/**
 * Further actions: `outlined` with `color="secondary"`.
 */
export const OutlinedSecondary: Story = {
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
        startIcon: <Icon name="delete" />,
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

/**
 * The button stays in place and keeps its width: the spinner replaces the start icon, or covers the label when there is none.
 */
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
 * Each button next to its loading state, at the same width.
 */
export const LoadingKeepsWidth: Story = {
    render: (args) => (
        <div className={styles.grid}>
            <Button {...args}>Save</Button>
            <Button {...args} loading>
                Save
            </Button>
            <Button {...args} variant="outlined" color="secondary" startIcon={<Icon name="visible" />}>
                Preview
            </Button>
            <Button {...args} variant="outlined" color="secondary" startIcon={<Icon name="visible" />} loading>
                Preview
            </Button>
        </div>
    ),
    play: async ({ canvas }) => {
        const [save, saving, preview, previewing] = canvas.getAllByRole("button");
        await expect(saving.getBoundingClientRect().width).toBe(save.getBoundingClientRect().width);
        await expect(previewing.getBoundingClientRect().width).toBe(preview.getBoundingClientRect().width);
    },
};

/**
 * `startIcon` and `endIcon` accept any `ReactNode`.
 */
export const WithIcons: Story = {
    render: () => (
        <div className={styles.row}>
            <Button startIcon={<Icon name="favorite" />}>Start only</Button>
            <Button endIcon={<Icon name="arrow-right" />}>End only</Button>
            <Button startIcon={<Icon name="favorite" />} endIcon={<Icon name="arrow-right" />}>
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
        endIcon: <Icon name="open-new-tab" />,
    },
};
