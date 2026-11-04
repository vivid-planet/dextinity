import { randomUUID } from "crypto";
import { readdir, readFile } from "fs/promises";
import mime from "mime";
import { join, posix, relative, sep } from "path";
import { text } from "stream/consumers";

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
    /**
     * The number of uploads whose build assets stay in the storage. The build assets of older uploads are deleted.
     */
    keepBuilds?: number;
};

/**
 * Uploads the `.next/static` files of this build to the storage, so that instances of other builds can serve them with `serveBuildAsset`,
 * and deletes the build assets of older uploads.
 * Run it after `next build` and before the build is rolled out, e.g., at the end of the build or in a job before the deployment.
 */
export async function uploadBuildAssets({
    storage,
    storageKeyPrefix,
    directory = ".next/static",
    cacheControl = "public, max-age=31536000, immutable",
    keepBuilds = 10,
}: UploadBuildAssetsOptions): Promise<void> {
    if (!Number.isInteger(keepBuilds) || keepBuilds < 1) {
        throw new Error(`keepBuilds must be a whole number of at least 1, got ${keepBuilds}`);
    }

    const filePaths = (await readdir(directory, { recursive: true, withFileTypes: true }))
        .filter((entry) => entry.isFile())
        .map((entry) => relative(directory, join(entry.parentPath, entry.name)).split(sep).join("/"));
    const keys = filePaths.map((filePath) => posix.join(storageKeyPrefix, "_next/static", filePath));

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

    // Outside of _next/static, so serveBuildAsset never serves the manifests. The ISO timestamp sorts them by upload.
    const manifestsPrefix = posix.join(storageKeyPrefix, "build-assets-manifests/");
    await storage.putFile(`${manifestsPrefix}${new Date().toISOString()}-${randomUUID()}.json`, {
        body: Buffer.from(JSON.stringify(keys)),
        contentType: "application/json",
    });

    try {
        await deleteBuildAssetsOfOlderUploads({ storage, storageKeyPrefix, manifestsPrefix, keepBuilds });
    } catch (error) {
        // The build assets of this build are in the storage, so the deployment can go ahead
        console.error("Failed to delete the build assets of older uploads", error);
    }
}

async function deleteBuildAssetsOfOlderUploads({
    storage,
    storageKeyPrefix,
    manifestsPrefix,
    keepBuilds,
}: {
    storage: BuildAssetsStorage;
    storageKeyPrefix: string;
    manifestsPrefix: string;
    keepBuilds: number;
}): Promise<void> {
    const manifestKeys = (await storage.listFiles(manifestsPrefix)).sort();
    // Until then, the storage may still hold build assets uploaded before the manifests were introduced, which running instances may need
    if (manifestKeys.length <= keepBuilds) {
        return;
    }

    const keptKeys = new Set<string>();
    for (const manifestKey of manifestKeys.slice(-keepBuilds)) {
        const manifest = await storage.getFile(manifestKey);
        if (!manifest) {
            throw new Error(`The manifest ${manifestKey} is missing, so the build assets it lists can't be told apart from older ones`);
        }
        for (const key of JSON.parse(await text(manifest.body)) as string[]) {
            keptKeys.add(key);
        }
    }

    const staleKeys = (await storage.listFiles(posix.join(storageKeyPrefix, "_next/static/"))).filter((key) => !keptKeys.has(key));
    await storage.deleteFiles([...staleKeys, ...manifestKeys.slice(0, -keepBuilds)]);
}
