import { MjmlColumn } from "@faire/mjml-react";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MjmlMailRoot } from "../../../../components/mailRoot/MjmlMailRoot.js";
import { MjmlSection } from "../../../../components/section/MjmlSection.js";
import { renderMailHtml } from "../../../../server/renderMailHtml.js";
import { createTheme } from "../../../../theme/createTheme.js";
import { defaultTheme } from "../../../../theme/defaultTheme.js";
import { getDefaultFromResponsiveValue } from "../../../../theme/responsiveValue.js";
import { ThemeProvider } from "../../../../theme/ThemeProvider.js";
import type { RichTextBlockData } from "../common.js";
import { createRichTextBlock } from "../createRichTextBlock.js";

function renderWithTheme(node: ReactNode, theme = createTheme()): string {
    return renderToStaticMarkup(<ThemeProvider theme={theme}>{node}</ThemeProvider>);
}

function createDraftBlock(overrides: { key: string; text: string; type?: string; [key: string]: unknown }) {
    return { type: "unstyled", depth: 0, inlineStyleRanges: [], entityRanges: [], data: {}, ...overrides };
}

function createBlockData(blocks: Array<Record<string, unknown>>, entityMap: Record<string, unknown> = {}): RichTextBlockData {
    return { draftContent: { blocks, entityMap } };
}

function markerTextsInDocumentOrder(markup: string): string[] {
    return [...markup.matchAll(/richTextBlock__listItemMarker[^>]*>([^<]*)</g)].map(([, marker]) => marker);
}

const themeWithVariants = createTheme({
    text: {
        variants: {
            heading1: { fontSize: "32px", fontWeight: 700 },
            body: { fontSize: "16px" },
        },
    },
});

describe("createRichTextBlock — base rendering", () => {
    const { MjmlRichTextBlock, HtmlRichTextBlock } = createRichTextBlock();

    it("renders each draft block as its own MjmlText with base theme styles", () => {
        const data = createBlockData([createDraftBlock({ key: "a", text: "First" }), createDraftBlock({ key: "b", text: "Second" })]);
        const markup = renderWithTheme(<MjmlRichTextBlock data={data} />);

        expect(markup.match(/<mj-text/g)).toHaveLength(2);
        expect(markup).toContain("First");
        expect(markup).toContain("Second");
    });

    it("renders each draft block as its own HtmlText div with a richTextBlock__text class", () => {
        const data = createBlockData([createDraftBlock({ key: "a", text: "First" }), createDraftBlock({ key: "b", text: "Second" })]);
        const markup = renderWithTheme(<HtmlRichTextBlock data={data} />);

        expect(markup.match(/<div/g)).toHaveLength(2);
        expect(markup.match(/richTextBlock__text/g)).toHaveLength(2);
    });

    it("renders unmapped block types with base styles instead of failing", () => {
        const data = createBlockData([createDraftBlock({ key: "a", text: "Custom", type: "paragraph-standard" })]);
        const markup = renderWithTheme(<MjmlRichTextBlock data={data} />);

        expect(markup).toContain("Custom");
        expect(markup).not.toContain("mjmlText--");
    });

    it("renders nothing when draftContent has no blocks with text", () => {
        const data = createBlockData([createDraftBlock({ key: "a", text: "" })]);

        expect(renderWithTheme(<MjmlRichTextBlock data={data} />)).toBe("");
    });

    it("renders nothing when draftContent is not draft-js raw content", () => {
        const data: RichTextBlockData = { draftContent: "not draft content" };

        expect(renderWithTheme(<MjmlRichTextBlock data={data} />)).toBe("");
    });

    it("filters empty draft blocks", () => {
        const data = createBlockData([
            createDraftBlock({ key: "a", text: "Content" }),
            createDraftBlock({ key: "b", text: "" }),
            createDraftBlock({ key: "c", text: "More" }),
        ]);
        const markup = renderWithTheme(<MjmlRichTextBlock data={data} />);

        expect(markup.match(/<mj-text/g)).toHaveLength(2);
    });
});

