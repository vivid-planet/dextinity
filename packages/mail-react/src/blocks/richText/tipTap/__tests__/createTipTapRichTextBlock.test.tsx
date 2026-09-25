import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

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

    it("prefers a text block style it knows over the block type, and falls back to the block type for one it does not", () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock({
            textBlocks: { "heading-1": { variant: "heading1" } },
            textBlockStyles: { quiet: { variant: "body" } },
        });
        const data = createBlockData([
            createTextBlock("heading-1", "Known", { textBlockStyle: "quiet" }),
            createTextBlock("heading-1", "Unknown", { textBlockStyle: "missing" }),
        ]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />, themeWithVariants);

        expect(markup).toContain("htmlText--body");
        expect(markup).toContain("htmlText--heading1");
    });

    it("renders each list item with its own text block style and keeps counting across styles", () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock({ textBlockStyles: { small: { variant: "body" } } });
        const data = createBlockData([{ type: "orderedList", content: [createListItem("One"), createListItem("Two", { textBlockStyle: "small" })] }]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />, themeWithVariants);

        expect(markup).toMatch(/richTextBlock__list--ordered richTextBlock__list--depth0"[\s\S]*1\.[\s\S]*One/);
        expect(markup).toMatch(/richTextBlock__list--variantBody"[\s\S]*2\.[\s\S]*Two/);
    });

    it("renders a nested list inside the text component of its parent list, which MJML would otherwise leave as a literal tag", () => {
        const { MjmlTipTapRichTextBlock } = createTipTapRichTextBlock();
        const data = createBlockData([
            {
                type: "bulletList",
                content: [{ type: "listItem", content: [createParagraph("Parent"), { type: "bulletList", content: [createListItem("Child")] }] }],
            },
        ]);
        const markup = renderWithTheme(<MjmlTipTapRichTextBlock data={data} />);

        expect(markup.match(/<mj-text/g)).toHaveLength(1);
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

        expect(markup).toContain(`href="https://example.com"`);
    });

    it("renders a placeholder as the literal text the rich text editor shows, for the sending system to substitute", () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock();
        const data = createBlockData([
            { type: "textBlock", attrs: { textBlock: "paragraph" }, content: [{ type: "placeholder", attrs: { name: "SALUTATION" } }] },
        ]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />);

        expect(markup).toContain("{{SALUTATION}}");
    });
});
