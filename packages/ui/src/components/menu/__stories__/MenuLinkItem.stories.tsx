import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { Menu } from "../Menu";
import menuTokens from "../Menu.tokens.scss?raw";
import { MenuLinkItem } from "../MenuLinkItem";
import styles from "./Menu.stories.module.scss";

const iconOptions = {
    PageTree: <Icon name="sitemap" />,
};

function InOpenMenu({ children }: { children: ReactNode }) {
    return (
        <Menu
            open
            onOpenChange={() => {}}
            trigger={
                <Button variant="outlined" color="secondary">
                    Go to
                </Button>
            }
        >
            {children}
        </Menu>
    );
}

const meta = {
    component: MenuLinkItem,
    title: "Building blocks/Menus & messages/MenuLinkItem",
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
        label: "Careers",
        href: "#careers",
        onClick: fn(),
    },
    argTypes: {
        icon: {
            control: "select",
            options: Object.keys(iconOptions),
            mapping: iconOptions,
        },
        className: { control: false },
        slotProps: { control: false },
        render: {
            control: false,
            description: "Replaces the rendered `<a>` element, e.g. with a router's link component, which receives the link's props.",
        },
    },
} satisfies Meta<typeof MenuLinkItem>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A link in a `Menu`: `onClick` navigates in place, e.g. with the router; a modifier key or the middle button opens `href` in a new
 * tab instead.
 */
export const Default: Story = {
    play: async ({ args }) => {
        const link = await screen.findByRole("menuitem", { name: "Careers" });
        await expect(link).toHaveAttribute("href", "#careers");

        let defaultPrevented: boolean | undefined;
        // Keeps the test page where it is, after the component has decided whether to cancel the click
        const keepPage = (event: MouseEvent) => {
            defaultPrevented = event.defaultPrevented;
            event.preventDefault();
        };
        link.ownerDocument.addEventListener("click", keepPage);
        try {
            link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, ctrlKey: true }));
        } finally {
            link.ownerDocument.removeEventListener("click", keepPage);
        }
        await expect(defaultPrevented).toBe(false);
        await expect(args.onClick).not.toHaveBeenCalled();

        await userEvent.click(link);
        await waitFor(() => expect(args.onClick).toHaveBeenCalledTimes(1));
    },
};

/**
 * `icon` comes before the label.
 */
export const WithIcon: Story = {
    args: { icon: <Icon name="sitemap" /> },
};
