import { createBlock, createListBlock, SvgImageBlock } from "@dextinity/serverless/server";
import { z } from "zod";

import { RichTextBlock } from "../../../common/blocks/rich-text.block";

const KeyFactsItemBlock = createBlock(
    "KeyFactsItem",
    z.strictObject({ icon: SvgImageBlock.schema, fact: z.string().optional(), label: z.string().optional(), description: RichTextBlock.schema }),
);

export const KeyFactsBlock = createListBlock({ name: "KeyFacts", block: KeyFactsItemBlock });
