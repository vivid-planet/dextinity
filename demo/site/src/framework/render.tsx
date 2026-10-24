import { renderToReadableStream } from "@vitejs/plugin-rsc/rsc/server";
import type { Context } from "hono";
import type { ReactNode } from "react";

import { getNavigationErrorDigest, isNotFoundDigest, parseRedirectDigest } from "./navigation";
import { reportError } from "./reportError";
import { getRequest, isRscRequest } from "./requestContext";
import { RouterProvider } from "./RouterProvider";

export type RscPayload = {
    root: ReactNode;
};

export const noStoreCacheControl = "private, no-cache, no-store, max-age=0, must-revalidate";

type RenderPageOptions = {
    root: ReactNode;
    /** Rendered with status 404 when `notFound()` is called while rendering `root` */
    notFound: () => ReactNode;
    /** Rendered with status 500 when rendering `root` fails */
    error: () => ReactNode;
    /** Only used for successful responses, all others aren't cached */
    cacheControl: string;
    status?: number;
};

export async function renderPage(c: Context, options: RenderPageOptions): Promise<Response> {
    const { root, notFound, error, status = 200 } = options;
    const url = new URL(getRequest().url);
    const rscPayload = await renderRscPayload(
        <RouterProvider pathname={url.pathname} search={url.search} params={c.req.param()}>
            {root}
        </RouterProvider>,
    );
    // Also when an error boundary in the browser handles the errors, they must not be cached
    const cacheControl = status === 200 && !rscPayload.hasError ? options.cacheControl : noStoreCacheControl;

    const result = rscPayload.navigationDigest
        ? { navigationDigest: rscPayload.navigationDigest }
        : await respond(rscPayload.chunks, { status, cacheControl });
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
        return c.redirect(redirect.location, redirect.status);
    }
    if (isNotFoundDigest(result.navigationDigest) && status !== 404) {
        return renderPage(c, { ...options, root: notFound(), status: 404 });
    }
    throw new Error("notFound() must not be called while rendering the not found page");
}

async function renderRscPayload(root: ReactNode) {
    let navigationDigest: string | undefined;
    let hasError = false;
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

    const ssrEntry = await import.meta.viteRsc.loadModule<typeof import("./entry.ssr")>("ssr", "index");
    const html = await ssrEntry.renderHtml(createStream(rscChunks));
    if (!("stream" in html)) {
        return html;
    }

    return {
        response: new Response(html.stream, {
            status,
            headers: { "Content-Type": "text/html;charset=utf-8", "Cache-Control": cacheControl },
        }),
    };
}
