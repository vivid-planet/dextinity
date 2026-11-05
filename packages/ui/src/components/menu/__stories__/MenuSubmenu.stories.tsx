import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import menuTokens from "../_tokens.scss?raw";
import { Menu } from "../Menu";
import { MenuItem } from "../MenuItem";
import { MenuSubmenu, type MenuSubmenuProps } from "../MenuSubmenu";
import styles from "./Menu.stories.module.scss";

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

function ControlledSubmenu(props: MenuSubmenuProps) {
    const [open, setOpen] = useState(props.open);
    return (
        <MenuSubmenu
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
    component: MenuSubmenu,
    title: "Building blocks/Menus & messages/MenuSubmenu",
    decorators: [
        (Story) => (
            <InOpenMenu>
                <Story />
                <MenuItem label="Download" icon={<Icon name="download" />} onClick={fn()} />
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
    render: (args) => <ControlledSubmenu {...args} />,
    args: {
        label: "Move to",
        open: false,
        onOpenChange: fn(),
        icon: <Icon name="folder" />,
        children: (
            <>
                <MenuItem label="Images" icon={<Icon name="folder" />} onClick={fn()} />
                <MenuItem label="Documents" icon={<Icon name="folder" />} onClick={fn()} />
            </>
        ),
    },
    argTypes: {
        icon: { control: false },
        children: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof MenuSubmenu>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Opens on hover, click, Enter, or the arrow key towards it; the arrow key back closes it.
 *
 * **Rules**
 *
 * - One level of nesting at most.
 */
export const Default: Story = {
    play: async ({ args }) => {
        const trigger = await screen.findByRole("menuitem", { name: "Move to" });
        await userEvent.click(trigger);
        const nestedItem = await screen.findByRole("menuitem", { name: "Images" });
        await waitFor(() => expect(nestedItem).toBeVisible());
        await expect(args.onOpenChange).toHaveBeenCalledWith(true);
    },
};

export const Open: Story = {
    args: { open: true },
};

export const Disabled: Story = {
    args: { disabled: true },
};
