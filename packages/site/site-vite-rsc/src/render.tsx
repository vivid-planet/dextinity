import type { Context } from "hono";
import type { ReactNode } from "react";

import { noStoreCacheControl } from "./cacheControl.js";
import { getNavigationErrorDigest, isNotFoundDigest, parseRedirectDigest } from "./navigation.js";
import { createCoalescer, getRenderCoalescingKey } from "./renderCoalescing.js";
import { reportError } from "./reportError.js";
import { getPreviewScope, getRequest, getSitePreview, getVisibility, isRscRequest } from "./requestContext.js";
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
     * Concurrent identical requests of a public page share one render, like a CDN shares the cached response.
     * Set to `false` if the page depends on request headers other than the URL, cookies and the forwarded host.
     * @default true
     */
    coalesceRenders?: boolean;
};

type RedirectStatus = NonNullable<ReturnType<typeof parseRedirectDigest>>["status"];

type PageResult<ResponseType = Response> =
    { response: ResponseType } | { redirect: { location: string; status: RedirectStatus }; cacheControl: string } | { hasFailed: true };

type BufferedResponse = { status: number; headers: [string, string][]; body: Uint8Array<ArrayBuffer> };

// A render taking longer is probably stuck, e.g. waiting for an API, so waiting requests render on their own instead
const renderCoalescer = createCoalescer<PageResult<BufferedResponse>>({ maxWaitMs: 10_000 });

export async function renderPage(c: Context, options: RenderPageOptions): Promise<Response> {
    const { coalesceRenders = true } = options;
    const coalescingKey = coalesceRenders
        ? getRenderCoalescingKey({
              request: getRequest(),
              routedUrl: c.req.url,
              isRscRequest: isRscRequest(),
              isPreview: getSitePreview() !== undefined || getVisibility() !== "default" || getPreviewScope() !== undefined,
              cacheControl: options.cacheControl,
          })
        : undefined;
    if (coalescingKey === undefined) {
        return createResponse(c, await renderPageResult(c, options));
    }

    // The response is buffered, so that every request gets its own copy. HTML is only sent when completely rendered anyway.
    const result = await renderCoalescer.run(coalescingKey, async () => bufferResponse(await renderPageResult(c, options)));
    if ("response" in result) {
        const { body, status, headers } = result.response;
        return new Response(body, { status, headers });
    }
    return createResponse(c, result);
}

async function bufferResponse(result: PageResult): Promise<PageResult<BufferedResponse>> {
    if (!("response" in result)) {
        return result;
    }
    const { response } = result;
    return { response: { status: response.status, headers: [...response.headers], body: new Uint8Array(await response.arrayBuffer()) } };
}

/**
 * Redirects and failures are created with the context of each request, so that they get the headers set by its middlewares
 */
function createResponse(c: Context, result: PageResult): Response {
    if ("response" in result) {
        return result.response;
    }
    if ("redirect" in result) {
        c.header("Cache-Control", result.cacheControl);
        return c.redirect(result.redirect.location, result.redirect.status);
    }
    return c.text("Internal Server Error", 500, { "Cache-Control": noStoreCacheControl });
}

async function renderPageResult(c: Context, options: RenderPageOptions): Promise<PageResult> {
    const { root, notFound, error, status = 200 } = options;
    const url = new URL(getRequest().url);
    const rscPayload = await renderRscPayload(
        <RouterProvider pathname={url.pathname} search={url.search} params={c.req.param()}>
            {getSitePreview() ? <SitePreviewProvider>{root}</SitePreviewProvider> : root}
        </RouterProvider>,
    );
    // Also when an error boundary in the browser handles the errors, they must not be cached
    const cacheControl = status === 200 && !rscPayload.hasError ? options.cacheControl : noStoreCacheControl;

    const result = rscPayload.navigationDigest
        ? { navigationDigest: rscPayload.navigationDigest }
        : await respond(rscPayload.chunks, { status, cacheControl });
    if ("response" in result) {
        return result;
    }

    if ("hasFailed" in result) {
        if (status === 500) {
            return { hasFailed: true };
        }
        return renderPageResult(c, { ...options, root: error(), status: 500 });
    }

    const redirect = parseRedirectDigest(result.navigationDigest);
    if (redirect) {
        return { redirect, cacheControl };
    }
    if (isNotFoundDigest(result.navigationDigest) && status !== 404) {
        return renderPageResult(c, { ...options, root: notFound(), status: 404 });
    }
    throw new Error("notFound() must not be called while rendering the not found page");
}

async function renderRscPayload(root: ReactNode) {
    let navigationDigest: string | undefined;
    let hasError = false;
    // Only works in Vite's RSC environment, loaded on use so that this package's other server code works anywhere, e.g. in unit tests
    const { renderToReadableStream } = await import("@vitejs/plugin-rsc/rsc/server");
    const stream = renderToReadableStream<RscPayload>(
        { root },
        {
            onError(error: unknown) {
                const digest = getNavigationErrorDigest(error);
                if (digest) {
                    navigationDigest ??= digest;
                    return digest;
                }
                hasError = true;
                reportError(error);
                return undefined;
            },
        },
    );

    // The payload is rendered completely before responding, so that notFound() and redirect() can set the status,
    // no matter where in the tree they are called
    // TODO Stream the payload once pages use Suspense, like Next.js: decide the status only up to the shell, then render
    // `<meta name="robots" content="noindex">` for notFound() and `<meta http-equiv="refresh">` for redirect() into the
    // HTML, and catch both in error boundaries around the layouts (not found page in place, client-side redirect)
    const chunks: Uint8Array[] = [];
    const reader = stream.getReader();
    for (let result = await reader.read(); !result.done; result = await reader.read()) {
        chunks.push(result.value);
    }

    return { chunks, navigationDigest, hasError };
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
    rscChunks: Uint8Array[],
    { status, cacheControl }: { status: number; cacheControl: string },
): Promise<{ response: Response } | { navigationDigest: string } | { hasFailed: true }> {
    if (isRscRequest()) {
        return {
            response: new Response(createStream(rscChunks), {
                status,
                headers: {
                    "Content-Type": "text/x-component;charset=utf-8",
                    "Cache-Control": cacheControl,
                    // Crawlers only need the HTML, the RSC payload for hydration is embedded in it
                    "X-Robots-Tag": "noindex",
                },
            }),
        };
    }

    const ssrEntry = await import.meta.viteRsc.loadModule<typeof import("./entry.ssr.js")>("ssr", "index");
    const html = await ssrEntry.renderHtml(createStream(rscChunks));
    if (!("stream" in html)) {
        return html;
    }

    return {
        response: new Response(import.meta.env.DEV ? checkTitleCount(html.stream) : html.stream, {
            status,
            headers: { "Content-Type": "text/html;charset=utf-8", "Cache-Control": html.hasError ? noStoreCacheControl : cacheControl },
        }),
    };
}
