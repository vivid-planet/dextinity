import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";

import { EmptyState } from "../../components/emptyState/EmptyState";
import { Icon } from "../../components/icon/Icon";
import type { SideNavGroup } from "../../components/sideNav/SideNav";
import { densitySetting } from "../density";
import { PageTypeShell } from "../pageTypes/PageTypeShell";
import { type FlowEdgeKind, type LeaveGuard, PrototypeNavigationContext } from "../pageTypes/prototypeNavigation";
import { addFlowEdges } from "./flowEdges";
import { customPageList, customPagePrefix, renderCustomPage } from "./pageTemplates";
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

const clickToHashChange = 1000;

// The page is the location's hash, so a reload keeps it and the browser's back button goes to the page before
// A page the designer added may arrive before the storage event that lists it, so its prefix is enough
function readPageId({ getPageLabel, startPageId }: WorkspacePrototype) {
    const id = decodeURIComponent(window.location.hash.slice(1));
    return getPageLabel(id) != null || id.startsWith(customPagePrefix) ? id : startPageId;
}

/**
 * A clickable prototype of an app: its navigation and links open the pages, which are kept in the location's hash.
 */
export function PrototypeApp({ prototype, navGroups, renderPage }: PrototypeAppProps) {
    const [pageId, setPageId] = useState(() => readPageId(prototype));
    const [navCollapsed, setNavCollapsed] = useState(false);
    const [assistantOpen, setAssistantOpen] = useState(false);
    const density = densitySetting.useValue();
    const pageIdRef = useRef(pageId);
    const leaveGuardRef = useRef<LeaveGuard | null>(null);
    // How the next page change was asked for; a change of the hash by a link on the page leaves it unset
    const nextViaRef = useRef<FlowEdgeKind | null>(null);
    const lastClickRef = useRef(-Infinity);
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
            // A change without a click on the page came from outside, e.g. the workspace's page list, which isn't a way through the app
            const via = nextViaRef.current ?? (performance.now() - lastClickRef.current < clickToHashChange ? "link" : null);
            if (via) {
                addFlowEdges([{ prototypeId: prototype.storyId, from: pageIdRef.current, to: nextPageId, kind: via }]);
            }
            nextViaRef.current = null;
            setPageId(nextPageId);
        };
        const handleClick = () => {
            lastClickRef.current = performance.now();
        };
        // Storybook's preview sets `<base target="_parent">`, which would open a page's link in the window around the frame, e.g.
        // the workspace, instead of in the prototype; the page's own handlers come first and may have taken the click already
        const handleLink = (event: MouseEvent) => {
            const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
            if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }
            event.preventDefault();
            nextViaRef.current = "link";
            window.location.hash = link.getAttribute("href")?.slice(1) ?? "";
        };
        window.addEventListener("hashchange", handleHashChange);
        document.addEventListener("click", handleClick, true);
        document.addEventListener("click", handleLink);
        return () => {
            window.removeEventListener("hashchange", handleHashChange);
            document.removeEventListener("click", handleClick, true);
            document.removeEventListener("click", handleLink);
        };
    }, [prototype]);

    const customPage = customPageList.useItems().find((candidate) => candidate.prototypeId === prototype.storyId && candidate.id === pageId);

    // The pages don't set the density themselves; in the workspace it sets it, opened on its own the prototype does
    useEffect(() => {
        document.documentElement.dataset.dextinityDensity = density;
    }, [density]);

    useEffect(() => {
        document.title = `${customPage?.title ?? prototype.getPageLabel(pageId)} · ${prototype.appName}`;
    }, [prototype, pageId, customPage?.title]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pageId]);

    const page = customPage ? renderCustomPage(customPage) : renderPage(pageId);

    return (
        <PrototypeNavigationContext.Provider
            value={{
                navigate: (id, via) => {
                    nextViaRef.current = via ?? "link";
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
