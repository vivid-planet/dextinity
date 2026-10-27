import { z } from "zod";

import { type Block, createBlock } from "../block.js";

/** The settings every video block has, `previewImage` is shown until the video plays */
export function baseVideoBlockShape(previewImage: Block) {
    return {
        autoplay: z.boolean().optional(),
        showControls: z.boolean().optional(),
        loop: z.boolean().optional(),
        previewImage: previewImage.schema,
    };
}

const youTubeIdentifierLength = 11;
// The same pattern as `YouTubeVideoBlock` of `@dextinity/cms-admin`
const youTubeUrlPattern =
    /(https?:\/\/)?(((m|www)\.)?(youtube(-nocookie)?|youtube.googleapis)\.com.*(v\/|v=|vi=|vi\/|e\/|embed\/|user\/.*\/u\/\d+\/)|youtu\.be\/)([_0-9a-zA-Z-]+)/;

const youTubeIdentifier = z
    .string()
    .refine(
        (value) => value.length === youTubeIdentifierLength || value.match(youTubeUrlPattern)?.[8].length === youTubeIdentifierLength,
        "Invalid YouTube identifier",
    );

const vimeoIdentifier = z
    .string()
    .regex(
        /^(https?:\/\/)?((www\.|player\.)?vimeo\.com\/?(showcase\/)*([0-9a-z]*\/)*([0-9]{6,11})[?]?.*)$|^([0-9]{6,11})$/,
        "Invalid Vimeo identifier",
    );

export function createYouTubeVideoBlock({ name = "YouTubeVideo", previewImage }: { name?: string; previewImage: Block }) {
    return createBlock(name, z.strictObject({ ...baseVideoBlockShape(previewImage), youtubeIdentifier: youTubeIdentifier.optional() }));
}

export function createVimeoVideoBlock({ name = "VimeoVideo", previewImage }: { name?: string; previewImage: Block }) {
    return createBlock(name, z.strictObject({ ...baseVideoBlockShape(previewImage), vimeoIdentifier: vimeoIdentifier.optional() }));
}
