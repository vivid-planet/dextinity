import type { BlockDependency, BlockInterface } from "../blocks/types";
import type { DocumentInterface } from "./types";

export function createDocumentRootBlocksMethods<
    DocumentInput extends Record<string, unknown> = Record<string, unknown>,
    DocumentOutput extends Record<string, unknown> = Record<string, unknown>,
>(
    rootBlocks: Record<string, BlockInterface>,
): Pick<DocumentInterface<DocumentInput, DocumentOutput>, "inputToOutput" | "anchors" | "dependencies" | "replaceDependenciesInOutput"> {
    return {
        inputToOutput: (input) => {
            return Object.fromEntries(
                Object.entries(rootBlocks).map(([blockKey, block]) => {
                    return [blockKey, block.state2Output(block.input2State(input[blockKey]))];
                }),
            ) as DocumentOutput;
        },
        anchors: (input) => {
            return Object.entries(rootBlocks).reduce((acc, [blockKey, block]) => {
                return [...acc, ...(block.anchors?.(block.input2State(input[blockKey])) ?? [])];
            }, [] as string[]);
        },
        dependencies: (input) => {
            return Object.entries(rootBlocks).reduce((acc, [blockKey, block]) => {
                return [...acc, ...(block.dependencies?.(block.input2State(input[blockKey])) ?? [])];
            }, [] as BlockDependency[]);
        },
        replaceDependenciesInOutput: (output, replacements) => {
            return {
                ...output,
                ...Object.fromEntries(
                    Object.entries(rootBlocks).map(([blockKey, block]) => {
                        return [blockKey, block.replaceDependenciesInOutput(output[blockKey], replacements)];
                    }),
                ),
            };
        },
    };
}
