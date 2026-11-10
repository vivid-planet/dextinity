// @vitest-environment node
import { GetObjectCommand, type GetObjectCommandOutput, NoSuchKey, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { Readable } from "stream";
import { afterEach, describe, expect, it } from "vitest";

import { createS3BuildAssetsStorage } from "../s3BuildAssetsStorage";

describe("createS3BuildAssetsStorage", () => {
    const s3Mock = mockClient(S3Client);
    const storage = createS3BuildAssetsStorage({ bucket: "build-assets", region: "eu-central-1" });

    afterEach(() => {
        s3Mock.reset();
    });

    it("returns the file with its content type and cache header", async () => {
        s3Mock.on(GetObjectCommand, { Bucket: "build-assets", Key: "site/_next/static/chunks/old.js" }).resolves({
            Body: Readable.from(["old"]) as unknown as GetObjectCommandOutput["Body"],
            ContentType: "text/javascript; charset=utf-8",
            CacheControl: "public, max-age=31536000, immutable",
        });

        const buildAsset = await storage.getFile("site/_next/static/chunks/old.js");

        expect(buildAsset?.contentType).toBe("text/javascript; charset=utf-8");
        expect(buildAsset?.cacheControl).toBe("public, max-age=31536000, immutable");
    });

    it("returns undefined for a missing file", async () => {
        s3Mock.on(GetObjectCommand).rejects(new NoSuchKey({ message: "NoSuchKey", $metadata: {} }));

        expect(await storage.getFile("site/_next/static/chunks/missing.js")).toBeUndefined();
    });

    it("throws other errors", async () => {
        s3Mock.on(GetObjectCommand).rejects(new Error("Access Denied"));

        await expect(storage.getFile("site/_next/static/chunks/old.js")).rejects.toThrow("Access Denied");
    });
    it("stores a file with its content type and cache header", async () => {
        s3Mock.on(PutObjectCommand).resolves({});

        await storage.putFile("site/_next/static/chunks/new.js", {
            body: Buffer.from("new"),
            contentType: "text/javascript",
            cacheControl: "public, max-age=31536000, immutable",
        });

        expect(s3Mock.commandCalls(PutObjectCommand)[0].args[0].input).toMatchObject({
            Bucket: "build-assets",
            Key: "site/_next/static/chunks/new.js",
            ContentType: "text/javascript",
            CacheControl: "public, max-age=31536000, immutable",
        });
    });
});
