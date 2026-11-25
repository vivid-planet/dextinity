import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { Menu } from "../Menu";
import { MenuItem } from "../MenuItem";
import styles from "./Menu.stories.module.scss";

const iconOptions = {
    Edit: <Icon name="edit" />,
    Copy: <Icon name="copy" />,
    Trash: <Icon name="trash" />,
};

const meta = {
    component: MenuItem,
    title: "Building blocks/Menus & messages/MenuItem",
    decorators: [
        themeDecorator,
        (Story) => (
            <div className={styles.stage}>
                <Story />
            </div>
        ),
    ],
    args: {
        label: "Duplicate",
        onClick: fn(),
    },
    argTypes: {
        color: {
            control: "radio",
            options: ["default", "error"],
        },
        icon: {
            control: "select",
            options: Object.keys(iconOptions),
            mapping: iconOptions,
        },
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
    },
    render: (args) => {
        const [isMenuOpen, setIsMenuOpen] = useState(true);
        return (
            <Menu
                open={isMenuOpen}
                onOpenChange={setIsMenuOpen}
                trigger={
                    <Button variant="outlined" color="secondary">
                        Actions
                    </Button>
                }
            >
                <MenuItem {...args} />
            </Menu>
        );
    },
} satisfies Meta<typeof MenuItem>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * An action in a `Menu`. Label it with a verb.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(await screen.findByRole("menuitem", { name: "Duplicate" }));
        await waitFor(() => expect(args.onClick).toHaveBeenCalled());
        await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());

        await userEvent.click(canvas.getByRole("button", { name: "Actions" }));
        await screen.findByRole("menuitem", { name: "Duplicate" });
    },
};

/**
 * `icon` comes before the label, in the subtle text color.
 */
export const WithIcon: Story = {
    args: { icon: <Icon name="copy" /> },
};

/**
 * `keyboardShortcut` shows the keyboard shortcut at the end, so people learn it.
 */
export const WithKeyboardShortcut: Story = {
    args: { icon: <Icon name="copy" />, keyboardShortcut: "mod+d" },
};

/**
 * `color="error"` for destructive actions. Put them last, after a `MenuSeparator`.
 */
export const ErrorColor: Story = {
    args: { label: "Delete", icon: <Icon name="trash" />, keyboardShortcut: "mod+Backspace", color: "error" },
};

/**
 * A disabled item can't be selected; keyboard navigation still reaches it.
 */
export const Disabled: Story = {
    args: { icon: <Icon name="copy" />, disabled: true },
    play: async ({ args }) => {
        const item = await screen.findByRole("menuitem", { name: "Duplicate" });
        await expect(item).toHaveAttribute("aria-disabled", "true");
        await userEvent.click(item);
        await expect(args.onClick).not.toHaveBeenCalled();
    },
};

/**
 * `disabledReason` explains why the item is disabled, in a tooltip and to screen readers.
 */
export const DisabledWithReason: Story = {
    args: { label: "Delete", icon: <Icon name="trash" />, color: "error", disabled: true, disabledReason: "Only admins can delete pages" },
    play: async ({ args }) => {
        const item = await screen.findByRole("menuitem", { name: "Delete" });
        await expect(item).toHaveAccessibleDescription("Only admins can delete pages");
        await userEvent.hover(item);
        await waitFor(() => expect(screen.getByRole("tooltip")).toHaveTextContent("Only admins can delete pages"));
        await userEvent.click(item);
        await expect(args.onClick).not.toHaveBeenCalled();
    },
};
