import { existsSync } from "node:fs";
import { join, posix } from "node:path";
import { Readable } from "node:stream";

import { createMiddleware } from "hono/factory";

import type { BuildAssetsStorage } from "./buildAssetsStorage.js";

const urlPrefix = "/_assets/";

type BuildAssetsMiddlewareOptions = {
    /**
     * Without a storage, all requests are passed on, e.g., in local development
     */
    storage?: BuildAssetsStorage;
    /**
     * Separates the build assets of different projects sharing a storage
     */
    storageKeyPrefix: string;
    /**
     * The directory holding the build assets of this build, served under `/_assets`
     */
    directory?: string;
};

/**
 * Serves an `/_assets` file that's missing in this build from the storage, which holds the build assets of every deployed build.
 * During a rolling deployment, a request for a build asset of another build can reach this instance.
 * Requests for other paths, for files of this build and for files missing in the storage are passed on.
 */
export function buildAssetsMiddleware({ storage, storageKeyPrefix, directory = "dist/client/_assets" }: BuildAssetsMiddlewareOptions) {
    return createMiddleware(async (c, next) => {
        const filePath = c.req.path;
        if (
            !storage ||
            (c.req.method !== "GET" && c.req.method !== "HEAD") ||
            !filePath.startsWith(urlPrefix) ||
            filePath.includes("..") ||
            filePath.includes("\\") ||
            existsSync(join(directory, filePath.slice(urlPrefix.length)))
        ) {
            return next();
        }

        const key = posix.join(storageKeyPrefix, filePath.slice(1));
        const buildAsset = await storage.getFile(key).catch((error: unknown) => {
            console.error(`Failed to load build asset ${key} from the storage`, error);
            return undefined;
        });
        if (!buildAsset) {
            return next();
        }

        const headers = new Headers();
        if (buildAsset.contentType) {
            headers.set("Content-Type", buildAsset.contentType);
        }
        if (buildAsset.cacheControl) {
            headers.set("Cache-Control", buildAsset.cacheControl);
        }
        if (c.req.method === "HEAD") {
            buildAsset.body.destroy();
            return new Response(null, { headers });
        }
        return new Response(Readable.toWeb(buildAsset.body) as ReadableStream, { headers });
    });
}
