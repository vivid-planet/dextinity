// The site is resolved from these headers behind a proxy or CDN, and a page's content can depend on its cookies
const keyHeaderNames = ["cookie", "forwarded", "x-forwarded-host", "x-forwarded-proto"];

function isSharedCacheable(cacheControl: string) {
    const directives = cacheControl.split(",").map((directive) => directive.trim().split("=")[0].toLowerCase());
    return !directives.some((directive) => ["private", "no-store", "no-cache"].includes(directive));
}

/**
 * Concurrent requests with the same key get the same response, so it's only returned for requests whose response is the
 * same for everyone: public pages outside the previews, that CDNs cache by URL anyway
 */
export function getRenderCoalescingKey({
    request,
    routedUrl,
    isRscRequest,
    isPreview,
    cacheControl,
}: {
    request: Request;
    /** The URL of the route, differs from the request's URL when a middleware rewrites it */
    routedUrl: string;
    isRscRequest: boolean;
    isPreview: boolean;
    cacheControl: string;
}): string | undefined {
    if (request.method !== "GET" && request.method !== "HEAD") {
        return undefined;
    }
    if (isPreview || request.headers.has("authorization") || request.headers.has("x-block-preview")) {
        return undefined;
    }
    if (!isSharedCacheable(cacheControl)) {
        return undefined;
    }
    // Both GET and HEAD render the body, HEAD only drops it afterwards
    return JSON.stringify([isRscRequest, request.url, routedUrl, ...keyHeaderNames.map((name) => request.headers.get(name))]);
}

/**
 * Runs concurrent calls with the same key only once, all of them get its result or error. Nothing is kept after it settles.
 * Calls joining a run that takes longer than `maxWaitMs` run on their own instead, and the next calls start a new run.
 */
export function createCoalescer<T>({ maxWaitMs }: { maxWaitMs: number }) {
    const inFlight = new Map<string, Promise<T>>();

    function start(key: string, run: () => Promise<T>) {
        const promise = (async () => run())().finally(() => {
            if (inFlight.get(key) === promise) {
                inFlight.delete(key);
            }
        });
        inFlight.set(key, promise);
        return promise;
    }

    async function join(key: string, shared: Promise<T>, run: () => Promise<T>) {
        let timeout: ReturnType<typeof setTimeout> | undefined;
        const timedOut = Symbol("timedOut");
        const result = await Promise.race([
            shared,
            new Promise<typeof timedOut>((resolve) => {
                timeout = setTimeout(() => resolve(timedOut), maxWaitMs);
            }),
        ]).finally(() => clearTimeout(timeout));
        if (result !== timedOut) {
            return result as T;
        }
        if (inFlight.get(key) === shared) {
            inFlight.delete(key);
        }
        return run();
    }

    return {
        run(key: string, run: () => Promise<T>): Promise<T> {
            const shared = inFlight.get(key);
            return shared ? join(key, shared, run) : start(key, run);
        },
        get size() {
            return inFlight.size;
        },
    };
}
