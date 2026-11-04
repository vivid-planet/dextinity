import type { JSONContent } from "@tiptap/core";
import { describe, expect, it } from "vitest";

import { createTipTapRichTextBlock, resolveTipTapOptions } from "../createTipTapRichTextBlock";
import { buildTextBlockNodeMigration } from "./buildTextBlockNodeMigration";

const resolvedOptions = resolveTipTapOptions({});

function migrate(tipTapContent: JSONContent): JSONContent {
    const Migration = buildTextBlockNodeMigration({ resolvedOptions });
    const migrated = new Migration().apply({ tipTapContent, $$vendorVersion: 1 }, "$$vendorVersion") as { tipTapContent: JSONContent };
    return migrated.tipTapContent;
}

function doc(...content: JSONContent[]): JSONContent {
    return { type: "doc", content };
}

const text = [{ type: "text", text: "Hello" }];

describe("buildTextBlockNodeMigration", () => {
    it("converts a paragraph node to the paragraph text block", () => {
        expect(migrate(doc({ type: "paragraph", content: text }))).toEqual(
            doc({ type: "textBlock", attrs: { textBlock: "paragraph" }, content: text }),
        );
    });

    it("converts a heading node to the text block carrying its level", () => {
        expect(migrate(doc({ type: "heading", attrs: { level: 3 }, content: text }))).toEqual(
            doc({ type: "textBlock", attrs: { textBlock: "heading-3" }, content: text }),
        );
    });

    it("keeps the text block a node already names", () => {
        expect(migrate(doc({ type: "heading", attrs: { level: 1, textBlock: "heading-2" }, content: text }))).toEqual(
            doc({ type: "textBlock", attrs: { textBlock: "heading-2" }, content: text }),
        );
    });

    it("keeps the textBlockStyle of a converted node", () => {
        expect(migrate(doc({ type: "paragraph", attrs: { textBlockStyle: "lead" }, content: text }))).toEqual(
            doc({ type: "textBlock", attrs: { textBlockStyle: "lead", textBlock: "paragraph" }, content: text }),
        );
    });

    it("leaves content that is already converted unchanged", () => {
        const converted = doc({ type: "textBlock", attrs: { textBlock: "heading-1" }, content: text });

        expect(migrate(converted)).toEqual(converted);
    });

    it("converts the paragraphs inside a list item", () => {
        const before = doc({
            type: "bulletList",
            content: [{ type: "listItem", content: [{ type: "paragraph", content: text }] }],
        });
        const after = doc({
            type: "bulletList",
            content: [{ type: "listItem", content: [{ type: "textBlock", attrs: { textBlock: "paragraph" }, content: text }] }],
        });

        expect(migrate(before)).toEqual(after);
    });

    it("keeps an empty document empty", () => {
        expect(migrate(doc({ type: "paragraph" }))).toEqual(doc({ type: "textBlock", attrs: { textBlock: "paragraph" } }));
    });
});

describe("createTipTapRichTextBlock converting content stored as paragraph and heading nodes", () => {
    it("counts the same vendor version whether migrateFromDraftJs is configured or not", () => {
        const withoutDraftJs = createTipTapRichTextBlock({}, "TextBlockNodeVendorVersion");
        const withDraftJs = createTipTapRichTextBlock({ migrateFromDraftJs: true }, "TextBlockNodeVendorVersionFromDraftJs");
        // Version 1 belongs to the DraftJS migration, so content that has run it still needs converting
        const stored = { tipTapContent: doc({ type: "heading", attrs: { level: 2 }, content: text }), $$vendorVersion: 1 };
        const converted = doc({ type: "textBlock", attrs: { textBlock: "heading-2" }, content: text });

        expect(withoutDraftJs.blockDataFactory(stored).tipTapContent).toEqual(converted);
        expect(withDraftJs.blockDataFactory(stored).tipTapContent).toEqual(converted);
    });

    it("converts on load and counts in the vendor chain", () => {
        const block = createTipTapRichTextBlock({}, "TextBlockNodeRichText");
        const data = block.blockDataFactory({
            tipTapContent: doc({ type: "heading", attrs: { level: 2 }, content: text }),
        });

        expect(data.tipTapContent).toEqual(doc({ type: "textBlock", attrs: { textBlock: "heading-2" }, content: text }));
    });

    it("is a no-op once the vendor chain is up to date", () => {
        const block = createTipTapRichTextBlock({}, "TextBlockNodeRichTextUpToDate");
        const tipTapContent = doc({ type: "textBlock", attrs: { textBlock: "paragraph" }, content: text });
        const data = block.blockDataFactory({ tipTapContent, $$vendorVersion: 2 });

        expect(data.tipTapContent).toEqual(tipTapContent);
    });

    it("runs after the DraftJS migration when both are configured", () => {
        const block = createTipTapRichTextBlock({ migrateFromDraftJs: true }, "TextBlockNodeRichTextFromDraftJs");
        // `$$vendorVersion: 1` is content the DraftJS migration has converted, before every
        // paragraph and heading became one node
        const data = block.blockDataFactory({
            tipTapContent: doc({ type: "heading", attrs: { level: 2 }, content: text }),
            $$vendorVersion: 1,
        });

        expect(data.tipTapContent).toEqual(doc({ type: "textBlock", attrs: { textBlock: "heading-2" }, content: text }));
    });
});
