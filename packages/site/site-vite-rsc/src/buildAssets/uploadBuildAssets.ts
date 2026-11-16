import { readdir, readFile } from "node:fs/promises";
import { join, posix, relative, sep } from "node:path";

import mime from "mime";

import type { BuildAssetsStorage } from "./buildAssetsStorage.js";

const uploadConcurrency = 10;

type UploadBuildAssetsOptions = {
    storage: BuildAssetsStorage;
    /**
     * Separates the build assets of different projects sharing a storage
     */
    storageKeyPrefix: string;
    /**
     * The directory holding the build assets, served under `/_assets`
     */
    directory?: string;
    /**
     * Defaults to a one-year immutable cache header, since the file names of the build assets contain content hashes
     */
    cacheControl?: string;
};

/**
 * Uploads the `dist/client/_assets` files of this build to the storage, so that instances of other builds can serve them with `buildAssetsMiddleware`.
 * Run it after `vite build` and before the build is rolled out, e.g., at the end of the build or in a job before the deployment.
 */
export async function uploadBuildAssets({
    storage,
    storageKeyPrefix,
    directory = "dist/client/_assets",
    cacheControl = "public, max-age=31536000, immutable",
}: UploadBuildAssetsOptions): Promise<void> {
    const filePaths = (await readdir(directory, { recursive: true, withFileTypes: true }))
        .filter((entry) => entry.isFile())
        .map((entry) => relative(directory, join(entry.parentPath, entry.name)).split(sep).join("/"));

    const queue = [...filePaths];
    await Promise.all(
        Array.from({ length: uploadConcurrency }, async () => {
            for (let filePath = queue.shift(); filePath !== undefined; filePath = queue.shift()) {
                await storage.putFile(posix.join(storageKeyPrefix, "_assets", filePath), {
                    body: await readFile(join(directory, filePath)),
                    contentType: mime.getType(filePath) ?? "application/octet-stream",
                    cacheControl,
                });
            }
        }),
    );
}
