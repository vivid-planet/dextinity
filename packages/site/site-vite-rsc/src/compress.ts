import { constants, createGzip } from "node:zlib";

import { createMiddleware } from "hono/factory";
import { parseAccept } from "hono/utils/accept";
import { COMPRESSIBLE_CONTENT_TYPE_REGEX } from "hono/utils/compress";

const minimumSizeInBytes = 1024;

function acceptsGzip(acceptEncoding: string | undefined) {
    return parseAccept(acceptEncoding ?? "").some(({ type, q }) => (type.toLowerCase() === "gzip" || type === "*") && q > 0);
}

/**
 * Gzip that flushes what it received so far after each task, so that streamed pages aren't held back until the end.
 * The chunks of one flush of React arrive in the same task, compressing them together keeps the compression ratio.
 */
export function createFlushingGzipStream(): TransformStream<Uint8Array, Uint8Array> {
    const gzip = createGzip();
    let isFlushScheduled = false;
    return new TransformStream({
        start(controller) {
            gzip.on("data", (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
            gzip.on("error", (error) => controller.error(error));
        },
        transform(chunk) {
            gzip.write(chunk);
            if (!isFlushScheduled) {
                isFlushScheduled = true;
                setImmediate(() => {
                    isFlushScheduled = false;
                    if (!gzip.writableEnded) {
                        gzip.flush(constants.Z_SYNC_FLUSH);
                    }
                });
            }
        },
        flush() {
            return new Promise((resolve) => {
                gzip.once("end", resolve);
                gzip.end();
            });
        },
    });
}

/**
 * Like `compress()` of Hono, whose `CompressionStream` holds back the response until it has enough data to compress
 */
export const compressMiddleware = createMiddleware(async (c, next) => {
    await next();

    const { res } = c;
    const contentType = res.headers.get("Content-Type");
    const contentLength = res.headers.get("Content-Length");
    if (
        !res.body ||
        c.req.method === "HEAD" ||
        res.status === 206 ||
        res.headers.has("Content-Encoding") ||
        (contentLength !== null && Number(contentLength) < minimumSizeInBytes) ||
        !contentType ||
        !COMPRESSIBLE_CONTENT_TYPE_REGEX.test(contentType) ||
        /(?:^|,)\s*no-transform\s*(?:,|$)/i.test(res.headers.get("Cache-Control") ?? "")
    ) {
        return;
    }

    const vary = res.headers.get("Vary");
    if (vary !== "*" && !/(?:^|,)\s*accept-encoding\s*(?:,|$)/i.test(vary ?? "")) {
        c.header("Vary", vary ? `${vary}, Accept-Encoding` : "Accept-Encoding");
    }
    if (!acceptsGzip(c.req.header("Accept-Encoding"))) {
        return;
    }

    c.res = new Response(res.body.pipeThrough(createFlushingGzipStream()), res);
    c.res.headers.delete("Content-Length");
    c.res.headers.set("Content-Encoding", "gzip");
    const etag = c.res.headers.get("ETag");
    if (etag && !etag.startsWith("W/")) {
        c.res.headers.set("ETag", `W/${etag}`);
    }
});
