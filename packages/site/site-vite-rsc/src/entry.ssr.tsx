import { createFromReadableStream, getClientEntryUrl } from "@vitejs/plugin-rsc/ssr";
import { use } from "react";
import { renderToReadableStream } from "react-dom/server.edge";
import { injectRSCPayload } from "rsc-html-stream/server";

import { getNavigationErrorDigest } from "./navigation.js";
import type { RscPayload } from "./render.js";
import { reportError } from "./reportError.js";

type RenderHtmlResult =
    | { stream: ReadableStream<Uint8Array> }
    /** `notFound()` or `redirect()` was called by a client component */
    | { navigationDigest: string }
    /** Rendering the shell failed */
    | { hasFailed: true };

export async function renderHtml(rscStream: ReadableStream<Uint8Array>): Promise<RenderHtmlResult> {
    const [ssrRscStream, browserRscStream] = rscStream.tee();

    let payload: Promise<RscPayload> | undefined;
    function SsrRoot() {
        // Deserialization must start inside the React DOM render for preloading (e.g. of client component CSS) to work
        payload ??= createFromReadableStream<RscPayload>(ssrRscStream);
        return use(payload).root;
    }

    let htmlStream: ReadableStream<Uint8Array>;
    try {
        htmlStream = await renderToReadableStream(<SsrRoot />, {
            bootstrapScriptContent: `import(${JSON.stringify(getClientEntryUrl())})`,
            onError(error: unknown) {
                const digest = getNavigationErrorDigest(error);
                if (digest) {
                    return digest;
                }
                reportError(error);
                return undefined;
            },
        });
    } catch (error) {
        await browserRscStream.cancel();
        const navigationDigest = getNavigationErrorDigest(error);
        if (navigationDigest) {
            return { navigationDigest };
        }
        return { hasFailed: true };
    }

    // The RSC payload is embedded into the HTML for hydration
    return { stream: htmlStream.pipeThrough(injectRSCPayload(browserRscStream)) };
}

if (import.meta.hot) {
    import.meta.hot.accept();
}
