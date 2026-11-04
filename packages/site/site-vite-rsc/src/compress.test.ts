// @vitest-environment node
import { constants, gunzipSync } from "node:zlib";

import { Hono } from "hono";
import { describe, expect, it } from "vitest";

import { compressMiddleware, createFlushingGzipStream } from "./compress.js";

const encoder = new TextEncoder();
const html = `<!DOCTYPE html><html><body>${"<p>Content</p>".repeat(200)}</body></html>`;

function createSlowStream() {
    let sendRest: () => void = () => {};
    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            controller.enqueue(encoder.encode("<p>Shell</p>"));
            sendRest = () => {
                controller.enqueue(encoder.encode("<p>Slow content</p>"));
                controller.close();
            };
        },
    });
    return { stream, sendRest: () => sendRest() };
}

async function readAll(response: Response) {
    return Buffer.from(await response.arrayBuffer());
}

describe("createFlushingGzipStream", () => {
    it("sends what it received so far before the stream ends", async () => {
        const { stream, sendRest } = createSlowStream();
        const reader = stream.pipeThrough(createFlushingGzipStream()).getReader();

        const chunks: Uint8Array[] = [];
        while (!gunzipSync(Buffer.concat(chunks), { finishFlush: constants.Z_SYNC_FLUSH }).toString().includes("Shell")) {
            const result = await reader.read();
            if (result.done) {
                throw new Error("The stream ended before the shell was sent");
            }
            chunks.push(result.value);
        }
        sendRest();
        for (let result = await reader.read(); !result.done; result = await reader.read()) {
            chunks.push(result.value);
        }

        expect(gunzipSync(Buffer.concat(chunks)).toString()).toBe("<p>Shell</p><p>Slow content</p>");
    });
});

describe("compressMiddleware", () => {
    function createApp(headers: Record<string, string> = {}) {
        const app = new Hono();
        app.use(compressMiddleware);
        app.get("/", (c) => c.body(html, 200, { "Content-Type": "text/html;charset=utf-8", ...headers }));
        return app;
    }

    it("compresses with gzip", async () => {
        const response = await createApp().request("/", { headers: { "Accept-Encoding": "gzip, deflate, br" } });

        expect(response.headers.get("Content-Encoding")).toBe("gzip");
        expect(response.headers.get("Vary")).toBe("Accept-Encoding");
        expect(gunzipSync(await readAll(response)).toString()).toBe(html);
    });

    it("doesn't compress when the client doesn't accept gzip", async () => {
        const response = await createApp().request("/", { headers: { "Accept-Encoding": "br;q=1, gzip;q=0" } });

        expect(response.headers.get("Content-Encoding")).toBeNull();
        expect(await response.text()).toBe(html);
    });

    it("doesn't compress responses with no-transform", async () => {
        const response = await createApp({ "Cache-Control": "public, no-transform" }).request("/", { headers: { "Accept-Encoding": "gzip" } });

        expect(response.headers.get("Content-Encoding")).toBeNull();
    });
});
