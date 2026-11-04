import type { BlockInterface } from "../blocks/types";
import type { TranslatableInterface } from "./TranslatableInterface";

export function createDocumentTranslationMethods<
    DocumentInput extends Record<string, unknown> = Record<string, unknown>,
    DocumentOutput extends Record<string, unknown> = Record<string, unknown>,
>(rootBlocks: Record<string, BlockInterface>): TranslatableInterface<DocumentInput, DocumentOutput> {
    return {
        translateContent: async (input, translate) => {
            const entries = await Promise.all(
                Object.entries(rootBlocks).map(async ([blockKey, block]) => {
                    const state = block.input2State(input[blockKey]);
                    const translatedState = block.translateContent ? await block.translateContent(state, translate) : state;
                    return [blockKey, block.state2Output(translatedState)];
                }),
            );
            return Object.fromEntries(entries) as DocumentOutput;
        },
    };
}
