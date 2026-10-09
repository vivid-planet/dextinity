import { MjmlColumn } from "@faire/mjml-react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MjmlMailRoot } from "../../../../components/mailRoot/MjmlMailRoot.js";
import { MjmlSection } from "../../../../components/section/MjmlSection.js";
import { renderMailHtml } from "../../../../server/renderMailHtml.js";
import { createTheme } from "../../../../theme/createTheme.js";
import { ThemeProvider } from "../../../../theme/ThemeProvider.js";
import type { TipTapRichTextBlockData } from "../common.js";
import { createTipTapRichTextBlock } from "../createTipTapRichTextBlock.js";

function renderWithTheme(node: ReactNode, theme = createTheme()): string {
    return renderToStaticMarkup(<ThemeProvider theme={theme}>{node}</ThemeProvider>);
}

function createBlockData(content: Array<Record<string, unknown>>): TipTapRichTextBlockData {
    return { tipTapContent: { type: "doc", content } };
}

function createTextBlock(textBlock: string, text: string, attrs?: Record<string, unknown>): Record<string, unknown> {
    return { type: "textBlock", attrs: { textBlock, ...attrs }, content: [{ type: "text", text }] };
}

function createParagraph(text: string, attrs?: Record<string, unknown>): Record<string, unknown> {
    return createTextBlock("paragraph", text, attrs);
}

function createListItem(text: string, attrs?: Record<string, unknown>): Record<string, unknown> {
    return { type: "listItem", content: [createParagraph(text, attrs)] };
}

function createLinkMark(type: string, props: Record<string, unknown>): Record<string, unknown> {
    return { type: "link", attrs: { data: { attachedBlocks: [], activeType: type, block: { type, props } } } };
}

function getListClassOf(markup: string, itemText: string): string | undefined {
    const list = markup.split("</table>").find((part) => part.includes(`>${itemText}<`));
    return list?.match(/<table[^>]*class="([^"]*)"/)?.[1];
}

function getListMarkerOf(markup: string, itemText: string): string | undefined {
    const row = markup.split("</tr>").find((part) => part.includes(`>${itemText}<`));
    return row?.match(/class="richTextBlock__listItemMarker"[^>]*>([^<]*)</)?.[1];
}

function getListItemTextStyleOf(markup: string, itemText: string): string | undefined {
    return markup.match(new RegExp(`class="richTextBlock__listItemText"[^>]*style="([^"]*)"[^>]*>${itemText}<`))?.[1];
}

function getListItemClassOf(markup: string, itemText: string): string | undefined {
    return markup.match(new RegExp(`<tr class="([^"]*)"><td[^>]*>[^<]*</td><td[^>]*>${itemText}<`))?.[1];
}

const themeWithVariants = createTheme({
    text: {
        variants: {
            heading1: { fontSize: "32px", fontWeight: 700 },
            body: { fontSize: "16px" },
        },
    },
});

