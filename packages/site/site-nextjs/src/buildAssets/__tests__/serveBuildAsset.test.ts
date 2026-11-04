// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "fs";
import { createServer, type IncomingMessage, type Server, type ServerResponse } from "http";
import type { AddressInfo } from "net";
import { tmpdir } from "os";
import { join } from "path";
import { Readable } from "stream";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { serveBuildAsset } from "../serveBuildAsset";
import type { BuildAssetsStorage } from "../storage/buildAssetsStorage";

describe("serveBuildAsset", () => {
    const cwd = process.cwd();
    let projectDir: string;
    let server: Server;
    let baseUrl: string;
    let storage: BuildAssetsStorage & { getFile: ReturnType<typeof vi.fn> };

    beforeEach(async () => {
        projectDir = mkdtempSync(join(tmpdir(), "serve-build-asset-"));
        mkdirSync(join(projectDir, ".next/static/chunks/app/[language]"), { recursive: true });
        writeFileSync(join(projectDir, ".next/static/chunks/local.js"), "local");
        writeFileSync(join(projectDir, ".next/static/chunks/app/[language]/local.js"), "local");
        process.chdir(projectDir);

        storage = {
            getFile: vi.fn(async (key: string) => {
                if (key === "site/_next/static/chunks/old.js" || key === "site/_next/static/chunks/app/[language]/old.js") {
                    return {
                        body: Readable.from(["old"]),
                        contentType: "text/javascript; charset=utf-8",
                        cacheControl: "public, max-age=31536000, immutable",
                    };
                }
                return undefined;
            }),
            putFile: vi.fn(),
            listFiles: vi.fn(),
            deleteFiles: vi.fn(),
        };

        server = createServer(async (req, res) => {
            if (!(await serveBuildAsset({ req, res, storage, storageKeyPrefix: "site" }))) {
                res.statusCode = 404;
                res.end("handled by Next.js");
            }
        });
        await new Promise<void>((resolve) => server.listen(0, resolve));
        baseUrl = `http://localhost:${(server.address() as AddressInfo).port}`;
    });

    afterEach(() => {
        server.close();
        process.chdir(cwd);
        rmSync(projectDir, { recursive: true });
    });

    it("serves a build asset missing in this build from the storage", async () => {
        const response = await fetch(`${baseUrl}/_next/static/chunks/old.js`);

        expect(response.status).toBe(200);
        expect(response.headers.get("content-type")).toBe("text/javascript; charset=utf-8");
        expect(response.headers.get("cache-control")).toBe("public, max-age=31536000, immutable");
        expect(await response.text()).toBe("old");
    });

    it("serves a build asset requested with a query string from the storage", async () => {
        const response = await fetch(`${baseUrl}/_next/static/chunks/old.js?dpl=1`);

        expect(await response.text()).toBe("old");
    });

    it("serves a build asset with an escaped path from the storage", async () => {
        const response = await fetch(`${baseUrl}/_next/static/chunks/app/%5Blanguage%5D/old.js`);

        expect(await response.text()).toBe("old");
    });

    it("leaves a build asset of this build to Next.js", async () => {
        expect(await (await fetch(`${baseUrl}/_next/static/chunks/local.js`)).text()).toBe("handled by Next.js");
        expect(await (await fetch(`${baseUrl}/_next/static/chunks/app/%5Blanguage%5D/local.js`)).text()).toBe("handled by Next.js");
        expect(storage.getFile).not.toHaveBeenCalled();
    });

    it("leaves a build asset missing in the storage to Next.js", async () => {
        expect(await (await fetch(`${baseUrl}/_next/static/chunks/missing.js`)).text()).toBe("handled by Next.js");
    });

    it("leaves a build asset to Next.js and logs the error if the storage fails", async () => {
        storage.getFile.mockRejectedValueOnce(new Error("Access Denied"));
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

        expect(await (await fetch(`${baseUrl}/_next/static/chunks/old.js`)).text()).toBe("handled by Next.js");
        expect(consoleError).toHaveBeenCalled();

        consoleError.mockRestore();
    });

    it("leaves other paths to Next.js", async () => {
        expect(await (await fetch(`${baseUrl}/en/page`)).text()).toBe("handled by Next.js");
        expect(storage.getFile).not.toHaveBeenCalled();
    });

    it("leaves paths leaving the build assets to Next.js", async () => {
        expect(
            await serveBuildAsset({
                req: { url: "/_next/static/../../package.json" } as IncomingMessage,
                res: {} as ServerResponse,
                storage,
                storageKeyPrefix: "site",
            }),
        ).toBe(false);
        expect(storage.getFile).not.toHaveBeenCalled();
    });

    it("leaves all requests to Next.js without a storage", async () => {
        expect(
            await serveBuildAsset({
                req: { url: "/_next/static/chunks/old.js" } as IncomingMessage,
                res: {} as ServerResponse,
                storageKeyPrefix: "site",
            }),
        ).toBe(false);
    });

    it("leaves a build asset of this build in another directory to Next.js", async () => {
        mkdirSync(join(projectDir, "dist/static/chunks"), { recursive: true });
        writeFileSync(join(projectDir, "dist/static/chunks/old.js"), "local");

        expect(
            await serveBuildAsset({
                req: { url: "/_next/static/chunks/old.js" } as IncomingMessage,
                res: {} as ServerResponse,
                storage,
                storageKeyPrefix: "site",
                directory: "dist/static",
            }),
        ).toBe(false);
        expect(storage.getFile).not.toHaveBeenCalled();
    });
});
