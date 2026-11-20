import { type PropsWithChildren, type ReactNode, useState } from "react";

import { AiAssistantSwitch } from "../../components/aiAssistantSwitch/AiAssistantSwitch";
import { AppShell } from "../../components/appShell/AppShell";
import { sideNavGroups } from "../../components/sideNav/__stories__/sideNavStoryData";
import { getSideNavAncestorIds, SideNav } from "../../components/sideNav/SideNav";
import { StoryScopeSwitcher, StoryUserMenu } from "../../components/topBar/__stories__/topBarStoryParts";
import { TopBar } from "../../components/topBar/TopBar";
import { ProductLogo, ProductSign } from "../ProductLogo";
import { StoryAssistant } from "../StoryAssistant";
import styles from "./PageTypeShell.module.scss";

function ShellNav({ initialCurrentId }: { initialCurrentId: string }) {
    const [currentId, setCurrentId] = useState(initialCurrentId);
    const [expandedIds, setExpandedIds] = useState(getSideNavAncestorIds(sideNavGroups, initialCurrentId));
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

export interface PageTypeShellProps {
    /** The navigation item of the page, e.g. `job-ads`. */
    currentId: string;
    /** Content above the top bar's page, e.g. a dialog. */
    overlay?: ReactNode;
}

/**
 * A page type's live example: the page inside the app frame with navigation, top bar, scope, and the AI assistant.
 */
export function PageTypeShell({ currentId, overlay, children }: PropsWithChildren<PageTypeShellProps>) {
    const [navCollapsed, setNavCollapsed] = useState(false);
    const [assistantOpen, setAssistantOpen] = useState(false);
    return (
        <>
            <AppShell
                nav={<ShellNav initialCurrentId={currentId} />}
                topBar={
                    <TopBar
                        onSearchClick={() => undefined}
                        scope={<StoryScopeSwitcher />}
                        assistantSwitch={<AiAssistantSwitch />}
                        userMenu={<StoryUserMenu />}
                    />
                }
                assistant={<StoryAssistant onClose={() => setAssistantOpen(false)} />}
                assistantOpen={assistantOpen}
                onAssistantOpenChange={setAssistantOpen}
                navCollapsed={navCollapsed}
                onNavCollapsedChange={setNavCollapsed}
                disableKeyboardShortcuts
            >
                {children}
            </AppShell>
            {overlay}
        </>
    );
}

/**
 * A numbered placeholder for one region of a page type's structure, as in the draft's wireframes.
 */
export function StructureRegion({
    number,
    label,
    variant = "plain",
    className,
}: {
    number: number;
    label: string;
    variant?: "plain" | "dashed" | "accent" | "warning";
    className?: string;
}) {
    return (
        <div className={[styles.region, className].filter(Boolean).join(" ")} data-variant={variant}>
            <span className={styles.regionNumber}>{number}</span>
            {label}
        </div>
    );
}

/**
 * The frame around a page type's wireframe.
 */
export function StructureFrame({ children }: PropsWithChildren) {
    return <div className={styles.frame}>{children}</div>;
}
