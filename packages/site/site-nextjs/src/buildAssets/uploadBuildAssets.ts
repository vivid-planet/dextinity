import { readdir, readFile } from "fs/promises";
import mime from "mime";
import { join, posix, relative, sep } from "path";

import type { BuildAssetsStorage } from "./storage/buildAssetsStorage";

const uploadConcurrency = 10;

type UploadBuildAssetsOptions = {
    storage: BuildAssetsStorage;
    /**
     * Separates the build assets of different projects sharing a storage
     */
    storageKeyPrefix: string;
    /**
     * The directory holding the build assets, served under `/_next/static`
     */
    directory?: string;
    /**
     * Defaults to the cache header Next.js serves the build assets with, since their file names contain content hashes
     */
    cacheControl?: string;
};

/**
 * Uploads the `.next/static` files of this build to the storage, so that instances of other builds can serve them with `serveBuildAsset`.
 * Run it after `next build` and before the build is rolled out, e.g., at the end of the build or in a job before the deployment.
 */
export async function uploadBuildAssets({
    storage,
    storageKeyPrefix,
    directory = ".next/static",
    cacheControl = "public, max-age=31536000, immutable",
}: UploadBuildAssetsOptions): Promise<void> {
    const filePaths = (await readdir(directory, { recursive: true, withFileTypes: true }))
        .filter((entry) => entry.isFile())
        .map((entry) => relative(directory, join(entry.parentPath, entry.name)).split(sep).join("/"));

    const queue = [...filePaths];
    await Promise.all(
        Array.from({ length: uploadConcurrency }, async () => {
            for (let filePath = queue.shift(); filePath !== undefined; filePath = queue.shift()) {
                await storage.putFile(posix.join(storageKeyPrefix, "_next/static", filePath), {
                    body: await readFile(join(directory, filePath)),
                    contentType: mime.getType(filePath) ?? "application/octet-stream",
                    cacheControl,
                });
            }
        }),
    );
}
