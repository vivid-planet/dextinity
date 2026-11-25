import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { Menu } from "../Menu";
import { MenuItem } from "../MenuItem";
import { MenuSeparator } from "../MenuSeparator";
import styles from "./Menu.stories.module.scss";

const meta = {
    component: MenuSeparator,
    title: "Building blocks/Menus & messages/MenuSeparator",
    decorators: [
        themeDecorator,
        (Story) => (
            <div className={styles.stage}>
                <Story />
            </div>
        ),
    ],
    argTypes: {
        className: { control: false },
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
                <MenuItem label="Archive" icon={<Icon name="archive" />} onClick={fn()} />
                <MenuSeparator {...args} />
                <MenuItem label="Delete" icon={<Icon name="trash" />} color="error" onClick={fn()} />
            </Menu>
        );
    },
} satisfies Meta<typeof MenuSeparator>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Separates groups of items, e.g. destructive actions from the rest.
 */
export const Default: Story = {
    play: async () => {
        await expect(await screen.findByRole("separator")).toBeInTheDocument();
    },
};
