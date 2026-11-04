import { BlockPreviewProvider, IFrameBridgeProvider, useIFrameBridge } from "@dextinity/site-react";
import { type ReactNode, Suspense, useEffect, useState } from "react";

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
    /** Called when `loadBlockData` fails, e.g. to report the error to an error tracking service. Defaults to `console.error` */
    onError?: (error: unknown) => void;
};

/**
 * Creates the component rendering the block the admin sends through the iframe bridge in its block preview, one route for all
 * previews. Check the type with `hasPreview()` in the loader of the route, so that unknown types get the not found page.
 * Previews with large dependencies that other previews don't need, e.g. mails, can be loaded with `lazy()`, as they're rendered in a Suspense boundary.
 *
 * @example
 * // route("block-preview/:type", "routes/BlockPreviewRoute.tsx")
 * export function loader({ params }: Route.LoaderArgs) {
 *     if (!BlockPreview.hasPreview(params.type)) {
 *         notFound();
 *     }
 * }
 *
 * export default function BlockPreviewRoute({ params }: Route.ComponentProps) {
 *     return <BlockPreview type={params.type} />;
 * }
 */
export function createBlockPreview<BlockType extends string>({
    previews,
    loadBlockData,
    onError = console.error,
}: CreateBlockPreviewOptions<BlockType>) {
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
                onError(error);
                // Rather than the previous block, which the editor would take for the changed one
                if (isCurrent) {
                    setData(undefined);
                }
            });
            return () => {
                isCurrent = false;
            };
        }, [preview, state, contentScope]);

        return data === undefined ? null : <Suspense>{preview.render(data as never)}</Suspense>;
    }

    function hasPreview(type: string) {
        return Object.hasOwn(previews, type);
    }

    function BlockPreview({ type }: { type: string }) {
        if (!hasPreview(type)) {
            throw new Error(`Unknown block preview ${type}, check it with BlockPreview.hasPreview() in the loader`);
        }
        const preview = previews[type];
        return (
            <IFrameBridgeProvider>
                <BlockPreviewProvider>
                    <BlockPreviewContent preview={preview} />
                </BlockPreviewProvider>
            </IFrameBridgeProvider>
        );
    }

    return Object.assign(BlockPreview, { hasPreview });
}