describe("createRichTextBlock — block type configuration", () => {
    const { MjmlRichTextBlock, HtmlRichTextBlock } = createRichTextBlock({
        blockTypes: {
            "header-one": { variant: "heading1" },
            "paragraph-standard": { variant: "body", className: "customParagraph" },
            unstyled: { color: "#ff0000", fontWeight: 700 },
        },
    });

    it("applies the mapped variant to the text component", () => {
        const data = createBlockData([createDraftBlock({ key: "a", text: "Heading", type: "header-one" })]);

        expect(renderWithTheme(<MjmlRichTextBlock data={data} />, themeWithVariants)).toContain("mjmlText--heading1");
        expect(renderWithTheme(<HtmlRichTextBlock data={data} />, themeWithVariants)).toContain("htmlText--heading1");
    });

    it("keeps the variant's resolved styles when the block type config sets no style props", () => {
        const data = createBlockData([createDraftBlock({ key: "a", text: "Heading", type: "header-one" })]);
        const markup = renderWithTheme(<MjmlRichTextBlock data={data} />, themeWithVariants);

        expect(markup).toContain('font-weight="700"');
        expect(markup).toContain('font-size="32px"');
    });

    it("passes className through to the text component", () => {
        const data = createBlockData([createDraftBlock({ key: "a", text: "Paragraph", type: "paragraph-standard" })]);

        expect(renderWithTheme(<MjmlRichTextBlock data={data} />, themeWithVariants)).toContain("customParagraph");
    });

    it("applies plain style props in the Mjml variant as MjmlText attributes", () => {
        const data = createBlockData([createDraftBlock({ key: "a", text: "Styled" })]);
        const markup = renderWithTheme(<MjmlRichTextBlock data={data} />);

        expect(markup).toContain('color="#ff0000"');
        expect(markup).toContain('font-weight="700"');
    });

    it("applies plain style props in the Html variant as inline styles", () => {
        const data = createBlockData([createDraftBlock({ key: "a", text: "Styled" })]);
        const markup = renderWithTheme(<HtmlRichTextBlock data={data} />);

        expect(markup).toContain("color:#ff0000");
        expect(markup).toContain("font-weight:700");
    });
});

describe("createRichTextBlock — bottom spacing", () => {
    const { HtmlRichTextBlock } = createRichTextBlock();

    it("applies bottomSpacing to every block except the last one with text", () => {
        const data = createBlockData([
            createDraftBlock({ key: "a", text: "First" }),
            createDraftBlock({ key: "b", text: "Last" }),
            createDraftBlock({ key: "c", text: "" }),
        ]);
        const markup = renderWithTheme(<HtmlRichTextBlock data={data} />);
        const blocks = markup.split("</div>").filter((block) => block !== "");

        expect(blocks[0]).toContain("htmlText--bottomSpacing");
        expect(blocks[1]).not.toContain("htmlText--bottomSpacing");
    });
});

