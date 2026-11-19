// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";

import { type IFrameBridge, type PreviewElement, useRefToRegisterMailBlocksForPreview } from "../useRefToRegisterMailBlocksForPreview.js";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

const textBlock = `<div class="dextinity-preview-route:%2Fedit%2Fblocks%23text dextinity-preview-label:Text"></div>`;
const listBlock = `<div class="dextinity-preview-route:%2Fedit%2Fblocks%23list dextinity-preview-label:Two%20List%20Sizes"></div>`;

function RenderedHtml({ html, iFrameBridge }: { html: string; iFrameBridge: IFrameBridge }) {
    const containerRef = useRefToRegisterMailBlocksForPreview<HTMLDivElement>(iFrameBridge);

    return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />;
}

function createFakeIFrameBridge() {
    const registeredElements = new Set<PreviewElement>();
    const iFrameBridge: IFrameBridge = {
        hasBridge: true,
        addPreviewElement: (element) => registeredElements.add(element),
        removePreviewElement: (element) => registeredElements.delete(element),
    };
    const root = createRoot(document.createElement("div"));

    return {
        render: (html: string) =>
            act(async () => {
                root.render(<RenderedHtml html={html} iFrameBridge={iFrameBridge} />);
            }),
        registeredElements: () =>
            Array.from(registeredElements, ({ adminRoute, label, measurementTarget }) => ({ adminRoute, label, measurementTarget })),
    };
}

describe("useRefToRegisterMailBlocksForPreview", () => {
    it("registers each element whose class names carry a preview route", async () => {
        const fakeIFrameBridge = createFakeIFrameBridge();

        await fakeIFrameBridge.render(`${textBlock}${listBlock}`);

        expect(fakeIFrameBridge.registeredElements()).toEqual([
            { adminRoute: "/edit/blocks#text", label: "Text", measurementTarget: "element" },
            { adminRoute: "/edit/blocks#list", label: "Two List Sizes", measurementTarget: "element" },
        ]);
    });

    it("registers the elements again after the HTML changes", async () => {
        const fakeIFrameBridge = createFakeIFrameBridge();
        await fakeIFrameBridge.render(`${textBlock}${listBlock}`);

        await fakeIFrameBridge.render(listBlock);

        expect(fakeIFrameBridge.registeredElements()).toEqual([
            { adminRoute: "/edit/blocks#list", label: "Two List Sizes", measurementTarget: "element" },
        ]);
    });
});
