import { serveStatic } from "@hono/node-server/serve-static";
import { createMiddleware } from "hono/factory";

const serveClientBuild = serveStatic({ root: "./dist/client" });

function getStaticFileMaxAge(pathname: string) {
    if (pathname.startsWith("/_assets/")) {
        // build assets have a content hash in their filename
        return 31536000; // 1 year cache
    } else if (pathname.startsWith("/assets/")) {
        // assets in public/assets/* are cached for 1 week. When updated without changing the filename, the cache is not invalidated.
        // To force an immediate update of a file, ensure the filename is changed as well
        return 604800; // 1 week cache
    } else if (["/favicon.ico", "/icon.svg", "/apple-icon.png"].includes(pathname)) {
        return 900; // 15 minutes cache
    }
    return undefined;
}

/**
 * Serves the client build including the files of public/ in production, Vite serves them during development
 */
export const staticFilesMiddleware = createMiddleware(async (c, next) => {
    let isFileFound = true;
    const response = await serveClientBuild(c, async () => {
        isFileFound = false;
        await next();
    });
    if (!isFileFound || !response) {
        return;
    }

    const maxAge = getStaticFileMaxAge(c.req.path);
    if (maxAge) {
        response.headers.set("Cache-Control", `public, max-age=${maxAge}`);
    }
    return response;
});
