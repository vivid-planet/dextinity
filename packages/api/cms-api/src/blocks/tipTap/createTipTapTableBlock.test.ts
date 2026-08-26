import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { ExternalLinkBlock } from "../externalLink/external-link.block";
import { createLinkBlock } from "../factories/createLinkBlock";
import type { TipTapRichTextBlockContent } from "./createTipTapRichTextBlock";
import { createTipTapTableBlock } from "./createTipTapTableBlock";

const cell = (text: string, type: "tableCell" | "tableHeader" = "tableCell") => ({
    type,
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});

const table = (rows: TipTapRichTextBlockContent[]): TipTapRichTextBlockContent => ({
    type: "doc",
    content: [{ type: "table", content: rows }],
});

const row = (...cells: TipTapRichTextBlockContent[]) => ({ type: "tableRow", content: cells });

describe("createTipTapTableBlock validation", () => {
    const block = createTipTapTableBlock({}, "TestTable");

    it("should accept a table with a header row and a body row", async () => {
        const input = block.blockInputFactory({
            tipTapContent: table([row(cell("Name", "tableHeader"), cell("Role", "tableHeader")), row(cell("Ada"), cell("Engineer"))]),
        });
        const errors = await validate(input);
        expect(errors).toHaveLength(0);
    });

    it("should accept merged cells via colspan and rowspan", async () => {
        const input = block.blockInputFactory({
            tipTapContent: table([row({ ...cell("Spans two columns"), attrs: { colspan: 2, rowspan: 1 } }), row(cell("a"), cell("b"))]),
        });
        const errors = await validate(input);
        expect(errors).toHaveLength(0);
    });

    it("should accept lists inside a cell", async () => {
        const input = block.blockInputFactory({
            tipTapContent: table([
                row({
                    type: "tableCell",
                    content: [{ type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph" }] }] }],
                }),
            ]),
        });
        const errors = await validate(input);
        expect(errors).toHaveLength(0);
    });

    it("should reject a document without a table", async () => {
        const input = block.blockInputFactory({
            tipTapContent: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "no table" }] }] },
        });
        const errors = await validate(input);
        expect(errors).toHaveLength(1);
    });

    it("should reject an empty document", async () => {
        const input = block.blockInputFactory({ tipTapContent: { type: "doc", content: [] } });
        const errors = await validate(input);
        expect(errors).toHaveLength(1);
    });

    it("should reject a table with a sibling paragraph", async () => {
        const input = block.blockInputFactory({
            tipTapContent: {
                type: "doc",
                content: [{ type: "table", content: [row(cell("a"))] }, { type: "paragraph" }],
            },
        });
        const errors = await validate(input);
        expect(errors).toHaveLength(1);
    });

    it("should reject a heading inside a cell (headings are not supported by default)", async () => {
        const input = block.blockInputFactory({
            tipTapContent: table([
                row({ type: "tableCell", content: [{ type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Nope" }] }] }),
            ]),
        });
        const errors = await validate(input);
        expect(errors).toHaveLength(1);
    });

    it("should reject a row without cells", async () => {
        const input = block.blockInputFactory({
            tipTapContent: { type: "doc", content: [{ type: "table", content: [{ type: "tableRow", content: [] }] }] },
        });
        const errors = await validate(input);
        expect(errors).toHaveLength(1);
    });

    it("should reject a table without rows", async () => {
        const input = block.blockInputFactory({ tipTapContent: { type: "doc", content: [{ type: "table", content: [] }] } });
        const errors = await validate(input);
        expect(errors).toHaveLength(1);
    });

    it("should reject a nested table", async () => {
        const input = block.blockInputFactory({
            tipTapContent: table([row({ type: "tableCell", content: [{ type: "table", content: [row(cell("nested"))] }] })]),
        });
        const errors = await validate(input);
        expect(errors).toHaveLength(1);
    });

    it("should accept a link mark inside a cell when a link block is configured", async () => {
        const LinkBlock = createLinkBlock({ supportedBlocks: { external: ExternalLinkBlock } }, "TestTableLink");
        const blockWithLink = createTipTapTableBlock({ link: LinkBlock }, "TestTableWithLink");

        const input = blockWithLink.blockInputFactory({
            tipTapContent: table([
                row({
                    type: "tableCell",
                    content: [
                        {
                            type: "paragraph",
                            content: [
                                {
                                    type: "text",
                                    marks: [
                                        {
                                            type: "link",
                                            attrs: {
                                                data: {
                                                    attachedBlocks: [
                                                        {
                                                            type: "external",
                                                            props: { targetUrl: "https://example.com", openInNewWindow: false, noFollow: false },
                                                        },
                                                    ],
                                                    activeType: "external",
                                                },
                                            },
                                        },
                                    ],
                                    text: "Example",
                                },
                            ],
                        },
                    ],
                }),
            ]),
        });
        const errors = await validate(input);
        expect(errors).toHaveLength(0);
    });
});
