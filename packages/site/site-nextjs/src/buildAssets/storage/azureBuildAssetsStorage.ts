import { BlobServiceClient, RestError, StorageSharedKeyCredential } from "@azure/storage-blob";
import { Readable } from "stream";

import type { BuildAssetsStorage } from "./buildAssetsStorage";

export function createAzureBuildAssetsStorage({
    accountName,
    accountKey,
    container,
}: {
    accountName: string;
    accountKey: string;
    container: string;
}): BuildAssetsStorage {
    const containerClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        new StorageSharedKeyCredential(accountName, accountKey),
    ).getContainerClient(container);

    return {
        async getFile(key) {
            try {
                const blob = await containerClient.getBlobClient(key).download();
                if (!blob.readableStreamBody) {
                    return undefined;
                }
                return { body: Readable.from(blob.readableStreamBody), contentType: blob.contentType, cacheControl: blob.cacheControl };
            } catch (error) {
                if (error instanceof RestError && error.statusCode === 404) {
                    return undefined;
                }
                throw error;
            }
        },
        async putFile(key, { body, contentType, cacheControl }) {
            await containerClient
                .getBlockBlobClient(key)
                .uploadData(body, { blobHTTPHeaders: { blobContentType: contentType, blobCacheControl: cacheControl } });
        },
        async listFiles(prefix) {
            const keys: string[] = [];
            for await (const blob of containerClient.listBlobsFlat({ prefix })) {
                keys.push(blob.name);
            }
            return keys;
        },
        async deleteFiles(keys) {
            for (const key of keys) {
                await containerClient.deleteBlob(key, { deleteSnapshots: "include" });
            }
        },
    };
}
