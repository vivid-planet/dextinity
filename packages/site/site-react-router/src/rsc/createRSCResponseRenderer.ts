import { isRouteErrorResponse, type unstable_RSCMatch as RSCMatch } from "react-router";

import { noStoreCacheControl } from "../cacheControl";

type RenderToReadableStream = (
    payload: unknown,
    options: { onError: (error: unknown) => string | undefined; temporaryReferences: unknown },
) => ReadableStream<Uint8Array>;

type GenerateResponseOptions = {
    onError(error: unknown): string | undefined;
    temporaryReferences: unknown;
};

function isRSCDataRequest(request: Request): boolean {
    return new URL(request.url).pathname.endsWith(".rsc");
}

/**
 * Renders the RSC payload of a request with error reporting and caching that fits a CMS site. Create one per request in `entry.rsc.tsx`
 * and pass its functions to `matchRSCServerRequest()`.
 *
 * In addition to the default of React Router:
 * - Errors of actions, resource routes, loaders, middlewares and server components are passed to `reportError`.
 *   Redirects and responses, e.g. a thrown `data(null, { status: 404 })`, aren't errors.
 * - The payloads of client navigations (`.rsc` requests) get `no-store` instead of the `Cache-Control` of the route when they
 *   contain an error. Their status is 200 even then, so they are rendered completely before responding.
 *   Document requests get their error status from the server-side rendering, see `preventCachingOfErrorResponse()`.
 *
 * @example
 * const renderer = createRSCResponseRenderer({ renderToReadableStream, reportError });
 * const response = await matchRSCServerRequest({
 *     // ...
 *     onError: renderer.onError,
 *     generateResponse: renderer.generateResponse,
 * });
 * return renderer.completeResponse(request, response);
 */
export function createRSCResponseRenderer({
    renderToReadableStream,
    reportError,
}: {
    renderToReadableStream: RenderToReadableStream;
    reportError: (error: unknown) => void;
}) {
    let hasError = false;

    function onError(error: unknown) {
        hasError = true;
        reportError(error);
    }

    function generateResponse(match: RSCMatch, options: GenerateResponseOptions): Response {
        if (match.payload.type === "render") {
            for (const error of Object.values(match.payload.errors ?? {})) {
                if (!isRouteErrorResponse(error)) {
                    onError(error);
                }
            }
        }

        const stream = renderToReadableStream(match.payload, {
            ...options,
            onError(error) {
                // React Router encodes its redirects and responses in the digest
                const digest = options.onError(error);
                if (digest === undefined) {
                    onError(error);
                }
                return digest;
            },
        });
        return new Response(stream, { status: match.statusCode, headers: match.headers });
    }

    async function completeResponse(request: Request, response: Response): Promise<Response> {
        const isPayload = response.headers.get("Content-Type")?.startsWith("text/x-component");
        if (!isRSCDataRequest(request) || !isPayload || !response.body) {
            return response;
        }
        const body = await response.arrayBuffer();
        const headers = new Headers(response.headers);
        if (hasError) {
            headers.set("Cache-Control", noStoreCacheControl);
        }
        return new Response(body, { status: response.status, statusText: response.statusText, headers });
    }

    return { onError, generateResponse, completeResponse };
}
