import { createBlock, createListBlock } from "@dextinity/serverless/server";
import { z } from "zod";

import { headingTags } from "../../../../shared/blocks";
import { MediaBlock } from "../../../common/blocks/media.block";
import { RichTextBlock } from "../../../common/blocks/rich-text.block";
import { TextLinkBlock } from "../../../common/blocks/text-link.block";

const TeaserItemBlock = createBlock(
    "TeaserItem",
    z.strictObject({
        media: MediaBlock.schema,
        title: z.string().optional(),
        titleHtmlTag: z.enum(headingTags),
        description: RichTextBlock.schema,
        link: TextLinkBlock.schema,
    }),
);

export const TeaserBlock = createListBlock({ name: "Teaser", block: TeaserItemBlock });
