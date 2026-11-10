import { existsSync } from "fs";
import type { IncomingMessage, ServerResponse } from "http";
import { join, posix } from "path";
import { pipeline } from "stream/promises";

import type { BuildAssetsStorage } from "./storage/buildAssetsStorage";

type ServeBuildAssetOptions = {
    req: IncomingMessage;
    res: ServerResponse;
    /**
     * Without a storage, all requests are left to Next.js, e.g., in local development
     */
    storage?: BuildAssetsStorage;
    /**
     * Separates the build assets of different projects sharing a storage
     */
    storageKeyPrefix: string;
    /**
     * The directory holding the build assets of this build, served under `/_next/static`
     */
    directory?: string;
};

/**
 * Serves a `/_next/static` file that's missing in this build from the storage, which holds the build assets of every deployed build.
 * During a rolling deployment, a request for a build asset of another build can reach this instance.
 *
 * @returns `true` if the file was served, `false` if Next.js should handle the request
 */
export async function serveBuildAsset({ req, res, storage, storageKeyPrefix, directory = ".next/static" }: ServeBuildAssetOptions): Promise<boolean> {
    const filePath = decodePathname(req.url?.split("?", 1)[0]);
    if (
        !storage ||
        !filePath?.startsWith("/_next/static/") ||
        filePath.includes("..") ||
        existsSync(join(directory, filePath.slice("/_next/static/".length)))
    ) {
        return false;
    }

    const key = posix.join(storageKeyPrefix, filePath.slice(1));
    const buildAsset = await storage.getFile(key).catch((error: unknown) => {
        console.error(`Failed to load build asset ${key} from the storage`, error);
        return undefined;
    });
    if (!buildAsset) {
        return false;
    }

    if (buildAsset.contentType) {
        res.setHeader("Content-Type", buildAsset.contentType);
    }
    if (buildAsset.cacheControl) {
        res.setHeader("Cache-Control", buildAsset.cacheControl);
    }
    await pipeline(buildAsset.body, res);
    return true;
}

// Next.js requests chunks of dynamic routes with escaped brackets, e.g. /_next/static/chunks/app/%5Blanguage%5D/page.js
function decodePathname(pathname: string | null | undefined): string | undefined {
    try {
        return pathname ? decodeURIComponent(pathname) : undefined;
    } catch {
        return undefined;
    }
}
