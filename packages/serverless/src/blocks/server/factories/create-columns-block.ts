import { z } from "zod";

import { type Block, createBlock } from "../block.js";

interface ColumnsBlockLayout {
    name: string;
    /** The number of columns, e.g. 2 for `9-9` */
    columns: number;
}

/** Columns with the same content block in each, e.g. text next to an image */
export function createColumnsBlock({
    name,
    layouts,
    contentBlock,
}: {
    name: string;
    layouts: [ColumnsBlockLayout, ...ColumnsBlockLayout[]];
    contentBlock: Block;
}) {
    const layoutNames = layouts.map((layout) => layout.name) as [string, ...string[]];
    const schema = z
        .strictObject({
            layout: z.enum(layoutNames),
            columns: z.array(z.strictObject({ key: z.uuid(), visible: z.boolean(), props: contentBlock.schema })),
        })
        .refine(({ layout, columns }) => layouts.find((candidate) => candidate.name === layout)?.columns === columns.length, {
            message: "The number of columns doesn't match the layout",
            path: ["columns"],
        });
    return createBlock(name, schema);
}
