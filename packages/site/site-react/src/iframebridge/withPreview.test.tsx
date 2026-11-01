import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { IFrameBridgeContext } from "./IFrameBridge";
import { BLOCK_PREVIEW_CONTAINER_DATA_ATTRIBUTE } from "./utils";
import { withPreview } from "./withPreview";

const TestBlock = withPreview(({ data }: { data: { text: string } }) => <p>{data.text}</p>, { label: "Test" });

function renderInBlockPreview(children: ReactNode) {
    return renderToStaticMarkup(
        <IFrameBridgeContext.Provider
            value={{
                hasBridge: true,
                showOutlines: false,
                showOnlyVisible: false,
                sendSelectComponent: () => {},
                sendHoverComponent: () => {},
                sendMessage: () => {},
                contentScope: undefined,
                contentScopeJwt: "",
                graphQLApiUrl: undefined,
                previewElementsData: [],
                addPreviewElement: () => {},
                removePreviewElement: () => {},
            }}
        >
            {children}
        </IFrameBridgeContext.Provider>,
    );
}

function countPreviewContainers(html: string) {
    return html.split(BLOCK_PREVIEW_CONTAINER_DATA_ATTRIBUTE).length - 1;
}

describe("withPreview", () => {
    it("renders the block without a preview wrapper when there's no adminMeta", () => {
        const html = renderInBlockPreview(<TestBlock data={{ text: "Hello" }} />);

        expect(html).toBe("<p>Hello</p>");
    });

    it("wraps the block in a preview element when adminMeta is present", () => {
        const html = renderInBlockPreview(<TestBlock data={{ text: "Hello", adminMeta: { route: "/blocks/1" } }} />);

        expect(countPreviewContainers(html)).toBe(1);
        expect(html).toContain("<p>Hello</p>");
    });

    it("renders only one preview element when the same route is nested", () => {
        const data = { text: "Hello", adminMeta: { route: "/blocks/1" } };
        const OuterBlock = withPreview(({ data }: { data: { text: string } }) => <TestBlock data={data} />, { label: "Outer" });

        const html = renderInBlockPreview(<OuterBlock data={data} />);

        expect(countPreviewContainers(html)).toBe(1);
    });

    it("renders a preview element for each nested route", () => {
        const OuterBlock = withPreview(
            ({ data }: { data: { child: { text: string; adminMeta: { route: string } } } }) => <TestBlock data={data.child} />,
            { label: "Outer" },
        );

        const html = renderInBlockPreview(
            <OuterBlock data={{ adminMeta: { route: "/blocks/1" }, child: { text: "Hello", adminMeta: { route: "/blocks/1/child" } } }} />,
        );

        expect(countPreviewContainers(html)).toBe(2);
    });
});
