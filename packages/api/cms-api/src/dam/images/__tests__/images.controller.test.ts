import { plainToInstance } from "class-transformer";
import type { Response } from "express";
import { describe, expect, it, vi } from "vitest";

import type { ScaledImagesCacheService } from "../../../blob-storage/cache/scaled-images-cache.service";
import { FocalPoint } from "../../../file-utils/focal-point.enum";
import { ImgproxyBuilder } from "../../../imgproxy/imgproxy.builder";
import type { ImgproxyService } from "../../../imgproxy/imgproxy.service";
import type { DamConfig } from "../../dam.config";
import type { FileInterface } from "../../files/entities/file.entity";
import type { FilesService } from "../../files/files.service";
import { HashImageParams } from "../dto/image.params";
import type { ImageCropArea } from "../entities/image-crop-area.entity";
import { createImagesController } from "../images.controller";
import { ImagesService } from "../images.service";

interface ImagesControllerForTest {
    smartCroppedImage(params: HashImageParams, accept: string, res: Response): Promise<void>;
    focusCroppedImage(params: HashImageParams, accept: string, res: Response): Promise<void>;
}

interface MockResponse {
    res: Response;
    writeHead: ReturnType<typeof vi.fn>;
    redirect: ReturnType<typeof vi.fn>;
    setHeader: ReturnType<typeof vi.fn>;
}

const damBasePath = "dam";

function createImagesService(config: Partial<DamConfig> = {}) {
    return new ImagesService({ secret: "secret", basePath: damBasePath, ...config } as DamConfig);
}

function createController({ file, includeFormatExtensionInImageUrls }: { file: FileInterface; includeFormatExtensionInImageUrls: boolean }) {
    const config = { secret: "secret", basePath: damBasePath, filesDirectory: "files", includeFormatExtensionInImageUrls } as DamConfig;
    const filesService = { findOneById: vi.fn().mockResolvedValue(file) } as unknown as FilesService;
    const imgproxyService = { builder: () => new ImgproxyBuilder(80) } as unknown as ImgproxyService;
    const cacheService = {
        get: vi.fn().mockResolvedValue({ file: { pipe: vi.fn() }, metaData: { contentType: "image/png", size: 1000 } }),
    } as unknown as ScaledImagesCacheService;
    const blobStorageBackendService = { getBackendFilePathPrefix: () => "" };

    const ImagesController = createImagesController({ damBasePath });
    return new (ImagesController as unknown as new (...dependencies: unknown[]) => ImagesControllerForTest)(
        config,
        imgproxyService,
        filesService,
        new ImagesService(config),
        cacheService,
        blobStorageBackendService,
        null,
    );
}

function createMockResponse(): MockResponse {
    const writeHead = vi.fn();
    const redirect = vi.fn();
    const setHeader = vi.fn();
    return { res: { vary: vi.fn(), writeHead, redirect, setHeader } as unknown as Response, writeHead, redirect, setHeader };
}

function parseImageUrl(url: string): HashImageParams {
    const match = url.match(/^\/dam\/images\/([^/]+)\/([^/]+)\/([^/]+)\/crop:([^/]+)\/resize:(\d+):(\d+)\/(.+)$/);
    if (!match) {
        throw new Error(`Not a hashed DAM image URL: ${url}`);
    }
    const [, hash, contentHash, fileId, crop, resizeWidth, resizeHeight, filename] = match;
    const cropParts = crop.split(":");
    const cropParams =
        cropParts.length === 1
            ? { focalPoint: cropParts[0] }
            : { cropWidth: cropParts[0], cropHeight: cropParts[1], focalPoint: cropParts[2], cropX: cropParts[3], cropY: cropParts[4] };

    return plainToInstance(HashImageParams, { hash, contentHash, fileId, ...cropParams, resizeWidth, resizeHeight, filename });
}

