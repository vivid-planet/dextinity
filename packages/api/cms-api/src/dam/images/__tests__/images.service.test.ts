import { describe, expect, it } from "vitest";

import { FocalPoint } from "../../../file-utils/focal-point.enum";
import type { DamConfig } from "../../dam.config";
import type { FileInterface } from "../../files/entities/file.entity";
import type { ImageCropArea } from "../entities/image-crop-area.entity";
import { ImagesService } from "../images.service";

function createImagesService(config: Partial<DamConfig> = {}) {
    return new ImagesService({ secret: "secret", basePath: "dam", ...config } as DamConfig);
}

function createImageFile({
    name,
    mimetype,
    cropArea = { focalPoint: FocalPoint.SMART },
}: {
    name: string;
    mimetype: string;
    cropArea?: Partial<ImageCropArea>;
}) {
    return {
        id: "11111111-1111-1111-1111-111111111111",
        name,
        mimetype,
        contentHash: "0123456789abcdef0123456789abcdef",
        image: { width: 4000, height: 2000, cropArea },
    } as FileInterface;
}

function cropSegment(urlTemplate: string): string {
    return urlTemplate.split("/").find((segment) => segment.startsWith("crop:")) as string;
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

    it("uses the given crop area", () => {
        const file = createImageFile({ name: "photo.png", mimetype: "image/png" });
        const cropArea = { focalPoint: FocalPoint.CENTER, width: 50, height: 25, x: 10, y: 5 };

        expect(cropSegment(createImagesService().createUrlTemplate({ file, cropArea }, {}))).toBe("crop:50:25:CENTER:10:5");
    });

    it("uses the DAM crop area when none is given", () => {
        const file = createImageFile({
            name: "photo.png",
            mimetype: "image/png",
            cropArea: { focalPoint: FocalPoint.NORTHWEST, width: 80, height: 60, x: 0, y: 0 },
        });

        expect(cropSegment(createImagesService().createUrlTemplate({ file }, {}))).toBe("crop:80:60:NORTHWEST:0:0");
    });

    // Crop areas without dimensions can't be applied and would result in an URL the image route rejects
    it("falls back to the DAM crop area when the given one is unusable", () => {
        const file = createImageFile({
            name: "photo.png",
            mimetype: "image/png",
            cropArea: { focalPoint: FocalPoint.NORTHWEST, width: 80, height: 60, x: 0, y: 0 },
        });
        const cropArea = { focalPoint: FocalPoint.CENTER, x: 86, y: 78 };

        expect(cropSegment(createImagesService().createUrlTemplate({ file, cropArea }, {}))).toBe("crop:80:60:NORTHWEST:0:0");
    });
});
