import type { IncomingMessage } from "http";
import { describe, expect, it, vi } from "vitest";

import { FocalPoint } from "../../../file-utils/focal-point.enum";
import type { DamConfig } from "../../dam.config";
import type { FileInterface } from "../../files/entities/file.entity";
import type { DamFileImage } from "../../files/entities/file-image.entity";
import type { FilesService } from "../../files/files.service";
import type { ImageInterface } from "../dto/image.interface";
import { FileImagesResolver } from "../file-image.resolver";
import { ImagesService } from "../images.service";

function createImageFile(id: string): FileInterface {
    return {
        id,
        name: `${id}.png`,
        mimetype: "image/png",
        contentHash: "0123456789abcdef0123456789abcdef",
        image: { id: `${id}-image`, width: 400, height: 200, cropArea: { focalPoint: FocalPoint.SMART } },
    } as unknown as FileInterface;
}

const original = createImageFile("original");
const fallback = createImageFile("fallback");
const imagesService = new ImagesService({ secret: "secret", basePath: "dam" } as DamConfig);

function createResolver({ hasInvalidLicense, fallbackImage }: { hasInvalidLicense: boolean; fallbackImage: FileInterface | null }) {
    const filesService = {
        findOneByImageId: vi.fn().mockResolvedValue(original),
        findImageToDeliver: vi.fn((image: ImageInterface, { previewDamUrls }: { previewDamUrls: boolean }) =>
            Promise.resolve(!previewDamUrls && hasInvalidLicense ? (fallbackImage ? { file: fallbackImage } : null) : image),
        ),
    } as unknown as FilesService;

    return new FileImagesResolver(imagesService, filesService);
}

const publicRequest = { headers: {} } as IncomingMessage;
const previewRequest = { headers: { "x-preview-dam-urls": "1" } } as unknown as IncomingMessage;
const fileImage = original.image as DamFileImage;

describe("FileImagesResolver", () => {
    it("returns the original image's URL when the license is valid", async () => {
        const resolver = createResolver({ hasInvalidLicense: false, fallbackImage: fallback });

        await expect(resolver.urlTemplate(fileImage, publicRequest)).resolves.toBe(imagesService.createUrlTemplate({ file: original }, {}));
    });

    it("returns the fallback image's URL when the license is invalid", async () => {
        const resolver = createResolver({ hasInvalidLicense: true, fallbackImage: fallback });

        await expect(resolver.urlTemplate(fileImage, publicRequest)).resolves.toBe(imagesService.createUrlTemplate({ file: fallback }, {}));
        await expect(resolver.url(640, 320, fileImage, publicRequest)).resolves.toBe(
            imagesService.createUrl({ file: fallback, resizeWidth: 640, resizeHeight: 320 }),
        );
    });

    it("returns no URL when the license is invalid and no fallback image is set", async () => {
        const resolver = createResolver({ hasInvalidLicense: true, fallbackImage: null });

        await expect(resolver.urlTemplate(fileImage, publicRequest)).resolves.toBeUndefined();
        await expect(resolver.url(640, 320, fileImage, publicRequest)).resolves.toBeUndefined();
    });

    it("keeps returning the original image's preview URL for the Admin", async () => {
        const resolver = createResolver({ hasInvalidLicense: true, fallbackImage: fallback });

        await expect(resolver.urlTemplate(fileImage, previewRequest)).resolves.toBe(
            imagesService.createUrlTemplate({ file: original }, { previewDamUrls: true }),
        );
    });
});
