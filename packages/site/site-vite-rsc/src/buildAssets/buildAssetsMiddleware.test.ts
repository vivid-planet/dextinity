// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";

import { Hono } from "hono";
import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";

import { buildAssetsMiddleware } from "./buildAssetsMiddleware.js";
import type { BuildAssetsStorage } from "./buildAssetsStorage.js";

function createApp(options: Parameters<typeof buildAssetsMiddleware>[0]) {
    const app = new Hono();
    app.use(buildAssetsMiddleware(options));
    app.all("*", (c) => c.text("passed on", 404));
    return app;
}

describe("buildAssetsMiddleware", () => {
    const cwd = process.cwd();
    let projectDir: string;
    let storage: BuildAssetsStorage & { getFile: Mock<BuildAssetsStorage["getFile"]> };
    let app: Hono;

    beforeEach(() => {
        projectDir = mkdtempSync(join(tmpdir(), "build-assets-middleware-"));
        mkdirSync(join(projectDir, "dist/client/_assets"), { recursive: true });
        writeFileSync(join(projectDir, "dist/client/_assets/local-BXb1sbJm.js"), "local");
        process.chdir(projectDir);

        storage = {
            getFile: vi.fn(async (key: string) => {
                if (key === "site/_assets/old-Cc2sPBy1.js") {
                    return {
                        body: Readable.from([Buffer.from("old")]),
                        contentType: "text/javascript",
                        cacheControl: "public, max-age=31536000, immutable",
                    };
                }
                return undefined;
            }),
            putFile: vi.fn(),
        };
        app = createApp({ storage, storageKeyPrefix: "site" });
    });

    afterEach(() => {
        process.chdir(cwd);
        rmSync(projectDir, { recursive: true });
    });

    it("serves a build asset missing in this build from the storage", async () => {
        const response = await app.request("/_assets/old-Cc2sPBy1.js");

        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toBe("text/javascript");
        expect(response.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
        expect(await response.text()).toBe("old");
        expect(storage.getFile).toHaveBeenCalledWith("site/_assets/old-Cc2sPBy1.js");
    });

    it("serves a build asset requested with a query string from the storage", async () => {
        expect(await (await app.request("/_assets/old-Cc2sPBy1.js?v=1")).text()).toBe("old");
    });

    it("answers a HEAD request for a build asset of the storage without a body", async () => {
        const response = await app.request("/_assets/old-Cc2sPBy1.js", { method: "HEAD" });

        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toBe("text/javascript");
        expect(await response.text()).toBe("");
    });

    it("passes on a build asset of this build", async () => {
        expect(await (await app.request("/_assets/local-BXb1sbJm.js")).text()).toBe("passed on");
        expect(storage.getFile).not.toHaveBeenCalled();
    });

    it("passes on a build asset missing in the storage", async () => {
        expect(await (await app.request("/_assets/missing-D4kZ1v9s.js")).text()).toBe("passed on");
    });

    it("passes on a build asset and logs the error if the storage fails", async () => {
        storage.getFile.mockRejectedValueOnce(new Error("Access Denied"));
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

        expect(await (await app.request("/_assets/old-Cc2sPBy1.js")).text()).toBe("passed on");
        expect(consoleError).toHaveBeenCalled();

        consoleError.mockRestore();
    });

    it("passes on other paths and methods", async () => {
        expect(await (await app.request("/en/page")).text()).toBe("passed on");
        expect(await (await app.request("/assets/old-Cc2sPBy1.js")).text()).toBe("passed on");
        expect(await (await app.request("/_assets/old-Cc2sPBy1.js", { method: "POST" })).text()).toBe("passed on");
        expect(storage.getFile).not.toHaveBeenCalled();
    });

    it("passes on paths leaving the build assets", async () => {
        expect(await (await app.request("http://localhost/_assets/%2E%2E/%2E%2E/package.json")).text()).toBe("passed on");
        expect(await (await app.request("http://localhost/_assets/..%5C..%5Cpackage.json")).text()).toBe("passed on");
        expect(storage.getFile).not.toHaveBeenCalled();
    });

    it("passes on all requests without a storage", async () => {
        expect(await (await createApp({ storageKeyPrefix: "site" }).request("/_assets/old-Cc2sPBy1.js")).text()).toBe("passed on");
    });

    it("passes on a build asset of this build in another directory", async () => {
        mkdirSync(join(projectDir, "build/_assets"), { recursive: true });
        writeFileSync(join(projectDir, "build/_assets/old-Cc2sPBy1.js"), "local");

        const response = await createApp({ storage, storageKeyPrefix: "site", directory: "build/_assets" }).request("/_assets/old-Cc2sPBy1.js");

        expect(await response.text()).toBe("passed on");
        expect(storage.getFile).not.toHaveBeenCalled();
    });
});
