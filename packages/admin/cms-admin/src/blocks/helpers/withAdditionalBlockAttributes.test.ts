import { describe, expect, it } from "vitest";

import type { BlockContext } from "../context/BlockContext";
import type { BlockMethods, BlockPreviewContext } from "../types";
import { withAdditionalBlockAttributes } from "./withAdditionalBlockAttributes";

type BaseInput = { title: string };
type BaseState = { title: string };
type BaseOutput = { title: string };

const previewCtx = { parentUrl: "/test" } as BlockPreviewContext & BlockContext;
const blockCtx = {} as BlockContext;

const baseBlock: BlockMethods<BaseInput, BaseState, BaseOutput> = {
    defaultValues: (): BaseState => ({ title: "" }),
    input2State: (input: BaseInput): BaseState => ({ title: input.title }),
    state2Output: (state: BaseState): BaseOutput => ({ title: state.title }),
    output2State: async (output: BaseOutput): Promise<BaseState> => ({ title: output.title }),
    createPreviewState: (state: BaseState) => ({ title: state.title }),
    isValid: () => true,
    previewContent: () => [],
    replaceDependenciesInOutput: (output) => output,
    resolveDependencyPath: () => "",
};

describe("withAdditionalBlockAttributes", () => {
    describe("defaultValues", () => {
        it("should include the additional attributes in defaultValues", () => {
            const decorated = withAdditionalBlockAttributes({ visible: true })(baseBlock);

            expect(decorated.defaultValues()).toEqual({ title: "", visible: true });
        });

        it("should preserve the base block's defaultValues when add is empty", () => {
            const decorated = withAdditionalBlockAttributes({})(baseBlock);

            expect(decorated.defaultValues()).toEqual({ title: "" });
        });
    });

    describe("input2State", () => {
        it("should extract additional attributes from input and merge with base block result", () => {
            const decorated = withAdditionalBlockAttributes({ visible: true })(baseBlock);

            const result = decorated.input2State({ title: "Hello", visible: false });

            expect(result).toEqual({ title: "Hello", visible: false });
        });

        it("should produce undefined for additional attributes absent in input", () => {
            const decorated = withAdditionalBlockAttributes({ visible: true })(baseBlock);

            const result = decorated.input2State({ title: "Hello" } as never);

            expect(result).toEqual({ title: "Hello", visible: undefined });
        });
    });

    describe("state2Output", () => {
        it("should extract additional attributes from state and merge with base block result", () => {
            const decorated = withAdditionalBlockAttributes({ visible: true })(baseBlock);

            const result = decorated.state2Output({ title: "Hello", visible: false });

            expect(result).toEqual({ title: "Hello", visible: false });
        });

        it("should work correctly with multiple additional attributes", () => {
            const decorated = withAdditionalBlockAttributes({ visible: true, order: 0 })(baseBlock);

            const result = decorated.state2Output({ title: "A", visible: false, order: 5 });

            expect(result).toEqual({ title: "A", visible: false, order: 5 });
        });
    });

    describe("output2State", () => {
        it("should extract additional attributes from output and merge with base block result", async () => {
            const decorated = withAdditionalBlockAttributes({ visible: true })(baseBlock);

            const result = await decorated.output2State({ title: "Hello", visible: false }, blockCtx);

            expect(result).toEqual({ title: "Hello", visible: false });
        });

        it("should await the base block's output2State before merging", async () => {
            const asyncBlock: BlockMethods<BaseInput, BaseState, BaseOutput> = {
                ...baseBlock,
                output2State: async (output) => ({ title: `[${output.title}]` }),
            };
            const decorated = withAdditionalBlockAttributes({ visible: true })(asyncBlock);

            const result = await decorated.output2State({ title: "Hello", visible: true }, blockCtx);

            expect(result).toEqual({ title: "[Hello]", visible: true });
        });
    });

    describe("createPreviewState", () => {
        it("should extract additional attributes from state for the preview state", () => {
            const decorated = withAdditionalBlockAttributes({ visible: true })(baseBlock);

            const result = decorated.createPreviewState({ title: "Hello", visible: false }, previewCtx);

            expect(result).toEqual({ title: "Hello", visible: false });
        });
    });

    describe("overrides", () => {
        it("should allow overriding decorated methods via the overrides parameter", () => {
            const decorated = withAdditionalBlockAttributes({ visible: true })(baseBlock, {
                defaultValues: () => ({ title: "custom-default", visible: false }),
            });

            expect(decorated.defaultValues()).toEqual({ title: "custom-default", visible: false });
        });

        it("should not affect other methods when only one method is overridden", () => {
            const decorated = withAdditionalBlockAttributes({ visible: true })(baseBlock, {
                defaultValues: () => ({ title: "overridden", visible: true }),
            });

            expect(decorated.input2State({ title: "Hello", visible: false })).toEqual({ title: "Hello", visible: false });
        });
    });

    describe("non-add properties", () => {
        it("should preserve all other properties from the base block", () => {
            const blockWithExtras = { ...baseBlock, name: "MyBlock", displayName: "My Block" };
            const decorated = withAdditionalBlockAttributes({ visible: true })(blockWithExtras);

            expect((decorated as unknown as typeof blockWithExtras).name).toBe("MyBlock");
            expect((decorated as unknown as typeof blockWithExtras).displayName).toBe("My Block");
        });
    });
});
