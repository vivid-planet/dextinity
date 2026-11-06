import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { expect, screen } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { Menu } from "../Menu";
import menuTokens from "../Menu.tokens.scss?raw";
import { MenuRadioGroup } from "../MenuRadioGroup";
import { MenuRadioItem } from "../MenuRadioItem";
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

function InRadioGroup({ children }: { children: ReactNode }) {
    const [value, setValue] = useState("dark");
    return (
        <MenuRadioGroup value={value} onChange={setValue}>
            {children}
            <MenuRadioItem value="light" label="Light" icon={<Icon name="light-mode" />} />
        </MenuRadioGroup>
    );
}

const iconOptions = {
    Sun: <Icon name="light-mode" />,
    Moon: <Icon name="dark-mode" />,
};

const meta = {
    component: MenuRadioItem,
    title: "Building blocks/Menus & messages/MenuRadioItem",
    decorators: [
        (Story) => (
            <InOpenMenu>
                <InRadioGroup>
                    <Story />
                </InRadioGroup>
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
        value: "dark",
        label: "Dark",
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
} satisfies Meta<typeof MenuRadioItem>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * An option of a `MenuRadioGroup`; checked when its `value` is the group's value.
 */
export const Default: Story = {
    play: async () => {
        await expect(await screen.findByRole("menuitemradio", { name: "Dark" })).toHaveAttribute("aria-checked", "true");
    },
};

export const WithIcon: Story = {
    args: { icon: <Icon name="dark-mode" /> },
};

export const Disabled: Story = {
    args: { icon: <Icon name="dark-mode" />, disabled: true },
};
