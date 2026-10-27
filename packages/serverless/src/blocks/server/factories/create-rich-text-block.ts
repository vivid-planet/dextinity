import { z } from "zod";

import { type Block, createBlock } from "../block.js";

const draftContentBlock = z.strictObject({
    key: z.string(),
    type: z.string(),
    text: z.string(),
    depth: z.number().int().min(0),
    inlineStyleRanges: z.array(z.strictObject({ style: z.string(), offset: z.number().int().min(0), length: z.number().int().min(0) })),
    entityRanges: z.array(z.strictObject({ key: z.number().int().min(0), offset: z.number().int().min(0), length: z.number().int().min(0) })),
    data: z.record(z.string(), z.unknown()).optional(),
});

/** Formatted text of the Draft.js based rich text editor. Links are the only entities, their data is the input of the link block. */
export function createRichTextBlock({ name = "RichText", link }: { name?: string; link: Block }) {
    return createBlock(
        name,
        z.strictObject({
            draftContent: z.strictObject({
                blocks: z.array(draftContentBlock),
                entityMap: z.record(
                    z.string(),
                    z.strictObject({ type: z.literal("LINK"), mutability: z.enum(["MUTABLE", "IMMUTABLE", "SEGMENTED"]), data: link.schema }),
                ),
            }),
        }),
    );
}
