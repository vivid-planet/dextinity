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

function createParagraph(text: string, attrs?: Record<string, unknown>): Record<string, unknown> {
    return { type: "paragraph", ...(attrs && { attrs }), content: [{ type: "text", text }] };
}

function createListItem(text: string, attrs?: Record<string, unknown>): Record<string, unknown> {
    return { type: "listItem", content: [createParagraph(text, attrs)] };
}

function createHeading(level: number, text: string, attrs?: Record<string, unknown>): Record<string, unknown> {
    return { type: "heading", attrs: { level, ...attrs }, content: [{ type: "text", text }] };
}

function createLinkMark(type: string, props: Record<string, unknown>): Record<string, unknown> {
    return { type: "link", attrs: { data: { attachedBlocks: [], activeType: type, block: { type, props } } } };
}

const themeWithVariants = createTheme({
    text: {
        variants: {
            heading1: { fontSize: "32px", fontWeight: 700 },
            heading2: { fontSize: "24px", fontWeight: 700 },
            body: { fontSize: "16px" },
        },
    },
});

describe("createTipTapRichTextBlock — base rendering", () => {
    const { MjmlTipTapRichTextBlock, HtmlTipTapRichTextBlock } = createTipTapRichTextBlock();

    it("renders every text block that has content as its own text component", () => {
        const data = createBlockData([createParagraph("First"), createParagraph("Second"), { type: "paragraph" }]);

        expect(renderWithTheme(<MjmlTipTapRichTextBlock data={data} />).match(/<mj-text/g)).toHaveLength(2);

        const htmlMarkup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />);

        expect(htmlMarkup.match(/richTextBlock__text/g)).toHaveLength(2);
        expect(htmlMarkup).toContain("First");
        expect(htmlMarkup).toContain("Second");
    });

    it("renders nothing for content that is not a Tip-Tap document", () => {
        expect(renderWithTheme(<HtmlTipTapRichTextBlock data={{ tipTapContent: null }} />)).toBe("");
        expect(renderWithTheme(<HtmlTipTapRichTextBlock data={{ tipTapContent: { blocks: [] } }} />)).toBe("");
    });

    it("applies the theme's spacing below every text block but the last", () => {
        const data = createBlockData([createParagraph("First"), createParagraph("Second"), createParagraph("Third")]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />);
        const textBlocks = markup.split("</div>").filter((textBlock) => textBlock !== "");

        expect(textBlocks[0]).toContain("htmlText--bottomSpacing");
        expect(textBlocks[1]).toContain("htmlText--bottomSpacing");
        expect(textBlocks[2]).not.toContain("htmlText--bottomSpacing");
    });
});

describe("createTipTapRichTextBlock — block types and text block styles", () => {
    it("styles a heading by its level", () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock({
            blockTypes: { "heading-1": { variant: "heading1" }, "heading-2": { variant: "heading2" } },
        });
        const data = createBlockData([createHeading(1, "One"), createHeading(2, "Two")]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />, themeWithVariants);

        expect(markup).toContain("htmlText--heading1");
        expect(markup).toContain("htmlText--heading2");
    });

    it("prefers a text block style it knows over the block type, and falls back to the block type for one it does not", () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock({
            blockTypes: { "heading-1": { variant: "heading1" } },
            textBlockStyles: { quiet: { variant: "body" } },
        });
        const data = createBlockData([
            createHeading(1, "Known", { textBlockStyle: "quiet" }),
            createHeading(1, "Unknown", { textBlockStyle: "missing" }),
        ]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />, themeWithVariants);

        expect(markup).toContain("htmlText--body");
        expect(markup).toContain("htmlText--heading1");
    });

    it("takes a list's text block style from the paragraph inside its first item", () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock({ textBlockStyles: { listSmall: { variant: "body" } } });
        const data = createBlockData([
            { type: "bulletList", content: [createListItem("One", { textBlockStyle: "listSmall" }), createListItem("Two")] },
        ]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />, themeWithVariants);

        expect(markup).toContain("richTextBlock__list--variantBody");
    });
});

