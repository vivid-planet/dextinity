// @vitest-environment node
import {
    DeleteObjectsCommand,
    GetObjectCommand,
    type GetObjectCommandOutput,
    ListObjectsV2Command,
    NoSuchKey,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
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

    it("lists the keys of all pages", async () => {
        s3Mock
            .on(ListObjectsV2Command, { Prefix: "site/_next/static/", ContinuationToken: undefined })
            .resolves({ Contents: [{ Key: "site/_next/static/a.js" }], NextContinuationToken: "next" })
            .on(ListObjectsV2Command, { Prefix: "site/_next/static/", ContinuationToken: "next" })
            .resolves({ Contents: [{ Key: "site/_next/static/b.js" }] });

        expect(await storage.listFiles("site/_next/static/")).toEqual(["site/_next/static/a.js", "site/_next/static/b.js"]);
    });

    it("deletes files in batches of 1000", async () => {
        s3Mock.on(DeleteObjectsCommand).resolves({});
        const keys = Array.from({ length: 1001 }, (_, index) => `site/_next/static/${index}.js`);

        await storage.deleteFiles(keys);

        const calls = s3Mock.commandCalls(DeleteObjectsCommand);
        expect(calls.map((call) => call.args[0].input.Delete?.Objects?.length)).toEqual([1000, 1]);
    });

    it("throws if a file couldn't be deleted", async () => {
        s3Mock.on(DeleteObjectsCommand).resolves({ Errors: [{ Key: "site/_next/static/a.js", Message: "Access Denied" }] });

        await expect(storage.deleteFiles(["site/_next/static/a.js"])).rejects.toThrow("Access Denied");
    });
});
