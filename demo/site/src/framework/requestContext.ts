import { AsyncLocalStorage } from "node:async_hooks";

import { parse } from "hono/utils/cookie";

export type Visibility = "default" | "invisiblePages" | "invisibleBlocks";

type SiteContext = {
    domain: string;
    visibility: Visibility;
};

type RequestContext = {
    /** The request as sent by the browser, before any middleware rewrites */
    request: Request;
    isRscRequest: boolean;
    /** Set by the site context middleware for site requests */
    siteContext?: SiteContext;
};

const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(context: RequestContext, callback: () => T): T {
    return requestContextStorage.run(context, callback);
}

function getRequestContext() {
    const context = requestContextStorage.getStore();
    if (!context) {
        throw new Error("Request context is only available while handling a request");
    }
    return context;
}

export function getRequest() {
    return getRequestContext().request;
}

export function isRscRequest() {
    return getRequestContext().isRscRequest;
}

export function getCookie(name: string): string | undefined {
    return parse(getRequest().headers.get("cookie") ?? "", name)[name];
}

export function setSiteContext(siteContext: SiteContext) {
    getRequestContext().siteContext = siteContext;
}

export function getSiteContext() {
    const { siteContext } = getRequestContext();
    if (!siteContext) {
        throw new Error("Site context is only available for site requests");
    }
    return siteContext;
}

// Falls back to "default" outside of site requests, e.g. in the SSR environment, which has its own module instance
export function getVisibility(): Visibility {
    return requestContextStorage.getStore()?.siteContext?.visibility ?? "default";
}
