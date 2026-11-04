import type { BlockDataInterface } from "../block";
import { FlatBlockNode } from "./flat-blocks";
import type { RootBlockInfo } from "./visit-blocks-breadth-first";

export function visitBlocksDepthFirst(blockData: BlockDataInterface, rootBlockInfo?: Partial<RootBlockInfo>): FlatBlockNode[] {
    const visitedNodes: FlatBlockNode[] = [];

    function traverse(visitNode: FlatBlockNode): void {
        visitedNodes.push(visitNode);

        visitNode.block.childBlocksInfo().forEach((childBlockInfo) => {
            const childVisitNode = new FlatBlockNode({
                name: childBlockInfo.name,
                block: childBlockInfo.block,
                parent: visitNode,
                level: visitNode.level + 1,
                path: [...visitNode.path, ...childBlockInfo.relJsonPath],
                visible: visitNode.visible && childBlockInfo.visible,
            });
            traverse(childVisitNode);
        });
    }

    traverse(
        new FlatBlockNode({
            name: rootBlockInfo?.name || "UnnamedRootBlock",
            block: blockData,
            parent: null,
            level: 0,
            path: [rootBlockInfo?.rootPath || "root"],
            visible: rootBlockInfo?.visible || true,
        }),
    );
    return visitedNodes;
}
