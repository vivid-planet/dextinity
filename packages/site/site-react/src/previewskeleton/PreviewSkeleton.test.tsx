import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PreviewContext } from "../preview/PreviewContext";
import { PreviewSkeleton } from "./PreviewSkeleton";

const content = <span className="content" />;

describe("PreviewSkeleton", () => {
    it("renders only the children when it has content", () => {
        const html = renderToStaticMarkup(
            <PreviewContext.Provider value={{ previewType: "BlockPreview", showPreviewSkeletons: true }}>
                <PreviewSkeleton hasContent title="Title">
                    {content}
                </PreviewSkeleton>
            </PreviewContext.Provider>,
        );

        expect(html).toBe('<span class="content"></span>');
    });

    it("renders nothing without content outside of a preview", () => {
        const html = renderToStaticMarkup(
            <PreviewSkeleton hasContent={false} title="Title">
                {content}
            </PreviewSkeleton>,
        );

        expect(html).toBe("");
    });

    it("renders the placeholder with the title without content when preview skeletons are shown", () => {
        const html = renderToStaticMarkup(
            <PreviewContext.Provider value={{ previewType: "BlockPreview", showPreviewSkeletons: true }}>
                <PreviewSkeleton hasContent={false} type="rows" title="Title">
                    {content}
                </PreviewSkeleton>
            </PreviewContext.Provider>,
        );

        expect(html).toContain("Title");
        expect(html).not.toContain("content");
        expect(html.match(/<div/g)).toHaveLength(4);
    });

    it("uses no hooks, so it can be rendered as a server component", () => {
        expect(PreviewSkeleton({ hasContent: true, children: content })).toEqual(<>{content}</>);
    });
});
