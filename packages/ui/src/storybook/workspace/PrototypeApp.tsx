import { Fragment, type ReactNode, useEffect, useRef, useState } from "react";

import { EmptyState } from "../../components/emptyState/EmptyState";
import { Icon } from "../../components/icon/Icon";
import type { SideNavGroup } from "../../components/sideNav/SideNav";
import { densitySetting } from "../density";
import { PageTypeShell } from "../pageTypes/PageTypeShell";
import { type FlowEdgeKind, type LeaveGuard, PrototypeNavigationContext } from "../pageTypes/prototypeNavigation";
import { useTextLength } from "../textLength";
import { addFlowEdges } from "./flowEdges";
import { findElementByPath } from "./frameElements";
import { usePageTextChanges } from "./FrameNotes";
import { hotspotList, toolAttribute } from "./hotspots";
import { customPageList, customPagePrefix, renderCustomPage } from "./pageTemplates";
import type { WorkspacePrototype } from "./prototypes";
import { getOverrideCss, tokenOverrideList } from "./tokenPlayground";

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
    useTextLength();
    const tokenCss = getOverrideCss(tokenOverrideList.useItems());
    // In the head, so that the page's elements keep their places, which hotspots, comments, and text changes are anchored to
    useEffect(() => {
        if (!tokenCss) {
            return;
        }
        const style = document.createElement("style");
        style.textContent = tokenCss;
        document.head.append(style);
        return () => style.remove();
    }, [tokenCss]);
    const pageIdRef = useRef(pageId);
    const leaveGuardRef = useRef<LeaveGuard | null>(null);
    // How the next page change was asked for, and to which page, so that a change to another page isn't taken for it; `via: null`
    // keeps a change out of the flow map, e.g. one the workspace asked for and a leave guard held back
    const nextIntentRef = useRef<{ to: string; via: FlowEdgeKind | null } | null>(null);
    const lastClickRef = useRef(-Infinity);
    pageIdRef.current = pageId;

    useEffect(() => {
        const handleHashChange = () => {
            const nextPageId = readPageId(prototype);
            const intent = nextIntentRef.current?.to === nextPageId ? nextIntentRef.current : null;
            nextIntentRef.current = null;
            // A change without a click on the page came from outside, e.g. the workspace's page list, which isn't a way through the app
            const via = intent ? intent.via : performance.now() - lastClickRef.current < clickToHashChange ? "link" : null;
            const leaveGuard = leaveGuardRef.current;
            if (leaveGuard != null && nextPageId !== pageIdRef.current) {
                // The hash already changed: show the current page again on top, keeping the destination's entry behind it for when
                // the guard lets the user leave
                window.history.pushState(null, "", `#${pageIdRef.current}`);
                leaveGuard(() => {
                    leaveGuardRef.current = null;
                    nextIntentRef.current = { to: nextPageId, via };
                    window.history.back();
                });
                return;
            }
            leaveGuardRef.current = null;
            if (via) {
                addFlowEdges([{ prototypeId: prototype.storyId, from: pageIdRef.current, to: nextPageId, kind: via }]);
            }
            setPageId(nextPageId);
        };
        const goTo = (pageId: string, via: FlowEdgeKind) => {
            if (pageId !== pageIdRef.current) {
                nextIntentRef.current = { to: pageId, via };
            }
            window.location.hash = pageId;
        };
        const handleClick = () => {
            lastClickRef.current = performance.now();
        };
        // A hotspot the designer set wins over what the element does itself, unless a workspace tool uses the click; of nested
        // hotspots, the innermost
        const handleHotspot = (event: MouseEvent) => {
            if (document.documentElement.hasAttribute(toolAttribute) || !(event.target instanceof Node)) {
                return;
            }
            const target = event.target;
            const hotspot = hotspotList
                .get()
                .filter(
                    (candidate) =>
                        candidate.prototypeId === prototype.storyId &&
                        candidate.page === pageIdRef.current &&
                        candidate.path.length > 0 &&
                        findElementByPath(document, candidate.path)?.contains(target),
                )
                .sort((a, b) => b.path.length - a.path.length)[0];
            if (hotspot) {
                event.preventDefault();
                event.stopPropagation();
                goTo(hotspot.target, "link");
            }
        };
        // Storybook's preview sets `<base target="_parent">`, which would open a page's link in the window around the frame, e.g.
        // the workspace, instead of in the prototype; the page's own handlers come first and may have taken the click already
        const handleLink = (event: MouseEvent) => {
            const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
            if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }
            event.preventDefault();
            goTo(link.getAttribute("href")?.slice(1) ?? "", "link");
        };
        window.addEventListener("hashchange", handleHashChange);
        document.addEventListener("click", handleClick, true);
        document.addEventListener("click", handleHotspot, true);
        document.addEventListener("click", handleLink);
        return () => {
            window.removeEventListener("hashchange", handleHashChange);
            document.removeEventListener("click", handleClick, true);
            document.removeEventListener("click", handleHotspot, true);
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

    usePageTextChanges(prototype.storyId, pageId);

    const page = customPage ? renderCustomPage(customPage) : renderPage(pageId);

    return (
        <PrototypeNavigationContext.Provider
            value={{
                navigate: (id, via) => {
                    if (id !== pageIdRef.current) {
                        nextIntentRef.current = { to: id, via: via ?? "link" };
                    }
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
