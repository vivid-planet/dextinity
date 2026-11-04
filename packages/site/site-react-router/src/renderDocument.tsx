import { PassThrough } from "node:stream";

import { createReadableStreamFromReadable } from "@react-router/node";
import { isbot } from "isbot";
import { renderToPipeableStream, type RenderToPipeableStreamOptions } from "react-dom/server";
import { type EntryContext, ServerRouter } from "react-router";

const streamTimeoutInMilliseconds = 5000;

/**
 * Renders the HTML of a document request, the default export of the site's `entry.server.tsx`.
 * Like React Router's default entry, but bots get the complete page instead of a stream, e.g. for the status of late errors.
 *
 * @example
 * // src/entry.server.tsx
 * export const streamTimeout = 5000;
 * export default function handleRequest(request: Request, status: number, headers: Headers, routerContext: EntryContext) {
 *     return renderDocument({ request, status, headers, routerContext });
 * }
 */
export function renderDocument({
    request,
    status,
    headers,
    routerContext,
}: {
    request: Request;
    status: number;
    headers: Headers;
    routerContext: EntryContext;
}): Promise<Response> {
    // https://httpwg.org/specs/rfc9110.html#HEAD
    if (request.method.toUpperCase() === "HEAD") {
        return Promise.resolve(new Response(null, { status, headers }));
    }

    return new Promise((resolve, reject) => {
        let responseStatus = status;
        const userAgent = request.headers.get("user-agent");
        const readyOption: keyof RenderToPipeableStreamOptions =
            (userAgent && isbot(userAgent)) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";

        // Aborted after the stream timeout of React Router, so that rejected boundaries are still flushed
        let timeoutId: ReturnType<typeof setTimeout> | undefined = setTimeout(() => abort(), streamTimeoutInMilliseconds + 1000);

        const { pipe, abort } = renderToPipeableStream(<ServerRouter context={routerContext} url={request.url} />, {
            [readyOption]() {
                const body = new PassThrough({
                    final(callback) {
                        clearTimeout(timeoutId);
                        timeoutId = undefined;
                        callback();
                    },
                });
                headers.set("Content-Type", "text/html;charset=utf-8");
                pipe(body);
                resolve(new Response(createReadableStreamFromReadable(body), { headers, status: responseStatus }));
            },
            onShellError(error: unknown) {
                reject(error);
            },
            onError() {
                // Errors before the shell is ready are rendered by React Router with the error boundary, later ones only change
                // the status of bots, which wait for the complete page
                responseStatus = 500;
            },
        });
    });
}
