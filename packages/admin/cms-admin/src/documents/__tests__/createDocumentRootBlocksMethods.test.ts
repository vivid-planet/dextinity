import { describe, expect, it } from "vitest";

import type { BlockInterface, ReplaceDependencyObject } from "../../blocks/types";
import { createDocumentRootBlocksMethods } from "../createDocumentRootBlocksMethods";

function createMockBlock(
    overrides: {
        input2State?: (v: unknown) => unknown;
        state2Output?: (v: unknown) => unknown;
        anchors?: (state: unknown) => string[];
        dependencies?: (state: unknown) => Array<{ targetGraphqlObjectType: string; id: string }>;
        replaceDependenciesInOutput?: (output: unknown, replacements: ReplaceDependencyObject[]) => unknown;
    } = {},
): BlockInterface {
    return {
        name: "mock",
        displayName: "Mock",
        category: "other" as BlockInterface["category"],
        AdminComponent: (() => null) as BlockInterface["AdminComponent"],
        defaultValues: () => ({}),
        input2State: overrides.input2State ?? ((v) => v),
        state2Output: overrides.state2Output ?? ((v) => v),
        output2State: async (v: unknown) => v,
        createPreviewState: (v: unknown) => v,
        isValid: () => true,
        previewContent: () => [],
        replaceDependenciesInOutput: overrides.replaceDependenciesInOutput ?? ((output) => output),
        resolveDependencyPath: () => "",
        anchors: overrides.anchors,
        dependencies: overrides.dependencies,
    } as unknown as BlockInterface;
}

describe("createDocumentRootBlocksMethods", () => {
    describe("inputToOutput", () => {
        it("converts input to output by applying each block's input2State then state2Output", () => {
            const block = createMockBlock({
                input2State: (v) => ({ state: v }),
                state2Output: (state) => ({ out: (state as { state: unknown }).state }),
            });

            const methods = createDocumentRootBlocksMethods({ content: block });

            expect(methods.inputToOutput?.({ content: "hello" })).toEqual({ content: { out: "hello" } });
        });

        it("handles multiple root blocks independently", () => {
            const blockA = createMockBlock({
                input2State: (v) => `stateA:${v}`,
                state2Output: (v) => `outA:${v}`,
            });
            const blockB = createMockBlock({
                input2State: (v) => `stateB:${v}`,
                state2Output: (v) => `outB:${v}`,
            });

            const methods = createDocumentRootBlocksMethods({ a: blockA, b: blockB });

            expect(methods.inputToOutput?.({ a: "foo", b: "bar" })).toEqual({
                a: "outA:stateA:foo",
                b: "outB:stateB:bar",
            });
        });

        it("returns empty object when rootBlocks is empty", () => {
            const methods = createDocumentRootBlocksMethods({});

            expect(methods.inputToOutput?.({})).toEqual({});
        });
    });

    describe("anchors", () => {
        it("collects anchors from a block that implements anchors()", () => {
            const block = createMockBlock({ anchors: () => ["section-intro", "section-contact"] });

            const { anchors } = createDocumentRootBlocksMethods({ content: block });

            expect(anchors({ content: {} })).toEqual(["section-intro", "section-contact"]);
        });

        it("returns empty array when no block implements anchors()", () => {
            const block = createMockBlock();

            const { anchors } = createDocumentRootBlocksMethods({ content: block });

            expect(anchors({ content: {} })).toEqual([]);
        });

        it("merges anchors from multiple blocks and skips blocks without anchors()", () => {
            const blockA = createMockBlock({ anchors: () => ["a1"] });
            const blockB = createMockBlock();
            const blockC = createMockBlock({ anchors: () => ["c1", "c2"] });

            const { anchors } = createDocumentRootBlocksMethods({ a: blockA, b: blockB, c: blockC });

            expect(anchors({ a: {}, b: {}, c: {} })).toEqual(["a1", "c1", "c2"]);
        });
    });

    describe("dependencies", () => {
        it("collects dependencies from a block that implements dependencies()", () => {
            const dep = { targetGraphqlObjectType: "Product", id: "42" };
            const block = createMockBlock({ dependencies: () => [dep] });

            const { dependencies } = createDocumentRootBlocksMethods({ content: block });

            expect(dependencies({ content: {} })).toEqual([dep]);
        });

        it("returns empty array when no block implements dependencies()", () => {
            const block = createMockBlock();

            const { dependencies } = createDocumentRootBlocksMethods({ content: block });

            expect(dependencies({ content: {} })).toEqual([]);
        });

        it("merges dependencies from multiple blocks", () => {
            const dep1 = { targetGraphqlObjectType: "Product", id: "1" };
            const dep2 = { targetGraphqlObjectType: "Category", id: "2" };
            const blockA = createMockBlock({ dependencies: () => [dep1] });
            const blockB = createMockBlock({ dependencies: () => [dep2] });

            const { dependencies } = createDocumentRootBlocksMethods({ a: blockA, b: blockB });

            expect(dependencies({ a: {}, b: {} })).toEqual([dep1, dep2]);
        });
    });

    describe("replaceDependenciesInOutput", () => {
        it("delegates to each block's replaceDependenciesInOutput with the replacement list", () => {
            const replacement: ReplaceDependencyObject = { originalId: "old", replaceWithId: "new", type: "Product" };
            const block = createMockBlock({
                replaceDependenciesInOutput: (_output, replacements) => ({
                    id: (replacements as ReplaceDependencyObject[])[0].replaceWithId,
                }),
            });

            const { replaceDependenciesInOutput } = createDocumentRootBlocksMethods({ content: block });

            expect(replaceDependenciesInOutput({ content: { id: "old" } }, [replacement])).toEqual({
                content: { id: "new" },
            });
        });

        it("preserves output of blocks that return their output unchanged", () => {
            const replacement: ReplaceDependencyObject = { originalId: "old", replaceWithId: "new", type: "Product" };
            const blockWithReplace = createMockBlock({
                replaceDependenciesInOutput: (output) => ({ ...(output as object), replaced: true }),
            });
            const blockNoChange = createMockBlock();

            const { replaceDependenciesInOutput } = createDocumentRootBlocksMethods({
                a: blockWithReplace,
                b: blockNoChange,
            });

            expect(replaceDependenciesInOutput({ a: { val: 1 }, b: { val: 2 } }, [replacement])).toEqual({
                a: { val: 1, replaced: true },
                b: { val: 2 },
            });
        });

        it("passes through output unchanged when replacements list is empty", () => {
            const block = createMockBlock({
                replaceDependenciesInOutput: (output, replacements) => {
                    if ((replacements as ReplaceDependencyObject[]).length === 0) {
                        return output;
                    }
                    return { replaced: true };
                },
            });

            const { replaceDependenciesInOutput } = createDocumentRootBlocksMethods({ content: block });

            expect(replaceDependenciesInOutput({ content: { id: "abc" } }, [])).toEqual({ content: { id: "abc" } });
        });
    });
});
