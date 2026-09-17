// -------- IMPORTANT --------
// this categorization is duplicated in admin/cms-admin/src/dam/config/damFileCategory.ts
// if you change this file, change the admin file too
// -------- IMPORTANT --------

export type DamFileCategory = "svgImage" | "pixelImage" | "audio" | "video" | "document";

const svgMimetype = "image/svg+xml";

export function getDamFileCategory(mimetype: string): DamFileCategory {
    if (mimetype === svgMimetype) {
        return "svgImage";
    }

    if (mimetype.startsWith("image/")) {
        return "pixelImage";
    }

    if (mimetype.startsWith("audio/")) {
        return "audio";
    }

    if (mimetype.startsWith("video/")) {
        return "video";
    }

    return "document";
}
