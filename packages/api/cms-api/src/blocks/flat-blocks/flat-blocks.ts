import type { BlockDataInterface } from "../block";
import { visitBlocksBreadthFirst } from "./visit-blocks-breadth-first";
import { visitBlocksDepthFirst } from "./visit-blocks-depth-first";

export class FlatBlockNode {
    name: string;
    block: BlockDataInterface;
    parent: FlatBlockNode | null;
    level: number;
    path: Array<string | number>;
    visible: boolean;
    pathToString(): string {
        return this.path.join(".");
    }
    constructor({
        name,
        block,
        parent,
        level,
        path,
        visible,
    }: {
        name: string;
        block: BlockDataInterface;
        parent: FlatBlockNode | null;
        level: number;
        path: Array<string | number>;
        visible: boolean;
    }) {
        this.name = name;
        this.block = block;
        this.parent = parent;
        this.level = level;
        this.path = path;
        this.visible = visible;
    }
}

interface RootBlockInfo {
    visible: boolean;
    name: string;
    rootPath: string;
}

// Traverses a Block Tree and returns an array of FlatBlockNodes
// FlatBlockNodes represent a block with additional information about its position it the block-tree
// Probably not only for search and index but also for history and/or transformToSave/plain
export class FlatBlocks {
    constructor(
        private blockData: BlockDataInterface,
        private rootBlockInfo?: Partial<RootBlockInfo>,
    ) {}

    nodes(): FlatBlockNode[] {
        return this.depthFirst();
    }

    depthFirst(): FlatBlockNode[] {
        return visitBlocksDepthFirst(this.blockData, this.rootBlockInfo);
    }

    breadthFirst(): FlatBlockNode[] {
        return visitBlocksBreadthFirst(this.blockData, this.rootBlockInfo);
    }
}
