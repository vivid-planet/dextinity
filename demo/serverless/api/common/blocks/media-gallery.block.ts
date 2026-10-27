import { createBlock, createListBlock } from "@dextinity/serverless/server";
import { z } from "zod";

import { mediaAspectRatios } from "../../../shared/blocks";
import { MediaBlock } from "./media.block";

const MediaGalleryItemBlock = createBlock("MediaGalleryItem", z.strictObject({ media: MediaBlock.schema, caption: z.string().optional() }));

export const MediaGalleryBlock = createBlock(
    "MediaGallery",
    z.strictObject({
        items: createListBlock({ name: "MediaGalleryList", block: MediaGalleryItemBlock }).schema,
        aspectRatio: z.enum(mediaAspectRatios),
    }),
);
