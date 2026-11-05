import { createFromFetch, createFromReadableStream } from "@vitejs/plugin-rsc/browser";
import { startTransition, type TransitionStartFunction, useEffect, useLayoutEffect, useState, useTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { rscStream } from "rsc-html-stream/client";
import { reportError as reportErrorOfSite } from "virtual:dextinity-site/report-error";

import { announceNavigation, setUpNavigationAnnouncer } from "./announceNavigation.js";
import { getFragmentTarget } from "./fragmentTarget.js";
import { GlobalErrorBoundary } from "./GlobalErrorBoundary.js";
import { resolveRedirectTarget } from "./redirectTarget.js";
import type { NavigationPayload, RscPayload } from "./render.js";
import { reportError, setErrorReporter } from "./reportError.js";
import { NavigationProvider, type Router } from "./RouterProvider.js";
import { createRscUrl, getRedirectedPageUrl } from "./rscRequest.js";
import {
    createHistoryState,
    getHistoryKey,
    getRememberedScrollPosition,
    loadPersistedScrollPositions,
    persistScrollPositions,
    rememberScrollPosition,
} from "./scrollPositions.js";
import { shouldReloadForUnknownClientReference } from "./unknownClientReference.js";

setErrorReporter(reportErrorOfSite);

type ScrollTarget = "top" | "hash" | { scrollY: number } | undefined;

const maxRedirects = 20; // Like browsers

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
        getFragmentTarget(window.location.hash.slice(1))?.scrollIntoView();
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

function navigate(href: string, { scrollTarget, redirectCount = 0 }: { scrollTarget: ScrollTarget; redirectCount?: number }) {
    pendingNavigation?.abort();
    const navigation = new AbortController();
    pendingNavigation = navigation;
    startNavigationTransition(async () => {
        try {
            const response = await fetch(createRscUrl(href), { signal: navigation.signal });
            if (!response.headers.get("Content-Type")?.startsWith("text/x-component")) {
                throw new Error(`Unexpected response for ${href}`);
            }
            const payload = await createFromFetch<NavigationPayload>(Promise.resolve(response));
            if (navigation.signal.aborted) {
                return;
            }
            if ("redirect" in payload) {
                followRedirect({ href, location: payload.redirect.location, scrollTarget, redirectCount });
                return;
            }
            pendingNavigation = undefined; // The response may still be streaming, aborting it would break the displayed page
            if (response.redirected) {
                const redirectedUrl = getRedirectedPageUrl(response.url, new URL(href, window.location.href));
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
            // Fall back to a full page load, e.g., for non-page responses
            reportError(error);
            window.location.assign(href);
        }
    });
}

function followRedirect({
    href,
    location,
    scrollTarget,
    redirectCount,
}: {
    href: string;
    location: string;
    scrollTarget: ScrollTarget;
    redirectCount: number;
}) {
    const target = resolveRedirectTarget(location, new URL(href));
    if (!target) {
        throw new Error(`Redirect of ${href} to ${location} disallowed`);
    }
    if (target.origin !== window.location.origin || redirectCount >= maxRedirects) {
        window.location.replace(target);
        return;
    }
    window.history.replaceState(window.history.state, "", target);
    currentDocumentPath = getDocumentPath(target);
    navigate(target.href, {
        scrollTarget: scrollTarget === undefined ? undefined : getScrollTarget(target, true),
        redirectCount: redirectCount + 1,
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
    // The browser would restore the position before the new page is rendered. Switching only now (the new entry inherits it), as switching while the page is loading cancels the browser's restoration of reloads.
    window.history.scrollRestoration = "manual";
    const state = createHistoryState();
    window.history[method](state, "", url);
    currentHistoryKey = state.key;
    currentDocumentPath = getDocumentPath(url);
    navigate(url.href, { scrollTarget: getScrollTarget(url, scroll) });
}

function refresh() {
    navigate(window.location.href, { scrollTarget: undefined });
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
    navigate(url.href, { scrollTarget });
}

function setUpScrollRestoration() {
    loadPersistedScrollPositions();
    currentHistoryKey = getHistoryKey(window.history.state) ?? replaceWithNewHistoryState();

    // Entries left with "auto" on pagehide are restored by the browser, it retries until the page is loaded instead of being capped by a short page
    const rememberedScrollY = getRememberedScrollPosition(currentHistoryKey);
    if (rememberedScrollY !== undefined && window.history.scrollRestoration === "manual") {
        window.scrollTo(0, rememberedScrollY);
    }

    window.addEventListener("pagehide", () => {
        rememberScrollPosition(currentHistoryKey, window.scrollY);
        persistScrollPositions();
        window.history.scrollRestoration = "auto";
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
    hydrateRoot(document, <BrowserRoot initialPayload={initialPayload} />, {
        // Called for the errors of all error boundaries, also of those that hide a failed block
        onCaughtError(error) {
            if (shouldReloadForUnknownClientReference(error)) {
                window.location.reload();
                return;
            }
            console.error(error); // Like React's default
        },
    });
    window.addEventListener("popstate", handlePopState);

    if (import.meta.hot) {
        import.meta.hot.on("rsc:update", refresh);
    }
}

main();
