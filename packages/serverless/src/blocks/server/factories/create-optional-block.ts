import { z } from "zod";

import { type Block, createBlock } from "../block.js";

/** A block the editor can leave empty or hide, e.g. the Open Graph image */
export function createOptionalBlock(block: Block, name = `Optional${block.name}`) {
    return createBlock(name, z.strictObject({ block: block.schema.optional(), visible: z.boolean() }));
}
