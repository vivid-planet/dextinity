import { describe, expect, it } from "vitest";

import { BlockMigration } from "../../migrations/BlockMigration";
import type { BlockMigrationInterface } from "../../migrations/types";
import { typeSafeBlockMigrationPipe } from "../../migrations/typeSafeBlockMigrationPipe";
import { createTipTapRichTextBlock, type TipTapRichTextBlockContent } from "../createTipTapRichTextBlock";
import type { DraftJsContent } from "./convertDraftJsToTipTap";

type DraftBlock = DraftJsContent["blocks"][number];

function draftBlock(overrides: Partial<DraftBlock> = {}): DraftBlock {
    return { key: "k", type: "unstyled", text: "", depth: 0, inlineStyleRanges: [], entityRanges: [], ...overrides };
}

interface HeadingMigrationShape {
    tipTapContent: TipTapRichTextBlockContent;
}

// Mirrors demo/api's Heading1ToHeading2Migration: bumps every level-1 heading to level 2, unaware of
// defaultTextBlockStyles, to reproduce the interaction the safety-net migration guards against.
function bumpHeading1ToHeading2(node: TipTapRichTextBlockContent): TipTapRichTextBlockContent {
    let result = node;
    if (node.type === "heading" && node.attrs?.level === 1) {
        result = { ...node, attrs: { ...node.attrs, level: 2 } };
    }
    if (Array.isArray(result.content)) {
        result = { ...result, content: result.content.map(bumpHeading1ToHeading2) };
    }
    return result;
}

class Heading1ToHeading2Migration extends BlockMigration<(from: HeadingMigrationShape) => HeadingMigrationShape> implements BlockMigrationInterface {
    public readonly toVersion = 2;

    protected migrate(from: HeadingMigrationShape): HeadingMigrationShape {
        return { tipTapContent: bumpHeading1ToHeading2(from.tipTapContent) };
    }
}

describe("buildApplyDefaultTextBlockStylesMigration", () => {
    it("fills in the default style a later migration's tag/level change made unreachable for migrateFromDraftJs", () => {
        const block = createTipTapRichTextBlock(
            {
                migrateFromDraftJs: true,
                textBlockStyles: [{ name: "headline300", appliesTo: ["heading-2"] }],
                defaultTextBlockStyles: { "heading-2": "headline300" },
            },
            {
                name: "HeadingBumpRichText",
                migrate: { migrations: typeSafeBlockMigrationPipe([Heading1ToHeading2Migration]), version: 2 },
            },
        );

        const data = block.blockDataFactory({
            draftContent: { blocks: [draftBlock({ type: "header-one", text: "Title" })], entityMap: {} },
        });

        expect(data.tipTapContent).toEqual({
            type: "doc",
            content: [{ type: "heading", attrs: { level: 2, textBlockStyle: "headline300" }, content: [{ type: "text", text: "Title" }] }],
        });
    });

    it("does not override a style a migration already set", () => {
        const block = createTipTapRichTextBlock(
            {
                textBlockStyles: [{ name: "paragraph200", appliesTo: ["paragraph"] }],
                defaultTextBlockStyles: { paragraph: "paragraph200" },
            },
            "PreStyledRichText",
        );

        const data = block.blockDataFactory({
            tipTapContent: {
                type: "doc",
                content: [{ type: "paragraph", attrs: { textBlockStyle: "paragraph200" }, content: [{ type: "text", text: "already styled" }] }],
            },
        });

        expect(data.tipTapContent).toEqual({
            type: "doc",
            content: [{ type: "paragraph", attrs: { textBlockStyle: "paragraph200" }, content: [{ type: "text", text: "already styled" }] }],
        });
    });

    it("is a no-op when defaultTextBlockStyles is not configured", () => {
        const block = createTipTapRichTextBlock({ migrateFromDraftJs: true }, "NoDefaultStylesRichText");

        const data = block.blockDataFactory({
            draftContent: { blocks: [draftBlock({ type: "unstyled", text: "Hello" })], entityMap: {} },
        });

        expect(data.tipTapContent).toEqual({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Hello" }] }] });
    });
});
