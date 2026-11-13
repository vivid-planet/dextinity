import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, fn, screen } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { Menu } from "../Menu";
import menuTokens from "../Menu.tokens.scss?raw";
import { MenuItem } from "../MenuItem";
import { MenuSeparator } from "../MenuSeparator";
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

const meta = {
    component: MenuSeparator,
    title: "Building blocks/Menus & messages/MenuSeparator",
    decorators: [
        (Story) => (
            <InOpenMenu>
                <MenuItem label="Archive" icon={<Icon name="archive" />} onClick={fn()} />
                <Story />
                <MenuItem label="Delete" icon={<Icon name="trash" />} color="error" onClick={fn()} />
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
    argTypes: {
        className: { control: false },
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
