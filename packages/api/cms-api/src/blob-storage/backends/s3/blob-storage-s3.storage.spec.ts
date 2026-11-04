import {
    CreateBucketCommand,
    DeleteBucketCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    HeadBucketCommand,
    HeadObjectCommand,
    ListObjectsV2Command,
    PutObjectCommand,
    S3Client,
} from "@aws-sdk/client-s3";
import { mockClient } from "aws-sdk-client-mock";
import { Readable } from "stream";
import { beforeEach, describe, expect, it } from "vitest";

import { BlobStorageS3Storage } from "./blob-storage-s3.storage";

function sdkError(statusCode: number, message = "Error"): Error {
    return Object.assign(new Error(message), { $response: { statusCode } });
}

function streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });
}

describe("BlobStorageS3Storage", () => {
    const s3Mock = mockClient(S3Client);

    let storage: BlobStorageS3Storage;

    beforeEach(() => {
        s3Mock.reset();
        storage = new BlobStorageS3Storage({ bucket: "my-bucket", region: "eu-central-1" });
    });

    describe("folderExists", () => {
        it("should return true when the bucket exists", async () => {
            s3Mock.on(HeadBucketCommand, { Bucket: "my-bucket" }).resolves({});

            expect(await storage.folderExists("some-folder")).toBe(true);
        });

        it("should return false when the bucket does not exist", async () => {
            s3Mock.on(HeadBucketCommand, { Bucket: "my-bucket" }).rejects(sdkError(404));

            expect(await storage.folderExists("some-folder")).toBe(false);
        });

        it("should rethrow non-404 errors", async () => {
            s3Mock.on(HeadBucketCommand).rejects(sdkError(403, "Forbidden"));

            await expect(storage.folderExists("some-folder")).rejects.toMatchObject({ message: "Forbidden" });
        });
    });

    describe("createFolder", () => {
        it("should send a CreateBucketCommand with the configured bucket", async () => {
            s3Mock.on(CreateBucketCommand).resolves({});

            await storage.createFolder("some-folder");

            const calls = s3Mock.commandCalls(CreateBucketCommand);
            expect(calls).toHaveLength(1);
            expect(calls[0].args[0].input).toEqual({ Bucket: "my-bucket" });
        });
    });

    describe("removeFolder", () => {
        it("should send a DeleteBucketCommand with the configured bucket", async () => {
            s3Mock.on(DeleteBucketCommand).resolves({});

            await storage.removeFolder("some-folder");

            const calls = s3Mock.commandCalls(DeleteBucketCommand);
            expect(calls).toHaveLength(1);
            expect(calls[0].args[0].input).toEqual({ Bucket: "my-bucket" });
        });
    });

    describe("fileExists", () => {
        it("should return true when HeadObject succeeds", async () => {
            s3Mock.on(HeadObjectCommand, { Bucket: "my-bucket", Key: "folder/file.txt" }).resolves({});

            expect(await storage.fileExists("folder", "file.txt")).toBe(true);
        });

        it("should return false when HeadObject returns 404", async () => {
            s3Mock.on(HeadObjectCommand).rejects(sdkError(404));

            expect(await storage.fileExists("folder", "missing.txt")).toBe(false);
        });

        it("should rethrow non-404 errors", async () => {
            s3Mock.on(HeadObjectCommand).rejects(sdkError(500, "Internal"));

            await expect(storage.fileExists("folder", "file.txt")).rejects.toMatchObject({ message: "Internal" });
        });
    });

    describe("createFile", () => {
        it("should upload a Buffer using PutObjectCommand", async () => {
            s3Mock.on(PutObjectCommand).resolves({});

            await storage.createFile("uploads", "buf.txt", Buffer.from("hello buffer"), { contentType: "text/plain", size: 12 });

            const calls = s3Mock.commandCalls(PutObjectCommand);
            expect(calls).toHaveLength(1);
            expect(calls[0].args[0].input).toMatchObject({
                Bucket: "my-bucket",
                Key: "uploads/buf.txt",
                ContentType: "text/plain",
                ContentLength: 12,
            });
        });
    });

    describe("getFile", () => {
        it("should return a readable stream with the file contents", async () => {
            s3Mock.on(GetObjectCommand, { Bucket: "my-bucket", Key: "folder/read-me.txt" }).resolves({
                Body: Readable.from([Buffer.from("read this")]) as never,
            });

            const stream = await storage.getFile("folder", "read-me.txt");
            const content = await streamToBuffer(stream);
            expect(content.toString()).toBe("read this");
        });
    });

    describe("getPartialFile", () => {
        it("should request the correct byte range", async () => {
            s3Mock.on(GetObjectCommand).resolves({
                Body: Readable.from([Buffer.from("3456")]) as never,
            });

            const stream = await storage.getPartialFile("folder", "partial.txt", 3, 4);
            const content = await streamToBuffer(stream);
            expect(content.toString()).toBe("3456");

            const calls = s3Mock.commandCalls(GetObjectCommand);
            expect(calls).toHaveLength(1);
            expect(calls[0].args[0].input).toMatchObject({
                Bucket: "my-bucket",
                Key: "folder/partial.txt",
                Range: "bytes=3-6",
            });
        });
    });

    describe("listFiles", () => {
        it("should return an empty array when there are no objects", async () => {
            s3Mock.on(ListObjectsV2Command).resolves({ Contents: [] });

            const files = await storage.listFiles("some-folder");
            expect(files).toEqual([]);
        });

        it("should return file names with the folder prefix stripped", async () => {
            s3Mock.on(ListObjectsV2Command).resolves({
                Contents: [{ Key: "listing/a.txt" }, { Key: "listing/b.txt" }],
            });

            const files = await storage.listFiles("listing");
            expect(files).toEqual(["a.txt", "b.txt"]);

            const calls = s3Mock.commandCalls(ListObjectsV2Command);
            expect(calls[0].args[0].input).toMatchObject({
                Bucket: "my-bucket",
                Prefix: "listing/",
            });
        });

        it("should handle pagination with continuation tokens", async () => {
            s3Mock
                .on(ListObjectsV2Command)
                .resolvesOnce({
                    Contents: [{ Key: "folder/page1.txt" }],
                    NextContinuationToken: "token-abc",
                })
                .resolvesOnce({
                    Contents: [{ Key: "folder/page2.txt" }],
                    NextContinuationToken: undefined,
                });

            const files = await storage.listFiles("folder");
            expect(files).toEqual(["page1.txt", "page2.txt"]);

            const calls = s3Mock.commandCalls(ListObjectsV2Command);
            expect(calls).toHaveLength(2);
            expect(calls[1].args[0].input.ContinuationToken).toBe("token-abc");
        });

        it("should skip the S3 folder marker object", async () => {
            s3Mock.on(ListObjectsV2Command).resolves({
                Contents: [{ Key: "listing/" }, { Key: "listing/a.txt" }, { Key: "listing/b.txt" }],
            });

            const files = await storage.listFiles("listing");
            expect(files).toEqual(["a.txt", "b.txt"]);
        });

        it("should skip objects without a Key", async () => {
            s3Mock.on(ListObjectsV2Command).resolves({
                Contents: [{ Key: "folder/valid.txt" }, {}, { Key: "folder/also-valid.txt" }],
            });

            const files = await storage.listFiles("folder");
            expect(files).toEqual(["valid.txt", "also-valid.txt"]);
        });
    });

    describe("removeFile", () => {
        it("should send a DeleteObjectCommand", async () => {
            s3Mock.on(DeleteObjectCommand).resolves({});

            await storage.removeFile("folder", "to-delete.txt");

            const calls = s3Mock.commandCalls(DeleteObjectCommand);
            expect(calls).toHaveLength(1);
            expect(calls[0].args[0].input).toEqual({
                Bucket: "my-bucket",
                Key: "folder/to-delete.txt",
            });
        });
    });

    describe("getFileMetaData", () => {
        it("should return size, etag, lastModified, and contentType", async () => {
            const lastModified = new Date("2025-01-15T10:00:00Z");
            s3Mock.on(HeadObjectCommand, { Bucket: "my-bucket", Key: "meta/info.txt" }).resolves({
                ContentLength: 42,
                ETag: '"abc123"',
                LastModified: lastModified,
                ContentType: "text/plain",
            });

            const meta = await storage.getFileMetaData("meta", "info.txt");

            expect(meta).toEqual({
                size: 42,
                etag: '"abc123"',
                lastModified,
                contentType: "text/plain",
            });
        });
    });

    describe("getBackendFilePathPrefix", () => {
        it("should return s3://", () => {
            expect(storage.getBackendFilePathPrefix()).toBe("s3://");
        });
    });

    describe("without a bucket (folderName as bucket)", () => {
        let noBucketStorage: BlobStorageS3Storage;

        beforeEach(() => {
            noBucketStorage = new BlobStorageS3Storage({ bucket: "", region: "eu-central-1" });
        });

        it("should use folderName as bucket for folderExists", async () => {
            s3Mock.on(HeadBucketCommand, { Bucket: "my-folder" }).resolves({});

            expect(await noBucketStorage.folderExists("my-folder")).toBe(true);
        });

        it("should use folderName as bucket and fileName as key for fileExists", async () => {
            s3Mock.on(HeadObjectCommand, { Bucket: "my-folder", Key: "file.txt" }).resolves({});

            expect(await noBucketStorage.fileExists("my-folder", "file.txt")).toBe(true);
        });

        it("should use folderName as bucket and fileName as key for removeFile", async () => {
            s3Mock.on(DeleteObjectCommand).resolves({});

            await noBucketStorage.removeFile("my-folder", "file.txt");

            const calls = s3Mock.commandCalls(DeleteObjectCommand);
            expect(calls[0].args[0].input).toEqual({ Bucket: "my-folder", Key: "file.txt" });
        });
    });
});
