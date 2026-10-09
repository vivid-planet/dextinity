import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { renderTipTapRichText } from "./TipTapRichTextRenderer";

describe("renderTipTapRichText", () => {
    it("renders a newline within a text as a line break", () => {
        const html = renderToStaticMarkup(
            <>
                {renderTipTapRichText({
                    content: {
                        type: "doc",
                        content: [
                            {
                                type: "textBlock",
                                attrs: { textBlock: "paragraph" },
                                content: [{ type: "text", text: "First line\nSecond line", marks: [{ type: "bold" }] }],
                            },
                        ],
                    },
                })}
            </>,
        );

        expect(html).toBe("<p><strong>First line<br/>Second line</strong></p>");
    });
});
