"use client";

import { BlockPreviewProvider, IFrameBridgeProvider, useIFrameBridge } from "@dextinity/site-react";
import { type ReactNode, useEffect, useState } from "react";

import { notFound } from "./navigation.js";
import { reportError } from "./reportError.js";

export type BlockPreviewDefinition<BlockType extends string = string> = {
    /** Passed to `loadBlockData`, e.g. to run the loaders of the block and its child blocks */
    blockType: BlockType;
    /** The block in the state the admin sends, if the state isn't the block itself */
    getBlock?: (state: never) => unknown;
    render: (data: never) => ReactNode;
};

/**
 * Types the data `render` receives, e.g. `defineBlockPreview({ blockType: "Stage", render: (data: StageBlockData) => <StageBlock data={data} /> })`
 */
export function defineBlockPreview<BlockType extends string, Data, State = unknown>(definition: {
    blockType: BlockType;
    getBlock?: (state: State) => unknown;
    render: (data: Data) => ReactNode;
}): BlockPreviewDefinition<BlockType> {
    return definition;
}

type LoadBlockData<BlockType extends string> = (options: { blockType: BlockType; block: unknown; contentScope: unknown }) => Promise<unknown>;

type CreateBlockPreviewOptions<BlockType extends string> = {
    /** The previews by the last path segment of the preview URL the admin opens, e.g. `page` for `/block-preview/main/en/page` */
    previews: Record<string, BlockPreviewDefinition<BlockType>>;
    /** Loads the data the blocks need, without it the block is rendered as the admin sends it */
    loadBlockData?: LoadBlockData<BlockType>;
};

/**
 * Creates the component rendering the block the admin sends through the iframe bridge in its block preview.
 * Call it in a client component module, as the previews contain functions. Unknown types render the not found page.
 */
export function createBlockPreview<BlockType extends string>({ previews, loadBlockData }: CreateBlockPreviewOptions<BlockType>) {
    function BlockPreviewContent({ preview }: { preview: BlockPreviewDefinition<BlockType> }) {
        const { block: state, contentScope } = useIFrameBridge();
        const [data, setData] = useState<unknown>();

        useEffect(() => {
            let isCurrent = true;
            async function load() {
                if (state === undefined || state === null) {
                    setData(undefined);
                    return;
                }
                const block = preview.getBlock ? preview.getBlock(state as never) : state;
                const loadedData = loadBlockData ? await loadBlockData({ blockType: preview.blockType, block, contentScope }) : block;
                if (isCurrent) {
                    setData(loadedData);
                }
            }
            load().catch((error: unknown) => {
                reportError(error);
                // Rather than the previous block, which the editor would take for the changed one
                if (isCurrent) {
                    setData(undefined);
                }
            });
            return () => {
                isCurrent = false;
            };
        }, [preview, state, contentScope]);

        return data === undefined ? null : preview.render(data as never);
    }

    return function BlockPreview({ type }: { type: string }) {
        const preview = Object.hasOwn(previews, type) ? previews[type] : undefined;
        if (!preview) {
            notFound();
        }
        return (
            <IFrameBridgeProvider>
                <BlockPreviewProvider>
                    <BlockPreviewContent preview={preview} />
                </BlockPreviewProvider>
            </IFrameBridgeProvider>
        );
    };
}
