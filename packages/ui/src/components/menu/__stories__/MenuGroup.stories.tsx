import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, fn, screen } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { Menu } from "../Menu";
import menuTokens from "../Menu.tokens.scss?raw";
import { MenuGroup } from "../MenuGroup";
import { MenuItem } from "../MenuItem";
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
    component: MenuGroup,
    title: "Building blocks/Menus & messages/MenuGroup",
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
        label: "3 items",
        children: (
            <>
                <MenuItem label="Move to …" icon={<Icon name="folder" />} onClick={fn()} />
                <MenuItem label="Download" icon={<Icon name="download" />} onClick={fn()} />
            </>
        ),
    },
    argTypes: {
        children: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof MenuGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The label says what the items act on, e.g. the selection or the row, as a mono uppercase heading.
 */
export const Default: Story = {
    play: async () => {
        await expect(await screen.findByRole("group", { name: "3 items" })).toBeInTheDocument();
    },
};
