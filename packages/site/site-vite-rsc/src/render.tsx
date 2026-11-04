import type { Context } from "hono";
import type { ReactNode } from "react";

import { isBotUserAgent } from "./bots.js";
import { isSharedCacheable, noStoreCacheControl } from "./cacheControl.js";
import { getNavigationErrorDigest, isNotFoundDigest, parseRedirectDigest } from "./navigation.js";
import { reportError } from "./reportError.js";
import { getRequest, getSitePreview, isNotFoundRequest, isRscRequest } from "./requestContext.js";
import { RouterProvider } from "./RouterProvider.js";
import { SitePreviewProvider } from "./SitePreviewProvider.js";
import { createTitleCountCheck } from "./titleCountCheck.js";

export type RscPayload = {
    root: ReactNode;
};

export type RedirectPayload = {
    redirect: { location: string };
};

export type NavigationPayload = RscPayload | RedirectPayload;

type RenderPageOptions = {
    root: ReactNode;
    /** Rendered with status 404 when `notFound()` is called while rendering `root` */
    notFound: () => ReactNode;
    /** Rendered with status 500 when rendering `root` fails */
    error: () => ReactNode;
    /** Only used for successful responses, all others aren't cached */
    cacheControl: string;
    status?: number;
    /**
     * Responds as soon as the content outside of Suspense boundaries is rendered, then streams the rest.
     * `notFound()`, `redirect()` and errors inside Suspense boundaries are handled by the browser then, with status 200
     * and `cacheControl`.
     *
     * Defaults to streaming responses that CDNs don't cache, i.e. with `no-store` or `private` in `cacheControl`, so that
     * failed pages are never cached. Bots always get the complete page.
     */
    streaming?: boolean;
};

export async function renderPage(c: Context, options: RenderPageOptions): Promise<Response> {
    const { root, notFound, error, status = 200 } = options;
    if (isNotFoundRequest() && status === 200) {
        return renderPage(c, { ...options, root: notFound(), status: 404 });
    }

    const streaming = (options.streaming ?? !isSharedCacheable(options.cacheControl)) && !isBotUserAgent(getRequest().headers.get("User-Agent"));
    const url = new URL(getRequest().url);
    const rscPayload = await renderRscPayload(
        <RouterProvider pathname={url.pathname} search={url.search} params={c.req.param()}>
            {getSitePreview() ? <SitePreviewProvider>{root}</SitePreviewProvider> : root}
        </RouterProvider>,
    );
    // The payload is rendered completely before responding, so that notFound() and redirect() can set the status,
    // no matter where in the tree they are called
    const rscStream = streaming ? rscPayload.stream : createStream(await readChunks(rscPayload.stream));
    // Also when an error boundary in the browser handles the errors, they must not be cached
    const getCacheControl = () => (status === 200 && !rscPayload.hasError ? options.cacheControl : noStoreCacheControl);

    const result =
        !streaming && rscPayload.navigationDigest
            ? { navigationDigest: rscPayload.navigationDigest }
            : await respond(rscStream, { status, getCacheControl, streaming });
    if ("response" in result) {
        return result.response;
    }

    if ("hasFailed" in result) {
        if (status === 500) {
            return c.text("Internal Server Error", 500, { "Cache-Control": noStoreCacheControl });
        }
        return renderPage(c, { ...options, root: error(), status: 500 });
    }

    const redirect = parseRedirectDigest(result.navigationDigest);
    if (redirect) {
        c.header("Cache-Control", getCacheControl());
        return c.redirect(redirect.location, redirect.status);
    }
    if (isNotFoundDigest(result.navigationDigest) && status !== 404) {
        return renderPage(c, { ...options, root: notFound(), status: 404 });
    }
    throw new Error("notFound() must not be called while rendering the not found page");
}

async function renderRscPayload(root: ReactNode) {
    // Only works in Vite's RSC environment, loaded on use so that this package's other server code works anywhere, e.g. in unit tests
    const { renderToReadableStream } = await import("@vitejs/plugin-rsc/rsc/server");
    const state: { navigationDigest?: string; hasError: boolean } = { hasError: false };
    const stream = renderToReadableStream<RscPayload>(
        { root },
        {
            onError(error: unknown) {
                const digest = getNavigationErrorDigest(error);
                if (digest) {
                    state.navigationDigest ??= digest;
                    return digest;
                }
                state.hasError = true;
                reportError(error);
                return undefined;
            },
        },
    );
    return Object.assign(state, { stream });
}

async function readChunks(stream: ReadableStream<Uint8Array>) {
    const chunks: Uint8Array[] = [];
    const reader = stream.getReader();
    for (let result = await reader.read(); !result.done; result = await reader.read()) {
        chunks.push(result.value);
    }
    return chunks;
}

export async function renderRedirectPayload(location: string) {
    const { renderToReadableStream } = await import("@vitejs/plugin-rsc/rsc/server");
    return renderToReadableStream<RedirectPayload>({ redirect: { location } });
}

function createStream(chunks: Uint8Array[]) {
    return new ReadableStream<Uint8Array>({
        start(controller) {
            for (const chunk of chunks) {
                controller.enqueue(chunk);
            }
            controller.close();
        },
    });
}

/**
 * React doesn't deduplicate titles, so every page has to render exactly one, e.g., `<DefaultTitle />`
 */
function checkTitleCount(html: ReadableStream<Uint8Array>) {
    const { url } = getRequest(); // The stream is read after the request context ended
    return html.pipeThrough(
        createTitleCountCheck((titleCount) => {
            if (titleCount !== 1) {
                console.error(`${url} renders ${titleCount} <title> elements instead of one`);
            }
        }),
    );
}

async function respond(
    rscStream: ReadableStream<Uint8Array>,
    { status, getCacheControl, streaming }: { status: number; getCacheControl: () => string; streaming: boolean },
): Promise<{ response: Response } | { navigationDigest: string } | { hasFailed: true }> {
    // Proxies like nginx would otherwise buffer the response
    const streamingHeaders: Record<string, string> = streaming ? { "X-Accel-Buffering": "no" } : {};
    if (isRscRequest()) {
        return {
            response: new Response(rscStream, {
                status,
                headers: {
                    "Content-Type": "text/x-component;charset=utf-8",
                    "Cache-Control": getCacheControl(),
                    // Crawlers only need the HTML, the RSC payload for hydration is embedded in it
                    "X-Robots-Tag": "noindex",
                    ...streamingHeaders,
                },
            }),
        };
    }

    const ssrEntry = await import.meta.viteRsc.loadModule<typeof import("./entry.ssr.js")>("ssr", "index");
    const html = await ssrEntry.renderHtml(rscStream, { streaming });
    if (!("stream" in html)) {
        return html;
    }

    return {
        response: new Response(import.meta.env.DEV ? checkTitleCount(html.stream) : html.stream, {
            status,
            headers: {
                "Content-Type": "text/html;charset=utf-8",
                "Cache-Control": html.hasError ? noStoreCacheControl : getCacheControl(),
                ...streamingHeaders,
            },
        }),
    };
}
