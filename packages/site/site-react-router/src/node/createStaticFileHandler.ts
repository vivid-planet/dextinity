import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { Readable } from "node:stream";

const contentTypes: Record<string, string> = {
    ".avif": "image/avif",
    ".css": "text/css; charset=utf-8",
    ".gif": "image/gif",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".map": "application/json; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".mp4": "video/mp4",
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".txt": "text/plain; charset=utf-8",
    ".webmanifest": "application/manifest+json",
    ".webm": "video/webm",
    ".webp": "image/webp",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".xml": "application/xml; charset=utf-8",
};

/**
 * Serves the files of the client build (`build/client`), which contains the hashed build assets and the files of `public/`.
 * During development, Vite serves them.
 *
 * @param options.directory The directory of the files
 * @param options.cacheControl The `Cache-Control` of a file by its path, e.g. a long caching for the hashed build assets
 * @returns A function that responds with the file of a request, or `undefined` if there is no file for the request
 *
 * @example
 * const serveStaticFile = createStaticFileHandler({
 *     directory: "build/client",
 *     cacheControl: (pathname) => (pathname.startsWith("/_assets/") ? "public, max-age=31536000, immutable" : "public, max-age=900"),
 * });
 * const response = (await serveStaticFile(request)) ?? (await handleRequest(request));
 */
export function createStaticFileHandler({ directory, cacheControl }: { directory: string; cacheControl: (pathname: string) => string }) {
    const root = resolve(directory);

    return async function serveStaticFile(request: Request): Promise<Response | undefined> {
        if (request.method !== "GET" && request.method !== "HEAD") {
            return undefined;
        }

        let pathname: string;
        try {
            pathname = decodeURIComponent(new URL(request.url).pathname);
        } catch {
            return undefined;
        }
        const filePath = join(root, pathname);
        if (pathname.includes("\0") || !filePath.startsWith(root + sep)) {
            return undefined;
        }

        const stats = await stat(filePath).catch(() => undefined);
        if (!stats?.isFile()) {
            return undefined;
        }

        const lastModified = new Date(Math.floor(stats.mtimeMs / 1000) * 1000);
        const headers = new Headers({
            "Content-Type": contentTypes[extname(filePath).toLowerCase()] ?? "application/octet-stream",
            "Cache-Control": cacheControl(pathname),
            "Last-Modified": lastModified.toUTCString(),
        });

        const ifModifiedSince = request.headers.get("If-Modified-Since");
        if (ifModifiedSince && new Date(ifModifiedSince) >= lastModified) {
            return new Response(null, { status: 304, headers });
        }

        headers.set("Content-Length", String(stats.size));
        if (request.method === "HEAD") {
            return new Response(null, { headers });
        }
        return new Response(Readable.toWeb(createReadStream(filePath)) as ReadableStream<Uint8Array>, { headers });
    };
}
