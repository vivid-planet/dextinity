import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { ProductLogo, ProductSign } from "../../../storybook/ProductLogo";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { CommandPalette } from "../../commandPalette/CommandPalette";
import { Icon } from "../../icon/Icon";
import { PageHeader } from "../../pageHeader/PageHeader";
import { Panel } from "../../panel/Panel";
import { SaveState } from "../../saveState/SaveState";
import { sideNavGroups } from "../../sideNav/__stories__/sideNavStoryData";
import { getSideNavAncestorIds, SideNav } from "../../sideNav/SideNav";
import { StoryScopeSwitcher, StoryUserMenu } from "../../topBar/__stories__/topBarStoryParts";
import { TopBar } from "../../topBar/TopBar";
import { AppShell, type AppShellProps } from "../AppShell";
import appShellTokens from "../AppShell.tokens.scss?raw";
import styles from "./AppShell.stories.module.scss";

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
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [query, setQuery] = useState("");
    return (
        <>
            <AppShell
                {...props}
                nav={<StoryNav />}
                topBar={<TopBar onSearchClick={() => setCommandPaletteOpen(true)} scope={<StoryScopeSwitcher />} userMenu={<StoryUserMenu />} />}
                navCollapsed={navCollapsed}
                onNavCollapsedChange={(collapsed) => {
                    setNavCollapsed(collapsed);
                    props.onNavCollapsedChange(collapsed);
                }}
            >
                {props.children ?? <StoryPage />}
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
                                id: "nav",
                                label: "Collapse navigation",
                                icon: <Icon name="pin-left" />,
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
    },
    argTypes: {
        navCollapsed: { control: "boolean" },
        disableShortcuts: { control: "boolean" },
        nav: { control: false },
        topBar: { control: false },
        children: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof AppShell>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Navigation, top bar, and content. From 1280px the navigation is open or collapsed; from 768px it shows icons; below, it is a drawer
 * behind the menu button. ⌘\ collapses the navigation, ⌘K opens the search.
 *
 * **Rules**
 *
 * - The shell stays in place when the page changes.
 * - Scope and language only in the top bar; the app name only in the navigation.
 * - Don't build a top bar per screen, and don't color apps differently: only the logo differs.
 */
export const Default: Story = {
    play: async () => {
        await userEvent.click(screen.getByRole("button", { name: "Search, jump, create …" }));
        const input = await screen.findByRole("combobox", { name: "Search, jump, create …" });
        await waitFor(() => expect(input).toHaveFocus());
        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(screen.queryByRole("combobox")).toBeNull());
    },
};

export const NavCollapsed: Story = {
    args: {
        navCollapsed: true,
    },
};

/** An editor: its page header leads back and holds the save state and Save; the top bar stays as it is. */
function StoryEditPage({ onBack }: { onBack: () => void }) {
    const [saved, setSaved] = useState(false);
    return (
        <div className={styles.editPage}>
            <PageHeader
                variant="compact"
                back={{ label: "Back to job ads", onClick: onBack }}
                eyebrow="Job ad · Austria · German"
                title="Frontend developer"
                actions={
                    <>
                        <SaveState state={saved ? "saved" : "dirty"} />
                        <Button startIcon={<Icon name="check" />} disabled={saved} onClick={() => setSaved(true)}>
                            Save
                        </Button>
                    </>
                }
            />
            <Panel title="Job ad">
                <p className={styles.placeholder}>The fields of the job ad</p>
            </Panel>
        </div>
    );
}

function StoryEditFlow() {
    const [editing, setEditing] = useState(false);
    return editing ? (
        <StoryEditPage onBack={() => setEditing(false)} />
    ) : (
        <PageHeader title="Job ads" actions={<Button onClick={() => setEditing(true)}>Edit “Frontend developer”</Button>} />
    );
}

/**
 * An edit page puts back, what is edited, and Save in its `PageHeader`. The top bar keeps search, scope, and user menu on every page.
 */
export const EditingPage: Story = {
    args: { children: <StoryEditFlow /> },
    play: async ({ canvasElement }) => {
        await userEvent.click(screen.getByRole("button", { name: "Edit “Frontend developer”" }));
        await expect(await screen.findByRole("heading", { level: 1, name: "Frontend developer" })).toBeInTheDocument();
        const bar = canvasElement.querySelector(".dextinityTopBar");
        await expect(bar).toContainElement(screen.getByRole("button", { name: "Search, jump, create …" }));
        await userEvent.click(screen.getByRole("button", { name: "Save" }));
        await expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
        await userEvent.click(screen.getByRole("button", { name: "Back to job ads" }));
        await expect(await screen.findByRole("heading", { level: 1, name: "Job ads" })).toBeInTheDocument();
    },
};
