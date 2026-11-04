import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { Readable } from "stream";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { BlobStorageFileStorage } from "./blob-storage-file.storage";

function streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
    });
}

describe("BlobStorageFileStorage", () => {
    let storage: BlobStorageFileStorage;
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "blob-storage-file-test-"));
        storage = new BlobStorageFileStorage({ path: tmpDir });
    });

    afterEach(async () => {
        await fs.promises.rm(tmpDir, { recursive: true, force: true });
    });

    describe("folderExists", () => {
        it("should return false for a non-existent folder", async () => {
            expect(await storage.folderExists("missing")).toBe(false);
        });

        it("should return true after the folder is created", async () => {
            await storage.createFolder("my-folder");
            expect(await storage.folderExists("my-folder")).toBe(true);
        });
    });

    describe("createFolder", () => {
        it("should create a folder on disk", async () => {
            await storage.createFolder("new-folder");
            const stat = await fs.promises.stat(path.join(tmpDir, "new-folder"));
            expect(stat.isDirectory()).toBe(true);
        });

        it("should create nested folders recursively", async () => {
            await storage.createFolder("a/b/c");
            const stat = await fs.promises.stat(path.join(tmpDir, "a/b/c"));
            expect(stat.isDirectory()).toBe(true);
        });
    });

    describe("removeFolder", () => {
        it("should remove an existing folder", async () => {
            await storage.createFolder("to-remove");
            await storage.removeFolder("to-remove");
            expect(await storage.folderExists("to-remove")).toBe(false);
        });
    });

    describe("fileExists", () => {
        it("should return false when the file does not exist", async () => {
            await storage.createFolder("folder");
            expect(await storage.fileExists("folder", "no-file.txt")).toBe(false);
        });

        it("should return true after a file is created", async () => {
            await storage.createFolder("folder");
            await storage.createFile("folder", "file.txt", Buffer.from("content"), { contentType: "text/plain", size: 7 });
            expect(await storage.fileExists("folder", "file.txt")).toBe(true);
        });

        it("should create missing parent directories for nested file paths", async () => {
            await storage.createFolder("folder");
            // fileExists with a nested path should auto-create intermediate dirs
            expect(await storage.fileExists("folder", "sub/dir/file.txt")).toBe(false);
            const stat = await fs.promises.stat(path.join(tmpDir, "folder/sub/dir"));
            expect(stat.isDirectory()).toBe(true);
        });
    });

    describe("createFile", () => {
        beforeEach(async () => {
            await storage.createFolder("uploads");
        });

        it("should write a Buffer to disk", async () => {
            await storage.createFile("uploads", "buf.txt", Buffer.from("hello buffer"), { contentType: "text/plain", size: 12 });

            const content = await fs.promises.readFile(path.join(tmpDir, "uploads/buf.txt"), "utf-8");
            expect(content).toBe("hello buffer");
        });

        it("should write a Readable stream to disk", async () => {
            const stream = Readable.from(["hello stream"]);
            await storage.createFile("uploads", "stream.txt", stream, { contentType: "text/plain", size: 12 });

            const content = await fs.promises.readFile(path.join(tmpDir, "uploads/stream.txt"), "utf-8");
            expect(content).toBe("hello stream");
        });

        it("should write from a file path (string) to disk", async () => {
            const srcPath = path.join(tmpDir, "source.txt");
            await fs.promises.writeFile(srcPath, "hello file path");

            await storage.createFile("uploads", "copy.txt", srcPath, { contentType: "text/plain", size: 15 });

            const content = await fs.promises.readFile(path.join(tmpDir, "uploads/copy.txt"), "utf-8");
            expect(content).toBe("hello file path");
        });

        it("should store content-type in a sidecar headers file", async () => {
            await storage.createFile("uploads", "img.png", Buffer.from("fake-png"), { contentType: "image/png", size: 8 });

            const raw = await fs.promises.readFile(path.join(tmpDir, "uploads/img.png-headers.json"), "utf-8");
            expect(JSON.parse(raw)).toEqual({ "content-type": "image/png" });
        });

        it("should create missing parent directories for nested file names", async () => {
            await storage.createFile("uploads", "a/b/nested.txt", Buffer.from("nested"), { contentType: "text/plain", size: 6 });

            const content = await fs.promises.readFile(path.join(tmpDir, "uploads/a/b/nested.txt"), "utf-8");
            expect(content).toBe("nested");
        });
    });

    describe("getFile", () => {
        it("should return a readable stream with the file contents", async () => {
            await storage.createFolder("folder");
            await storage.createFile("folder", "read-me.txt", Buffer.from("read this"), { contentType: "text/plain", size: 9 });

            const stream = await storage.getFile("folder", "read-me.txt");
            const content = await streamToBuffer(stream);
            expect(content.toString()).toBe("read this");
        });
    });

    describe("getPartialFile", () => {
        it("should return only the requested byte range", async () => {
            await storage.createFolder("folder");
            await storage.createFile("folder", "partial.txt", Buffer.from("0123456789"), { contentType: "text/plain", size: 10 });

            const stream = await storage.getPartialFile("folder", "partial.txt", 3, 4);
            const content = await streamToBuffer(stream);
            expect(content.toString()).toBe("3456");
        });
    });

    describe("listFiles", () => {
        it("should return an empty array for a non-existent folder", async () => {
            const files = await storage.listFiles("does-not-exist");
            expect(files).toEqual([]);
        });

        it("should return an empty array for an empty folder", async () => {
            await storage.createFolder("empty");
            const files = await storage.listFiles("empty");
            expect(files).toEqual([]);
        });

        it("should return file names without including sidecar headers files", async () => {
            await storage.createFolder("listing");
            await storage.createFile("listing", "a.txt", Buffer.from("aaa"), { contentType: "text/plain", size: 3 });
            await storage.createFile("listing", "b.txt", Buffer.from("bb"), { contentType: "text/html", size: 2 });

            const files = await storage.listFiles("listing");
            files.sort();

            expect(files).toEqual(["a.txt", "b.txt"]);
        });

        it("should not include subdirectories in the listing", async () => {
            await storage.createFolder("parent");
            await storage.createFile("parent", "file.txt", Buffer.from("f"), { contentType: "text/plain", size: 1 });
            await storage.createFolder("parent/child");

            const files = await storage.listFiles("parent");
            expect(files).toEqual(["file.txt"]);
        });
    });

    describe("removeFile", () => {
        it("should remove the file and its sidecar headers file", async () => {
            await storage.createFolder("folder");
            await storage.createFile("folder", "to-delete.txt", Buffer.from("bye"), { contentType: "text/plain", size: 3 });

            await storage.removeFile("folder", "to-delete.txt");

            expect(await storage.fileExists("folder", "to-delete.txt")).toBe(false);
            await expect(fs.promises.access(path.join(tmpDir, "folder/to-delete.txt-headers.json"))).rejects.toThrow();
        });
    });

    describe("getFileMetaData", () => {
        it("should return size, lastModified, and contentType", async () => {
            await storage.createFolder("meta");
            const data = Buffer.from("metadata test");
            await storage.createFile("meta", "info.txt", data, { contentType: "text/plain", size: data.length });

            const meta = await storage.getFileMetaData("meta", "info.txt");

            expect(meta.size).toBe(data.length);
            expect(meta.contentType).toBe("text/plain");
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            expect(new Date(meta.lastModified!).getTime()).not.toBeNaN();
        });
    });

    describe("getBackendFilePathPrefix", () => {
        it("should return the local file prefix", () => {
            expect(storage.getBackendFilePathPrefix()).toBe("local:///");
        });
    });
});