const routes = [
    {
        handler: "smartCroppedImage" as const,
        storedCropArea: { focalPoint: FocalPoint.SMART },
        requestedCropArea: { focalPoint: FocalPoint.SMART },
        requestedCropSegment: "crop:SMART",
    },
    {
        handler: "focusCroppedImage" as const,
        storedCropArea: { focalPoint: FocalPoint.CENTER, width: 50, height: 50, x: 25, y: 25 },
        requestedCropArea: { focalPoint: FocalPoint.CENTER, width: 33.333, height: 50, x: 12.5, y: 0 },
        requestedCropSegment: "crop:33.333:50:CENTER:12.5:0",
    },
];

describe.each(routes)("ImagesController.$handler", ({ handler, storedCropArea, requestedCropArea, requestedCropSegment }) => {
    function createPngFile(name = "photo.png") {
        return {
            id: "11111111-1111-1111-1111-111111111111",
            name,
            mimetype: "image/png",
            contentHash: "0123456789abcdef0123456789abcdef",
            image: { width: 4000, height: 2000, cropArea: storedCropArea },
        } as FileInterface;
    }

    function createRequestedImageUrl({ file, imagesService }: { file: FileInterface; imagesService: ImagesService }) {
        return imagesService.createUrl({ file, cropArea: requestedCropArea as ImageCropArea, resizeWidth: 640, resizeHeight: 320 });
    }

    describe("with format extensions in image URLs", () => {
        it("permanently redirects a URL without extension to the URL with extension, keeping the requested crop and size", async () => {
            const file = createPngFile();
            const controller = createController({ file, includeFormatExtensionInImageUrls: true });
            const { res, redirect, setHeader, writeHead } = createMockResponse();

            await controller[handler](parseImageUrl(createRequestedImageUrl({ file, imagesService: createImagesService() })), "image/webp", res);

            expect(writeHead).not.toHaveBeenCalled();
            expect(setHeader).toHaveBeenCalledWith("cache-control", "max-age=31536000, s-maxage=86400, public");
            expect(redirect).toHaveBeenCalledWith(301, expect.stringContaining(`/${requestedCropSegment}/resize:640:320/photo.png`));
        });

        it("serves the URL it redirects to", async () => {
            const file = createPngFile();
            const controller = createController({ file, includeFormatExtensionInImageUrls: true });
            const redirectResponse = createMockResponse();
            await controller[handler](
                parseImageUrl(createRequestedImageUrl({ file, imagesService: createImagesService() })),
                "image/webp",
                redirectResponse.res,
            );
            const [, location] = redirectResponse.redirect.mock.calls[0];
            const { res, redirect, writeHead } = createMockResponse();

            await controller[handler](parseImageUrl(location), "image/webp", res);

            expect(redirect).not.toHaveBeenCalled();
            expect(writeHead).toHaveBeenCalledWith(200, expect.anything());
        });

        it("permanently redirects a URL with the filename from before the file was renamed", async () => {
            const imagesService = createImagesService({ includeFormatExtensionInImageUrls: true });
            const urlBeforeRename = createRequestedImageUrl({ file: createPngFile("old-name.png"), imagesService });
            const controller = createController({ file: createPngFile("new-name.png"), includeFormatExtensionInImageUrls: true });
            const { res, redirect } = createMockResponse();

            await controller[handler](parseImageUrl(urlBeforeRename), "image/webp", res);

            expect(redirect).toHaveBeenCalledWith(301, expect.stringMatching(/\/new-name\.png$/));
        });
    });

    describe("without format extensions in image URLs", () => {
        it.each([
            { urlForm: "a URL without extension", includeFormatExtensionInImageUrls: false },
            { urlForm: "a URL with extension", includeFormatExtensionInImageUrls: true },
        ])("serves $urlForm", async ({ includeFormatExtensionInImageUrls }) => {
            const file = createPngFile();
            const controller = createController({ file, includeFormatExtensionInImageUrls: false });
            const { res, redirect, writeHead } = createMockResponse();

            await controller[handler](
                parseImageUrl(createRequestedImageUrl({ file, imagesService: createImagesService({ includeFormatExtensionInImageUrls }) })),
                "image/webp",
                res,
            );

            expect(redirect).not.toHaveBeenCalled();
            expect(writeHead).toHaveBeenCalledWith(200, expect.anything());
        });
    });
});
