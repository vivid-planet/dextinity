import type { RichTextBlockData } from "../common.js";

export const exampleBlockData: RichTextBlockData = {
    draftContent: {
        blocks: [
            {
                key: "dkq9u",
                text: "Heading One",
                type: "header-one",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
            {
                key: "ajl7h",
                text: "Default paragraph: Inventore eum velit fuga qui quae voluptatibus similique odio. Libero molestias non et dignissimos numquam est. Sint amet voluptate non.",
                type: "paragraph-standard",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
            {
                key: "4hl5r",
                text: "Default paragraph with an external link and an internal link within it.",
                type: "paragraph-standard",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [
                    { offset: 26, length: 13, key: 0 },
                    { offset: 47, length: 13, key: 1 },
                ],
                data: {},
            },
            {
                key: "a968k",
                text: "This paragraph has bold text, italic text and both at once. \nAnd this has strike through, after a line break.",
                type: "paragraph-standard",
                depth: 0,
                inlineStyleRanges: [
                    { offset: 19, length: 9, style: "BOLD" },
                    { offset: 46, length: 12, style: "BOLD" },
                    { offset: 30, length: 11, style: "ITALIC" },
                    { offset: 46, length: 12, style: "ITALIC" },
                    { offset: 75, length: 14, style: "STRIKETHROUGH" },
                ],
                entityRanges: [],
                data: {},
            },
            {
                key: "h2lst",
                text: "Heading Two above a list",
                type: "header-two",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
            {
                key: "ul1",
                text: "Unordered list item one",
                type: "unordered-list-item",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
            {
                key: "ul2",
                text: "Unordered list item two",
                type: "unordered-list-item",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
            {
                key: "ol1",
                text: "Ordered list item one",
                type: "ordered-list-item",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
            {
                key: "ol2",
                text: "Ordered list item two",
                type: "ordered-list-item",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
            {
                key: "fu9f1",
                text: "",
                type: "paragraph-standard",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
        ],
        entityMap: {
            "0": {
                type: "LINK",
                mutability: "MUTABLE",
                data: {
                    attachedBlocks: [],
                    block: {
                        type: "external",
                        props: {
                            targetUrl: "https://example.com",
                            openInNewWindow: false,
                        },
                    },
                    activeType: "external",
                },
            },
            "1": {
                type: "LINK",
                mutability: "MUTABLE",
                data: {
                    attachedBlocks: [],
                    block: {
                        type: "internal",
                        props: {
                            targetPage: {
                                id: "home",
                                name: "Home",
                                path: "/",
                                documentType: "Page",
                            },
                        },
                    },
                    activeType: "internal",
                },
            },
        },
    },
};

export const highlightBlockData: RichTextBlockData = {
    draftContent: {
        blocks: [
            {
                key: "hlt1",
                text: "This paragraph contains highlighted text a reader should not miss.",
                type: "paragraph-standard",
                depth: 0,
                inlineStyleRanges: [{ offset: 24, length: 16, style: "HIGHLIGHT" }],
                entityRanges: [],
                data: {},
            },
        ],
        entityMap: {},
    },
};

function createListItems(type: string, texts: string[]) {
    return texts.map((text, index) => ({
        key: `${type}-${String(index)}`,
        text,
        type,
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
    }));
}

const orderedItemsPastTen = createListItems("ordered-list-item", [
    "Ordered item one",
    "Ordered item two",
    "Ordered item three",
    "Ordered item four",
    "Ordered item five",
    "Ordered item six",
    "Ordered item seven",
    "Ordered item eight",
    "Ordered item nine",
    "Ordered item ten — the marker column widens here, and every item's text keeps the same left edge",
    "Ordered item eleven",
]);

export const listVarietyBlockData: RichTextBlockData = {
    draftContent: {
        blocks: [
            {
                key: "lv1",
                text: "A paragraph above the first list, so the list has a block before it.",
                type: "paragraph-standard",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
            {
                key: "lv2",
                text: "Short item",
                type: "unordered-list-item",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
            {
                key: "lv3",
                text: "A long item that keeps going for long enough to wrap onto a second line, which is the only way to see whether the marker stays level with the item's first line.",
                type: "unordered-list-item",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
            {
                key: "lv4",
                text: "This item is long enough to wrap onto a second line in the email body, then it breaks the line here\nand ends with a link that follows the break.",
                type: "unordered-list-item",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [{ offset: 114, length: 6, key: 0 }],
                data: {},
            },
            ...orderedItemsPastTen,
            {
                key: "lv8",
                text: "A paragraph between the lists, so the lists above sit in the middle of the document.",
                type: "paragraph-standard",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
            {
                key: "lv9",
                text: "A final list, first item",
                type: "unordered-list-item",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
            {
                key: "lv10",
                text: "A final list, last item — the document ends here",
                type: "unordered-list-item",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
        ],
        entityMap: {
            "0": {
                type: "LINK",
                mutability: "MUTABLE",
                data: {
                    attachedBlocks: [],
                    block: {
                        type: "external",
                        props: {
                            targetUrl: "https://example.com",
                            openInNewWindow: false,
                        },
                    },
                    activeType: "external",
                },
            },
        },
    },
};

export const listSpacingBlockData: RichTextBlockData = {
    draftContent: {
        blocks: [
            ...createListItems("unordered-list-item", ["Bulleted item one", "Bulleted item two", "Bulleted item three"]),
            ...createListItems("ordered-list-item", ["Numbered item one", "Numbered item two", "Numbered item three"]),
        ],
        entityMap: {},
    },
};

export const listSizesBlockData: RichTextBlockData = {
    draftContent: {
        blocks: [
            ...createListItems("unordered-list-item", ["A bulleted item at the standard size", "And a second one"]),
            ...createListItems("unordered-list-item-large", ["A bulleted item at the large size", "And a second one"]),
            ...createListItems("ordered-list-item", ["A numbered item at the standard size", "And a second one"]),
            ...createListItems("ordered-list-item-large", ["A numbered item at the large size, counted on its own", "And a second one"]),
        ],
        entityMap: {},
    },
};

function createNestedListItem(type: "unordered-list-item" | "ordered-list-item", key: string, text: string, depth: number) {
    return { key, text, type, depth, inlineStyleRanges: [], entityRanges: [], data: {} };
}

export const nestedListBlockData: RichTextBlockData = {
    draftContent: {
        blocks: [
            createNestedListItem("unordered-list-item", "nl1", "A bulleted item at the top level", 0),
            createNestedListItem("unordered-list-item", "nl2", "One level in", 1),
            createNestedListItem("unordered-list-item", "nl3", "Still one level in", 1),
            createNestedListItem("unordered-list-item", "nl4", "Two levels in", 2),
            createNestedListItem("unordered-list-item", "nl5", "Back at the top level", 0),
            createNestedListItem("ordered-list-item", "nl6", "A numbered item at the top level", 0),
            createNestedListItem("ordered-list-item", "nl7", "One level in, counted on its own", 1),
            createNestedListItem("ordered-list-item", "nl8", "Still one level in", 1),
            createNestedListItem("ordered-list-item", "nl9", "Back at the top level", 0),
        ],
        entityMap: {},
    },
};

export const bulletedListBlockData: RichTextBlockData = {
    draftContent: {
        blocks: createListItems("unordered-list-item", ["Bulleted item one", "Bulleted item two", "Bulleted item three"]),
        entityMap: {},
    },
};

export const headlinesOnlyBlockData: RichTextBlockData = {
    draftContent: {
        blocks: [
            {
                key: "hl1",
                text: "Main headline",
                type: "header-one",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
            {
                key: "hl2",
                text: "Secondary headline",
                type: "header-two",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
        ],
        entityMap: {},
    },
};
