import { isRouteErrorResponse, RouterContextProvider, unstable_matchRSCServerRequest as matchRSCServerRequest } from "react-router";

import { noStoreCacheControl } from "./cacheControl.js";

type MatchOptions = Parameters<typeof matchRSCServerRequest>[0];

type RenderToReadableStream = (
    payload: unknown,
    options: { onError: (error: unknown) => string | undefined; temporaryReferences: unknown },
) => ReadableStream<Uint8Array>;

/**
 * Matches the request with the routes and renders their RSC payload, the `fetchServer()` of React Router's default `entry.rsc.tsx`
 * with error reporting and caching like `@dextinity/site-vite-rsc`:
 *
 * - Errors of middlewares, loaders and server components are passed to `reportError`, redirects and responses like `notFound()` aren't errors
 * - The payload is rendered completely before responding, so that payloads with errors, which the error boundaries render, get
 *   `no-store` instead of the `Cache-Control` of the page. Also client navigations, whose status is always 200, aren't cached then.
 *
 * @example
 * import { createTemporaryReferenceSet, decodeAction, decodeFormState, decodeReply, loadServerAction, renderToReadableStream } from "@vitejs/plugin-rsc/rsc";
 *
 * const response = await matchRscRequest({
 *     request, routes, basename, clientVersion, routeDiscovery,
 *     createTemporaryReferenceSet, decodeAction, decodeFormState, decodeReply, loadServerAction, renderToReadableStream,
 *     reportError,
 * });
 */
export async function matchRscRequest({
    renderToReadableStream,
    reportError,
    ...options
}: Omit<MatchOptions, "generateResponse" | "onError" | "requestContext"> & {
    renderToReadableStream: RenderToReadableStream;
    reportError: (error: unknown) => void;
}): Promise<Response> {
    let hasError = false;

    function handleError(error: unknown) {
        hasError = true;
        reportError(error);
    }

    const response = await matchRSCServerRequest({
        ...options,
        requestContext: new RouterContextProvider(),
        // Errors of actions and resource routes
        onError: reportError,
        generateResponse(match, renderOptions) {
            if (match.payload.type === "render") {
                for (const error of Object.values(match.payload.errors ?? {})) {
                    if (!isRouteErrorResponse(error)) {
                        handleError(error);
                    }
                }
            }
            const stream = renderToReadableStream(match.payload, {
                ...renderOptions,
                onError(error) {
                    const digest = renderOptions.onError(error);
                    if (digest === undefined) {
                        handleError(error);
                    }
                    return digest;
                },
            });
            return new Response(stream, { status: match.statusCode, headers: match.headers });
        },
    });

    // Resource routes answer with their own response
    if (response.headers.get("Content-Type")?.split(";")[0] !== "text/x-component") {
        return response;
    }

    const body = await response.arrayBuffer();
    const headers = new Headers(response.headers);
    if (hasError) {
        headers.set("Cache-Control", noStoreCacheControl);
    }
    return new Response(body, { status: response.status, statusText: response.statusText, headers });
}
