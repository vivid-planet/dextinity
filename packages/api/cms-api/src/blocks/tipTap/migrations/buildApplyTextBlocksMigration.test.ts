import { describe, expect, it } from "vitest";

import type { TipTapTextBlock } from "../createTipTapRichTextBlock";
import { buildApplyTextBlocksMigration } from "./buildApplyTextBlocksMigration";

const textBlocks: TipTapTextBlock[] = [
    { name: "paragraph", tag: "p", styles: [{ name: "copy100" }, { name: "copy200" }], defaultStyle: "copy100" },
    { name: "heading-1", tag: "h1", styles: [{ name: "headline300" }] },
    { name: "heading-2", tag: "h2" },
];

/**
 * The same configuration after a display headline was added above the heading 1 - both are stored as
 * an `h1`, so a node without a name would now resolve to the display.
 */
const textBlocksWithDisplay: TipTapTextBlock[] = [textBlocks[0], { name: "display", tag: "h1" }, ...textBlocks.slice(1)];

const unorderedList = { styles: [{ name: "list300" }], defaultStyle: "list300" };

function migrate(tipTapContent: unknown, configuredTextBlocks = textBlocks) {
    const Migration = buildApplyTextBlocksMigration({ toVersion: 2, textBlocks: configuredTextBlocks, unorderedList });
    return new Migration().apply({ $$version: 1, tipTapContent });
}

describe("buildApplyTextBlocksMigration", () => {
    it("backfills the textBlock attribute of legacy content that predates it", () => {
        const migrated = migrate({
            type: "doc",
            content: [
                { type: "paragraph", content: [{ type: "text", text: "Text" }] },
                { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Heading" }] },
            ],
        });

        expect(migrated).toEqual({
            $$version: 2,
            tipTapContent: {
                type: "doc",
                content: [
                    {
                        type: "paragraph",
                        attrs: { textBlock: "paragraph", textBlockStyle: "copy100" },
                        content: [{ type: "text", text: "Text" }],
                    },
                    { type: "heading", attrs: { level: 2, textBlock: "heading-2" }, content: [{ type: "text", text: "Heading" }] },
                ],
            },
        });
    });

    it("gives content that predates a defaultStyle that style", () => {
        const migrated = migrate({ type: "doc", content: [{ type: "paragraph" }] });

        expect(migrated).toEqual({
            $$version: 2,
            tipTapContent: { type: "doc", content: [{ type: "paragraph", attrs: { textBlock: "paragraph", textBlockStyle: "copy100" } }] },
        });
    });

    it("keeps a style the text block still offers", () => {
        const migrated = migrate({ type: "doc", content: [{ type: "paragraph", attrs: { textBlockStyle: "copy200" } }] });

        expect(migrated).toEqual({
            $$version: 2,
            tipTapContent: { type: "doc", content: [{ type: "paragraph", attrs: { textBlock: "paragraph", textBlockStyle: "copy200" } }] },
        });
    });

    it("replaces a style the text block no longer offers with its defaultStyle", () => {
        const migrated = migrate({ type: "doc", content: [{ type: "paragraph", attrs: { textBlockStyle: "removed" } }] });

        expect(migrated).toEqual({
            $$version: 2,
            tipTapContent: { type: "doc", content: [{ type: "paragraph", attrs: { textBlock: "paragraph", textBlockStyle: "copy100" } }] },
        });
    });

    it("drops a style from a text block that offers none, rather than storing an explicit null", () => {
        const migrated = migrate(
            { type: "doc", content: [{ type: "heading", attrs: { level: 1, textBlock: "display", textBlockStyle: "removed" } }] },
            textBlocksWithDisplay,
        );

        expect(migrated).toEqual({
            $$version: 2,
            tipTapContent: { type: "doc", content: [{ type: "heading", attrs: { level: 1, textBlock: "display" } }] },
        });
    });

    it("styles a list item's paragraph from the list, not from its own text block", () => {
        const migrated = migrate({
            type: "doc",
            content: [{ type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph" }] }] }],
        });

        expect(migrated).toEqual({
            $$version: 2,
            tipTapContent: {
                type: "doc",
                content: [
                    {
                        type: "bulletList",
                        content: [
                            {
                                type: "listItem",
                                content: [{ type: "paragraph", attrs: { textBlock: "paragraph", textBlockStyle: "list300" } }],
                            },
                        ],
                    },
                ],
            },
        });
    });

    it("pins existing content to its text block before another one starts sharing the tag", () => {
        const legacyContent = { type: "doc", content: [{ type: "heading", attrs: { level: 1 } }] };

        // Unmigrated, the heading falls back to the first text block with its tag - the display.
        expect(migrate(legacyContent, textBlocksWithDisplay)).toEqual({
            $$version: 2,
            tipTapContent: { type: "doc", content: [{ type: "heading", attrs: { level: 1, textBlock: "display" } }] },
        });

        const { tipTapContent } = migrate(legacyContent);

        expect(migrate(tipTapContent, textBlocksWithDisplay)).toEqual({
            $$version: 2,
            tipTapContent: { type: "doc", content: [{ type: "heading", attrs: { level: 1, textBlock: "heading-1" } }] },
        });
    });

    it("keeps a textBlock that still matches the node's tag", () => {
        const migrated = migrate({
            type: "doc",
            content: [{ type: "heading", attrs: { level: 1, textBlock: "heading-1", textBlockStyle: "headline300" } }],
        });

        expect(migrated).toEqual({
            $$version: 2,
            tipTapContent: {
                type: "doc",
                content: [{ type: "heading", attrs: { level: 1, textBlock: "heading-1", textBlockStyle: "headline300" } }],
            },
        });
    });

    it("repairs a textBlock left stale by an earlier migration that changed the node's level", () => {
        const migrated = migrate({ type: "doc", content: [{ type: "heading", attrs: { level: 2, textBlock: "heading-1" } }] });

        expect(migrated).toEqual({
            $$version: 2,
            tipTapContent: { type: "doc", content: [{ type: "heading", attrs: { level: 2, textBlock: "heading-2" } }] },
        });
    });

    it("leaves a node whose tag no text block is configured for untouched", () => {
        const migrated = migrate({ type: "doc", content: [{ type: "heading", attrs: { level: 4 } }] });

        expect(migrated).toEqual({
            $$version: 2,
            tipTapContent: { type: "doc", content: [{ type: "heading", attrs: { level: 4 } }] },
        });
    });
});
