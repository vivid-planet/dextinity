import { isNotFoundDigest, parseRedirectDigest } from "./navigation.js";

function escapeHtmlAttribute(value: string) {
    return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

/**
 * The HTML for `notFound()` or `redirect()` called after the response started, when the status can't be changed anymore
 */
export function renderLateNavigationHtml(digest: string) {
    const redirect = parseRedirectDigest(digest);
    if (redirect) {
        return `<meta http-equiv="refresh" content="0;url=${escapeHtmlAttribute(redirect.location)}">`;
    }
    if (isNotFoundDigest(digest)) {
        return '<meta name="robots" content="noindex">';
    }
    return "";
}

/**
 * Inserts HTML into a stream of React DOM after its flushes. React flushes synchronously and may split an element
 * across chunks, so the chunks arriving in the same task belong together (like `injectRSCPayload()` of rsc-html-stream).
 * The first flush is the shell, nothing is inserted in front of it.
 */
export function createHtmlInsertion() {
    const encoder = new TextEncoder();
    let pendingHtml = "";
    let endOfFlushTimeout: ReturnType<typeof setTimeout> | undefined;
    let isShellSent = false;

    function enqueuePendingHtml(controller: TransformStreamDefaultController<Uint8Array>) {
        if (pendingHtml) {
            controller.enqueue(encoder.encode(pendingHtml));
            pendingHtml = "";
        }
    }

    return {
        insert(html: string) {
            pendingHtml += html;
        },
        stream: new TransformStream<Uint8Array, Uint8Array>({
            transform(chunk, controller) {
                if (endOfFlushTimeout === undefined) {
                    if (isShellSent) {
                        enqueuePendingHtml(controller);
                    }
                    endOfFlushTimeout = setTimeout(() => {
                        endOfFlushTimeout = undefined;
                        isShellSent = true;
                        enqueuePendingHtml(controller);
                    }, 0);
                }
                controller.enqueue(chunk);
            },
            flush(controller) {
                clearTimeout(endOfFlushTimeout);
                enqueuePendingHtml(controller);
            },
        }),
    };
}
