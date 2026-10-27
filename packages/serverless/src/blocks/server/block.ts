import { z } from "zod";

/**
 * The server side of a block: its name and the zod schema of its input, which is what the admin's `state2Output` sends.
 *
 * The counterpart of the blocks of `@dextinity/cms-api` without the data side: documents store the validated input, and nothing is
 * transformed for the site yet. Schemas use strict objects, so a field the admin sends but the schema doesn't know is an error and
 * not silently dropped.
 */
export interface Block<TSchema extends z.ZodType = z.ZodType> {
    name: string;
    schema: TSchema;
}

export type BlockInput<TBlock extends Block> = z.output<TBlock["schema"]>;

export type SupportedBlocks = Record<string, Block>;

export function createBlock<TSchema extends z.ZodType>(name: string, schema: TSchema): Block<TSchema> {
    return { name, schema };
}

/** The items of `blocks` and `attachedBlocks`: one strict object per supported block, discriminated by `type` */
export function supportedBlockItems<TShape extends z.ZodRawShape>(supportedBlocks: SupportedBlocks, shape: TShape) {
    const items = Object.entries(supportedBlocks).map(([type, block]) => z.strictObject({ ...shape, type: z.literal(type), props: block.schema }));
    if (items.length === 0) {
        throw new Error("At least one supported block is required");
    }
    return z.discriminatedUnion("type", items as [(typeof items)[number], ...(typeof items)[number][]]);
}