describe("createRichTextBlock — inline styles and line breaks", () => {
    const { HtmlRichTextBlock } = createRichTextBlock();

    it("renders BOLD and ITALIC ranges as semantic tags with an explicit style fallback", () => {
        const data = createBlockData([
            createDraftBlock({
                key: "a",
                text: "bold italic",
                inlineStyleRanges: [
                    { offset: 0, length: 4, style: "BOLD" },
                    { offset: 5, length: 6, style: "ITALIC" },
                ],
            }),
        ]);
        const markup = renderWithTheme(<HtmlRichTextBlock data={data} />);

        expect(markup).toContain('<strong style="font-weight:bold">bold</strong>');
        expect(markup).toContain('<em style="font-style:italic">italic</em>');
    });

    it("renders a STRIKETHROUGH range", () => {
        const data = createBlockData([
            createDraftBlock({ key: "a", text: "struck", inlineStyleRanges: [{ offset: 0, length: 6, style: "STRIKETHROUGH" }] }),
        ]);
        const markup = renderWithTheme(<HtmlRichTextBlock data={data} />);

        expect(markup).toContain("<s>struck</s>");
    });

    it("renders a line break within a block as <br/>", () => {
        const data = createBlockData([createDraftBlock({ key: "a", text: "line one\nline two" })]);
        const markup = renderWithTheme(<HtmlRichTextBlock data={data} />);

        expect(markup).toContain("line one<br/>line two");
    });

    it("merges the inline option over the built-in marks: overrides one, keeps the rest", () => {
        const { HtmlRichTextBlock: HtmlCustomBoldRichTextBlock } = createRichTextBlock({
            inline: {
                BOLD: (children, { key }) => (
                    <span key={key} className="customBold">
                        {children}
                    </span>
                ),
            },
        });
        const data = createBlockData([
            createDraftBlock({
                key: "a",
                text: "bold italic",
                inlineStyleRanges: [
                    { offset: 0, length: 4, style: "BOLD" },
                    { offset: 5, length: 6, style: "ITALIC" },
                ],
            }),
        ]);
        const markup = renderWithTheme(<HtmlCustomBoldRichTextBlock data={data} />);

        expect(markup).toContain('<span class="customBold">bold</span>');
        expect(markup).toContain('<em style="font-style:italic">italic</em>');
    });

    it("renders a custom inline style that has no built-in renderer", () => {
        const { HtmlRichTextBlock: HtmlHighlightRichTextBlock } = createRichTextBlock({
            inline: {
                HIGHLIGHT: (children, { key }) => (
                    <span key={key} style={{ backgroundColor: "#ff0000" }}>
                        {children}
                    </span>
                ),
            },
        });
        const data = createBlockData([
            createDraftBlock({ key: "a", text: "highlighted", inlineStyleRanges: [{ offset: 0, length: 11, style: "HIGHLIGHT" }] }),
        ]);
        const markup = renderWithTheme(<HtmlHighlightRichTextBlock data={data} />);

        expect(markup).toContain('<span style="background-color:#ff0000">highlighted</span>');
    });
});

describe("createRichTextBlock — links", () => {
    const { HtmlRichTextBlock } = createRichTextBlock();

    function createLinkBlockData(linkBlock: Record<string, unknown>): RichTextBlockData {
        return createBlockData([createDraftBlock({ key: "a", text: "Visit our website now", entityRanges: [{ offset: 6, length: 11, key: 0 }] })], {
            "0": { type: "LINK", mutability: "MUTABLE", data: { block: linkBlock } },
        });
    }

    it("renders an external LINK entity as an inline link with the target URL", () => {
        const data = createLinkBlockData({ type: "external", props: { targetUrl: "https://example.com", openInNewWindow: false } });
        const markup = renderWithTheme(<HtmlRichTextBlock data={data} />);

        expect(markup).toContain('href="https://example.com"');
        expect(markup).toContain("richTextBlock__link");
        expect(markup).toContain("our website");
    });

    it("renders the text of an unconfigured link type without a link", () => {
        const data = createLinkBlockData({ type: "internal", props: { targetPage: { id: "1", path: "/" } } });
        const markup = renderWithTheme(<HtmlRichTextBlock data={data} />);

        expect(markup).not.toContain("<a");
        expect(markup).toContain("our website");
    });

    it("resolves application-defined link types through the linkTypes option", () => {
        const { HtmlRichTextBlock: HtmlPhoneLinkRichTextBlock } = createRichTextBlock({
            linkTypes: {
                phone: (props: { phoneNumber: string }) => `tel:${props.phoneNumber}`,
            },
        });
        const data = createLinkBlockData({ type: "phone", props: { phoneNumber: "+431234567" } });
        const markup = renderWithTheme(<HtmlPhoneLinkRichTextBlock data={data} />);

        expect(markup).toContain('href="tel:+431234567"');
    });

    it("types resolver props from the factory's type argument", () => {
        createRichTextBlock<{ phone: { phoneNumber: string } }>({
            linkTypes: {
                phone: (props) => {
                    // Accessing `phoneNumber` compiles only because `props` is typed from the type argument, not `unknown`.
                    const phoneNumber: string = props.phoneNumber;
                    // @ts-expect-error `props.phoneNumber` is a string, not a number
                    const wrongType: number = props.phoneNumber;

                    return `tel:${phoneNumber}${String(wrongType)}`;
                },
            },
        });
    });

    it("types resolver props from an annotated parameter", () => {
        createRichTextBlock({
            linkTypes: {
                phone: (props: { phoneNumber: string }) => {
                    // @ts-expect-error `props.phoneNumber` is a string, not a number
                    const phoneNumber: number = props.phoneNumber;

                    return `tel:${String(phoneNumber)}`;
                },
            },
        });
    });

    it("keeps the built-in external link type when linkTypes adds more", () => {
        const { HtmlRichTextBlock: HtmlPhoneLinkRichTextBlock } = createRichTextBlock({ linkTypes: { phone: () => undefined } });
        const data = createLinkBlockData({ type: "external", props: { targetUrl: "https://example.com", openInNewWindow: false } });
        const markup = renderWithTheme(<HtmlPhoneLinkRichTextBlock data={data} />);

        expect(markup).toContain('href="https://example.com"');
    });
});