describe("createTipTapRichTextBlock", () => {
    it("skips the empty text block the rich text editor adds at the end, so the last text keeps no bottom spacing", () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock();
        const data = createBlockData([createParagraph("First"), createParagraph("Last"), { type: "textBlock", attrs: { textBlock: "paragraph" } }]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />);

        expect(markup.match(/htmlText--bottomSpacing/g)).toHaveLength(1);
    });

    it("uses the look of the picked style, or the `textBlocks` look when the style has none", () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock({
            textBlocks: { "heading-1": { variant: "heading1" } },
            textBlockStyles: { small: { variant: "body" } },
        });
        const data = createBlockData([
            createTextBlock("heading-1", "Known", { textBlockStyle: "small" }),
            createTextBlock("heading-1", "Unknown", { textBlockStyle: "missing" }),
        ]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />, themeWithVariants);

        expect(markup).toMatch(/htmlText--body[^>]*>Known</);
        expect(markup).toMatch(/htmlText--heading1[^>]*>Unknown</);
    });

    it("renders each list item with its own text block style and keeps counting across styles", () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock({ textBlockStyles: { body: { variant: "body" } } });
        const data = createBlockData([{ type: "orderedList", content: [createListItem("One"), createListItem("Two", { textBlockStyle: "body" })] }]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />, themeWithVariants);

        expect(getListClassOf(markup, "One")).not.toContain("richTextBlock__list--variantBody");
        expect(getListClassOf(markup, "Two")).toContain("richTextBlock__list--variantBody");
        expect(getListMarkerOf(markup, "Two")).toBe("2.");
    });

    it("renders a nested list item with its own text block style", () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock({
            textBlockStyles: { heading: { variant: "heading1" }, body: { variant: "body" } },
        });
        const data = createBlockData([
            {
                type: "bulletList",
                content: [
                    {
                        type: "listItem",
                        content: [
                            createParagraph("Parent", { textBlockStyle: "heading" }),
                            { type: "bulletList", content: [createListItem("Child", { textBlockStyle: "body" })] },
                        ],
                    },
                ],
            },
        ]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />, themeWithVariants);

        expect(getListItemTextStyleOf(markup, "Parent")).toContain("font-size:32px");
        expect(getListItemTextStyleOf(markup, "Child")).toContain("font-size:16px");
        expect(getListItemTextStyleOf(markup, "Child")).toContain("font-weight:normal");
    });

    it("renders a nested list item without a text block style with the `textBlocks` style of its list, not with the enclosing item's style", () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock({
            textBlocks: { "unordered-list": { fontSize: "20px" } },
            textBlockStyles: { heading: { variant: "heading1" } },
        });
        const data = createBlockData([
            {
                type: "bulletList",
                content: [
                    {
                        type: "listItem",
                        content: [
                            createParagraph("Parent", { textBlockStyle: "heading" }),
                            { type: "bulletList", content: [createListItem("Child")] },
                        ],
                    },
                ],
            },
        ]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />, themeWithVariants);

        expect(getListItemTextStyleOf(markup, "Child")).toContain("font-size:20px");
    });

    it("gives a nested list item's row the classes of its own text block style", () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock({
            textBlockStyles: { heading: { variant: "heading1" }, body: { variant: "body", className: "bodyText" } },
        });
        const data = createBlockData([
            {
                type: "bulletList",
                content: [
                    {
                        type: "listItem",
                        content: [
                            createParagraph("Parent", { textBlockStyle: "heading" }),
                            { type: "bulletList", content: [createListItem("Child", { textBlockStyle: "body" })] },
                        ],
                    },
                ],
            },
        ]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />, themeWithVariants);

        expect(getListItemClassOf(markup, "Child")).toContain("richTextBlock__listItem--variantBody");
        expect(getListItemClassOf(markup, "Child")).toContain("bodyText");
    });

    it("leaves no `mj-text` tag in the compiled mail for a nested list", () => {
        const { MjmlTipTapRichTextBlock } = createTipTapRichTextBlock();
        const data = createBlockData([
            {
                type: "bulletList",
                content: [{ type: "listItem", content: [createParagraph("Parent"), { type: "bulletList", content: [createListItem("Child")] }] }],
            },
        ]);
        const { html } = renderMailHtml(
            <MjmlMailRoot>
                <MjmlSection indent>
                    <MjmlColumn>
                        <MjmlTipTapRichTextBlock data={data} />
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(html).toContain(">Child<");
        expect(html).not.toContain("<mj-text");
    });

    it("renders a link mark as an anchor to the resolved href", () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock();
        const data = createBlockData([
            {
                type: "textBlock",
                attrs: { textBlock: "paragraph" },
                content: [{ type: "text", marks: [createLinkMark("external", { targetUrl: "https://example.com" })], text: "link" }],
            },
        ]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />);

        expect(markup).toContain('href="https://example.com"');
        expect(markup).toContain(">link</a>");
    });

    it("renders a placeholder as `{{name}}`, for the sending system to replace", () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock();
        const data = createBlockData([
            { type: "textBlock", attrs: { textBlock: "paragraph" }, content: [{ type: "placeholder", attrs: { name: "SALUTATION" } }] },
        ]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />);

        expect(markup).toContain("{{SALUTATION}}");
    });

    it("renders a newline within a text as a line break", () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock();
        const data = createBlockData([createParagraph("First line\nSecond line")]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />);

        expect(markup).toContain("First line<br/>Second line");
    });
});
