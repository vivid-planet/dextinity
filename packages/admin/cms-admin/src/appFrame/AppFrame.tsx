import { MasterLayoutContext, useStoredState } from "@dextinity/admin";
import {
    AppShell,
    type CommandPaletteItem,
    Icon,
    SideNav,
    Theme,
    type ThemeBrand,
    type ThemeColorScheme,
    type ThemeDensity,
    TopBar,
} from "@dextinity/ui";
import { CssBaseline, GlobalStyles } from "@mui/material";
import { type AnchorHTMLAttributes, forwardRef, type MouseEvent, type PropsWithChildren, type ReactNode, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";

import type { MasterMenuData } from "../common/MasterMenu";
import { AppToastsProvider } from "../common/toasts/AppToasts";
import { AppFrameAboutDialog } from "./AppFrameAboutDialog";
import { AppFrameCommandPalette } from "./AppFrameCommandPalette";
import { AppFrameErrorDialog } from "./AppFrameErrorDialog";
import { AppFrameRouterConfirmationDialog } from "./AppFrameRouterConfirmationDialog";
import { type AppFrameScopeDimensionLabels, AppFrameScopeSwitcher } from "./AppFrameScopeSwitcher";
import { AppFrameUserMenu } from "./AppFrameUserMenu";
import { useAppFrameMenu } from "./useAppFrameMenu";

// Where sticky MUI toolbars of existing pages stop: below the floating top bar
const topBarBottomOffset = 84;
// Full-height MUI pages fill the viewport below their top offset, which leaves out the shell's padding below the content
const shellContentBottomPadding = 48;

export interface AppFrameAiAssistant {
    /** The assistant, usually an `AIPanel` from `@dextinity/ui`. */
    panel: ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface AppFrameProps {
    /** The navigation, the same data `MasterMenu` and `MasterMenuRoutes` take. Entries the user has no permission for are left out. */
    menu: MasterMenuData;
    /** The app name, shown in the navigation below the logo. */
    title: string;
    /** Tenant and environment, shown small below the app name. */
    subtitle?: string;
    /** The product's logo, shown in the navigation and in the About dialog. */
    logo?: ReactNode;
    /** The product's sign, shown instead of the logo while the navigation is collapsed. */
    logoMark?: ReactNode;
    colorScheme: ThemeColorScheme;
    onColorSchemeChange: (colorScheme: ThemeColorScheme) => void;
    density: ThemeDensity;
    onDensityChange: (density: ThemeDensity) => void;
    brand?: ThemeBrand | (string & {});
    /** Shows the AI assistant toggle in the top bar and the assistant next to the content. */
    aiAssistant?: AppFrameAiAssistant;
    /** Names of the content scope dimensions in the scope switcher, e.g. `{ domain: "Site" }`. Defaults to the capitalized key. */
    scopeDimensionLabels?: AppFrameScopeDimensionLabels;
    /** Further entries of the user menu, e.g. `MenuItem`s from `@dextinity/ui`. */
    userMenuItems?: ReactNode;
    /** App-wide status and actions in the top bar, before the scope switcher, e.g. `BuildEntry`. */
    topBarActions?: ReactNode;
}

const NavLink = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement>>(function NavLink({ children, ...props }, ref) {
    const isExternal = props.href != null && /^[a-z][a-z\d+.-]*:/i.test(props.href);
    return (
        <a {...props} ref={ref} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noopener noreferrer" : undefined}>
            {children}
        </a>
    );
});

function isModifiedClick(event: MouseEvent<HTMLElement>) {
    return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

/**
 * The admin's frame built on `@dextinity/ui`: navigation from the menu data, top bar with search, scope, and user menu, and the
 * command palette (⌘K). Wrap the routes with it, inside `ContentScopeProvider`.
 *
 * It also shows the app-wide feedback with `@dextinity/ui`: toasts (`useShowAppToast`), the errors of `useErrorDialog` and
 * `createErrorDialogApolloLink` (replacing `ErrorDialogHandler`), and the unsaved-changes dialog of `RouterPrompt`s.
 */
export function AppFrame({
    menu,
    title,
    subtitle,
    logo,
    logoMark,
    colorScheme,
    onColorSchemeChange,
    density,
    onDensityChange,
    brand = "dextinity",
    aiAssistant,
    scopeDimensionLabels,
    userMenuItems,
    topBarActions,
    children,
}: PropsWithChildren<AppFrameProps>) {
    const intl = useIntl();
    const history = useHistory();
    const { groups, entries, activeId, activeAncestorIds } = useAppFrameMenu(
        menu,
        intl.formatMessage({ id: "dextinity.appFrame.navigation.mainGroup", defaultMessage: "Menu" }),
    );
    const [expanded, setExpanded] = useState(activeAncestorIds);
    const [navCollapsed, setNavCollapsed] = useStoredState<boolean>("dextinity-app-frame-nav-collapsed", false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [aboutDialogOpen, setAboutDialogOpen] = useState(false);

    const activeAncestorKey = activeAncestorIds.join(" ");
    useEffect(() => {
        const ancestorIds = activeAncestorKey.split(" ").filter(Boolean);
        setExpanded((current) => [...current, ...ancestorIds.filter((id) => !current.includes(id))]);
    }, [activeAncestorKey]);

    const commands: CommandPaletteItem[] = [
        {
            id: "toggle-navigation",
            label: navCollapsed
                ? intl.formatMessage({ id: "dextinity.appFrame.command.expandNavigation", defaultMessage: "Expand navigation" })
                : intl.formatMessage({ id: "dextinity.appFrame.command.collapseNavigation", defaultMessage: "Collapse navigation" }),
            icon: <Icon name={navCollapsed ? "pin-right" : "pin-left"} />,
            shortcut: "mod+\\",
            onSelect: () => setNavCollapsed(!navCollapsed),
        },
        {
            id: "toggle-color-scheme",
            label:
                colorScheme === "light"
                    ? intl.formatMessage({ id: "dextinity.appFrame.command.darkColorScheme", defaultMessage: "Switch to dark theme" })
                    : intl.formatMessage({ id: "dextinity.appFrame.command.lightColorScheme", defaultMessage: "Switch to light theme" }),
            icon: <Icon name={colorScheme === "light" ? "moon" : "sun"} />,
            onSelect: () => onColorSchemeChange(colorScheme === "light" ? "dark" : "light"),
        },
    ];
    if (aiAssistant) {
        commands.push({
            id: "toggle-ai-assistant",
            label: intl.formatMessage({ id: "dextinity.appFrame.command.toggleAiAssistant", defaultMessage: "Toggle AI assistant" }),
            icon: <Icon name="magic-wand" />,
            shortcut: "mod+j",
            onSelect: () => aiAssistant.onOpenChange(!aiAssistant.open),
        });
    }

    return (
        <MasterLayoutContext.Provider value={{ headerHeight: topBarBottomOffset }}>
            <CssBaseline />
            <GlobalStyles styles={{ ".DextinityAdminMainContent-fullHeight": { marginBottom: -shellContentBottomPadding } }} />
            <Theme colorScheme={colorScheme} brand={brand} density={density}>
                <AppToastsProvider>
                    <AppShell
                        navCollapsed={navCollapsed}
                        onNavCollapsedChange={setNavCollapsed}
                        aiPanel={aiAssistant?.panel}
                        aiOpen={aiAssistant?.open}
                        onAiOpenChange={aiAssistant?.onOpenChange}
                        labels={{
                            navigation: intl.formatMessage({ id: "dextinity.appFrame.navigation", defaultMessage: "Navigation" }),
                            ai: intl.formatMessage({ id: "dextinity.appFrame.aiAssistant", defaultMessage: "AI assistant" }),
                        }}
                        nav={
                            <SideNav
                                logo={logo}
                                logoMark={logoMark}
                                title={title}
                                subtitle={subtitle}
                                groups={groups}
                                activeId={activeId}
                                expanded={expanded}
                                onExpandedChange={setExpanded}
                                onNavigate={(item, event) => {
                                    const isInternal = entries.some((entry) => entry.item === item && !entry.external);
                                    if (isInternal && item.href != null && !isModifiedClick(event)) {
                                        event.preventDefault();
                                        history.push(item.href);
                                    }
                                }}
                                slots={{ link: NavLink }}
                                labels={{
                                    navigation: intl.formatMessage({ id: "dextinity.appFrame.navigation.main", defaultMessage: "Main navigation" }),
                                    collapse: intl.formatMessage({ id: "dextinity.appFrame.navigation.collapse", defaultMessage: "Collapse" }),
                                    expand: intl.formatMessage({ id: "dextinity.appFrame.navigation.expand", defaultMessage: "Expand" }),
                                }}
                            />
                        }
                        topBar={
                            <TopBar
                                onSearchClick={() => setCommandPaletteOpen(true)}
                                scope={
                                    <>
                                        {topBarActions}
                                        <AppFrameScopeSwitcher dimensionLabels={scopeDimensionLabels} />
                                    </>
                                }
                                aiOpen={aiAssistant?.open}
                                onAiOpenChange={aiAssistant?.onOpenChange}
                                userMenu={
                                    <AppFrameUserMenu
                                        colorScheme={colorScheme}
                                        onColorSchemeChange={onColorSchemeChange}
                                        density={density}
                                        onDensityChange={onDensityChange}
                                        onAboutClick={() => setAboutDialogOpen(true)}
                                    >
                                        {userMenuItems}
                                    </AppFrameUserMenu>
                                }
                                labels={{
                                    search: intl.formatMessage({ id: "dextinity.appFrame.topBar.search", defaultMessage: "Search, jump to …" }),
                                    ai: intl.formatMessage({ id: "dextinity.appFrame.aiAssistant", defaultMessage: "AI assistant" }),
                                    menu: intl.formatMessage({ id: "dextinity.appFrame.topBar.menu", defaultMessage: "Open navigation" }),
                                }}
                            />
                        }
                    >
                        {children}
                    </AppShell>
                    <AppFrameCommandPalette
                        open={commandPaletteOpen}
                        onOpenChange={setCommandPaletteOpen}
                        menuEntries={entries}
                        commands={commands}
                    />
                    <AppFrameAboutDialog open={aboutDialogOpen} onOpenChange={setAboutDialogOpen} logo={logo} />
                    <AppFrameErrorDialog />
                    <AppFrameRouterConfirmationDialog />
                </AppToastsProvider>
            </Theme>
        </MasterLayoutContext.Provider>
    );
}
