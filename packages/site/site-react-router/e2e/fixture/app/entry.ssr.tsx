import { createFromReadableStream } from "@vitejs/plugin-rsc/ssr";
import { renderToReadableStream } from "react-dom/server.edge";
import { unstable_routeRSCServerRequest as routeRSCServerRequest, unstable_RSCStaticRouter as RSCStaticRouter } from "react-router";

import { reportError } from "./reportError";

/**
 * Renders the HTML of document requests from the RSC payload, like the default entry of React Router
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
                    // Returns the digest of redirects and responses, e.g. of notFound()
                    const digest = options.onError?.(error);
                    // Errors of server components have a digest and are reported by entry.rsc.tsx
                    if (digest === undefined && !(typeof error === "object" && error !== null && "digest" in error)) {
                        reportError(error);
                    }
                    return digest;
                },
            });
        },
    });
}