describe("createTipTapRichTextBlock — marks and inline nodes", () => {
    const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock();

    it("renders the built-in marks", () => {
        const data = createBlockData([
            {
                type: "paragraph",
                content: [
                    { type: "text", marks: [{ type: "bold" }], text: "bold" },
                    { type: "text", marks: [{ type: "italic" }], text: "italic" },
                    { type: "text", marks: [{ type: "underline" }], text: "underline" },
                    { type: "text", marks: [{ type: "strike" }], text: "strike" },
                    { type: "text", marks: [{ type: "superscript" }], text: "sup" },
                    { type: "text", marks: [{ type: "subscript" }], text: "sub" },
                ],
            },
        ]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />);

        expect(markup).toMatch(/<strong[^>]*>bold<\/strong>/);
        expect(markup).toMatch(/<em[^>]*>italic<\/em>/);
        expect(markup).toMatch(/<u[^>]*>underline<\/u>/);
        expect(markup).toMatch(/<s[^>]*>strike<\/s>/);
        expect(markup).toMatch(/<sup[^>]*>sup<\/sup>/);
        expect(markup).toMatch(/<sub[^>]*>sub<\/sub>/);
    });

    it("nests the marks of one text node into one another", () => {
        const data = createBlockData([
            { type: "paragraph", content: [{ type: "text", marks: [{ type: "bold" }, { type: "italic" }], text: "both" }] },
        ]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />);

        expect(markup).toMatch(/<em[^>]*><strong[^>]*>both<\/strong><\/em>/);
    });

    it("lets a configured mark replace a built-in one", () => {
        const { HtmlTipTapRichTextBlock: HtmlCustomMarkBlock } = createTipTapRichTextBlock({
            marks: { bold: (children, { key }) => <b key={key}>{children}</b> },
        });
        const data = createBlockData([{ type: "paragraph", content: [{ type: "text", marks: [{ type: "bold" }], text: "bold" }] }]);
        const markup = renderWithTheme(<HtmlCustomMarkBlock data={data} />);

        expect(markup).toContain("<b>bold</b>");
        expect(markup).not.toContain("<strong");
    });

    it("renders an inline style through its configured renderer, and keeps the plain text of one without", () => {
        const { HtmlTipTapRichTextBlock: HtmlInlineStyleBlock } = createTipTapRichTextBlock({
            inlineStyles: { highlight: (children, { key }) => <mark key={key}>{children}</mark> },
        });
        const data = createBlockData([
            {
                type: "paragraph",
                content: [
                    { type: "text", marks: [{ type: "inlineStyle", attrs: { type: "highlight" } }], text: "lit" },
                    { type: "text", marks: [{ type: "inlineStyle", attrs: { type: "unknown" } }], text: "plain" },
                ],
            },
        ]);
        const markup = renderWithTheme(<HtmlInlineStyleBlock data={data} />);

        expect(markup).toContain("<mark>lit</mark>");
        expect(markup).toContain("plain");
    });

    it("renders a placeholder as the literal text the editor shows", () => {
        const data = createBlockData([{ type: "paragraph", content: [{ type: "placeholder", attrs: { name: "SALUTATION" } }] }]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />);

        expect(markup).toContain("{{SALUTATION}}");
    });

    it("renders line breaks and the characters stored as their own nodes", () => {
        const data = createBlockData([
            {
                type: "paragraph",
                content: [
                    { type: "text", text: "one" },
                    { type: "hardBreak" },
                    { type: "text", text: "two" },
                    { type: "nonBreakingSpace" },
                    { type: "softHyphen" },
                ],
            },
        ]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />);

        expect(markup).toContain("one<br/>two");
        expect(markup).toContain(String.fromCodePoint(0xa0));
        expect(markup).toContain(String.fromCodePoint(0xad));
    });

    it("skips child blocks while keeping the text around them", () => {
        const data = createBlockData([
            {
                type: "paragraph",
                content: [
                    { type: "text", text: "before" },
                    { type: "cmsInlineBlock", attrs: { blockType: "productPrice", data: {} } },
                    { type: "text", text: "after" },
                ],
            },
        ]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />);

        expect(markup).toContain("beforeafter");
    });
});

describe("createTipTapRichTextBlock — links", () => {
    it("resolves both the built-in external link type and a configured one to anchors", () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock({
            linkTypes: { phone: (props: { phone: string }) => `tel:${props.phone}` },
        });
        const data = createBlockData([
            {
                type: "paragraph",
                content: [
                    { type: "text", marks: [createLinkMark("external", { targetUrl: "https://example.com" })], text: "link" },
                    { type: "text", marks: [createLinkMark("phone", { phone: "+123" })], text: "call" },
                ],
            },
        ]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />);

        expect(markup).toContain(`href="https://example.com"`);
        expect(markup).toContain(`href="tel:+123"`);
        expect(markup).toContain("richTextBlock__link");
    });

    it("renders the text without an anchor for a link type that has no resolver", () => {
        const { HtmlTipTapRichTextBlock } = createTipTapRichTextBlock();
        const data = createBlockData([
            { type: "paragraph", content: [{ type: "text", marks: [createLinkMark("internal", { targetPage: { path: "/" } })], text: "link" }] },
        ]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />);

        expect(markup).toContain("link");
        expect(markup).not.toContain("<a");
    });
});

describe("createTipTapRichTextBlock — lists", () => {
    const { MjmlTipTapRichTextBlock, HtmlTipTapRichTextBlock } = createTipTapRichTextBlock();

    const nestedListData = createBlockData([
        {
            type: "bulletList",
            content: [
                {
                    type: "listItem",
                    content: [
                        createParagraph("Level 1"),
                        {
                            type: "orderedList",
                            content: [
                                {
                                    type: "listItem",
                                    content: [createParagraph("Level 2"), { type: "bulletList", content: [createListItem("Level 3")] }],
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ]);

    it("renders one list row per item", () => {
        const data = createBlockData([{ type: "bulletList", content: [createListItem("One"), createListItem("Two")] }]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />);

        expect(markup.match(/richTextBlock__listItemText/g)).toHaveLength(2);
    });

    it("names each level's nesting depth and marks the nested ones", () => {
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={nestedListData} />);

        expect(markup.match(/richTextBlock__list--depth\d+/g)).toEqual([
            "richTextBlock__list--depth0",
            "richTextBlock__list--depth1",
            "richTextBlock__list--depth2",
        ]);
        expect(markup.match(/richTextBlock__list--nested/g)).toHaveLength(2);
    });

    it("renders every level inside one text component, leaving no unprocessed MJML tag in the compiled mail", () => {
        const { html } = renderMailHtml(
            <MjmlMailRoot>
                <MjmlSection indent>
                    <MjmlColumn>
                        <MjmlTipTapRichTextBlock data={nestedListData} />
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(html).toContain("Level 3");
        expect(html.match(/richTextBlock__text/g)).toHaveLength(1);
        expect(html).not.toContain("<mj-");
    });

    it("separates several text blocks of one list item with a line break", () => {
        const data = createBlockData([
            { type: "bulletList", content: [{ type: "listItem", content: [createParagraph("One"), createParagraph("Two")] }] },
        ]);
        const markup = renderWithTheme(<HtmlTipTapRichTextBlock data={data} />);

        expect(markup).toContain("One<br/>Two");
    });
});
