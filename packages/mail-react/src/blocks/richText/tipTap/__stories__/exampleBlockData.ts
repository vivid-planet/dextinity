import type { TipTapRichTextBlockData } from "../common.js";

const externalLink = {
    type: "link",
    attrs: {
        data: {
            attachedBlocks: [],
            block: { type: "external", props: { targetUrl: "https://example.com", openInNewWindow: false } },
            activeType: "external",
        },
    },
};

const internalLink = {
    type: "link",
    attrs: {
        data: {
            attachedBlocks: [],
            block: { type: "internal", props: { targetPage: { id: "home", name: "Home", path: "/", documentType: "Page" } } },
            activeType: "internal",
        },
    },
};

export const exampleBlockData: TipTapRichTextBlockData = {
    tipTapContent: {
        type: "doc",
        content: [
            {
                type: "textBlock",
                attrs: { textBlock: "paragraph", textBlockStyle: "title" },
                content: [{ type: "text", text: "Everything a newsletter needs" }],
            },
            {
                type: "textBlock",
                attrs: { textBlock: "paragraph" },
                content: [
                    { type: "text", text: "A paragraph carries " },
                    { type: "text", marks: [{ type: "bold" }], text: "bold" },
                    { type: "text", text: ", " },
                    { type: "text", marks: [{ type: "italic" }], text: "italic" },
                    { type: "text", text: " and " },
                    { type: "text", marks: [{ type: "strike" }], text: "struck" },
                    { type: "text", text: " text, an " },
                    { type: "text", marks: [externalLink], text: "external link" },
                    { type: "text", text: " and an " },
                    { type: "text", marks: [internalLink], text: "internal one" },
                    { type: "text", text: "." },
                ],
            },
            {
                type: "textBlock",
                attrs: { textBlock: "paragraph", textBlockStyle: "header" },
                content: [{ type: "text", text: "A header" }],
            },
            {
                type: "textBlock",
                attrs: { textBlock: "paragraph" },
                content: [
                    { type: "text", text: "A hard break ends this line," },
                    { type: "hardBreak" },
                    { type: "text", text: "and the next one starts here." },
                ],
            },
        ],
    },
};

export const textBlockStylesBlockData: TipTapRichTextBlockData = {
    tipTapContent: {
        type: "doc",
        content: [
            {
                type: "textBlock",
                attrs: { textBlock: "paragraph", textBlockStyle: "title" },
                content: [{ type: "text", text: "A paragraph styled as a title" }],
            },
            {
                type: "textBlock",
                attrs: { textBlock: "paragraph", textBlockStyle: "intro" },
                content: [{ type: "text", text: "An intro paragraph, larger than the copy." }],
            },
            {
                type: "textBlock",
                attrs: { textBlock: "paragraph" },
                content: [{ type: "text", text: "A paragraph with no style, which renders with the default variant." }],
            },
        ],
    },
};

function createListItem(text: string, textBlockStyle?: string) {
    return {
        type: "listItem",
        content: [{ type: "textBlock", attrs: { textBlock: "paragraph", textBlockStyle }, content: [{ type: "text", text }] }],
    };
}

export const listVariantsBlockData: TipTapRichTextBlockData = {
    tipTapContent: {
        type: "doc",
        content: [
            {
                type: "bulletList",
                content: [
                    createListItem("An item with no style"),
                    createListItem("A second item with no style"),
                    createListItem("An item with the listLarge style", "listLarge"),
                    createListItem("A second item with the listLarge style", "listLarge"),
                ],
            },
            { type: "textBlock", attrs: { textBlock: "paragraph" }, content: [{ type: "text", text: "A paragraph with no style." }] },
        ],
    },
};

export const listBlockData: TipTapRichTextBlockData = {
    tipTapContent: {
        type: "doc",
        content: [
            {
                type: "textBlock",
                attrs: { textBlock: "paragraph" },
                content: [{ type: "text", text: "A paragraph above the list, so the list has a text block before it." }],
            },
            {
                type: "bulletList",
                content: [
                    createListItem("A bulleted item"),
                    {
                        type: "listItem",
                        content: [
                            {
                                type: "textBlock",
                                attrs: { textBlock: "paragraph" },
                                content: [{ type: "text", text: "An item holding a list of its own" }],
                            },
                            {
                                type: "orderedList",
                                content: [
                                    createListItem("A numbered item one level in"),
                                    {
                                        type: "listItem",
                                        content: [
                                            {
                                                type: "textBlock",
                                                attrs: { textBlock: "paragraph" },
                                                content: [{ type: "text", text: "And one more level" }],
                                            },
                                            { type: "bulletList", content: [createListItem("The deepest item")] },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                    createListItem("A bulleted item after the nested levels"),
                ],
            },
            { type: "textBlock", attrs: { textBlock: "paragraph" }, content: [{ type: "text", text: "A paragraph below the list." }] },
        ],
    },
};

export const inlineStyleBlockData: TipTapRichTextBlockData = {
    tipTapContent: {
        type: "doc",
        content: [
            {
                type: "textBlock",
                attrs: { textBlock: "paragraph" },
                content: [
                    { type: "text", text: "This paragraph contains " },
                    { type: "text", marks: [{ type: "inlineStyle", attrs: { type: "highlight" } }], text: "highlighted text" },
                    { type: "text", text: " a reader should not miss, plus " },
                    { type: "text", marks: [{ type: "underline" }], text: "underlined" },
                    { type: "text", text: ", " },
                    { type: "text", marks: [{ type: "superscript" }], text: "superscript" },
                    { type: "text", text: " and " },
                    { type: "text", marks: [{ type: "subscript" }], text: "subscript" },
                    { type: "text", text: " text." },
                ],
            },
        ],
    },
};
