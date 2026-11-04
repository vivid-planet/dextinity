// @vitest-environment node
import { describe, expect, it } from "vitest";

import { createHtmlInsertion, renderLateNavigationHtml } from "./lateNavigation.js";

describe("renderLateNavigationHtml", () => {
    it("marks the page as noindex for notFound()", () => {
        expect(renderLateNavigationHtml("NOT_FOUND")).toBe('<meta name="robots" content="noindex">');
    });

    it("redirects with a meta refresh for redirect(), with the location escaped", () => {
        expect(renderLateNavigationHtml('REDIRECT;307;/search?a=1&b="2"')).toBe(
            '<meta http-equiv="refresh" content="0;url=/search?a=1&amp;b=&quot;2&quot;">',
        );
    });
});

describe("createHtmlInsertion", () => {
    const encoder = new TextEncoder();

    async function readText(stream: ReadableStream<Uint8Array>) {
        return new Response(stream).text();
    }

    it("inserts between the flushes of React, not between chunks of the same task", async () => {
        const insertion = createHtmlInsertion();
        const output = readText(
            new ReadableStream<Uint8Array>({
                async start(controller) {
                    controller.enqueue(encoder.encode("<p>Sh"));
                    controller.enqueue(encoder.encode("ell</p>"));
                    insertion.insert("<meta>");
                    await new Promise((resolve) => setTimeout(resolve, 10));
                    controller.enqueue(encoder.encode("<p>Late</p>"));
                    controller.close();
                },
            }).pipeThrough(insertion.stream),
        );

        expect(await output).toBe("<p>Shell</p><meta><p>Late</p>");
    });

    it("inserts what's left when the stream ends", async () => {
        const insertion = createHtmlInsertion();
        const output = readText(
            new ReadableStream<Uint8Array>({
                start(controller) {
                    controller.enqueue(encoder.encode("<p>Shell</p>"));
                    insertion.insert("<meta>");
                    controller.close();
                },
            }).pipeThrough(insertion.stream),
        );

        expect(await output).toBe("<p>Shell</p><meta>");
    });
});
