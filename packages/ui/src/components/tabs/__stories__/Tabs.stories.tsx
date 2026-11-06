import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ComponentPropsWithRef, useState } from "react";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Tabs, type TabsItem, type TabsProps } from "../Tabs";
import tabsTokens from "../Tabs.tokens.scss?raw";
import styles from "./Tabs.stories.module.scss";

const pageSections: TabsItem[] = [
    { value: "blocks", label: "Blocks" },
    { value: "seo", label: "SEO", count: 1 },
    { value: "settings", label: "Settings" },
];

const withPanels: TabsItem[] = [
    { value: "blocks", label: "Blocks", panel: <div className={styles.panel}>The page's blocks.</div> },
    { value: "seo", label: "SEO", count: 1, panel: <div className={styles.panel}>How the page appears in search results.</div> },
    { value: "settings", label: "Settings", panel: <div className={styles.panel}>Path, visibility, and access.</div> },
];

/** Keeps the story controlled: choosing updates the local value; the `value` arg sets the initial one. */
function ControlledTabs(props: TabsProps) {
    const [value, setValue] = useState(props.value);
    return (
        <Tabs
            {...props}
            value={value}
            onChange={(next) => {
                props.onChange(next);
                setValue(next);
            }}
        />
    );
}

const meta = {
    component: Tabs,
    title: "Building blocks/Selection & toggles/Tabs",
    decorators: [themeDecorator],
    parameters: { tokens: tabsTokens },
    args: {
        "aria-label": "Page",
        items: pageSections,
        value: "blocks",
        onChange: fn(),
    },
    argTypes: {
        items: { control: false },
        className: { control: false },
        slots: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <ControlledTabs {...args} />,
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Always controlled: `value` + `onChange`.
 * - Tabs for equal-ranking sections of one view, never for the steps of a flow.
 * - Name the tab list with `aria-label`.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("tab", { name: "Settings" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("settings"));
        await expect(canvas.getByRole("tab", { name: "Settings" })).toHaveAttribute("aria-selected", "true");
    },
};

/**
 * With `panel` on each item, the tabs render the active panel and link it to its tab.
 */
export const WithPanels: Story = {
    args: { items: withPanels },
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("tab", { name: "SEO 1" }));
        await waitFor(() => expect(canvas.getByRole("tabpanel")).toHaveTextContent("How the page appears in search results."));
    },
};

export const DisabledTab: Story = {
    args: { items: [...pageSections, { value: "history", label: "History", disabled: true }] },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("tab", { name: "History" }));
        await expect(args.onChange).not.toHaveBeenCalled();
    },
};

/**
 * Arrow keys move between tabs and activate them.
 */
export const Keyboard: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.tab();
        await expect(canvas.getByRole("tab", { name: "Blocks" })).toHaveFocus();
        await userEvent.keyboard("{ArrowRight}");
        await expect(canvas.getByRole("tab", { name: "SEO 1" })).toHaveFocus();
        await userEvent.keyboard("{Enter}");
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("seo"));
    },
};

/**
 * `tone="error"` marks the sections with invalid fields, e.g. after a failed save.
 */
export const WithErrors: Story = {
    args: {
        items: [
            { value: "blocks", label: "Blocks" },
            { value: "seo", label: "SEO", tone: "error" },
            { value: "settings", label: "Settings", tone: "error", count: 2 },
        ],
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("tab", { name: "SEO Contains errors" })).toHaveAttribute("data-tone", "error");
    },
};

/** Stands in for a router's link component: navigates on the client instead of loading the page. */
function StoryRouterLink({ onClick, ...props }: ComponentPropsWithRef<"a">) {
    return (
        <a
            {...props}
            onClick={(event) => {
                onClick?.(event);
                if (!event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
                    event.preventDefault();
                }
            }}
        />
    );
}

/**
 * With `href` on each item, the tabs are links: each section has its own address and opens in a new browser tab with a middle click
 * or ⌘-click. `slots.tab` renders them as the router's link component.
 */
export const AsLinks: Story = {
    args: {
        items: [
            { value: "blocks", label: "Blocks", href: "#blocks" },
            { value: "seo", label: "SEO", href: "#seo" },
            { value: "settings", label: "Settings", href: "#settings" },
        ],
        slots: { tab: StoryRouterLink },
    },
    play: async ({ args, canvas }) => {
        const seo = canvas.getByRole("tab", { name: "SEO" });
        await expect(seo).toHaveAttribute("href", "#seo");
        await userEvent.click(seo);
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("seo"));
        await expect(seo).toHaveAttribute("aria-selected", "true");
    },
};
