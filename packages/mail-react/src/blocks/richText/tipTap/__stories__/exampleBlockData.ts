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
            { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Everything a newsletter needs" }] },
            {
                type: "paragraph",
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
            { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "A second level heading" }] },
            {
                type: "paragraph",
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
            { type: "paragraph", attrs: { textBlockStyle: "title" }, content: [{ type: "text", text: "A paragraph styled as a title" }] },
            { type: "paragraph", attrs: { textBlockStyle: "intro" }, content: [{ type: "text", text: "An intro paragraph, larger than the copy." }] },
            { type: "paragraph", content: [{ type: "text", text: "A paragraph with no style, which renders with the base theme text styles." }] },
            {
                type: "bulletList",
                content: [
                    {
                        type: "listItem",
                        content: [
                            { type: "paragraph", attrs: { textBlockStyle: "listSmall" }, content: [{ type: "text", text: "A small list item" }] },
                        ],
                    },
                    {
                        type: "listItem",
                        content: [
                            { type: "paragraph", attrs: { textBlockStyle: "listSmall" }, content: [{ type: "text", text: "A second small item" }] },
                        ],
                    },
                ],
            },
        ],
    },
};

function createListItem(text: string) {
    return { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text }] }] };
}

export const listBlockData: TipTapRichTextBlockData = {
    tipTapContent: {
        type: "doc",
        content: [
            { type: "paragraph", content: [{ type: "text", text: "A paragraph above the list, so the list has a text block before it." }] },
            {
                type: "bulletList",
                content: [
                    createListItem("A bulleted item"),
                    {
                        type: "listItem",
                        content: [
                            { type: "paragraph", content: [{ type: "text", text: "An item holding a list of its own" }] },
                            {
                                type: "orderedList",
                                content: [
                                    createListItem("A numbered item one level in"),
                                    {
                                        type: "listItem",
                                        content: [
                                            { type: "paragraph", content: [{ type: "text", text: "And one more level" }] },
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
            { type: "paragraph", content: [{ type: "text", text: "A paragraph below the list." }] },
        ],
    },
};

export const inlineStyleBlockData: TipTapRichTextBlockData = {
    tipTapContent: {
        type: "doc",
        content: [
            {
                type: "paragraph",
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

export const placeholderBlockData: TipTapRichTextBlockData = {
    tipTapContent: {
        type: "doc",
        content: [
            {
                type: "paragraph",
                content: [
                    { type: "placeholder", attrs: { name: "SALUTATION" } },
                    { type: "text", text: "," },
                ],
            },
            { type: "paragraph", content: [{ type: "text", text: "The mail server replaces the placeholder above when it sends the mail." }] },
        ],
    },
};
