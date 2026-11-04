// @vitest-environment node
import { brotliDecompressSync, gunzipSync } from "node:zlib";

import { describe, expect, it } from "vitest";

import { compressResponse } from "./compressResponse";

const html = "<html>".padEnd(2000, "x");

function createResponse(contentType = "text/html; charset=utf-8") {
    return new Response(html, { headers: { "Content-Type": contentType } });
}

describe("compressResponse", () => {
    it("compresses with Brotli if the client accepts it", async () => {
        const response = compressResponse(
            new Request("http://localhost/", { headers: { "Accept-Encoding": "gzip, deflate, br" } }),
            createResponse(),
        );

        expect(response.headers.get("Content-Encoding")).toBe("br");
        expect(response.headers.get("Vary")).toBe("Accept-Encoding");
        expect(brotliDecompressSync(Buffer.from(await response.arrayBuffer())).toString()).toBe(html);
    });

    it("compresses with gzip otherwise", async () => {
        const response = compressResponse(new Request("http://localhost/", { headers: { "Accept-Encoding": "gzip" } }), createResponse());

        expect(response.headers.get("Content-Encoding")).toBe("gzip");
        expect(gunzipSync(Buffer.from(await response.arrayBuffer())).toString()).toBe(html);
    });

    it("doesn't compress without the Accept-Encoding of the client or for binary files", () => {
        const response = createResponse();
        expect(compressResponse(new Request("http://localhost/"), response)).toBe(response);

        const image = createResponse("image/png");
        expect(compressResponse(new Request("http://localhost/", { headers: { "Accept-Encoding": "gzip" } }), image)).toBe(image);
    });
});
