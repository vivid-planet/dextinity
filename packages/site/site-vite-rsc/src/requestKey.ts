import { createHash } from "node:crypto";

// Tracing instrumentations add a different trace context to every request
const ignoredHeaderNames = ["traceparent", "tracestate"];

/**
 * Identical requests, i.e. with the same method, URL, headers and body, get the same key
 */
export function createRequestKey(request: Request, body: Uint8Array<ArrayBuffer>) {
    const headers = [...request.headers.entries()].filter(([name]) => !ignoredHeaderNames.includes(name)).sort(([a], [b]) => a.localeCompare(b));
    return createHash("sha256")
        .update(JSON.stringify([request.method, request.url, headers]))
        .update(body)
        .digest("hex");
}
