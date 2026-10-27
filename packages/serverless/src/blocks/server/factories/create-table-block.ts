import { z } from "zod";

import { type Block, createBlock } from "../block.js";

export const tableColumnSizes = ["extraSmall", "small", "standard", "large", "extraLarge"] as const;

/** A table with rich text cells, columns and rows can be highlighted */
export function createTableBlock({ name = "Table", richText }: { name?: string; richText: Block }) {
    return createBlock(
        name,
        z.strictObject({
            columns: z.array(z.strictObject({ id: z.string(), size: z.enum(tableColumnSizes), highlighted: z.boolean() })),
            rows: z.array(
                z.strictObject({
                    id: z.string(),
                    highlighted: z.boolean(),
                    cellValues: z.array(z.strictObject({ columnId: z.string(), value: richText.schema })),
                }),
            ),
        }),
    );
}
