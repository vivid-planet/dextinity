import { describe, expect, it } from "vitest";

import { getDamFileCategory } from "./damFileCategory";

describe("getDamFileCategory", () => {
    it("categorizes SVG images separately from pixel images", () => {
        expect(getDamFileCategory("image/svg+xml")).toBe("svgImage");
    });

    it.each(["image/jpeg", "image/png", "image/webp", "image/gif", "image/vnd.microsoft.icon"])("categorizes %s as pixel image", (mimeType) => {
        expect(getDamFileCategory(mimeType)).toBe("pixelImage");
    });

    it.each(["audio/mpeg", "audio/ogg", "audio/wav"])("categorizes %s as audio", (mimeType) => {
        expect(getDamFileCategory(mimeType)).toBe("audio");
    });

    it.each(["video/mp4", "video/quicktime", "video/webm"])("categorizes %s as video", (mimeType) => {
        expect(getDamFileCategory(mimeType)).toBe("video");
    });

    it.each(["application/pdf", "text/plain", "text/vtt", "text/csv", "application/zip"])("categorizes %s as document", (mimeType) => {
        expect(getDamFileCategory(mimeType)).toBe("document");
    });
});
