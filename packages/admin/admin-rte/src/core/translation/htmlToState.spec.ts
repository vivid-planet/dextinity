import { convertFromRaw, EditorState, type RawDraftContentState } from "draft-js";
import { describe, expect, it } from "vitest";

import type { IRteOptions } from "../Rte";
import { htmlToState } from "./htmlToState";
import { stateToHtml } from "./stateToHtml";

describe("htmlToState", () => {
    const options = { customInlineStyles: { HIGHLIGHT: { label: "Highlight!", style: { backgroundColor: "yellow" } } } } as unknown as IRteOptions;

    it("should convert html to state to html with the html staying the same", () => {
        const blocks = [
            // Basic stylings
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
            // Unordered List
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
            // Ordered List
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
            // Custom Style
            {
                key: "7l333",
                text: "A rte text with custom styling",
                type: "unstyled",
                depth: 0,
                inlineStyleRanges: [{ offset: 0, length: 30, style: "HIGHLIGHT" }],
                entityRanges: [],
                data: {},
            },
            // Custom Block Style
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

        const { html, entities } = stateToHtml({
            editorState,
            options,
        });

        const state = htmlToState({
            html: html,
            entities,
        });

        const { html: html2, entities: linkDataList2 } = stateToHtml({
            editorState: state,
            options,
        });

        expect(html).toEqual(html2);
        expect(entities).toEqual(linkDataList2);
    });
});
