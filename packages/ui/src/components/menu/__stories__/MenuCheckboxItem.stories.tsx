import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ElementType, type ReactNode, useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import menuTokens from "../_tokens.scss?raw";
import { Menu } from "../Menu";
import { MenuCheckboxItem, type MenuCheckboxItemProps } from "../MenuCheckboxItem";
import styles from "./Menu.stories.module.scss";

function InOpenMenu({ children }: { children: ReactNode }) {
    return (
        <Menu
            open
            onOpenChange={() => {}}
            trigger={
                <Button variant="outlined" color="secondary">
                    Columns
                </Button>
            }
        >
            {children}
        </Menu>
    );
}

function ControlledMenuCheckboxItem(props: MenuCheckboxItemProps<ElementType>) {
    const [checked, setChecked] = useState(props.checked);
    return (
        <MenuCheckboxItem
            {...props}
            checked={checked}
            onChange={(nextChecked) => {
                props.onChange(nextChecked);
                setChecked(nextChecked);
            }}
        />
    );
}

const iconOptions = {
    Globe: <Icon name="domain" />,
    Eye: <Icon name="visible" />,
};

const meta = {
    component: MenuCheckboxItem,
    title: "Building blocks/Menus & messages/MenuCheckboxItem",
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
        label: "Location",
        checked: true,
        onChange: fn(),
    },
    argTypes: {
        icon: {
            control: "select",
            options: Object.keys(iconOptions),
            mapping: iconOptions,
        },
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <ControlledMenuCheckboxItem {...args} />,
} satisfies Meta<typeof MenuCheckboxItem>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Switches an option on and off; the menu stays open, so several options can be switched in a row.
 */
export const Default: Story = {
    play: async ({ args }) => {
        const item = await screen.findByRole("menuitemcheckbox", { name: "Location" });
        await expect(item).toHaveAttribute("aria-checked", "true");

        await userEvent.click(item);
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(false));
        await expect(item).toHaveAttribute("aria-checked", "false");
        await expect(screen.getByRole("menu")).toBeVisible();
    },
};

export const Unchecked: Story = {
    args: { checked: false },
};

export const WithIcon: Story = {
    args: { icon: <Icon name="domain" /> },
};

export const Disabled: Story = {
    args: { disabled: true },
};
