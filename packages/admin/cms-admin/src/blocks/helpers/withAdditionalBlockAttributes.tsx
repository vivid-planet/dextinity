import type { BlockInputApi, BlockInterface, BlockMethods, BlockOutputApi, BlockState } from "../types";

type Decorate = BlockMethods;
type Decorated<Block extends Decorate, Add extends Record<string, DefaultValue>> = BlockMethods<
    BlockInputApi<Block> & Add,
    BlockState<Block> & Add,
    BlockOutputApi<Block> & Add
>;

type DefaultValue = unknown;
export function withAdditionalBlockAttributes<Add extends Record<string, DefaultValue>>(add: Add) {
    return function withAdditionalBlockAttributesInner<Block extends Decorate>(
        block: Block,
        overrides: Partial<BlockInterface<BlockInputApi<Block> & Add, BlockState<Block> & Add, BlockOutputApi<Block> & Add>> = {},
    ): Decorated<Block, Add> & typeof overrides & Omit<Block, keyof Decorate> {
        // returns the decoreted methods & the added stuff in the overrides, and all the non decorated methods from the decorate
        return {
            ...block,
            defaultValues: () => ({
                ...block.defaultValues(),
                ...add,
            }),

            input2State: (input) => ({
                ...block.input2State(input),
                ...Object.keys(add).reduce((acc, c) => ({ ...acc, [c]: input[c] }), {}),
            }),
            state2Output: (state) => ({
                ...block.state2Output(state),
                ...Object.keys(add).reduce((acc, c) => ({ ...acc, [c]: state[c] }), {}),
            }),

            output2State: async (output, context) => ({
                ...(await block.output2State(output, context)),
                ...Object.keys(add).reduce((acc, c) => ({ ...acc, [c]: output[c] }), {}),
            }),

            createPreviewState: (state: BlockState<Block>, previewCtx) => ({
                ...block.createPreviewState(state, previewCtx),
                ...Object.keys(add).reduce((acc, c) => ({ ...acc, [c]: state[c] }), {}),
            }),
            ...overrides,
        };
    };
}
