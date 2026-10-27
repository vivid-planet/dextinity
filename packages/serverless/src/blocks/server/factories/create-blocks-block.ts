import { z } from "zod";

import { createBlock, supportedBlockItems, type SupportedBlocks } from "../block.js";

/** A list of blocks of the supported types, e.g. the content of a page */
export function createBlocksBlock({ name, supportedBlocks }: { name: string; supportedBlocks: SupportedBlocks }) {
    return createBlock(name, z.strictObject({ blocks: z.array(supportedBlockItems(supportedBlocks, { key: z.string(), visible: z.boolean() })) }));
}
