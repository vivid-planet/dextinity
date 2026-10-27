import type { InferResponseType } from "hono/client";

import type { DamApiClient } from "./DamApiProvider.js";

export type DamItem = InferResponseType<DamApiClient["items"]["$get"], 200>["nodes"][number];
export type DamFileItem = Extract<DamItem, { __typename: "DamFile" }>;
export type DamFolderItem = Extract<DamItem, { __typename: "DamFolder" }>;
export type DamFileDetails = InferResponseType<DamApiClient["files"][":id"]["$get"], 200>;
type DamImage = NonNullable<DamFileItem["image"]>;

export const damQueryKeys = {
    all: ["dam"] as const,
    items: (query: object) => ["dam", "items", query] as const,
    folder: (id: string | undefined) => ["dam", "folder", id] as const,
    file: (id: string) => ["dam", "file", id] as const,
};

type DamImageCropArea = DamImage["cropArea"];

function cropSegment(cropArea: DamImageCropArea): string {
    return (
        cropArea.focalPoint === "SMART"
            ? ["crop", cropArea.focalPoint]
            : ["crop", cropArea.width, cropArea.height, cropArea.focalPoint, cropArea.x, cropArea.y]
    ).join(":");
}

/**
 * The URL template of the image with `$resizeWidth` and `$resizeHeight`, like the site's image components expect it.
 *
 * `cropArea` overrides the crop area of the file, e.g. the one of an image block. That only works for preview URLs, which the admin
 * gets (see `createDamApiClient`): the public URLs are signed with the crop area of the file.
 */
export function createImageUrlTemplate(image: Pick<DamImage, "urlTemplate" | "cropArea">, cropArea = image.cropArea): string {
    return image.urlTemplate.replace(/\/crop:[^/]+\//, `/${cropSegment(cropArea)}/`);
}

/** Uses the aspect ratio of the crop area, which the API accepts for every allowed width */
export function createImageUrl(
    image: Pick<DamImage, "urlTemplate" | "width" | "height" | "cropArea">,
    { width, cropArea = image.cropArea }: { width: number; cropArea?: DamImageCropArea },
): string {
    const aspectRatio =
        cropArea.focalPoint === "SMART" || !cropArea.width || !cropArea.height
            ? image.width / image.height
            : (cropArea.width * image.width) / (cropArea.height * image.height);
    return createImageUrlTemplate(image, cropArea)
        .replace("$resizeWidth", String(width))
        .replace("$resizeHeight", String(Math.ceil(width / aspectRatio)));
}
