import { reportError } from "@src/util/reportError";
import { createFromReadableStream } from "@vitejs/plugin-rsc/ssr";
import { renderToReadableStream } from "react-dom/server";
import { unstable_routeRSCServerRequest as routeRSCServerRequest, unstable_RSCStaticRouter as RSCStaticRouter } from "react-router";

/**
 * Renders the HTML of document requests from the RSC payload, like the default entry.ssr.tsx of React Router
 */
export async function generateHTML(request: Request, serverResponse: Response): Promise<Response> {
    return routeRSCServerRequest({
        request,
        serverResponse,
        createFromReadableStream,
        async renderHTML(getPayload, options) {
            const payload = await getPayload();
            const formState = payload.type === "render" ? await payload.formState : undefined;
            const bootstrapScriptContent = await import.meta.viteRsc.loadBootstrapScriptContent("index");

            return renderToReadableStream(<RSCStaticRouter getPayload={getPayload} />, {
                ...options,
                bootstrapScriptContent,
                formState,
                signal: request.signal,
                onError(error: unknown) {
                    // React Router encodes its redirects and responses in the digest, e.g. of a 404
                    const digest = options.onError?.(error);
                    // The errors of server components have a digest and are reported by entry.rsc.tsx
                    const isServerComponentError = typeof error === "object" && error !== null && "digest" in error;
                    if (digest === undefined && !isServerComponentError) {
                        reportError(error);
                    }
                    return digest;
                },
            });
        },
    });
}
