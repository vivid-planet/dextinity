import { createBlock, createTableBlock } from "@dextinity/serverless/server";
import { z } from "zod";

import { RichTextBlock } from "./rich-text.block";

export const TableBlock = createBlock(
    "Table",
    z.strictObject({
        table: createTableBlock({ name: "TableContent", richText: RichTextBlock }).schema,
        responsiveBehavior: z.enum(["scrollSideways", "none", "listByRow", "listByColumn"]),
    }),
);
