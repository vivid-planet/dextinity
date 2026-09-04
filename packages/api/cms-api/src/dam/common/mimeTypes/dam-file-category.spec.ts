import { describe, expect, it } from "vitest";

import { getDamFileCategory } from "./dam-file-category";

describe("getDamFileCategory", () => {
    it("categorizes SVG images separately from pixel images", () => {
        expect(getDamFileCategory("image/svg+xml")).toBe("svgImage");
    });

    it.each(["image/jpeg", "image/png", "image/webp", "image/gif", "image/vnd.microsoft.icon"])("categorizes %s as pixel image", (mimetype) => {
        expect(getDamFileCategory(mimetype)).toBe("pixelImage");
    });

    it.each(["audio/mpeg", "audio/ogg", "audio/wav"])("categorizes %s as audio", (mimetype) => {
        expect(getDamFileCategory(mimetype)).toBe("audio");
    });

    it.each(["video/mp4", "video/quicktime", "video/webm"])("categorizes %s as video", (mimetype) => {
        expect(getDamFileCategory(mimetype)).toBe("video");
    });

    it.each(["application/pdf", "text/plain", "text/vtt", "text/csv", "application/zip"])("categorizes %s as document", (mimetype) => {
        expect(getDamFileCategory(mimetype)).toBe("document");
    });
});
