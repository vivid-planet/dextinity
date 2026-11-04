import { convertFromRaw, EditorState, type RawDraftContentState } from "draft-js";
import { describe, expect, it } from "vitest";

import type { IRteOptions } from "../Rte";
import { stateToHtml } from "./stateToHtml";

// Remove all newlines and spaces to compare the html strings
function trimHtml(html: string) {
    return html.replace(/\s|\n/g, "");
}

describe("stateToHtml", () => {
    const options = {
        customInlineStyles: { HIGHLIGHT: { label: "Highlight!", style: { backgroundColor: "yellow" } } },
        blocktypeMap: { "header-custom-green": { label: "Header Custom Green", renderConfig: { element: "p" } } },
    } as unknown as IRteOptions;

    it("should convert the rte editor state with styling into html while keeping the format via tags - formats part 1", () => {
        const blocks = [
            { key: "52cmg", text: "Normal Text", type: "unstyled", depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} },
            {
                key: "8psic",
                text: "Bold Text",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [{ offset: 0, length: 9, style: "BOLD" }],
                entityRanges: [],
                data: {},
            },
            {
                key: "4m6ou",
                text: "Italic Text",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [{ offset: 0, length: 11, style: "ITALIC" }],
                entityRanges: [],
                data: {},
            },
            {
                key: "fask6",
                text: "Bold Italic Text",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [
                    { offset: 0, length: 16, style: "ITALIC" },
                    { offset: 0, length: 16, style: "BOLD" },
                ],
                entityRanges: [],
                data: {},
            },
            {
                key: "fm23u",
                text: "Strikethrough Text",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [{ offset: 0, length: 18, style: "STRIKETHROUGH" }],
                entityRanges: [],
                data: {},
            },
            {
                key: "9q8m5",
                text: "A Subscript Text",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [{ offset: 2, length: 14, style: "SUB" }],
                entityRanges: [],
                data: {},
            },
            {
                key: "t3nk",
                text: "B Superscript Text",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [{ offset: 2, length: 16, style: "SUP" }],
                entityRanges: [],
                data: {},
            },
            { key: "e6k04", text: "Headline 1", type: "header-one", depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} },
            { key: "ect4f", text: "Headline 2", type: "header-two", depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} },
            { key: "e038j", text: "Headline 3", type: "header-three", depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} },
            { key: "4bha8", text: "Headline 4", type: "header-four", depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} },
            { key: "aje6k", text: "Headline 5", type: "header-five", depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} },
            { key: "7u6on", text: "Headline 6", type: "header-six", depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} },
        ];

        const rawContent = {
            entityMap: {},
            blocks,
        } as RawDraftContentState;

        const content = convertFromRaw(rawContent);
        const editorState = EditorState.createWithContent(content);

        const { html } = stateToHtml({
            editorState,
            options,
        });

        const expectedHtml = `<p>Normal Text</p><p><strong>Bold Text</strong></p><p><em>Italic Text</em></p><p><em><strong>Bold Italic Text</strong></em></p><p><del>Strikethrough Text</del></p><p>A <sub>Subscript Text</sub></p><p>B <sup>Superscript Text</sup></p><h1>Headline 1</h1><h2>Headline 2</h2><h3>Headline 3</h3><h4>Headline 4</h4><h5>Headline 5</h5><h6>Headline 6</h6>`;

        expect(trimHtml(html)).toEqual(trimHtml(expectedHtml));
    });

    it("should convert the rte editor state with formating into html while keeping the format via tags - formats part 2 (unordered list)", () => {
        const blocks = [
            { key: "a9t3", text: "Unordered List", type: "unordered-list-item", depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} },
            {
                key: "f4o2c",
                text: "123456",
                type: "unordered-list-item",
                depth: 1,
                inlineStyleRanges: [{ offset: 3, length: 3, style: "SUB" }],
                entityRanges: [],
                data: {},
            },
            {
                key: "7v61p",
                text: "234",
                type: "unordered-list-item",
                depth: 2,
                inlineStyleRanges: [{ offset: 0, length: 3, style: "ITALIC" }],
                entityRanges: [],
                data: {},
            },
            {
                key: "1duir",
                text: "345",
                type: "unordered-list-item",
                depth: 2,
                inlineStyleRanges: [{ offset: 0, length: 3, style: "BOLD" }],
                entityRanges: [],
                data: {},
            },
        ];

        const rawContent = {
            entityMap: {},
            blocks,
        } as RawDraftContentState;

        const content = convertFromRaw(rawContent);
        const editorState = EditorState.createWithContent(content);

        const { html } = stateToHtml({
            editorState,
            options,
        });

        const expectedHtml = `<ul><li>Unordered List<ul><li>123<sub>456</sub><ul><li><em>234</em></li><li><strong>345</strong></li></ul></li></ul></li></ul>`;

        expect(trimHtml(html)).toEqual(trimHtml(expectedHtml));
    });

    it("should convert the rte editor state with formating into html while keeping the format via tags - formats part 3 (ordered list)", () => {
        const blocks = [
            { key: "1iahs", text: "List", type: "ordered-list-item", depth: 0, inlineStyleRanges: [], entityRanges: [], data: {} },
            {
                key: "aqjhb",
                text: "123456",
                type: "ordered-list-item",
                depth: 1,
                inlineStyleRanges: [{ offset: 3, length: 3, style: "SUP" }],
                entityRanges: [],
                data: {},
            },
            {
                key: "c4js6",
                text: "234",
                type: "ordered-list-item",
                depth: 2,
                inlineStyleRanges: [{ offset: 0, length: 3, style: "ITALIC" }],
                entityRanges: [],
                data: {},
            },
            {
                key: "3qjfc",
                text: "345",
                type: "ordered-list-item",
                depth: 2,
                inlineStyleRanges: [{ offset: 0, length: 3, style: "BOLD" }],
                entityRanges: [],
                data: {},
            },
        ];

        const rawContent = {
            entityMap: {},
            blocks,
        } as RawDraftContentState;

        const content = convertFromRaw(rawContent);
        const editorState = EditorState.createWithContent(content);

        const { html } = stateToHtml({
            editorState,
            options,
        });

        const expectedHtml = `<ol><li>List<ol><li>123<sup>456</sup><ol><li><em>234</em></li><li><strong>345</strong></li></ol></li></ol></li></ol>`;

        expect(trimHtml(html)).toEqual(trimHtml(expectedHtml));
    });

    it("should convert the rte editor state with formating into html while keeping the format via tags - formats part 4 (links)", () => {
        const entityMap = {
            "0": {
                type: "LINK",
                mutability: "MUTABLE",
                data: {
                    activeType: "external",
                    attachedBlocks: [{ type: "external", props: { targetUrl: "https://www.vivid-planet.com/", openInNewWindow: false } }],
                },
            },
            "1": {
                type: "LINK",
                mutability: "MUTABLE",
                data: {
                    activeType: "internal",
                    attachedBlocks: [
                        {
                            type: "internal",
                            props: {
                                targetPage: {
                                    id: "5aab378c-7a8f-4442-aa33-4aff950d0233",
                                    name: "RTE Save",
                                    path: "/rte-save",
                                    documentType: "Page",
                                },
                            },
                        },
                    ],
                },
            },
            "2": {
                type: "LINK",
                mutability: "MUTABLE",
                data: { activeType: "news", attachedBlocks: [{ type: "news", props: { id: "3d90dd58-f880-4fd8-a4b8-9ff690655a5b" } }] },
            },
        };

        const blocks = [
            {
                key: "b40ve",
                text: "External Link",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [{ offset: 0, length: 13, key: 0 }],
                data: {},
            },
            {
                key: "67hve",
                text: "Internal Link",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [{ offset: 0, length: 13, key: 1 }],
                data: {},
            },
            {
                key: "8mn26",
                text: "Internal News Link",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [{ offset: 0, length: 18, key: 2 }],
                data: {},
            },
        ];
        const rawContent = {
            entityMap,
            blocks,
        } as RawDraftContentState;

        const content = convertFromRaw(rawContent);
        const editorState = EditorState.createWithContent(content);

        const { html, entities } = stateToHtml({
            editorState,
            options,
        });

        const expectedHtml = `<p><a id="0">External Link</a></p><p><a id="1">Internal Link</a></p><p><a id="2">Internal News Link</a></p>`;

        expect(trimHtml(html)).toEqual(trimHtml(expectedHtml));

        const expectedLinkDataList = [
            {
                id: "0",
                data: {
                    activeType: "external",
                    attachedBlocks: [{ type: "external", props: { targetUrl: "https://www.vivid-planet.com/", openInNewWindow: false } }],
                },
            },
            {
                id: "1",
                data: {
                    activeType: "internal",
                    attachedBlocks: [
                        {
                            type: "internal",
                            props: {
                                targetPage: { id: "5aab378c-7a8f-4442-aa33-4aff950d0233", name: "RTE Save", path: "/rte-save", documentType: "Page" },
                            },
                        },
                    ],
                },
            },
            { id: "2", data: { activeType: "news", attachedBlocks: [{ type: "news", props: { id: "3d90dd58-f880-4fd8-a4b8-9ff690655a5b" } }] } },
        ];

        expect(entities).toEqual(expectedLinkDataList);
    });

    it("should convert the rte editor state with formating into html while keeping the format via tags - formats part 5 (custom styles)", () => {
        const blocks = [
            {
                key: "7l333",
                text: "A rte text with custom styling",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [{ offset: 0, length: 30, style: "HIGHLIGHT" }],
                entityRanges: [],
                data: {},
            },
        ];

        const rawContent = {
            entityMap: {},
            blocks,
        } as RawDraftContentState;

        const content = convertFromRaw(rawContent);
        const editorState = EditorState.createWithContent(content);

        const { html } = stateToHtml({
            editorState,
            options,
        });

        const expectedHtml = `<p><span class="HIGHLIGHT">A rte text with custom styling</span></p>`;

        expect(trimHtml(html)).toEqual(trimHtml(expectedHtml));
    });

    it("should convert the rte editor state with formating into html while keeping the format via tags - formats part 6 (custom block styles)", () => {
        const blocks = [
            {
                key: "7l334",
                text: "A rte text with custom block styling",
                type: "header-custom-green",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
        ];

        const rawContent = {
            entityMap: {},
            blocks,
        } as RawDraftContentState;

        const content = convertFromRaw(rawContent);
        const editorState = EditorState.createWithContent(content);

        const { html } = stateToHtml({
            editorState,
            options,
        });

        const expectedHtml = `<p class="header-custom-green">A rte text with custom block styling</p>`;

        expect(trimHtml(html)).toEqual(trimHtml(expectedHtml));
    });
});
