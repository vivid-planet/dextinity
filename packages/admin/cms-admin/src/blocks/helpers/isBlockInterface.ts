import type { AnonymousBlockInterface, BlockInterface } from "../types";

export function isBlockInterface(block: BlockInterface | AnonymousBlockInterface): block is BlockInterface {
    const blockAsBlockInterface = block as BlockInterface;
    if (blockAsBlockInterface.name) {
        return true;
    }
    return false;
}
