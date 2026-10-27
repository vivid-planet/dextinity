import { z } from "zod";

import { type Block, createBlock } from "../block.js";

export function createImageLinkBlock({ name = "ImageLink", link, image }: { name?: string; link: Block; image: Block }) {
    return createBlock(name, z.strictObject({ link: link.schema, image: image.schema }));
}
