import type { Block, BlockDataInterface, BlockIndex, BlockIndexItem } from "../block";
import { FlatBlocks } from "../flat-blocks/flat-blocks";

export function transformToBlockSaveIndex(block: Block, blockData: BlockDataInterface): BlockIndex {
    const flatBlocks = new FlatBlocks(blockData, { name: block.name, visible: true, rootPath: "root" }); // breadthFirst or depthFirst is equally ok for the app, but the tests for original version are written for depth first traversal

    return flatBlocks.depthFirst().map((c) => {
        let blockIndexItem: BlockIndexItem = {
            blockname: c.name,
            jsonPath: c.pathToString(),
            visible: c.visible,
        };

        const indexData = c.block.indexData();
        if (Object.keys(indexData).length > 0) {
            blockIndexItem = { ...blockIndexItem, ...indexData };
        }

        return blockIndexItem;
    });
}
