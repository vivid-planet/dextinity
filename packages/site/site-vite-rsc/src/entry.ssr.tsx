import { createFromReadableStream, getClientEntryUrl } from "@vitejs/plugin-rsc/ssr";
import { use } from "react";
import { renderToReadableStream } from "react-dom/server";
import { injectRSCPayload } from "rsc-html-stream/server";
import { reportError as reportErrorOfSite } from "virtual:dextinity-site/report-error";

import { getNavigationErrorDigest } from "./navigation.js";
import type { RscPayload } from "./render.js";
import { reportError, setErrorReporter } from "./reportError.js";

setErrorReporter(reportErrorOfSite);

type RenderHtmlResult =
    /** `hasError` when a Suspense boundary is rendered by the browser instead, as its content failed */
    | { stream: ReadableStream<Uint8Array>; hasError: boolean }
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

    let navigationDigest: string | undefined;
    let hasError = false;
    let htmlStream: Awaited<ReturnType<typeof renderToReadableStream>>;
    try {
        htmlStream = await renderToReadableStream(<SsrRoot />, {
            bootstrapScriptContent: `import(${JSON.stringify(getClientEntryUrl())})`,
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
        });
    } catch (error) {
        await browserRscStream.cancel();
        const navigationDigest = getNavigationErrorDigest(error);
        if (navigationDigest) {
            return { navigationDigest };
        }
        return { hasFailed: true };
    }

    // Errors inside Suspense boundaries don't fail the shell, so the status is only known when everything is rendered
    await htmlStream.allReady;
    if (navigationDigest) {
        await Promise.all([htmlStream.cancel(), browserRscStream.cancel()]);
        return { navigationDigest };
    }

    // The RSC payload is embedded into the HTML for hydration
    return { stream: htmlStream.pipeThrough(injectRSCPayload(browserRscStream)), hasError };
}

if (import.meta.hot) {
    import.meta.hot.accept();
}
