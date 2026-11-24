import { Readable } from "node:stream";

import { describe, expect, it, vi } from "vitest";

import type { DamConfig } from "../../dam/dam.config";
import type { FileInterface } from "../../dam/files/entities/file.entity";
import type { FilesService } from "../../dam/files/files.service";
import type { ImageCropArea } from "../../dam/images/entities/image-crop-area.entity";
import { ImagesService } from "../../dam/images/images.service";
import type { ScaledImage, ScaledImagesService } from "../../dam/images/scaled-images.service";
import { FocalPoint } from "../../file-utils/focal-point.enum";
import { Extension } from "../../imgproxy/imgproxy.enum";
import { DamMailImageFetcherService } from "../dam-mail-image-fetcher.service";
import { MailImageFetchError } from "../mail-image";
import { defaultMailImageLimits } from "../mail-images.config";

const config = { secret: "secret", basePath: "dam", allowedImageSizes: [640, 1280] } as DamConfig;
const limits = { ...defaultMailImageLimits, maxBytesPerImage: 100 };

function createFile(mimetype = "image/jpeg"): FileInterface {
    return {
        id: "11111111-1111-1111-1111-111111111111",
        name: mimetype === "image/png" ? "photo.png" : "photo.jpg",
        mimetype,
        contentHash: "0123456789abcdef0123456789abcdef",
        image: { width: 4000, height: 2000, cropArea: { focalPoint: FocalPoint.SMART } },
    } as FileInterface;
}

function createScaledImage({ status = 200, byteLength = 10, cacheWrite }: { status?: number; byteLength?: number; cacheWrite?: Promise<void> } = {}) {
    return {
        status,
        contentType: "image/jpeg",
        contentLength: byteLength,
        body: Readable.from([Buffer.alloc(byteLength, 1)]),
        cacheWrite,
    } satisfies ScaledImage;
}

function createFetcher({
    file = createFile(),
    hasInvalidLicense = false,
    getScaledImage = vi.fn(async () => createScaledImage()),
}: {
    file?: FileInterface | null;
    hasInvalidLicense?: boolean;
    getScaledImage?: ScaledImagesService["getScaledImage"];
} = {}) {
    const filesService = {
        findOneById: vi.fn().mockResolvedValue(file),
        hasInvalidLicense: vi.fn().mockReturnValue(hasInvalidLicense),
    } as unknown as FilesService;
    const imagesService = new ImagesService(config);
    const fetcher = new DamMailImageFetcherService(config, filesService, imagesService, { getScaledImage } as unknown as ScaledImagesService);
    return { fetcher, imagesService, getScaledImage };
}

function createPath(
    imagesService: ImagesService,
    {
        file = createFile(),
        cropArea = { focalPoint: FocalPoint.SMART },
        resizeWidth = 640,
    }: { file?: FileInterface; cropArea?: ImageCropArea; resizeWidth?: number } = {},
) {
    return imagesService.createUrl({ file, cropArea, resizeWidth, resizeHeight: resizeWidth / 2 });
}

describe("DamMailImageFetcherService.fetchImage", () => {
    it("creates the variant of the URL in the file's basic format", async () => {
        const { fetcher, imagesService, getScaledImage } = createFetcher();
        const cropArea = { focalPoint: FocalPoint.NORTHWEST, width: 50, height: 50, x: 10, y: 20 };

        const image = await fetcher.fetchImage(createPath(imagesService, { cropArea }), limits);

        expect(image).toEqual({ buffer: Buffer.alloc(10, 1), filename: "photo.jpg", contentType: "image/jpeg" });
        expect(getScaledImage).toHaveBeenCalledWith(
            expect.objectContaining({ id: createFile().id }),
            { cropArea, focalPoint: FocalPoint.NORTHWEST, resizeWidth: 640, resizeHeight: 320 },
            Extension.JPG,
            { background: undefined, signal: expect.any(AbortSignal) },
        );
    });

    it.each([
        { case: "a URL with a wrong hash", path: (path: string) => path.replace(/\/images\/[0-9a-f]{40}\//, `/images/${"0".repeat(40)}/`) },
        { case: "a width that the DAM doesn't allow", path: (path: string) => path.replace("resize:640:320", "resize:700:350") },
        { case: "a URL of another route", path: (path: string) => path.replace("/dam/images/", "/dam/files/") },
    ])("returns null for $case", async ({ path }) => {
        const { fetcher, imagesService, getScaledImage } = createFetcher();

        await expect(fetcher.fetchImage(path(createPath(imagesService)), limits)).resolves.toBeNull();
        expect(getScaledImage).not.toHaveBeenCalled();
    });

    it("returns null for a file with an invalid license", async () => {
        const { fetcher, imagesService, getScaledImage } = createFetcher({ hasInvalidLicense: true });

        await expect(fetcher.fetchImage(createPath(imagesService), limits)).resolves.toBeNull();
        expect(getScaledImage).not.toHaveBeenCalled();
    });

    it("re-encodes a PNG over the limit as JPEG on white", async () => {
        const getScaledImage = vi
            .fn()
            .mockResolvedValueOnce(createScaledImage({ byteLength: 200 }))
            .mockResolvedValueOnce(createScaledImage({ byteLength: 50 }));
        const file = createFile("image/png");
        const { fetcher, imagesService } = createFetcher({ file, getScaledImage });

        const image = await fetcher.fetchImage(createPath(imagesService, { file }), limits);

        expect(image).toMatchObject({ filename: "photo.jpg", contentType: "image/jpeg" });
        expect(getScaledImage.mock.calls.map(([, , format, options]) => [format, options.background])).toEqual([
            [Extension.PNG, undefined],
            [Extension.JPG, "ffffff"],
        ]);
    });

    it("returns null for a JPEG over the limit, after its body is read for the cache", async () => {
        const scaledImage = createScaledImage({ byteLength: 200, cacheWrite: Promise.resolve() });
        const { fetcher, imagesService } = createFetcher({ getScaledImage: vi.fn(async () => scaledImage) });

        await expect(fetcher.fetchImage(createPath(imagesService), limits)).resolves.toBeNull();
        expect(scaledImage.body.readableEnded).toBe(true);
    });

    it("returns null for a 4xx of imgproxy", async () => {
        const { fetcher, imagesService } = createFetcher({ getScaledImage: vi.fn(async () => createScaledImage({ status: 404 })) });

        await expect(fetcher.fetchImage(createPath(imagesService), limits)).resolves.toBeNull();
    });

    it.each([500, 429])("throws a MailImageFetchError for a %i of imgproxy", async (status) => {
        const { fetcher, imagesService } = createFetcher({ getScaledImage: vi.fn(async () => createScaledImage({ status })) });

        await expect(fetcher.fetchImage(createPath(imagesService), limits)).rejects.toThrow(MailImageFetchError);
    });

    it("throws a MailImageFetchError when imgproxy can't be reached", async () => {
        const { fetcher, imagesService } = createFetcher({ getScaledImage: vi.fn().mockRejectedValue(new TypeError("fetch failed")) });

        await expect(fetcher.fetchImage(createPath(imagesService), limits)).rejects.toThrow(MailImageFetchError);
    });
});
