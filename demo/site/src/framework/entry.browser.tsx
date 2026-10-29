import { createFromFetch, createFromReadableStream } from "@vitejs/plugin-rsc/browser";
import { startTransition, type TransitionStartFunction, useEffect, useLayoutEffect, useState, useTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { rscStream } from "rsc-html-stream/client";

import { announceNavigation, setUpNavigationAnnouncer } from "./announceNavigation";
import { GlobalErrorBoundary } from "./GlobalErrorBoundary";
import type { RscPayload } from "./render";
import { NavigationProvider, type Router } from "./RouterProvider";
import { createRscUrl, stripRscPrefix } from "./rscRequest";
import {
    createHistoryState,
    getHistoryKey,
    getRememberedScrollPosition,
    loadPersistedScrollPositions,
    persistScrollPositions,
    rememberScrollPosition,
} from "./scrollPositions";

type ScrollTarget = "top" | "hash" | { scrollY: number } | undefined;

let setPayloadFromOutside: ((payload: RscPayload, scrollTarget: ScrollTarget) => void) | undefined;
let startNavigationTransition: TransitionStartFunction = startTransition; // Replaced by BrowserRoot to track the pending state
let pendingNavigation: AbortController | undefined;
let currentHistoryKey: string;
let currentDocumentPath = getDocumentPath(new URL(window.location.href));
let announcedPathname = window.location.pathname;

function getDocumentPath(url: URL) {
    return url.pathname + url.search;
}

function scrollToTarget(scrollTarget: ScrollTarget) {
    if (scrollTarget === "hash" && window.location.hash) {
        document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView();
    } else if (typeof scrollTarget === "object") {
        window.scrollTo(0, scrollTarget.scrollY);
    } else if (scrollTarget) {
        window.scrollTo(0, 0);
    }
}

function BrowserRoot({ initialPayload }: { initialPayload: RscPayload }) {
    const [{ payload, scrollTarget }, setState] = useState<{ payload: RscPayload; scrollTarget: ScrollTarget }>({
        payload: initialPayload,
        scrollTarget: undefined,
    });

    const [isPending, startPendingTransition] = useTransition();

    useEffect(() => {
        // State updates after an await of the transition have to be marked as transition again
        setPayloadFromOutside = (payload, scrollTarget) => startTransition(() => setState({ payload, scrollTarget }));
        startNavigationTransition = startPendingTransition;
        setUpNavigationAnnouncer();
    }, []);

    useLayoutEffect(() => {
        scrollToTarget(scrollTarget);
    }, [payload, scrollTarget]);

    useEffect(() => {
        if (window.location.pathname !== announcedPathname) {
            announcedPathname = window.location.pathname;
            announceNavigation();
        }
    }, [payload]);

    return (
        <NavigationProvider router={browserRouter} isPending={isPending}>
            <GlobalErrorBoundary resetKey={payload}>{payload.root}</GlobalErrorBoundary>
        </NavigationProvider>
    );
}

function navigate(href: string, scrollTarget: ScrollTarget) {
    pendingNavigation?.abort();
    const navigation = new AbortController();
    pendingNavigation = navigation;
    startNavigationTransition(async () => {
        try {
            const response = await fetch(createRscUrl(href), { signal: navigation.signal });
            if (!response.headers.get("Content-Type")?.startsWith("text/x-component")) {
                throw new Error(`Unexpected response for ${href}`);
            }
            const payload = await createFromFetch<RscPayload>(Promise.resolve(response));
            if (navigation.signal.aborted) {
                return;
            }
            pendingNavigation = undefined; // The response may still be streaming, aborting it would break the displayed page
            if (response.redirected) {
                const redirectedUrl = stripRscPrefix(new URL(response.url));
                if (redirectedUrl) {
                    window.history.replaceState(window.history.state, "", redirectedUrl);
                    currentDocumentPath = getDocumentPath(new URL(redirectedUrl, window.location.href));
                }
            }
            setPayloadFromOutside?.(payload, scrollTarget);
        } catch (error) {
            if (navigation.signal.aborted) {
                return;
            }
            // Fall back to a full page load, e.g., for redirects to other origins or non-page responses
            console.error(error);
            window.location.assign(href);
        }
    });
}

function getScrollTarget(url: URL, scroll: boolean): ScrollTarget {
    if (!scroll) {
        return undefined;
    }
    return url.hash ? "hash" : "top";
}

function replaceWithNewHistoryState() {
    const state = createHistoryState();
    window.history.replaceState(state, "");
    return state.key;
}

function changeHistory(method: "pushState" | "replaceState", href: string, scroll: boolean) {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) {
        window.location.assign(url);
        return;
    }
    rememberScrollPosition(currentHistoryKey, window.scrollY);
    const state = createHistoryState();
    window.history[method](state, "", url);
    currentHistoryKey = state.key;
    currentDocumentPath = getDocumentPath(url);
    navigate(url.href, getScrollTarget(url, scroll));
}

function refresh() {
    navigate(window.location.href, undefined);
}

function handlePopState(event: PopStateEvent) {
    // With manual scroll restoration, the browser hasn't scrolled yet, so this is still the position of the left entry
    rememberScrollPosition(currentHistoryKey, window.scrollY);

    const key = getHistoryKey(event.state);
    const isNewFragmentEntry = key === undefined; // Created by the browser for a link to a fragment, it scrolls to the fragment itself
    currentHistoryKey = key ?? replaceWithNewHistoryState();

    const url = new URL(window.location.href);
    const rememberedScrollY = getRememberedScrollPosition(currentHistoryKey);
    const scrollTarget = rememberedScrollY !== undefined ? { scrollY: rememberedScrollY } : getScrollTarget(url, true);

    if (getDocumentPath(url) === currentDocumentPath) {
        if (!isNewFragmentEntry) {
            scrollToTarget(scrollTarget);
        }
        return;
    }
    currentDocumentPath = getDocumentPath(url);
    navigate(url.href, scrollTarget);
}

function setUpScrollRestoration() {
    // The browser would restore the position before the new page is rendered
    window.history.scrollRestoration = "manual";
    loadPersistedScrollPositions();
    currentHistoryKey = getHistoryKey(window.history.state) ?? replaceWithNewHistoryState();

    const rememberedScrollY = getRememberedScrollPosition(currentHistoryKey);
    if (rememberedScrollY !== undefined) {
        window.scrollTo(0, rememberedScrollY);
    }

    window.addEventListener("pagehide", () => {
        rememberScrollPosition(currentHistoryKey, window.scrollY);
        persistScrollPositions();
    });
}

const browserRouter: Router = {
    push: (href, { scroll = true } = {}) => changeHistory("pushState", href, scroll),
    replace: (href, { scroll = true } = {}) => changeHistory("replaceState", href, scroll),
    refresh,
};

async function main() {
    setUpScrollRestoration();
    const initialPayload = await createFromReadableStream<RscPayload>(rscStream);
    hydrateRoot(document, <BrowserRoot initialPayload={initialPayload} />);
    window.addEventListener("popstate", handlePopState);

    if (import.meta.hot) {
        import.meta.hot.on("rsc:update", refresh);
    }
}

main();
