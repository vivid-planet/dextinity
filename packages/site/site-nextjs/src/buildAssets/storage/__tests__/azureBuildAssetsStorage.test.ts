// @vitest-environment node
import { BlobClient, type BlobDownloadResponseParsed, BlockBlobClient, type BlockBlobUploadResponse, RestError } from "@azure/storage-blob";
import { Readable } from "stream";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createAzureBuildAssetsStorage } from "../azureBuildAssetsStorage";

describe("createAzureBuildAssetsStorage", () => {
    const storage = createAzureBuildAssetsStorage({
        accountName: "account",
        accountKey: Buffer.from("key").toString("base64"),
        container: "build-assets",
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns the file with its content type and cache header", async () => {
        const download = vi.spyOn(BlobClient.prototype, "download").mockResolvedValue({
            readableStreamBody: Readable.from(["old"]),
            contentType: "text/javascript; charset=utf-8",
            cacheControl: "public, max-age=31536000, immutable",
        } as unknown as BlobDownloadResponseParsed);

        const buildAsset = await storage.getFile("site/_next/static/chunks/old.js");

        expect(buildAsset?.contentType).toBe("text/javascript; charset=utf-8");
        expect(buildAsset?.cacheControl).toBe("public, max-age=31536000, immutable");
        expect(download.mock.contexts[0]).toMatchObject({ containerName: "build-assets", name: "site/_next/static/chunks/old.js" });
    });

    it("returns undefined for a missing file", async () => {
        vi.spyOn(BlobClient.prototype, "download").mockRejectedValue(new RestError("The specified blob does not exist.", { statusCode: 404 }));

        expect(await storage.getFile("site/_next/static/chunks/missing.js")).toBeUndefined();
    });

    it("throws other errors", async () => {
        vi.spyOn(BlobClient.prototype, "download").mockRejectedValue(
            new RestError("Server failed to authenticate the request.", { statusCode: 403 }),
        );

        await expect(storage.getFile("site/_next/static/chunks/old.js")).rejects.toThrow("Server failed to authenticate the request.");
    });
    it("stores a file with its content type and cache header", async () => {
        const uploadData = vi.spyOn(BlockBlobClient.prototype, "uploadData").mockResolvedValue({} as BlockBlobUploadResponse);

        await storage.putFile("site/_next/static/chunks/new.js", {
            body: Buffer.from("new"),
            contentType: "text/javascript",
            cacheControl: "public, max-age=31536000, immutable",
        });

        expect(uploadData.mock.contexts[0]).toMatchObject({ containerName: "build-assets", name: "site/_next/static/chunks/new.js" });
        expect(uploadData.mock.calls[0][1]).toEqual({
            blobHTTPHeaders: { blobContentType: "text/javascript", blobCacheControl: "public, max-age=31536000, immutable" },
        });
    });
});