describe("createRichTextBlock — lists", () => {
    const { MjmlRichTextBlock, HtmlRichTextBlock } = createRichTextBlock();

    function createListBlocks(type: "unordered-list-item" | "ordered-list-item", texts: string[]) {
        return texts.map((text, index) => createDraftBlock({ key: `${type}-${String(index)}`, text, type }));
    }

    it("renders consecutive items as one table, one row per item", () => {
        const data = createBlockData(createListBlocks("unordered-list-item", ["Item one", "Item two"]));
        const markup = renderWithTheme(<MjmlRichTextBlock data={data} />);

        expect(markup.match(/<mj-text/g)).toHaveLength(1);
        expect(markup.match(/<tr/g)).toHaveLength(2);
        expect(markup.match(/richTextBlock__listItemMarker/g)).toHaveLength(2);
        expect(markup.match(/richTextBlock__listItemText/g)).toHaveLength(2);
    });

    it("spaces the items through their rows, and puts the block's bottom spacing below the last one", () => {
        const data = createBlockData([
            ...createListBlocks("unordered-list-item", ["Item one", "Item two", "Item three"]),
            createDraftBlock({ key: "p", text: "A closing paragraph" }),
        ]);
        const rows = renderWithTheme(<HtmlRichTextBlock data={data} />).split("<tr");

        expect(rows[1]).toContain("richTextBlock__listItem--itemSpacing");
        expect(rows[1]).toMatch(/padding-bottom:\d+px/);
        expect(rows[3]).not.toContain("richTextBlock__listItem--itemSpacing");
        expect(rows[3]).toContain("richTextBlock__listItem--blockSpacing");
        expect(rows[3]).toMatch(/padding-bottom:\d+px/);
        expect(rows[0]).not.toContain("htmlText--bottomSpacing");
    });

    it("keeps an item's inline markup inside its text cell", () => {
        const data = createBlockData(
            [
                createDraftBlock({
                    key: "a",
                    text: "line one\nour website",
                    type: "unordered-list-item",
                    entityRanges: [{ offset: 9, length: 11, key: 0 }],
                }),
            ],
            { "0": { type: "LINK", mutability: "MUTABLE", data: { block: { type: "external", props: { targetUrl: "https://example.com" } } } } },
        );
        const markup = renderWithTheme(<HtmlRichTextBlock data={data} />);
        const textCell = /<td[^>]*richTextBlock__listItemText[^>]*>.*?<\/td>/s.exec(markup)?.[0];

        expect(textCell).toContain("line one<br/>");
        expect(textCell).toContain('href="https://example.com"');
    });

    it("numbers ordered items, restarting after an interrupting paragraph", () => {
        const data = createBlockData([
            ...createListBlocks("ordered-list-item", ["First list, item one", "First list, item two"]),
            createDraftBlock({ key: "p", text: "An interrupting paragraph" }),
            createDraftBlock({ key: "second", text: "Second list, item one", type: "ordered-list-item" }),
        ]);
        const markup = renderWithTheme(<HtmlRichTextBlock data={data} />);

        expect(markup.match(/>1\.</g)).toHaveLength(2);
        expect(markup.match(/>2\.</g)).toHaveLength(1);
    });

    it("takes the marker of each list kind from the theme", () => {
        const markerTheme = createTheme({
            list: { unorderedMarker: "▪", orderedMarker: ({ index }) => `${index + 1})` },
        });
        const data = createBlockData([
            ...createListBlocks("unordered-list-item", ["Bulleted item one", "Bulleted item two"]),
            ...createListBlocks("ordered-list-item", ["Numbered item one", "Numbered item two", "Numbered item three"]),
        ]);
        const markup = renderWithTheme(<HtmlRichTextBlock data={data} />, markerTheme);

        expect(markerTextsInDocumentOrder(markup)).toEqual(["▪", "▪", "1)", "2)", "3)"]);
    });

    it("gives the marker function the nesting level of the item's own list", () => {
        const markerTheme = createTheme({ list: { unorderedMarker: ({ depth }) => `L${depth}` } });
        const data = createBlockData([
            createDraftBlock({ key: "top", text: "Top item", type: "unordered-list-item" }),
            createDraftBlock({ key: "nested", text: "Nested item", type: "unordered-list-item", depth: 1 }),
            createDraftBlock({ key: "deep", text: "Deep item", type: "unordered-list-item", depth: 2 }),
        ]);
        const markup = renderWithTheme(<HtmlRichTextBlock data={data} />, markerTheme);

        expect(markup).toContain(">L0<");
        expect(markup).toContain(">L1<");
        expect(markup).toContain(">L2<");
    });

    it("numbers a nested ordered list from its own first item", () => {
        const markerTheme = createTheme({
            list: { orderedMarker: ({ index, depth }) => (depth === 0 ? `${index + 1}.` : `${String.fromCharCode(97 + index)}.`) },
        });
        const data = createBlockData([
            createDraftBlock({ key: "top-1", text: "Top one", type: "ordered-list-item" }),
            createDraftBlock({ key: "nested-1", text: "Nested one", type: "ordered-list-item", depth: 1 }),
            createDraftBlock({ key: "nested-2", text: "Nested two", type: "ordered-list-item", depth: 1 }),
            createDraftBlock({ key: "top-2", text: "Top two", type: "ordered-list-item" }),
        ]);
        const markup = renderWithTheme(<HtmlRichTextBlock data={data} />, markerTheme);

        expect(markerTextsInDocumentOrder(markup)).toEqual(["1.", "a.", "b.", "2."]);
    });

    it("renders an element marker inside the marker cell", () => {
        const markerTheme = createTheme({ list: { unorderedMarker: <span style={{ color: "#c0392b" }}>▪</span> } });
        const data = createBlockData(createListBlocks("unordered-list-item", ["Item one"]));
        const markup = renderWithTheme(<HtmlRichTextBlock data={data} />, markerTheme);
        const markerCell = /<td[^>]*richTextBlock__listItemMarker[^>]*>.*?<\/td>/s.exec(markup)?.[0];

        expect(markerCell).toContain('<span style="color:#c0392b">▪</span>');
    });

    // Both cells need the styles because the nearest ancestor with a font size can be MJML's column, at zero.
    it("copies the surrounding text styles onto both cells of an item", () => {
        const data = createBlockData(createListBlocks("unordered-list-item", ["Item one"]));
        const markup = renderWithTheme(<MjmlRichTextBlock data={data} />);

        expect(markup.match(/font-family:/g)).toHaveLength(2);
        expect(markup).toContain("mso-line-height-rule:exactly");
    });

    it("renders the items unstyled when no theme is set", () => {
        const data = createBlockData(createListBlocks("unordered-list-item", ["Item one"]));
        const markup = renderToStaticMarkup(<MjmlRichTextBlock data={data} />);

        expect(markup).toContain("Item one");
        expect(markup).not.toContain("font-family");
    });

    it("takes the spacing of the marker and of the items from the theme", () => {
        const spaciousTheme = createTheme({ list: { indent: 40, markerGap: 24, itemSpacing: 20 } });
        const data = createBlockData(createListBlocks("unordered-list-item", ["Item one", "Item two"]));
        const rows = renderWithTheme(<HtmlRichTextBlock data={data} />, spaciousTheme).split("<tr");

        expect(rows[1]).toContain("padding-left:40px");
        expect(rows[1]).toContain("padding-right:24px");
        expect(rows[1]).toContain("padding-bottom:20px");
    });

    it("falls back to the default theme's spacing when no theme is set", () => {
        const data = createBlockData(createListBlocks("unordered-list-item", ["Item one"]));
        const markup = renderToStaticMarkup(<MjmlRichTextBlock data={data} />);
        const { indent, markerGap } = defaultTheme.list;

        expect(markup).toContain(`padding-left:${String(getDefaultFromResponsiveValue(indent))}px`);
        expect(markup).toContain(`padding-right:${String(getDefaultFromResponsiveValue(markerGap))}px`);
    });

    it("adds the modifier naming the list's type", () => {
        const unorderedData = createBlockData(createListBlocks("unordered-list-item", ["Item one"]));
        const orderedData = createBlockData(createListBlocks("ordered-list-item", ["Item one"]));

        expect(renderWithTheme(<HtmlRichTextBlock data={unorderedData} />)).toContain("richTextBlock__list--unordered");
        expect(renderWithTheme(<HtmlRichTextBlock data={orderedData} />)).toContain("richTextBlock__list--ordered");
    });

    it("adds the variant modifier for the variant its items render with", () => {
        const { HtmlRichTextBlock: HtmlVariantRichTextBlock } = createRichTextBlock({ blockTypes: { "unordered-list-item": { variant: "body" } } });
        const themeWithDefaultVariant = createTheme({ text: { defaultVariant: "body", variants: { body: { fontSize: "16px" } } } });
        const data = createBlockData(createListBlocks("unordered-list-item", ["Item one"]));

        expect(renderWithTheme(<HtmlVariantRichTextBlock data={data} />, themeWithVariants)).toContain("richTextBlock__list--variantBody");
        expect(renderWithTheme(<HtmlRichTextBlock data={data} />, themeWithDefaultVariant)).toContain("richTextBlock__list--variantBody");
    });
});

