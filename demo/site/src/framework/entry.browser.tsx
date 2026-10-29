import { createFromFetch, createFromReadableStream } from "@vitejs/plugin-rsc/browser";
import { startTransition, useEffect, useLayoutEffect, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { rscStream } from "rsc-html-stream/client";

import { GlobalErrorBoundary } from "./GlobalErrorBoundary";
import type { RscPayload } from "./render";
import { setBrowserRouter } from "./RouterProvider";
import { createRscUrl, stripRscPrefix } from "./rscRequest";

type ScrollTarget = "top" | "hash" | undefined;

let setPayloadFromOutside: ((payload: RscPayload, scrollTarget: ScrollTarget) => void) | undefined;
let pendingNavigation: AbortController | undefined;

function BrowserRoot({ initialPayload }: { initialPayload: RscPayload }) {
    const [{ payload, scrollTarget }, setState] = useState<{ payload: RscPayload; scrollTarget: ScrollTarget }>({
        payload: initialPayload,
        scrollTarget: undefined,
    });

    useEffect(() => {
        setPayloadFromOutside = (payload, scrollTarget) => startTransition(() => setState({ payload, scrollTarget }));
    }, []);

    useLayoutEffect(() => {
        if (scrollTarget === "hash" && window.location.hash) {
            document.getElementById(decodeURIComponent(window.location.hash.slice(1)))?.scrollIntoView();
        } else if (scrollTarget) {
            window.scrollTo(0, 0);
        }
    }, [payload, scrollTarget]);

    return <GlobalErrorBoundary resetKey={payload}>{payload.root}</GlobalErrorBoundary>;
}

async function navigate(href: string, scrollTarget: ScrollTarget) {
    pendingNavigation?.abort();
    const navigation = new AbortController();
    pendingNavigation = navigation;
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
                window.history.replaceState(null, "", redirectedUrl);
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
}

function getScrollTarget(url: URL, scroll: boolean): ScrollTarget {
    if (!scroll) {
        return undefined;
    }
    return url.hash ? "hash" : "top";
}

function changeHistory(method: "pushState" | "replaceState", href: string, scroll: boolean) {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) {
        window.location.assign(url);
        return;
    }
    window.history[method](null, "", url);
    navigate(url.href, getScrollTarget(url, scroll));
}

function refresh() {
    navigate(window.location.href, undefined);
}

function setUpNavigation() {
    setBrowserRouter({
        push: (href, { scroll = true } = {}) => changeHistory("pushState", href, scroll),
        replace: (href, { scroll = true } = {}) => changeHistory("replaceState", href, scroll),
        refresh,
    });

    window.addEventListener("popstate", refresh);
}

async function main() {
    const initialPayload = await createFromReadableStream<RscPayload>(rscStream);
    hydrateRoot(document, <BrowserRoot initialPayload={initialPayload} />);
    setUpNavigation();

    if (import.meta.hot) {
        import.meta.hot.on("rsc:update", refresh);
    }
}

main();
