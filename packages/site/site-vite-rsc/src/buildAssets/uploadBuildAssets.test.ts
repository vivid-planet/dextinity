// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { BuildAssetsStorage } from "./buildAssetsStorage.js";
import { uploadBuildAssets } from "./uploadBuildAssets.js";

describe("uploadBuildAssets", () => {
    const cwd = process.cwd();
    let projectDir: string;
    let files: Map<string, { body: Buffer; contentType?: string; cacheControl?: string }>;
    let storage: BuildAssetsStorage;

    beforeEach(() => {
        projectDir = mkdtempSync(join(tmpdir(), "upload-build-assets-"));
        mkdirSync(join(projectDir, "dist/client/_assets/fonts"), { recursive: true });
        writeFileSync(join(projectDir, "dist/client/_assets/index-BXb1sbJm.js"), "index");
        writeFileSync(join(projectDir, "dist/client/_assets/index-Cc2sPBy1.css"), "css");
        writeFileSync(join(projectDir, "dist/client/_assets/fonts/inter-DkBMAkNd.woff2"), "font");
        writeFileSync(join(projectDir, "dist/client/favicon.ico"), "icon");
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

    it("uploads every file of dist/client/_assets with its content type and an immutable cache header", async () => {
        await uploadBuildAssets({ storage, storageKeyPrefix: "site" });

        expect([...files.keys()].sort()).toEqual([
            "site/_assets/fonts/inter-DkBMAkNd.woff2",
            "site/_assets/index-BXb1sbJm.js",
            "site/_assets/index-Cc2sPBy1.css",
        ]);
        expect(files.get("site/_assets/index-BXb1sbJm.js")).toMatchObject({
            contentType: "text/javascript",
            cacheControl: "public, max-age=31536000, immutable",
        });
        expect(files.get("site/_assets/index-BXb1sbJm.js")?.body.toString()).toBe("index");
        expect(files.get("site/_assets/index-Cc2sPBy1.css")?.contentType).toBe("text/css");
        expect(files.get("site/_assets/fonts/inter-DkBMAkNd.woff2")?.contentType).toBe("font/woff2");
    });

    it("uploads the build assets of another directory with another cache header", async () => {
        mkdirSync(join(projectDir, "build/_assets"), { recursive: true });
        writeFileSync(join(projectDir, "build/_assets/other-D4kZ1v9s.js"), "other");

        await uploadBuildAssets({ storage, storageKeyPrefix: "site", directory: "build/_assets", cacheControl: "public, max-age=3600" });

        expect([...files.keys()]).toEqual(["site/_assets/other-D4kZ1v9s.js"]);
        expect(files.get("site/_assets/other-D4kZ1v9s.js")?.cacheControl).toBe("public, max-age=3600");
    });
});
