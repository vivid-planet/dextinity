import { AsyncLocalStorage } from "node:async_hooks";

import type { PreviewData } from "@dextinity/site-react";
import { parse } from "hono/utils/cookie";

export type Visibility = "default" | "invisiblePages" | "invisibleBlocks";

export type SitePreview = { previewData?: PreviewData };

/**
 * The project's data of the request, e.g. the scope of the site. Projects declare their fields with module augmentation:
 *
 * ```ts
 * declare module "@dextinity/site-vite-rsc/server" {
 *     interface RequestContextData {
 *         domain: string;
 *     }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RequestContextData {}

type RequestContext = {
    /** The request as sent by the browser, before any middleware rewrites */
    request: Request;
    isRscRequest: boolean;
    /** From the site preview or the block preview */
    visibility?: Visibility;
    /** Set while the site is opened in the site preview of the admin */
    sitePreview?: SitePreview;
    data: Partial<RequestContextData>;
};

const requestContextStorage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>({ request, isRscRequest }: { request: Request; isRscRequest: boolean }, callback: () => T): T {
    return requestContextStorage.run({ request, isRscRequest, data: {} }, callback);
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

export function setPreview({ visibility, sitePreview }: { visibility: Visibility; sitePreview?: SitePreview }) {
    const context = getRequestContext();
    context.visibility = visibility;
    context.sitePreview = sitePreview;
}

// Falls back to "default" outside of requests, e.g. in the SSR environment, which has its own module instance
export function getVisibility(): Visibility {
    return requestContextStorage.getStore()?.visibility ?? "default";
}

export function getSitePreview(): SitePreview | undefined {
    return getRequestContext().sitePreview;
}

export function setRequestData<Key extends keyof RequestContextData>(key: Key, value: RequestContextData[Key]) {
    getRequestContext().data[key] = value;
}

export function getRequestData<Key extends keyof RequestContextData>(key: Key): RequestContextData[Key] | undefined {
    return getRequestContext().data[key];
}
