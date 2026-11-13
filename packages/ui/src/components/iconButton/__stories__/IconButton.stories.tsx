import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent } from "storybook/test";

import { storyShortcutText } from "../../../storybook/keyboardPlatformDecorator";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../IconButton";
import iconButtonTokens from "../IconButton.tokens.scss?raw";
import styles from "./IconButton.stories.module.scss";

const iconOptions = {
    Favorite: <Icon name="star-fill" />,
    More: <Icon name="more-horizontal" />,
    Edit: <Icon name="edit" />,
    Trash: <Icon name="trash" />,
    Close: <Icon name="close" />,
};

const meta = {
    component: IconButton,
    title: "Building blocks/Buttons/IconButton",
    decorators: [
        themeDecorator,
        (Story) => (
            <div className={styles.stage}>
                <Story />
            </div>
        ),
    ],
    parameters: { tokens: iconButtonTokens },
    args: {
        children: <Icon name="star-fill" />,
        "aria-label": "Add to favorites",
        onClick: fn(),
    },
    argTypes: {
        onClick: { description: "Called when the button is clicked." },
        children: {
            control: "select",
            options: Object.keys(iconOptions),
            mapping: iconOptions,
        },
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
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The `aria-label` names the action for assistive technology and is shown as the tooltip on hover and keyboard focus.
 *
 * **Rules**
 *
 * - Always name the action in `aria-label`; it is also the tooltip text.
 * - Use an icon only for actions whose icon is well known (more, edit, delete, close). Otherwise use a `Button` with a label.
 * - In toolbars and rows, use `variant="text"` with `color="secondary"`.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const button = canvas.getByRole("button", { name: "Add to favorites" });
        await userEvent.hover(button);
        await expect(await screen.findByRole("tooltip")).toHaveTextContent("Add to favorites");
        await userEvent.click(button);
        await expect(args.onClick).toHaveBeenCalledOnce();
    },
};

/**
 * Keyboard focus shows the tooltip with the shortcut; Enter triggers the action.
 */
export const WithShortcut: Story = {
    args: {
        children: <Icon name="edit" />,
        "aria-label": "Edit",
        shortcut: "mod+e",
    },
    play: async ({ args, canvas }) => {
        await userEvent.tab();
        await expect(canvas.getByRole("button", { name: "Edit" })).toHaveFocus();
        await expect(await screen.findByRole("tooltip")).toHaveTextContent(`Edit${storyShortcutText("mod+e")}`);
        await userEvent.keyboard("{Enter}");
        await expect(args.onClick).toHaveBeenCalledOnce();
    },
};

/**
 * Where the button stands alone on a surface, e.g. next to a field.
 */
export const Outlined: Story = {
    args: {
        variant: "outlined",
    },
};

/**
 * For toolbars and rows, usually with `color="secondary"`.
 */
export const Text: Story = {
    args: {
        variant: "text",
    },
};

/**
 * Neutral, e.g. `variant="text"` for the actions of a table row.
 */
export const Secondary: Story = {
    args: {
        color: "secondary",
    },
};

export const Error: Story = {
    args: {
        color: "error",
        children: <Icon name="trash" />,
        "aria-label": "Delete",
    },
};

export const Success: Story = {
    args: {
        color: "success",
        children: <Icon name="check" />,
        "aria-label": "Approve",
    },
};

/**
 * In table rows, tree rows, and dense panels.
 */
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
 * The spinner replaces the icon; the button keeps its size and ignores clicks.
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
 * Every variant in every color, in both sizes.
 */
export const Overview: Story = {
    render: (args) => (
        <div className={styles.grid}>
            {(["contained", "outlined", "text"] as const).map((variant) =>
                (["primary", "secondary", "error", "success"] as const).map((color) => (
                    <div key={`${variant}-${color}`} className={styles.row}>
                        <IconButton {...args} variant={variant} color={color} />
                        <IconButton {...args} variant={variant} color={color} size="small" />
                    </div>
                )),
            )}
        </div>
    ),
};
