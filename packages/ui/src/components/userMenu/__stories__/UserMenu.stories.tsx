import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { MenuGroup } from "../../menu/MenuGroup";
import { MenuItem } from "../../menu/MenuItem";
import { MenuRadioGroup } from "../../menu/MenuRadioGroup";
import { MenuRadioItem } from "../../menu/MenuRadioItem";
import { MenuSeparator } from "../../menu/MenuSeparator";
import userMenuTokens from "../_tokens.scss?raw";
import { UserMenu, type UserMenuProps } from "../UserMenu";
import styles from "./UserMenu.stories.module.scss";

function UserSettings() {
    const [theme, setTheme] = useState("auto");
    const [density, setDensity] = useState("standard");
    return (
        <>
            <MenuGroup label="Theme">
                <MenuRadioGroup value={theme} onChange={setTheme}>
                    <MenuRadioItem closeOnClick={false} value="light" label="Light" icon={<Icon name="sun" />} />
                    <MenuRadioItem closeOnClick={false} value="dark" label="Dark" icon={<Icon name="moon" />} />
                    <MenuRadioItem closeOnClick={false} value="high-contrast" label="High contrast" icon={<Icon name="contrast" />} />
                    <MenuRadioItem closeOnClick={false} value="auto" label="Time of day" icon={<Icon name="clock" />} />
                </MenuRadioGroup>
            </MenuGroup>
            <MenuSeparator />
            <MenuGroup label="Density">
                <MenuRadioGroup value={density} onChange={setDensity}>
                    <MenuRadioItem closeOnClick={false} value="comfortable" label="Comfortable" />
                    <MenuRadioItem closeOnClick={false} value="standard" label="Standard" />
                    <MenuRadioItem closeOnClick={false} value="compact" label="Compact" />
                </MenuRadioGroup>
            </MenuGroup>
            <MenuSeparator />
            <MenuItem label="Keyboard shortcuts" icon={<Icon name="keyboard" />} shortcut="?" onClick={fn()} />
        </>
    );
}

function ControlledUserMenu(props: UserMenuProps) {
    const [open, setOpen] = useState(props.open);
    return (
        <UserMenu
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
    component: UserMenu,
    title: "Shell/Top bar & scope/UserMenu",
    decorators: [
        themeDecorator,
        (Story) => (
            <div className={styles.stage}>
                <Story />
            </div>
        ),
    ],
    parameters: { tokens: userMenuTokens },
    render: (args) => <ControlledUserMenu {...args} />,
    args: {
        name: "Max Mustermann",
        role: "Editor",
        open: false,
        onOpenChange: fn(),
        children: <UserSettings />,
        onLogout: fn(),
    },
    argTypes: {
        placement: { control: "select", options: ["bottom-start", "bottom-end", "top-start", "top-end"] },
        children: { control: false },
        labels: { control: false },
        className: { control: false },
    },
} satisfies Meta<typeof UserMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The avatar at the end of the top bar. The settings are the app's own menu items: theme, density, interface language, keyboard
 * shortcuts. Settings apply immediately.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        canvas.getByRole("button", { name: "Account: Max Mustermann" }).focus();
        await userEvent.keyboard("{Enter}");
        await expect(args.onOpenChange).toHaveBeenLastCalledWith(true);
        const dark = await screen.findByRole("menuitemradio", { name: /Dark/ });
        await waitFor(() => expect(dark).toBeVisible());
        await userEvent.click(dark);
        await waitFor(() => expect(dark).toHaveAttribute("aria-checked", "true"));
        await waitFor(() => expect(screen.getByRole("menuitem", { name: /Log out/ })).toBeVisible());
        await userEvent.click(screen.getByRole("menuitem", { name: /Log out/ }));
        await expect(args.onLogout).toHaveBeenCalled();
    },
};

export const Open: Story = {
    args: {
        open: true,
    },
};

/**
 * Only who is signed in and the logout.
 */
export const WithoutSettings: Story = {
    args: {
        open: true,
        children: undefined,
    },
};
