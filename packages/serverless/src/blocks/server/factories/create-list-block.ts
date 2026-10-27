import { z } from "zod";

import { type Block, createBlock } from "../block.js";

/** A list of blocks of one type, e.g. the items of an accordion */
export function createListBlock({ name, block }: { name: string; block: Block }) {
    return createBlock(name, z.strictObject({ blocks: z.array(z.strictObject({ key: z.string(), visible: z.boolean(), props: block.schema })) }));
}
