import { Readable } from "node:stream";
import { constants, createBrotliCompress, createGzip } from "node:zlib";

const compressibleContentType = /^(text\/|application\/(json|javascript|xml|manifest\+json|.*\+json|.*\+xml)|image\/svg\+xml)/;

function getEncoding(acceptEncoding: string | null): "br" | "gzip" | undefined {
    const encodings = (acceptEncoding ?? "").split(",").map((encoding) => encoding.split(";")[0].trim());
    if (encodings.includes("br")) {
        return "br";
    }
    if (encodings.includes("gzip")) {
        return "gzip";
    }
    return undefined;
}

/**
 * Compresses the response with Brotli or gzip if the client accepts it, like Next.js does. The compressed chunks are flushed
 * as they come, so that streamed HTML and RSC payloads are still streamed.
 */
export function compressResponse(request: Request, response: Response): Response {
    const contentType = response.headers.get("Content-Type") ?? "";
    const encoding = getEncoding(request.headers.get("Accept-Encoding"));
    if (
        !encoding ||
        !response.body ||
        request.method === "HEAD" ||
        response.headers.has("Content-Encoding") ||
        response.headers.get("Cache-Control")?.includes("no-transform") ||
        !compressibleContentType.test(contentType)
    ) {
        return response;
    }

    const compression =
        encoding === "br"
            ? createBrotliCompress({ flush: constants.BROTLI_OPERATION_FLUSH, params: { [constants.BROTLI_PARAM_QUALITY]: 4 } })
            : createGzip({ flush: constants.Z_SYNC_FLUSH });
    const body = Readable.fromWeb(response.body as import("node:stream/web").ReadableStream).pipe(compression);

    const headers = new Headers(response.headers);
    headers.set("Content-Encoding", encoding);
    headers.delete("Content-Length");
    headers.append("Vary", "Accept-Encoding");
    return new Response(Readable.toWeb(body) as ReadableStream<Uint8Array>, { status: response.status, statusText: response.statusText, headers });
}