describe("createRichTextBlock — list block types", () => {
    function createListBlocks(type: string, texts: string[]) {
        return texts.map((text, index) => createDraftBlock({ key: `${type}-${String(index)}`, text, type }));
    }

    it("renders a block type that declares a list kind as a list of that kind", () => {
        const { HtmlRichTextBlock } = createRichTextBlock({
            blockTypes: {
                "unordered-list-item-small": { list: "unordered" },
                "ordered-list-item-small": { list: "ordered" },
            },
        });
        const data = createBlockData([
            ...createListBlocks("unordered-list-item-small", ["Bulleted item"]),
            ...createListBlocks("ordered-list-item-small", ["Numbered one", "Numbered two"]),
        ]);
        const markup = renderWithTheme(<HtmlRichTextBlock data={data} />);

        expect(markup).toContain("richTextBlock__list--unordered");
        expect(markup).toContain("richTextBlock__list--ordered");
        expect(markerTextsInDocumentOrder(markup)).toEqual(["•", "1.", "2."]);
    });

    it("renders two list block types independently of each other", () => {
        const { HtmlRichTextBlock } = createRichTextBlock({
            blockTypes: {
                "ordered-list-item": { variant: "body" },
                "ordered-list-item-large": { variant: "heading1", list: "ordered" },
            },
        });
        const data = createBlockData([
            ...createListBlocks("ordered-list-item", ["Standard one", "Standard two"]),
            ...createListBlocks("ordered-list-item-large", ["Large one", "Large two"]),
        ]);
        const markup = renderWithTheme(<HtmlRichTextBlock data={data} />, themeWithVariants);

        expect(markup.match(/richTextBlock__list--depth0/g)).toHaveLength(2);
        expect(markerTextsInDocumentOrder(markup)).toEqual(["1.", "2.", "1.", "2."]);
        expect(markup).toContain("richTextBlock__list--variantBody");
        expect(markup).toContain("richTextBlock__list--variantHeading1");
    });

    it("keeps the declared kind out of the rendered mail", () => {
        const { MjmlRichTextBlock, HtmlRichTextBlock } = createRichTextBlock({
            blockTypes: { "unordered-list-item-small": { list: "unordered" } },
        });
        const data = createBlockData(createListBlocks("unordered-list-item-small", ["Item one"]));

        expect(renderWithTheme(<MjmlRichTextBlock data={data} />)).not.toMatch(/\slist="/);
        expect(renderWithTheme(<HtmlRichTextBlock data={data} />)).not.toContain("list:unordered");
    });
});

describe("createRichTextBlock — draft depths", () => {
    const { HtmlRichTextBlock } = createRichTextBlock();
    const depthMarkerTheme = createTheme({ list: { unorderedMarker: ({ depth }) => `L${String(depth)}` } });

    it("renders content that starts with a nested list item", () => {
        const data = createBlockData([
            createDraftBlock({ key: "a", text: "", type: "unordered-list-item" }),
            createDraftBlock({ key: "b", text: "Item one", type: "unordered-list-item", depth: 1 }),
        ]);

        expect(renderWithTheme(<HtmlRichTextBlock data={data} />)).toContain("Item one");
    });

    it("gives the marker the depth of the level its item renders at", () => {
        const data = createBlockData([
            createDraftBlock({ key: "a", text: "Item one", type: "unordered-list-item" }),
            createDraftBlock({ key: "b", text: "Item two", type: "unordered-list-item", depth: 3 }),
        ]);
        const markup = renderWithTheme(<HtmlRichTextBlock data={data} />, depthMarkerTheme);

        expect(markerTextsInDocumentOrder(markup)).toEqual(["L0", "L1"]);
    });
});

describe("createRichTextBlock — nested lists", () => {
    const { MjmlRichTextBlock, HtmlRichTextBlock } = createRichTextBlock();

    function createNestedListBlocks(depths: number[]): Array<Record<string, unknown>> {
        return depths.map((depth, index) =>
            createDraftBlock({ key: `nested-${String(index)}`, text: `Level ${String(depth + 1)}`, type: "unordered-list-item", depth }),
        );
    }

    it("renders every level inside one text component, leaving no unprocessed MJML tag in the compiled mail", () => {
        const data = createBlockData(createNestedListBlocks([0, 1]));
        const { html } = renderMailHtml(
            <MjmlMailRoot>
                <MjmlSection indent>
                    <MjmlColumn>
                        <MjmlRichTextBlock data={data} />
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(html).toContain("Level 2");
        expect(html.match(/richTextBlock__text/g)).toHaveLength(1);
        expect(html).not.toContain("<mj-");
    });

    it("names each level's nesting depth, marks the nested ones and leaves the variant modifier to the outermost level", () => {
        const themeWithDefaultVariant = createTheme({ text: { defaultVariant: "body", variants: { body: { fontSize: "16px" } } } });
        const data = createBlockData(createNestedListBlocks([0, 1, 2]));
        const markup = renderWithTheme(<HtmlRichTextBlock data={data} />, themeWithDefaultVariant);

        expect(markup.match(/richTextBlock__list--depth\d+/g)).toEqual([
            "richTextBlock__list--depth0",
            "richTextBlock__list--depth1",
            "richTextBlock__list--depth2",
        ]);
        expect(markup.match(/richTextBlock__list--nested/g)).toHaveLength(2);
        expect(markup.match(/richTextBlock__list--variantBody/g)).toHaveLength(1);
    });

    it("puts the item spacing above a nested level's first item, and only there", () => {
        const data = createBlockData(createNestedListBlocks([0, 1, 1]));
        const rows = renderWithTheme(<HtmlRichTextBlock data={data} />).split("<tr");

        expect(rows[1]).not.toContain("richTextBlock__listItem--itemSpacingAbove");
        expect(rows[2]).toContain("richTextBlock__listItem--itemSpacingAbove");
        expect(rows[3]).not.toContain("richTextBlock__listItem--itemSpacingAbove");
        expect(rows[3]).not.toMatch(/padding-top:\d+px/);
    });

    it("leaves the spacing below a nested level to the item enclosing it", () => {
        const themeWithBlockSpacing = createTheme({
            text: { defaultVariant: "body", variants: { body: { fontSize: "16px", bottomSpacing: "16px" } } },
        });
        const data = createBlockData(createNestedListBlocks([0, 1, 0]));
        const rows = renderWithTheme(<HtmlRichTextBlock data={data} />, themeWithBlockSpacing).split("<tr");

        expect(rows[1]).toContain("richTextBlock__listItem--itemSpacing");
        expect(rows[2]).not.toContain("richTextBlock__listItem--blockSpacing");
        expect(rows[2]).not.toMatch(/padding-bottom:\d+px/);
    });
});
