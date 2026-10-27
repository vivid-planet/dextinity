import { z } from "zod";

import { baseVideoBlockShape, createBlock, createOneOfBlock } from "../../../blocks/server/index.js";
import { focalPoints } from "../common/focal-point.js";

const percentage = z.number().min(0).max(100);

/** Overrides the crop area of the file, see `ImageCropArea` */
const cropArea = z.strictObject({
    focalPoint: z.enum(focalPoints),
    width: percentage.optional(),
    height: percentage.optional(),
    x: percentage.optional(),
    y: percentage.optional(),
});

// The files aren't checked: a deleted file leaves an empty image, and the routes that load files check the scope
export const PixelImageBlock = createBlock("PixelImage", z.strictObject({ damFileId: z.uuid().optional(), cropArea: cropArea.optional() }));

export const SvgImageBlock = createBlock("SvgImage", z.strictObject({ damFileId: z.uuid().optional() }));

export const DamImageBlock = createOneOfBlock({
    name: "DamImage",
    supportedBlocks: { pixelImage: PixelImageBlock, svgImage: SvgImageBlock },
    allowEmpty: false,
});

export const DamVideoBlock = createBlock("DamVideo", z.strictObject({ ...baseVideoBlockShape(PixelImageBlock), damFileId: z.uuid().optional() }));

export const DamFileDownloadLinkBlock = createBlock(
    "DamFileDownloadLink",
    z.strictObject({ fileId: z.uuid().optional(), openFileType: z.enum(["NewTab", "Download"]) }),
);
