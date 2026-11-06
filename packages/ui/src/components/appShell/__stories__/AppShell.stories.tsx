import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { ProductLogo, ProductSign } from "../../../storybook/ProductLogo";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { AIPanel, type AIPanelMessage } from "../../aiPanel/AIPanel";
import { CommandPalette } from "../../commandPalette/CommandPalette";
import { Icon } from "../../icon/Icon";
import { PageHeader } from "../../pageHeader/PageHeader";
import { Panel } from "../../panel/Panel";
import { sideNavGroups } from "../../sideNav/__stories__/sideNavStoryData";
import { getSideNavAncestorIds, SideNav } from "../../sideNav/SideNav";
import { StoryScopeSwitcher, StoryUserMenu } from "../../topBar/__stories__/topBarStoryParts";
import { TopBar } from "../../topBar/TopBar";
import appShellTokens from "../_tokens.scss?raw";
import { AppShell, type AppShellProps } from "../AppShell";
import styles from "./AppShell.stories.module.scss";

const greeting: AIPanelMessage = {
    id: "greeting",
    role: "assistant",
    content: "Hello Max. I know the content of the career portal in the scope Austria · German. Ask me something or pick a suggestion.",
};

function StoryNav() {
    const [activeId, setActiveId] = useState("job-ads");
    const [expanded, setExpanded] = useState(getSideNavAncestorIds(sideNavGroups, "job-ads"));
    return (
        <SideNav
            logo={<ProductLogo />}
            logoMark={<ProductSign />}
            title="Career portal"
            subtitle="Example Ltd · Production"
            groups={sideNavGroups}
            activeId={activeId}
            expanded={expanded}
            onExpandedChange={setExpanded}
            onNavigate={(item, event) => {
                event.preventDefault();
                setActiveId(item.id);
            }}
        />
    );
}

function StoryAIPanel({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [value, setValue] = useState("");
    const [messages, setMessages] = useState([greeting]);
    return (
        <AIPanel
            open={open}
            onOpenChange={onOpenChange}
            context="Job ads · Austria · German"
            messages={messages}
            suggestions={[
                { label: "What expires this week?", prompt: "Which job ads expire this week?" },
                { label: "Find drafts", prompt: "Which job ads are still drafts?" },
            ]}
            value={value}
            onValueChange={setValue}
            onSend={(prompt) => {
                setMessages((current) => [...current, { id: `${current.length}`, role: "user", content: prompt }]);
                setValue("");
            }}
        />
    );
}

function StoryPage() {
    return (
        <>
            <PageHeader eyebrow="Content · Careers" title="Job ads" subtitle="All job ads in the scope Austria · German." />
            <div className={styles.panels}>
                <Panel title="Open positions" description="The frame around this page is the shell: light fields behind, glass above.">
                    <p className={styles.placeholder}>Page content</p>
                </Panel>
                <Panel title="Recently edited">
                    <p className={styles.placeholder}>Page content</p>
                </Panel>
            </div>
        </>
    );
}

function ControlledAppShell(props: AppShellProps) {
    const [navCollapsed, setNavCollapsed] = useState(props.navCollapsed);
    const [aiOpen, setAiOpen] = useState(props.aiOpen ?? false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [query, setQuery] = useState("");
    function changeAiOpen(open: boolean) {
        setAiOpen(open);
        props.onAiOpenChange?.(open);
    }
    return (
        <>
            <AppShell
                {...props}
                nav={<StoryNav />}
                topBar={
                    <TopBar
                        onSearchClick={() => setCommandPaletteOpen(true)}
                        scope={<StoryScopeSwitcher />}
                        aiOpen={aiOpen}
                        onAiOpenChange={changeAiOpen}
                        userMenu={<StoryUserMenu />}
                    />
                }
                aiPanel={<StoryAIPanel open={aiOpen} onOpenChange={changeAiOpen} />}
                aiOpen={aiOpen}
                onAiOpenChange={changeAiOpen}
                navCollapsed={navCollapsed}
                onNavCollapsedChange={(collapsed) => {
                    setNavCollapsed(collapsed);
                    props.onNavCollapsedChange(collapsed);
                }}
            >
                <StoryPage />
            </AppShell>
            <CommandPalette
                open={commandPaletteOpen}
                onOpenChange={setCommandPaletteOpen}
                query={query}
                onQueryChange={setQuery}
                groups={[
                    {
                        label: "Commands",
                        items: [
                            {
                                id: "ai",
                                label: "Toggle AI assistant",
                                icon: <Icon name="sparkle" />,
                                shortcut: "⌘J",
                                onSelect: () => changeAiOpen(!aiOpen),
                            },
                            {
                                id: "nav",
                                label: "Collapse navigation",
                                icon: <Icon name="sidebar-close" />,
                                shortcut: "⌘\\",
                                onSelect: () => setNavCollapsed(!navCollapsed),
                            },
                        ],
                    },
                ]}
            />
        </>
    );
}

const meta = {
    component: AppShell,
    title: "Shell/App frame/AppShell",
    decorators: [themeDecorator],
    parameters: { tokens: appShellTokens, layout: "fullscreen" },
    render: (args) => <ControlledAppShell {...args} />,
    args: {
        nav: null,
        topBar: null,
        children: null,
        navCollapsed: false,
        onNavCollapsedChange: fn(),
        onAiOpenChange: fn(),
    },
    argTypes: {
        aiOpen: { control: "boolean" },
        navCollapsed: { control: "boolean" },
        disableShortcuts: { control: "boolean" },
        nav: { control: false },
        topBar: { control: false },
        children: { control: false },
        aiPanel: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof AppShell>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Navigation, top bar, content, and AI assistant. From 1280px the navigation is open or collapsed and the assistant sits next to the
 * content; from 768px the navigation shows icons and the assistant lies over the content; below, the navigation is a drawer behind the
 * menu button and the assistant a sheet from the bottom. ⌘\ collapses the navigation, ⌘J toggles the assistant, ⌘K opens the search.
 *
 * **Rules**
 *
 * - The shell stays in place when the page changes.
 * - Scope and language only in the top bar; the app name only in the navigation.
 * - Don't build a top bar per screen, and don't color apps differently: only the logo differs.
 */
export const Default: Story = {
    play: async ({ args }) => {
        await userEvent.keyboard("{Control>}j{/Control}");
        await expect(args.onAiOpenChange).toHaveBeenLastCalledWith(true);
        await waitFor(() => expect(screen.getByRole("complementary", { name: "AI assistant" })).toBeVisible());
        await userEvent.click(screen.getByRole("button", { name: "Close AI assistant" }));
        await expect(args.onAiOpenChange).toHaveBeenLastCalledWith(false);
    },
};

export const AiOpen: Story = {
    args: {
        aiOpen: true,
    },
};

export const NavCollapsed: Story = {
    args: {
        navCollapsed: true,
    },
};
