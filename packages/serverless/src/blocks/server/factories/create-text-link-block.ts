import { z } from "zod";

import { type Block, createBlock } from "../block.js";

export function createTextLinkBlock({ name = "TextLink", link }: { name?: string; link: Block }) {
    return createBlock(name, z.strictObject({ text: z.string().optional(), link: link.schema }));
}
