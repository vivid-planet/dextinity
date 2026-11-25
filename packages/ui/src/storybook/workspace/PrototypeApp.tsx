import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";

import { EmptyState } from "../../components/emptyState/EmptyState";
import { Icon } from "../../components/icon/Icon";
import type { SideNavGroup } from "../../components/sideNav/SideNav";
import { PageTypeShell } from "../pageTypes/PageTypeShell";
import { type LeaveGuard, PrototypeNavigationContext } from "../pageTypes/prototypeNavigation";
import type { WorkspacePrototype } from "./prototypes";

function PageNotInPrototype({ prototype, pageId }: { prototype: WorkspacePrototype; pageId: string }) {
    const { getPageLabel, designedPageIds } = prototype;
    return (
        <PageTypeShell currentId={pageId}>
            <EmptyState
                icon={<Icon name="window" />}
                title={`${getPageLabel(pageId)} isn't part of the prototype yet`}
                description={`The navigation works; this page has no design yet. Pages with a design: ${designedPageIds.map(getPageLabel).join(", ")}.`}
            />
        </PageTypeShell>
    );
}

interface PrototypeAppProps {
    prototype: WorkspacePrototype;
    /** The prototype's navigation; without it, the career portal's. */
    navGroups?: SideNavGroup[];
    /** The page for an id the prototype knows, e.g. `news` or `news/spring-campaign`; `undefined` for an entry without a design. */
    renderPage: (pageId: string) => ReactNode;
}

// The page is the location's hash, so a reload keeps it and the browser's back button goes to the page before
function readPageId({ getPageLabel, startPageId }: WorkspacePrototype) {
    const id = decodeURIComponent(window.location.hash.slice(1));
    return getPageLabel(id) != null ? id : startPageId;
}

/**
 * A clickable prototype of an app: its navigation and links open the pages, which are kept in the location's hash.
 */
export function PrototypeApp({ prototype, navGroups, renderPage }: PrototypeAppProps) {
    const [pageId, setPageId] = useState(() => readPageId(prototype));
    const [navCollapsed, setNavCollapsed] = useState(false);
    const [assistantOpen, setAssistantOpen] = useState(false);
    const pageIdRef = useRef(pageId);
    const leaveGuardRef = useRef<LeaveGuard | null>(null);
    pageIdRef.current = pageId;

    useEffect(() => {
        const handleHashChange = () => {
            const nextPageId = readPageId(prototype);
            const leaveGuard = leaveGuardRef.current;
            if (leaveGuard != null && nextPageId !== pageIdRef.current) {
                // The hash already changed: show the current page again on top, keeping the destination's entry behind it for when
                // the guard lets the user leave
                window.history.pushState(null, "", `#${pageIdRef.current}`);
                leaveGuard(() => {
                    leaveGuardRef.current = null;
                    window.history.back();
                });
                return;
            }
            leaveGuardRef.current = null;
            setPageId(nextPageId);
        };
        window.addEventListener("hashchange", handleHashChange);
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, [prototype]);

    useEffect(() => {
        document.title = `${prototype.getPageLabel(pageId)} · ${prototype.appName}`;
        window.scrollTo(0, 0);
    }, [prototype, pageId]);

    const page = renderPage(pageId);

    return (
        <PrototypeNavigationContext.Provider
            value={{
                navigate: (id) => {
                    window.location.hash = id;
                },
                navCollapsed,
                onNavCollapsedChange: setNavCollapsed,
                assistantOpen,
                onAssistantOpenChange: setAssistantOpen,
                navGroups,
                setLeaveGuard: (guard) => {
                    leaveGuardRef.current = guard;
                },
            }}
        >
            <Fragment key={pageId}>{page ?? <PageNotInPrototype prototype={prototype} pageId={pageId} />}</Fragment>
        </PrototypeNavigationContext.Provider>
    );
}
