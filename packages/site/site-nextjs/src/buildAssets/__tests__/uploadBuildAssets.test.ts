// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { Readable } from "stream";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { BuildAssetsStorage } from "../storage/buildAssetsStorage";
import { uploadBuildAssets } from "../uploadBuildAssets";

describe("uploadBuildAssets", () => {
    const cwd = process.cwd();
    let projectDir: string;
    let files: Map<string, { body: Buffer; contentType?: string; cacheControl?: string }>;
    let storage: BuildAssetsStorage;

    function givenUpload(manifestName: string, keys: string[]) {
        files.set(`site/build-assets-manifests/${manifestName}.json`, { body: Buffer.from(JSON.stringify(keys)) });
        for (const key of keys) {
            files.set(key, { body: Buffer.from(key) });
        }
    }

    function buildAssetKeys() {
        return [...files.keys()].filter((key) => key.startsWith("site/_next/static/")).sort();
    }

    function manifestKeys() {
        return [...files.keys()].filter((key) => key.startsWith("site/build-assets-manifests/")).sort();
    }

    beforeEach(() => {
        projectDir = mkdtempSync(join(tmpdir(), "upload-build-assets-"));
        mkdirSync(join(projectDir, ".next/static/chunks/app/[language]"), { recursive: true });
        mkdirSync(join(projectDir, ".next/static/media"), { recursive: true });
        writeFileSync(join(projectDir, ".next/static/chunks/main.js"), "main");
        writeFileSync(join(projectDir, ".next/static/chunks/app/[language]/page.js"), "page");
        writeFileSync(join(projectDir, ".next/static/media/font.woff2"), "font");
        process.chdir(projectDir);

        files = new Map();
        storage = {
            getFile: async (key) => {
                const file = files.get(key);
                return file ? { body: Readable.from([file.body]), contentType: file.contentType, cacheControl: file.cacheControl } : undefined;
            },
            putFile: async (key, file) => {
                files.set(key, file);
            },
            listFiles: async (prefix) => [...files.keys()].filter((key) => key.startsWith(prefix)),
            deleteFiles: async (keys) => {
                for (const key of keys) {
                    files.delete(key);
                }
            },
        };
    });

    afterEach(() => {
        process.chdir(cwd);
        rmSync(projectDir, { recursive: true, force: true });
        vi.restoreAllMocks();
    });

    it("uploads every file of .next/static with its content type and an immutable cache header", async () => {
        await uploadBuildAssets({ storage, storageKeyPrefix: "site" });

        expect(buildAssetKeys()).toEqual([
            "site/_next/static/chunks/app/[language]/page.js",
            "site/_next/static/chunks/main.js",
            "site/_next/static/media/font.woff2",
        ]);
        expect(files.get("site/_next/static/chunks/main.js")).toMatchObject({
            contentType: "text/javascript",
            cacheControl: "public, max-age=31536000, immutable",
        });
        expect(files.get("site/_next/static/chunks/app/[language]/page.js")?.body.toString()).toBe("page");
        expect(files.get("site/_next/static/media/font.woff2")?.contentType).toBe("font/woff2");
    });

    it("uploads the build assets of another directory with another cache header", async () => {
        mkdirSync(join(projectDir, "dist/static/chunks"), { recursive: true });
        writeFileSync(join(projectDir, "dist/static/chunks/other.js"), "other");

        await uploadBuildAssets({ storage, storageKeyPrefix: "site", directory: "dist/static", cacheControl: "public, max-age=3600" });

        expect(buildAssetKeys()).toEqual(["site/_next/static/chunks/other.js"]);
        expect(files.get("site/_next/static/chunks/other.js")?.cacheControl).toBe("public, max-age=3600");
    });

    it("records the uploaded build assets in a manifest", async () => {
        await uploadBuildAssets({ storage, storageKeyPrefix: "site" });

        const [manifestKey] = manifestKeys();
        expect(JSON.parse(files.get(manifestKey)?.body.toString() ?? "").sort()).toEqual(buildAssetKeys());
    });

    it("deletes the build assets of older uploads and keeps those shared with kept uploads", async () => {
        givenUpload("2026-01-01T00:00:00.000Z-a", ["site/_next/static/chunks/oldest.js", "site/_next/static/chunks/shared.js"]);
        givenUpload("2026-01-02T00:00:00.000Z-b", ["site/_next/static/chunks/previous.js", "site/_next/static/chunks/shared.js"]);

        await uploadBuildAssets({ storage, storageKeyPrefix: "site", keepBuilds: 2 });

        expect(buildAssetKeys()).toEqual([
            "site/_next/static/chunks/app/[language]/page.js",
            "site/_next/static/chunks/main.js",
            "site/_next/static/chunks/previous.js",
            "site/_next/static/chunks/shared.js",
            "site/_next/static/media/font.woff2",
        ]);
        expect(manifestKeys()).toHaveLength(2);
        expect(manifestKeys()[0]).toBe("site/build-assets-manifests/2026-01-02T00:00:00.000Z-b.json");
    });

    it("keeps build assets without a manifest until there are more uploads than kept", async () => {
        files.set("site/_next/static/chunks/uploaded-before-manifests.js", { body: Buffer.from("old") });
        givenUpload("2026-01-01T00:00:00.000Z-a", ["site/_next/static/chunks/previous.js"]);

        await uploadBuildAssets({ storage, storageKeyPrefix: "site", keepBuilds: 2 });

        expect(buildAssetKeys()).toContain("site/_next/static/chunks/uploaded-before-manifests.js");
        expect(buildAssetKeys()).toContain("site/_next/static/chunks/previous.js");
    });

    it("keeps everything if a kept manifest can't be read", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
        givenUpload("2026-01-01T00:00:00.000Z-a", ["site/_next/static/chunks/oldest.js"]);
        files.set("site/build-assets-manifests/2026-01-02T00:00:00.000Z-b.json", { body: Buffer.from("[]") });
        const getFile = storage.getFile;
        storage.getFile = async (key) => (key.endsWith("-b.json") ? undefined : getFile(key));

        await uploadBuildAssets({ storage, storageKeyPrefix: "site", keepBuilds: 2 });

        expect(buildAssetKeys()).toContain("site/_next/static/chunks/oldest.js");
        expect(consoleError).toHaveBeenCalled();
    });

    it("completes the upload if the cleanup fails", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
        givenUpload("2026-01-01T00:00:00.000Z-a", ["site/_next/static/chunks/oldest.js"]);
        storage.deleteFiles = async () => {
            throw new Error("Access Denied");
        };

        await expect(uploadBuildAssets({ storage, storageKeyPrefix: "site", keepBuilds: 1 })).resolves.toBeUndefined();
        expect(buildAssetKeys()).toContain("site/_next/static/chunks/main.js");
        expect(consoleError).toHaveBeenCalled();
    });

    it("rejects keeping fewer than one upload", async () => {
        await expect(uploadBuildAssets({ storage, storageKeyPrefix: "site", keepBuilds: 0 })).rejects.toThrow(
            "keepBuilds must be a whole number of at least 1",
        );
    });
});
