import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import { ProductLogo, ProductSign } from "../../../storybook/ProductLogo";
import { useControlledArg } from "../../../storybook/storyArgs";
import { StoryAssistant } from "../../../storybook/StoryAssistant";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { AiAssistantSwitch } from "../../aiAssistantSwitch/AiAssistantSwitch";
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
import { AppShell } from "../AppShell";
import appShellTokens from "../AppShell.tokens.scss?raw";
import styles from "./AppShell.stories.module.scss";

function StoryNav() {
    const [currentId, setCurrentId] = useState("job-ads");
    const [expandedIds, setExpandedIds] = useState(getSideNavAncestorIds(sideNavGroups, "job-ads"));
    return (
        <SideNav
            logo={<ProductLogo />}
            logoMark={<ProductSign />}
            groups={sideNavGroups}
            currentId={currentId}
            expandedIds={expandedIds}
            onExpandedIdsChange={setExpandedIds}
            onNavigate={(item, event) => {
                event.preventDefault();
                setCurrentId(item.id);
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

const meta = {
    component: AppShell,
    title: "Shell/App frame/AppShell",
    decorators: [themeDecorator],
    parameters: { tokens: appShellTokens, layout: "fullscreen" },
    render: (args, context) => {
        const [navCollapsed, setNavCollapsed] = useControlledArg(args, "navCollapsed", context);
        const [assistantOpen, setAssistantOpen] = useControlledArg(args, "assistantOpen", context);
        const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
        const changeAssistantOpen = (open: boolean) => {
            setAssistantOpen(open);
            args.onAssistantOpenChange?.(open);
        };
        const [query, setQuery] = useState("");
        return (
            <>
                <AppShell
                    {...args}
                    nav={<StoryNav />}
                    topBar={
                        <TopBar
                            onSearchClick={() => setCommandPaletteOpen(true)}
                            scope={<StoryScopeSwitcher />}
                            assistantSwitch={args.assistant != null ? <AiAssistantSwitch /> : undefined}
                            userMenu={<StoryUserMenu />}
                        />
                    }
                    navCollapsed={navCollapsed}
                    onNavCollapsedChange={(collapsed) => {
                        setNavCollapsed(collapsed);
                        args.onNavCollapsedChange(collapsed);
                    }}
                    assistant={
                        args.assistant != null ? (
                            <StoryAssistant closeKeyboardShortcut="mod+j" onClose={() => changeAssistantOpen(false)} />
                        ) : undefined
                    }
                    assistantOpen={assistantOpen}
                    onAssistantOpenChange={changeAssistantOpen}
                >
                    {args.children ?? <StoryPage />}
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
                                    keyboardShortcut: "mod+\\",
                                    onSelect: () => setNavCollapsed(!navCollapsed),
                                },
                                ...(args.assistant != null
                                    ? [
                                          {
                                              id: "assistant",
                                              label: "Open AI assistant",
                                              icon: <Icon name="spark" />,
                                              keyboardShortcut: "mod+j",
                                              onSelect: () => changeAssistantOpen(true),
                                          },
                                      ]
                                    : []),
                            ],
                        },
                    ]}
                />
            </>
        );
    },
    args: {
        nav: null,
        topBar: null,
        children: null,
        navCollapsed: false,
        onNavCollapsedChange: fn(),
        assistantOpen: false,
        onAssistantOpenChange: fn(),
    },
    argTypes: {
        navCollapsed: { control: "boolean" },
        assistantOpen: { control: "boolean" },
        assistant: {
            control: "select",
            options: ["Chat"],
            mapping: { Chat: <StoryAssistant closeKeyboardShortcut="mod+j" /> },
        },
        environment: {
            control: "select",
            options: ["Development", "Test", "Staging", "Pre-live"],
            mapping: {
                Development: { label: "Dev", color: "info" },
                Test: { label: "Test", color: "success" },
                Staging: { label: "Staging", color: "warning" },
                "Pre-live": { label: "Pre-live", color: "error" },
            },
        },
        disableKeyboardShortcuts: { control: "boolean" },
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
 * Navigation, top bar, and content. From 1280px the navigation is open or collapsed; from 768px it shows icons and expands over the
 * content; below, it is a drawer behind the menu button. ⌘\ collapses or expands the navigation, ⌘K opens the search.
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

/**
 * `assistant` adds the AI assistant as a third column: the page gets narrower, nothing is covered. The `AiAssistantSwitch` in the top
 * bar and ⌘J / Ctrl+J show and hide it; focus moves into its composer, and Escape returns it to the switch. The assistant stays
 * mounted while hidden, so the conversation is kept. On narrow windows it opens as a bottom sheet.
 *
 * **Rules**
 *
 * - Leave out `assistant` and the switch for users without the right to use the assistant.
 * - Keep the open state when the user navigates between pages.
 * - The assistant's header names what it works on: the page and the scope.
 */
export const WithAssistant: Story = {
    args: {
        assistant: <StoryAssistant closeKeyboardShortcut="mod+j" />,
        assistantOpen: true,
    },
    play: async ({ args }) => {
        const assistantSwitch = screen.getByRole("switch", { name: "AI assistant" });
        await expect(assistantSwitch).toHaveAttribute("aria-checked", "true");
        const composer = screen.getByRole("textbox", { name: "Message to the AI assistant" });
        await waitFor(() => expect(composer).toHaveFocus());

        await userEvent.keyboard("{Escape}");
        await waitFor(() => expect(args.onAssistantOpenChange).toHaveBeenLastCalledWith(false));
        await waitFor(() => expect(assistantSwitch).toHaveFocus());
        await expect(assistantSwitch).toHaveAttribute("aria-checked", "false");

        await userEvent.click(assistantSwitch);
        await waitFor(() => expect(composer).toHaveFocus());
        await userEvent.click(screen.getByRole("button", { name: "Close" }));
        await waitFor(() => expect(assistantSwitch).toHaveFocus());
        await expect(assistantSwitch).toHaveAttribute("aria-checked", "false");
    },
};

export const WithAssistantNavCollapsed: Story = {
    args: {
        navCollapsed: true,
        assistant: <StoryAssistant closeKeyboardShortcut="mod+j" />,
        assistantOpen: true,
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

/**
 * `environment` marks an instance other than the live system, e.g. Staging: a line in its color along the top edge, which is seen on
 * every page, and its label in the top right corner of the navigation. Collapsed, the label shows only its first letter; on narrow
 * windows, where the navigation is a drawer, the top bar shows it.
 *
 * **Rules**
 *
 * - Leave out `environment` on the live system: whatever isn't marked is live.
 * - The warmer the color, the closer the instance is to the live system: `info` for development, `success` for test, `warning` for
 *   staging, `error` for pre-live.
 * - Name the instance as the team calls it, short: "Dev", "Test", "Staging", "Pre-live", "QA".
 */
export const WithEnvironment: Story = {
    args: {
        environment: { label: "Staging", color: "warning" },
    },
    play: async ({ canvas }) => {
        await expect(within(canvas.getByRole("navigation", { name: "Main navigation" })).getByText("Staging")).toBeVisible();
    },
};

export const WithEnvironmentNavCollapsed: Story = {
    args: {
        navCollapsed: true,
        environment: { label: "Pre-live", color: "error" },
    },
    play: async ({ canvas }) => {
        const label = within(canvas.getByRole("navigation", { name: "Main navigation" })).getByText("Pre-live").parentElement;
        await userEvent.hover(label as HTMLElement);
        await expect(await screen.findByRole("tooltip")).toHaveTextContent("Pre-live");
    },
};
