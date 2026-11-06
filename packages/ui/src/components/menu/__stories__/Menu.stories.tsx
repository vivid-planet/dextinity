import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { IconButton } from "../../iconButton/IconButton";
import menuTokens from "../_tokens.scss?raw";
import { Menu, type MenuProps } from "../Menu";
import { MenuGroup } from "../MenuGroup";
import { MenuItem } from "../MenuItem";
import { MenuRadioGroup } from "../MenuRadioGroup";
import { MenuRadioItem } from "../MenuRadioItem";
import { MenuSeparator } from "../MenuSeparator";
import { MenuSubmenu } from "../MenuSubmenu";
import styles from "./Menu.stories.module.scss";

const rowMenuItems = (
    <MenuGroup label="Senior UX Designer">
        <MenuItem label="Edit" icon={<Icon name="edit" />} shortcut="↵" onClick={fn()} />
        <MenuItem label="Duplicate" icon={<Icon name="copy" />} shortcut="⌘D" onClick={fn()} />
        <MenuSeparator />
        <MenuItem label="Archive" icon={<Icon name="archive" />} onClick={fn()} />
        <MenuItem label="Delete" icon={<Icon name="delete" />} shortcut="⌫" color="error" onClick={fn()} />
    </MenuGroup>
);

function MoveToSubmenu() {
    const [open, setOpen] = useState(false);
    return (
        <MenuSubmenu label="Move to" icon={<Icon name="folder" />} open={open} onOpenChange={setOpen}>
            <MenuItem label="Images" icon={<Icon name="folder" />} onClick={fn()} />
            <MenuItem label="Documents" icon={<Icon name="folder" />} onClick={fn()} />
            <MenuItem label="Videos" icon={<Icon name="folder" />} onClick={fn()} />
        </MenuSubmenu>
    );
}

function ControlledMenu(props: MenuProps) {
    const [open, setOpen] = useState(props.open);
    return (
        <Menu
            {...props}
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                props.onOpenChange(nextOpen);
            }}
        />
    );
}

const meta = {
    component: Menu,
    title: "Building blocks/Menus & messages/Menu",
    decorators: [
        themeDecorator,
        (Story, { args }) => (
            <div className={args.placement?.startsWith("top") ? `${styles.stage} ${styles.stageTop}` : styles.stage}>
                <Story />
            </div>
        ),
    ],
    parameters: { tokens: menuTokens },
    render: (args) => <ControlledMenu {...args} />,
    args: {
        trigger: (
            <IconButton color="secondary" aria-label="More actions" variant="outlined">
                <Icon name="more-horizontal" />
            </IconButton>
        ),
        children: rowMenuItems,
        open: false,
        onOpenChange: fn(),
    },
    argTypes: {
        placement: {
            control: "radio",
            options: ["bottom-start", "bottom-end", "top-start", "top-end"],
        },
        trigger: { control: false },
        children: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Menu>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The row menu: opens at the trigger, arrow keys move through the items, Enter selects, Escape closes.
 *
 * **Rules**
 *
 * - Give frequent items a keyboard shortcut, so people learn it.
 * - Destructive items come last, after a separator, in `error` color.
 * - Use groups once a menu has more than ten items.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "More actions" }));
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(true));
        const menu = await screen.findByRole("menu");
        await waitFor(() => expect(menu).toBeVisible());
        await userEvent.keyboard("{ArrowDown}");
        await waitFor(() => expect(screen.getByRole("menuitem", { name: /Edit/ })).toHaveFocus());
        await userEvent.keyboard("{ArrowDown}");
        await expect(screen.getByRole("menuitem", { name: /Duplicate/ })).toHaveFocus();
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(false));
        await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    },
};

/**
 * Open, as in the row menu of the draft.
 */
export const Open: Story = {
    args: { open: true },
};

function ThemeItems() {
    const [value, setValue] = useState("light");
    return (
        <MenuGroup label="Theme">
            <MenuRadioGroup value={value} onChange={setValue}>
                <MenuRadioItem value="light" label="Light" icon={<Icon name="light-mode" />} />
                <MenuRadioItem value="dark" label="Dark" icon={<Icon name="dark-mode" />} />
                <MenuRadioItem value="high-contrast" label="High contrast" icon={<Icon name="high-contrast-mode" />} />
            </MenuRadioGroup>
        </MenuGroup>
    );
}

/**
 * A choice of one option with `MenuRadioGroup`: the checked option shows a check mark.
 */
export const SelectionWithCheck: Story = {
    args: {
        open: true,
        trigger: (
            <Button variant="outlined" color="secondary" startIcon={<Icon name="palette" />}>
                Theme
            </Button>
        ),
        children: <ThemeItems />,
    },
    play: async ({ args }) => {
        await expect(await screen.findByRole("menuitemradio", { name: "Light" })).toHaveAttribute("aria-checked", "true");
        await userEvent.click(screen.getByRole("menuitemradio", { name: "Dark" }));
        // Choosing an option closes the menu, as `closeOnClick` defaults to true for radio items
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(false));
        await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    },
};

/**
 * The context menu of a selection, with a submenu. `MenuSubmenu` opens on hover, click, or the arrow key towards it.
 */
export const WithSubmenu: Story = {
    args: {
        open: true,
        trigger: (
            <Button variant="outlined" color="secondary">
                3 items
            </Button>
        ),
        children: (
            <MenuGroup label="3 items">
                <MoveToSubmenu />
                <MenuItem label="Download" icon={<Icon name="download" />} onClick={fn()} />
                <MenuSeparator />
                <MenuItem label="Delete" icon={<Icon name="delete" />} shortcut="⌘⌫" color="error" onClick={fn()} />
            </MenuGroup>
        ),
    },
    play: async () => {
        const submenuTrigger = await screen.findByRole("menuitem", { name: "Move to" });
        submenuTrigger.focus();
        await userEvent.keyboard("{ArrowRight}");
        const nestedItem = await screen.findByRole("menuitem", { name: "Images" });
        await waitFor(() => expect(nestedItem).toBeVisible());
    },
};

/**
 * A disabled item stays visible, so people know the action exists; say why near the menu if it isn't obvious.
 */
export const DisabledItem: Story = {
    args: {
        open: true,
        children: (
            <>
                <MenuItem label="Edit" icon={<Icon name="edit" />} onClick={fn()} />
                <MenuItem label="Publish" icon={<Icon name="online" />} disabled onClick={fn()} />
            </>
        ),
    },
};

export const BottomEnd: Story = {
    args: { open: true, placement: "bottom-end" },
};

export const TopStart: Story = {
    args: { open: true, placement: "top-start" },
};

const onDuplicate = fn();

/**
 * Selecting an item runs its `onClick` and closes the menu.
 */
export const SelectItem: Story = {
    args: {
        children: (
            <>
                <MenuItem label="Edit" icon={<Icon name="edit" />} onClick={fn()} />
                <MenuItem label="Duplicate" icon={<Icon name="copy" />} onClick={onDuplicate} />
            </>
        ),
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "More actions" }));
        await userEvent.click(await screen.findByRole("menuitem", { name: "Duplicate" }));
        await waitFor(() => expect(onDuplicate).toHaveBeenCalled());
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(false));
        await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    },
};
