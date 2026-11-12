import { type PropsWithChildren, type ReactNode, useState } from "react";

import { AppShell } from "../../components/appShell/AppShell";
import { sideNavGroups } from "../../components/sideNav/__stories__/sideNavStoryData";
import { getSideNavAncestorIds, SideNav } from "../../components/sideNav/SideNav";
import { StoryScopeSwitcher, StoryUserMenu } from "../../components/topBar/__stories__/topBarStoryParts";
import { TopBar } from "../../components/topBar/TopBar";
import { ProductLogo, ProductSign } from "../ProductLogo";
import styles from "./PageTypeShell.module.scss";

function ShellNav({ activeId }: { activeId: string }) {
    const [currentId, setCurrentId] = useState(activeId);
    const [expanded, setExpanded] = useState(getSideNavAncestorIds(sideNavGroups, activeId));
    return (
        <SideNav
            logo={<ProductLogo />}
            logoMark={<ProductSign />}
            title="Career portal"
            subtitle="Example Ltd · Production"
            groups={sideNavGroups}
            activeId={currentId}
            expanded={expanded}
            onExpandedChange={setExpanded}
            onNavigate={(item, event) => {
                event.preventDefault();
                setCurrentId(item.id);
            }}
        />
    );
}

export interface PageTypeShellProps {
    /** The navigation item of the page, e.g. `job-ads`. */
    activeId: string;
    /** Content above the top bar's page, e.g. a dialog. */
    overlay?: ReactNode;
}

/**
 * A page type's live example: the page inside the app frame with navigation, top bar, and scope.
 */
export function PageTypeShell({ activeId, overlay, children }: PropsWithChildren<PageTypeShellProps>) {
    const [navCollapsed, setNavCollapsed] = useState(false);
    const [aiOpen, setAiOpen] = useState(false);
    return (
        <>
            <AppShell
                nav={<ShellNav activeId={activeId} />}
                topBar={
                    <TopBar
                        onSearchClick={() => undefined}
                        scope={<StoryScopeSwitcher />}
                        aiOpen={aiOpen}
                        onAiOpenChange={setAiOpen}
                        userMenu={<StoryUserMenu />}
                    />
                }
                navCollapsed={navCollapsed}
                onNavCollapsedChange={setNavCollapsed}
                disableShortcuts
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
