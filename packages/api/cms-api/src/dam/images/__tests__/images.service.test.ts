import { describe, expect, it } from "vitest";

import { FocalPoint } from "../../../file-utils/focal-point.enum.js";
import type { DamConfig } from "../../dam.config.js";
import type { FileInterface } from "../../files/entities/file.entity.js";
import { ImagesService } from "../images.service.js";

function createImagesService(config: Partial<DamConfig> = {}) {
    return new ImagesService({ secret: "secret", basePath: "dam", ...config } as DamConfig);
}

function createImageFile({ name, mimetype }: { name: string; mimetype: string }) {
    return {
        id: "11111111-1111-1111-1111-111111111111",
        name,
        mimetype,
        contentHash: "0123456789abcdef0123456789abcdef",
        image: { width: 4000, height: 2000, cropArea: { focalPoint: FocalPoint.SMART } },
    } as FileInterface;
}

describe("ImagesService.createUrlTemplate", () => {
    it("ends with the filename without extension by default", () => {
        const file = createImageFile({ name: "photo.png", mimetype: "image/png" });

        expect(createImagesService().createUrlTemplate({ file }, {})).toMatch(/\/resize:\$resizeWidth:\$resizeHeight\/photo$/);
    });

    it.each([
        { name: "photo.png", mimetype: "image/png", filename: "photo.png" },
        { name: "animation.gif", mimetype: "image/gif", filename: "animation.gif" },
        { name: "photo.jpeg", mimetype: "image/jpeg", filename: "photo.jpg" },
        { name: "scan.tiff", mimetype: "image/tiff", filename: "scan.jpg" },
        { name: "photo.webp", mimetype: "image/webp", filename: "photo.jpg" },
        { name: "report.2026.png", mimetype: "image/png", filename: "report.2026.png" },
    ])("ends with the extension of the format delivered without an Accept header for $mimetype ($name)", ({ name, mimetype, filename }) => {
        const file = createImageFile({ name, mimetype });
        const imagesService = createImagesService({ includeFormatExtensionInImageUrls: true });

        expect(imagesService.createUrlTemplate({ file }, {})).toMatch(new RegExp(`/resize:\\$resizeWidth:\\$resizeHeight/${filename}$`));
    });

    it("adds the extension to preview URLs", () => {
        const file = createImageFile({ name: "photo.png", mimetype: "image/png" });
        const imagesService = createImagesService({ includeFormatExtensionInImageUrls: true });

        expect(imagesService.createUrlTemplate({ file }, { previewDamUrls: true })).toMatch(/^\/dam\/images\/preview\/.*\/photo\.png$/);
    });
});
