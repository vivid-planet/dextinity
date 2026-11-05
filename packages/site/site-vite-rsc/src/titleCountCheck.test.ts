// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

import { createTitleCountCheck } from "./titleCountCheck.js";

async function check(chunks: string[]) {
    const onTitleCount = vi.fn();
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            for (const chunk of chunks) {
                controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
        },
    });

    const html = await new Response(stream.pipeThrough(createTitleCountCheck(onTitleCount))).text();

    return { html, onTitleCount };
}

describe("createTitleCountCheck", () => {
    it("counts the titles in the head", async () => {
        const { onTitleCount } = await check(["<html><head><title>One</title><title>Two</title></head><body></body></html>"]);

        expect(onTitleCount).toHaveBeenCalledExactlyOnceWith(2);
    });

    it("counts no titles if the head has none", async () => {
        const { onTitleCount } = await check(['<html><head><meta charSet="utf-8"/></head><body></body></html>']);

        expect(onTitleCount).toHaveBeenCalledExactlyOnceWith(0);
    });

    it("finds the end of the head across chunks", async () => {
        const { onTitleCount } = await check(["<html><head><title>One</ti", "tle></he", "ad><body><title>Ignored</title></body></html>"]);

        expect(onTitleCount).toHaveBeenCalledExactlyOnceWith(1);
    });

    it("ignores titles of SVGs in the body", async () => {
        const { onTitleCount } = await check(["<html><head><title>Page</title></head><body><svg><title>Icon</title></svg></body></html>"]);

        expect(onTitleCount).toHaveBeenCalledExactlyOnceWith(1);
    });

    it("passes the HTML through unchanged", async () => {
        const chunks = ["<html><head><title>Page</title>", "</head><body>Content</body></html>"];

        const { html } = await check(chunks);

        expect(html).toBe(chunks.join(""));
    });
});
