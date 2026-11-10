// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { BuildAssetsStorage } from "../storage/buildAssetsStorage";
import { uploadBuildAssets } from "../uploadBuildAssets";

describe("uploadBuildAssets", () => {
    const cwd = process.cwd();
    let projectDir: string;
    let files: Map<string, { body: Buffer; contentType?: string; cacheControl?: string }>;
    let storage: BuildAssetsStorage;

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
            getFile: async () => undefined,
            putFile: async (key, file) => {
                files.set(key, file);
            },
        };
    });

    afterEach(() => {
        process.chdir(cwd);
        rmSync(projectDir, { recursive: true, force: true });
    });

    it("uploads every file of .next/static with its content type and an immutable cache header", async () => {
        await uploadBuildAssets({ storage, storageKeyPrefix: "site" });

        expect([...files.keys()].sort()).toEqual([
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

        expect([...files.keys()]).toEqual(["site/_next/static/chunks/other.js"]);
        expect(files.get("site/_next/static/chunks/other.js")?.cacheControl).toBe("public, max-age=3600");
    });
});
