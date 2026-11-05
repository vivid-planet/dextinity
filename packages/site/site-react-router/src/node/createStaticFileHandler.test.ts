// @vitest-environment node
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { beforeAll, describe, expect, it } from "vitest";

import { createStaticFileHandler } from "./createStaticFileHandler";

describe("createStaticFileHandler", () => {
    let serveStaticFile: ReturnType<typeof createStaticFileHandler>;

    beforeAll(async () => {
        const directory = await mkdtemp(join(tmpdir(), "static-files-"));
        await mkdir(join(directory, "_assets"));
        await writeFile(join(directory, "_assets", "index-abc.js"), "console.log(1);");
        await writeFile(join(directory, "favicon.ico"), "icon");
        await writeFile(join(directory, "..", "secret.txt"), "secret");
        serveStaticFile = createStaticFileHandler({
            directory,
            cacheControl: (pathname) => (pathname.startsWith("/_assets/") ? "public, max-age=31536000, immutable" : "public, max-age=900"),
        });
    });

    it("serves the files with their content type and cache control", async () => {
        const response = await serveStaticFile(new Request("http://localhost/_assets/index-abc.js"));

        expect(response?.status).toBe(200);
        expect(response?.headers.get("Content-Type")).toBe("text/javascript; charset=utf-8");
        expect(response?.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
        expect(await response?.text()).toBe("console.log(1);");
    });

    it("answers conditional requests with 304", async () => {
        const response = await serveStaticFile(new Request("http://localhost/favicon.ico"));
        const lastModified = response?.headers.get("Last-Modified") ?? "";

        const conditionalResponse = await serveStaticFile(
            new Request("http://localhost/favicon.ico", { headers: { "If-Modified-Since": lastModified } }),
        );

        expect(conditionalResponse?.status).toBe(304);
    });

    it("skips unknown files, directories and other methods", async () => {
        expect(await serveStaticFile(new Request("http://localhost/en/about"))).toBeUndefined();
        expect(await serveStaticFile(new Request("http://localhost/_assets"))).toBeUndefined();
        expect(await serveStaticFile(new Request("http://localhost/favicon.ico", { method: "POST", body: "" }))).toBeUndefined();
    });

    it("doesn't serve files outside of the directory", async () => {
        expect(await serveStaticFile(new Request("http://localhost/%2e%2e/secret.txt"))).toBeUndefined();
        expect(await serveStaticFile(new Request("http://localhost/..%2Fsecret.txt"))).toBeUndefined();
    });
});
