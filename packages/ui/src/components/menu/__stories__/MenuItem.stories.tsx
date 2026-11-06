import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import menuTokens from "../_tokens.scss?raw";
import { Menu } from "../Menu";
import { MenuItem } from "../MenuItem";
import styles from "./Menu.stories.module.scss";

const iconOptions = {
    Edit: <Icon name="edit" />,
    Copy: <Icon name="copy" />,
    Trash: <Icon name="trash" />,
};

function InOpenMenu({ children }: { children: ReactNode }) {
    return (
        <Menu
            open
            onOpenChange={() => {}}
            trigger={
                <Button variant="outlined" color="secondary">
                    Actions
                </Button>
            }
        >
            {children}
        </Menu>
    );
}

const meta = {
    component: MenuItem,
    title: "Building blocks/Menus & messages/MenuItem",
    decorators: [
        (Story) => (
            <InOpenMenu>
                <Story />
            </InOpenMenu>
        ),
        themeDecorator,
        (Story) => (
            <div className={styles.stage}>
                <Story />
            </div>
        ),
    ],
    parameters: { tokens: menuTokens },
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
} satisfies Meta<typeof MenuItem>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * An action in a `Menu`. Label it with a verb.
 */
export const Default: Story = {
    play: async ({ args }) => {
        await userEvent.click(await screen.findByRole("menuitem", { name: "Duplicate" }));
        await waitFor(() => expect(args.onClick).toHaveBeenCalled());
    },
};

/**
 * `icon` comes before the label, in the tertiary text color.
 */
export const WithIcon: Story = {
    args: { icon: <Icon name="copy" /> },
};

/**
 * `shortcut` shows the keyboard shortcut at the end, so people learn it.
 */
export const WithShortcut: Story = {
    args: { icon: <Icon name="copy" />, shortcut: "⌘D" },
};

/**
 * `color="error"` for destructive actions. Put them last, after a `MenuSeparator`.
 */
export const ErrorColor: Story = {
    args: { label: "Delete", icon: <Icon name="trash" />, shortcut: "⌘⌫", color: "error" },
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
