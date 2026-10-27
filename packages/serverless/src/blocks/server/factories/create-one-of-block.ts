import { z } from "zod";

import { createBlock, supportedBlockItems, type SupportedBlocks } from "../block.js";

interface CreateOneOfBlockOptions<TAdditionalFields extends z.ZodRawShape> {
    name: string;
    supportedBlocks: SupportedBlocks;
    /** Whether no block may be active */
    allowEmpty?: boolean;
    /** Fields next to the attached blocks, e.g. the title of a link */
    additionalFields?: TAdditionalFields;
}

/**
 * One of the supported blocks, e.g. an internal or external link. The admin keeps the blocks the editor switched away from in
 * `attachedBlocks`, so switching back restores them.
 */
export function createOneOfBlock<TAdditionalFields extends z.ZodRawShape = Record<never, never>>({
    name,
    supportedBlocks,
    allowEmpty = true,
    additionalFields,
}: CreateOneOfBlockOptions<TAdditionalFields>) {
    const types = Object.keys(supportedBlocks) as [string, ...string[]];
    const schema = z
        .strictObject({
            ...additionalFields,
            attachedBlocks: z.array(supportedBlockItems(supportedBlocks, {})),
            activeType: allowEmpty ? z.enum(types).nullish() : z.enum(types),
        })
        .refine(({ attachedBlocks, activeType }) => !activeType || attachedBlocks.some((attachedBlock) => attachedBlock.type === activeType), {
            message: "The active block must be attached",
            path: ["activeType"],
        });
    return createBlock(name, schema);
}
