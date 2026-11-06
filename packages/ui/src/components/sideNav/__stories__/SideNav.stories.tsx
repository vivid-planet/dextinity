import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { ProductLogo, ProductSign } from "../../../storybook/ProductLogo";
import { themeDecorator } from "../../../storybook/themeDecorator";
import sideNavTokens from "../_tokens.scss?raw";
import { getSideNavAncestorIds, SideNav, type SideNavProps } from "../SideNav";
import styles from "./SideNav.stories.module.scss";
import { sideNavGroups } from "./sideNavStoryData";

function ControlledSideNav(props: SideNavProps) {
    const [activeId, setActiveId] = useState(props.activeId);
    const [expanded, setExpanded] = useState(props.expanded);
    const [collapsed, setCollapsed] = useState(props.collapsed ?? false);
    return (
        <SideNav
            {...props}
            activeId={activeId}
            expanded={expanded}
            onExpandedChange={(nextExpanded) => {
                setExpanded(nextExpanded);
                props.onExpandedChange(nextExpanded);
            }}
            onNavigate={(item, event) => {
                event.preventDefault();
                setActiveId(item.id);
                props.onNavigate(item, event);
            }}
            collapsed={collapsed}
            onCollapsedChange={
                props.onCollapsedChange == null
                    ? undefined
                    : (nextCollapsed) => {
                          setCollapsed(nextCollapsed);
                          props.onCollapsedChange?.(nextCollapsed);
                      }
            }
        />
    );
}

const meta = {
    component: SideNav,
    title: "Shell/Navigation/SideNav",
    decorators: [
        themeDecorator,
        (Story) => (
            <div className={styles.stage}>
                <Story />
            </div>
        ),
    ],
    parameters: { tokens: sideNavTokens, layout: "fullscreen" },
    render: (args) => <ControlledSideNav {...args} />,
    args: {
        logo: <ProductLogo />,
        logoMark: <ProductSign />,
        title: "Career portal",
        subtitle: "Example Ltd · Production",
        groups: sideNavGroups,
        activeId: "job-ads",
        expanded: getSideNavAncestorIds(sideNavGroups, "job-ads"),
        onExpandedChange: fn(),
        onNavigate: fn(),
        onCollapsedChange: fn(),
    },
    argTypes: {
        collapsed: { control: "boolean" },
        logo: { control: false },
        logoMark: { control: false },
        groups: { control: false },
        labels: { control: false },
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof SideNav>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * App header with logo, app name, and tenant, then groups with up to three levels. The active entry's ancestors start open, via
 * `getSideNavAncestorIds`.
 *
 * **Rules**
 *
 * - Up to three levels; long labels may wrap.
 * - Icons only on the first level.
 * - Open the active entry's ancestors automatically.
 * - Don't add a fourth level, repeat a label in different groups, or give an entry with sub-entries a target of its own.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const website = canvas.getByRole("button", { name: "Website" });
        await expect(website).toHaveAttribute("aria-expanded", "true");
        await expect(canvas.getByRole("link", { name: "Job ads" })).toHaveAttribute("aria-current", "page");

        await userEvent.click(canvas.getByRole("button", { name: "Structure" }));
        await waitFor(() => expect(args.onExpandedChange).toHaveBeenLastCalledWith(["website", "careers", "structure"]));
        await userEvent.click(canvas.getByRole("link", { name: "Main navigation" }));
        await waitFor(() => expect(args.onNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ id: "main-navigation" }), expect.anything()));
        await expect(canvas.getByRole("link", { name: "Main navigation" })).toHaveAttribute("aria-current", "page");
    },
};

/**
 * Only icons, each with its name as a tooltip; entries with sub-entries open them as a menu next to the rail.
 */
export const Collapsed: Story = {
    args: {
        collapsed: true,
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Website" }));
        const menu = await screen.findByRole("menu");
        await waitFor(() => expect(menu).toBeVisible());
        await userEvent.click(screen.getByRole("menuitem", { name: "Locations" }));
        await waitFor(() => expect(args.onNavigate).toHaveBeenLastCalledWith(expect.objectContaining({ id: "locations" }), expect.anything()));
        await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    },
};

/**
 * Without `onCollapsedChange`, the footer with the collapse button is left out.
 */
export const WithoutCollapse: Story = {
    args: {
        onCollapsedChange: undefined,
    },
};

/**
 * Closed sub-entries are out of the tab order; Enter or Space on an entry with sub-entries opens them.
 */
export const Keyboard: Story = {
    args: {
        activeId: "dashboard",
        expanded: [],
    },
    play: async ({ canvas }) => {
        const website = canvas.getByRole("button", { name: "Website" });
        canvas.getByRole("link", { name: "Overview" }).focus();
        await userEvent.tab();
        await expect(website).toHaveFocus();
        await userEvent.keyboard("{Enter}");
        await expect(website).toHaveAttribute("aria-expanded", "true");
        await userEvent.tab();
        await expect(canvas.getByRole("link", { name: "Page tree" })).toHaveFocus();
    },
};
