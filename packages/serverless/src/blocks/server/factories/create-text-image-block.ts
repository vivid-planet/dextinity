import { z } from "zod";

import { type Block, createBlock } from "../block.js";

interface CreateTextImageBlockOptions {
    name?: string;
    text: Block;
    image: Block;
    /** The aspect ratios the editor can choose from, e.g. `["16x9", "1x1"]` */
    imageAspectRatios: readonly [string, ...string[]];
}

export function createTextImageBlock({ name = "TextImage", text, image, imageAspectRatios }: CreateTextImageBlockOptions) {
    return createBlock(
        name,
        z.strictObject({
            text: text.schema,
            image: image.schema,
            imagePosition: z.enum(["left", "right"]),
            imageAspectRatio: z.enum(imageAspectRatios),
        }),
    );
}
