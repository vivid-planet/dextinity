import { act, type PropsWithChildren, useContext } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it } from "vitest";

import { IFrameBridgeContext, type PreviewElement } from "./IFrameBridge";
import { useRefToRegisterPreviewElementsFromClassNames } from "./useRefToRegisterPreviewElementsFromClassNames";

Reflect.set(globalThis, "IS_REACT_ACT_ENVIRONMENT", true);

const textBlock = `<div class="dextinity-preview-route:%2Fedit%2Fblocks%23text dextinity-preview-label:Text"></div>`;
const listBlock = `<div class="dextinity-preview-route:%2Fedit%2Fblocks%23list dextinity-preview-label:Two%20List%20Sizes"></div>`;

function RenderedHtml({ html }: { html: string }) {
    const containerRef = useRefToRegisterPreviewElementsFromClassNames<HTMLDivElement>();

    return <div ref={containerRef} dangerouslySetInnerHTML={{ __html: html }} />;
}

function createFakeIFrameBridge() {
    const registeredElements = new Set<PreviewElement>();
    const addPreviewElement = (element: PreviewElement) => registeredElements.add(element);
    const removePreviewElement = (element: PreviewElement) => registeredElements.delete(element);

    function FakeIFrameBridgeProvider({ children }: PropsWithChildren) {
        const defaultBridge = useContext(IFrameBridgeContext);

        return (
            <IFrameBridgeContext.Provider value={{ ...defaultBridge, hasBridge: true, addPreviewElement, removePreviewElement }}>
                {children}
            </IFrameBridgeContext.Provider>
        );
    }

    const root = createRoot(document.createElement("div"));

    return {
        render: (html: string) =>
            act(async () => {
                root.render(
                    <FakeIFrameBridgeProvider>
                        <RenderedHtml html={html} />
                    </FakeIFrameBridgeProvider>,
                );
            }),
        registeredElements: () =>
            Array.from(registeredElements, ({ adminRoute, label, measurementTarget }) => ({ adminRoute, label, measurementTarget })),
    };
}

describe("useRefToRegisterPreviewElementsFromClassNames", () => {
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
