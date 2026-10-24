import { createFromFetch, createFromReadableStream } from "@vitejs/plugin-rsc/browser";
import { startTransition, useEffect, useLayoutEffect, useState } from "react";
import { hydrateRoot } from "react-dom/client";
import { rscStream } from "rsc-html-stream/client";

import { GlobalErrorBoundary } from "./GlobalErrorBoundary";
import type { RscPayload } from "./render";
import { createRscUrl, stripRscPrefix } from "./rscRequest";

type ScrollTarget = "top" | "hash" | undefined;

let setPayloadFromOutside: ((payload: RscPayload, scrollTarget: ScrollTarget) => void) | undefined;
let latestNavigationId = 0;

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
    const navigationId = ++latestNavigationId;
    try {
        const response = await fetch(createRscUrl(href));
        if (!response.headers.get("Content-Type")?.startsWith("text/x-component")) {
            throw new Error(`Unexpected response for ${href}`);
        }
        const payload = await createFromFetch<RscPayload>(Promise.resolve(response));
        if (navigationId !== latestNavigationId) {
            return;
        }
        if (response.redirected) {
            const redirectedUrl = stripRscPrefix(new URL(response.url));
            if (redirectedUrl) {
                window.history.replaceState(null, "", redirectedUrl);
            }
        }
        setPayloadFromOutside?.(payload, scrollTarget);
    } catch (error) {
        // Fall back to a full page load, e.g., for redirects to other origins or non-page responses
        console.error(error);
        window.location.assign(href);
    }
}

function shouldHandleLinkClick(event: MouseEvent, link: HTMLAnchorElement) {
    return (
        event.button === 0 &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        !event.defaultPrevented &&
        (!link.target || link.target === "_self") &&
        !link.hasAttribute("download") &&
        link.origin === window.location.origin &&
        !link.pathname.startsWith("/dam/") &&
        !link.pathname.startsWith("/api/")
    );
}

function listenToNavigation() {
    document.addEventListener("click", (event) => {
        const link = (event.target as Element | null)?.closest("a");
        if (!link || !link.href || !shouldHandleLinkClick(event, link)) {
            return;
        }
        if (link.hash && link.pathname === window.location.pathname && link.search === window.location.search) {
            // Let the browser scroll to the anchor
            return;
        }
        event.preventDefault();
        window.history.pushState(null, "", link.href);
        navigate(link.href, link.hash ? "hash" : "top");
    });

    window.addEventListener("popstate", () => {
        navigate(window.location.href, undefined);
    });
}

async function main() {
    const initialPayload = await createFromReadableStream<RscPayload>(rscStream);
    hydrateRoot(document, <BrowserRoot initialPayload={initialPayload} />);
    listenToNavigation();

    if (import.meta.hot) {
        import.meta.hot.on("rsc:update", () => {
            navigate(window.location.href, undefined);
        });
    }
}

main();
