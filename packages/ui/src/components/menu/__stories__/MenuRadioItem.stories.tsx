import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { Menu } from "../Menu";
import { MenuRadioGroup } from "../MenuRadioGroup";
import { MenuRadioItem } from "../MenuRadioItem";
import styles from "./Menu.stories.module.scss";

const iconOptions = {
    Sun: <Icon name="sun" />,
    Moon: <Icon name="moon" />,
};

const meta = {
    component: MenuRadioItem,
    title: "Building blocks/Menus & messages/MenuRadioItem",
    decorators: [
        themeDecorator,
        (Story) => (
            <div className={styles.stage}>
                <Story />
            </div>
        ),
    ],
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
    render: (args) => {
        const [isMenuOpen, setIsMenuOpen] = useState(true);
        const [colorScheme, setColorScheme] = useState("dark");
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
                <MenuRadioGroup value={colorScheme} onChange={setColorScheme}>
                    <MenuRadioItem {...args} />
                    <MenuRadioItem value="light" label="Light" icon={<Icon name="sun" />} />
                </MenuRadioGroup>
            </Menu>
        );
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
    args: { icon: <Icon name="moon" /> },
};

export const Disabled: Story = {
    args: { icon: <Icon name="moon" />, disabled: true },
};
