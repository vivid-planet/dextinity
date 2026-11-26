import type { BlockContext, BlockInterface } from "@dextinity/cms-admin";
import { describe, expect, it } from "vitest";

import type { BlocksBlockChild } from "./blockProps";
import { planBlockEdits } from "./editBlocks";

// Converts like a block that declares the fields "text" and "alignment": fields it does not declare are dropped on the
// way in.
const textBlock = {
    defaultValues: () => ({ text: "", alignment: "left" }),
    output2State: async (output: Record<string, unknown>) => ({ text: output.text, alignment: output.alignment }),
    state2Output: (state: unknown) => state,
    isValid: async () => true,
} as unknown as BlockInterface;

const supportedBlocks = { text: textBlock };
const blockContext = {} as BlockContext;

const child = (key: string, props: unknown = { text: key, alignment: "left" }, visible = true): BlocksBlockChild => ({
    key,
    type: "text",
    visible,
    selected: false,
    slideIn: false,
    props,
});

const plan = (blocks: BlocksBlockChild[], operations: Parameters<typeof planBlockEdits>[0]["operations"]) =>
    planBlockEdits({
        blocks,
        blockListName: "content",
        operations,
        supportedBlocks,
        additionalItemFields: { userGroup: { defaultValue: "all" } },
        schemaRootBlockName: "PageContent",
        blockContext,
    });

const keysOf = (blocks: BlocksBlockChild[]) => blocks.map((block) => block.key);

describe("planBlockEdits", () => {
    it("inserts a block at the given position, with a new key and the converted props", async () => {
        const blocks = [child("a"), child("b")];

        const { apply, results } = await plan(blocks, [{ operation: "insert", type: "text", props: { text: "New" }, index: 1 }]);
        const applied = apply?.(blocks) ?? [];

        expect(results).toEqual([{ operation: "insert", key: applied[1].key, type: "text", index: 1 }]);
        expect(applied[1]).toMatchObject({ type: "text", visible: true, props: { text: "New" } });
        expect(applied[1].userGroup).toBe("all");
        expect(keysOf(applied)).toEqual(["a", applied[1].key, "b"]);
    });

    it("applies the operations in order, each one seeing what the preceding ones left", async () => {
        const blocks = [child("a"), child("b"), child("c")];

        const { apply, results } = await plan(blocks, [
            { operation: "remove", key: "a" },
            { operation: "move", key: "c", index: 0 },
        ]);

        expect(results).toEqual([
            { operation: "remove", key: "a", type: "text", index: 0 },
            { operation: "move", key: "c", type: "text", from: 1, index: 0 },
        ]);
        expect(keysOf(apply?.(blocks) ?? [])).toEqual(["c", "b"]);
    });

    it("applies none of the operations when one fails, and names the one that did", async () => {
        const blocks = [child("a")];

        await expect(
            plan(blocks, [
                { operation: "remove", key: "a" },
                { operation: "update", key: "missing", props: { text: "Changed" } },
            ]),
        ).rejects.toThrow('Operation 2 ("update") failed, so none of the 2 operations were applied and the page is unchanged.');
    });

    it("inserts only the blocks the content scope offers, but still updates a block of another type", async () => {
        const blocks = [{ ...child("a"), type: "news" }];
        const planWithNews = (operations: Parameters<typeof planBlockEdits>[0]["operations"]) =>
            planBlockEdits({
                blocks,
                blockListName: "content",
                operations,
                supportedBlocks: { text: textBlock, news: textBlock },
                insertableBlocks: { text: textBlock },
                schemaRootBlockName: "PageContent",
                blockContext,
            });

        await expect(planWithNews([{ operation: "insert", type: "news", props: {} }])).rejects.toThrow(
            'Unknown block type "news". Insertable types: text.',
        );
        await expect(planWithNews([{ operation: "update", key: "a", props: { text: "Changed" } }])).resolves.toMatchObject({
            results: [{ operation: "update", key: "a", type: "news" }],
        });
    });

    it("refuses a field the block does not have instead of dropping it silently", async () => {
        await expect(plan([child("a")], [{ operation: "update", key: "a", props: { headline: "Changed" } }])).rejects.toThrow(
            'The "text" block has no field "headline"',
        );
    });

    it("fills the fields an inserted block is given no value for with the block's default values", async () => {
        const { apply } = await plan([], [{ operation: "insert", type: "text", props: { text: "New" } }]);

        expect(apply?.([])[0].props).toEqual({ text: "New", alignment: "left" });
    });

    it("keeps the key, visibility, user group, and untouched fields of an updated block", async () => {
        const blocks = [{ ...child("a", { text: "Old", alignment: "right" }, false), userGroup: "admin" }];

        const { apply } = await plan(blocks, [{ operation: "update", key: "a", props: { text: "New" } }]);

        expect(apply?.(blocks)).toEqual([{ ...child("a", { text: "New", alignment: "right" }, false), userGroup: "admin" }]);
    });

    it("changes nothing for a move to the position the block holds, or a show of a visible block", async () => {
        const { apply, results } = await plan(
            [child("a"), child("b")],
            [
                { operation: "move", key: "a", index: 0 },
                { operation: "show", key: "b" },
            ],
        );

        expect(apply).toBeNull();
        expect(results).toContainEqual({ operation: "show", key: "b", type: "text", index: 1, wasVisible: true });
    });

    it("says that a nested block cannot be acted on, rather than that its key does not exist", async () => {
        const blocks = [child("group", { content: { blocks: [child("nested")] } })];

        await expect(plan(blocks, [{ operation: "remove", key: "nested" }])).rejects.toThrow(
            "is nested inside another block, and only the top-level blocks of the page's content can be removed.",
        );
    });

    describe("in a list that shows a single visible block, like the stage", () => {
        const planStage = (blocks: BlocksBlockChild[], operations: Parameters<typeof planBlockEdits>[0]["operations"]) =>
            planBlockEdits({
                blocks,
                blockListName: "stage",
                maxVisibleBlocks: 1,
                operations,
                supportedBlocks,
                schemaRootBlockName: "Stage",
                blockContext,
            });

        it("inserts a block hidden while another one is visible, and says so", async () => {
            const blocks = [child("a")];

            const { apply, results } = await planStage(blocks, [{ operation: "insert", type: "text", props: { text: "New" } }]);

            expect(apply?.(blocks)[1].visible).toBe(false);
            expect(results[0]).toMatchObject({ warnings: [expect.stringContaining("was inserted hidden")] });
        });

        it("refuses to show a block while another one is visible", async () => {
            await expect(planStage([child("a"), child("b", undefined, false)], [{ operation: "show", key: "b" }])).rejects.toThrow(
                'so "b" can only be shown once "a" is hidden',
            );
        });

        it("switches the visible block when the visible one is hidden first", async () => {
            const blocks = [child("a"), child("b", undefined, false)];

            const { apply } = await planStage(blocks, [
                { operation: "hide", key: "a" },
                { operation: "show", key: "b" },
            ]);

            expect(apply?.(blocks).map((block) => block.visible)).toEqual([false, true]);
        });
    });
});
