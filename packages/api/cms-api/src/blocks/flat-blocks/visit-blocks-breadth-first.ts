import type { BlockDataInterface } from "../block";
import { FlatBlockNode } from "./flat-blocks";

export interface RootBlockInfo {
    visible: boolean;
    name: string;
    rootPath: string;
}
// Visits all block-nodes with a Visitor to collect meta data from the blocks
export function visitBlocksBreadthFirst(blockData: BlockDataInterface, rootBlockInfo?: Partial<RootBlockInfo>): FlatBlockNode[] {
    const visitedNodes: FlatBlockNode[] = [];

    const queue: FlatBlockNode[] = [];

    queue.push(
        new FlatBlockNode({
            name: rootBlockInfo?.name || "UnnamedRootBlock",
            block: blockData,
            parent: null,
            level: 0,
            path: [rootBlockInfo?.rootPath || "root"],
            visible: rootBlockInfo?.visible || true,
        }),
    );
    while (queue.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const next = queue.shift()!;
        visitedNodes.push(next);
        const childInfo = next.block.childBlocksInfo();
        if (childInfo.length) {
            childInfo.forEach((childInfo) => {
                queue.push(
                    new FlatBlockNode({
                        name: childInfo.name,
                        block: childInfo.block,
                        parent: next,
                        level: next.level + 1,
                        path: [...next.path, ...childInfo.relJsonPath],
                        visible: next.visible && childInfo.visible,
                    }),
                );
            });
        }
    }

    return visitedNodes;
}
