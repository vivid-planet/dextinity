import type { BlockContext, BlockDataInterface } from "./block";
import { FlatBlocks } from "./flat-blocks/flat-blocks";

export async function getPreviewImageUrlTemplatesFromBlock(
    block: BlockDataInterface,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dependencies: Record<string, any>,
    context: BlockContext,
): Promise<string[]> {
    const previewImageUrlTemplates: string[] = [];

    const visitor = new FlatBlocks(block);

    for (const node of visitor.depthFirst()) {
        if (node.visible) {
            const previewImageUrlTemplate = await node.block.previewImageUrlTemplate(dependencies, context);

            if (previewImageUrlTemplate !== undefined) {
                previewImageUrlTemplates.push(previewImageUrlTemplate);
            }
        }
    }

    return previewImageUrlTemplates;
}

export async function getMostSignificantPreviewImageUrlTemplateFromBlock(
    block: BlockDataInterface,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dependencies: Record<string, any>,
    context: BlockContext,
): Promise<string | undefined> {
    const previewImageUrlTemplates = await getPreviewImageUrlTemplatesFromBlock(block, dependencies, context);

    return previewImageUrlTemplates.length > 0 ? previewImageUrlTemplates[0] : undefined;
}
