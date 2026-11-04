// -------- IMPORTANT --------
// this categorization is a duplicate of api/cms-api/src/dam/common/mimeTypes/dam-file-category.ts
// if you change this file, change the api file too
// -------- IMPORTANT --------

export type DamFileCategory = "svgImage" | "pixelImage" | "audio" | "video" | "document";

const svgMimeType = "image/svg+xml";

export function getDamFileCategory(mimeType: string): DamFileCategory {
    if (mimeType === svgMimeType) {
        return "svgImage";
    }

    if (mimeType.startsWith("image/")) {
        return "pixelImage";
    }

    if (mimeType.startsWith("audio/")) {
        return "audio";
    }

    if (mimeType.startsWith("video/")) {
        return "video";
    }

    return "document";
}
