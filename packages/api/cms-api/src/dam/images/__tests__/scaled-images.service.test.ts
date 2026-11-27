import { text } from "node:stream/consumers";

import { afterEach, describe, expect, it, vi } from "vitest";

import type { BlobStorageBackendService } from "../../../blob-storage/backends/blob-storage-backend.service";
import type { FileCache } from "../../../blob-storage/cache/dto/file-cache.interface";
import type { ScaledImagesCacheService } from "../../../blob-storage/cache/scaled-images-cache.service";
import { FocalPoint } from "../../../file-utils/focal-point.enum";
import { ImgproxyBuilder } from "../../../imgproxy/imgproxy.builder";
import { Extension } from "../../../imgproxy/imgproxy.enum";
import type { ImgproxyService } from "../../../imgproxy/imgproxy.service";
import type { DamConfig } from "../../dam.config";
import type { FileInterface } from "../../files/entities/file.entity";
import type { ImageCropArea } from "../entities/image-crop-area.entity";
import { ScaledImagesService } from "../scaled-images.service";

const file = {
    id: "11111111-1111-1111-1111-111111111111",
    name: "photo.png",
    mimetype: "image/png",
    contentHash: "0123456789abcdef0123456789abcdef",
    image: { width: 4000, height: 2000, cropArea: { focalPoint: FocalPoint.SMART } },
} as FileInterface;

const smartParams = {
    cropArea: { focalPoint: FocalPoint.SMART } as ImageCropArea,
    focalPoint: FocalPoint.SMART,
    resizeWidth: 640,
    resizeHeight: 320,
};

function createService({ cached }: { cached?: FileCache } = {}) {
    const cacheService = {
        get: vi.fn().mockResolvedValue(cached),
        set: vi.fn(async (_fileIdentifier: string, _cacheKey: string, { file }: FileCache) => {
            await text(file);
        }),
    };
    const imgproxyService = {
        builder: () => new ImgproxyBuilder(80),
        getSignedUrl: (path: string) => `http://imgproxy${path}`,
    } as unknown as ImgproxyService;
    const blobStorageBackendService = { getBackendFilePathPrefix: () => "" } as unknown as BlobStorageBackendService;

    const service = new ScaledImagesService(
        { filesDirectory: "files" } as DamConfig,
        imgproxyService,
        cacheService as unknown as ScaledImagesCacheService,
        blobStorageBackendService,
    );
    return { service, cacheService };
}

function mockFetch(response: Response) {
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

describe("ScaledImagesService.getScaledImage", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("requests the image from imgproxy in the given format and stores it in the cache", async () => {
        const fetchMock = mockFetch(new Response("image-bytes", { headers: { "content-length": "11", "content-type": "image/jpeg" } }));
        const { service, cacheService } = createService();

        const scaledImage = await service.getScaledImage(file, smartParams, Extension.JPG);
        const body = await text(scaledImage.body);
        await scaledImage.cacheWrite;

        expect(fetchMock.mock.calls[0][0]).toContain("/crop:4000:2000:sm/resize:auto:640:0:0/format:jpg/");
        expect(scaledImage).toMatchObject({ status: 200, contentType: "image/jpeg", contentLength: 11 });
        expect(body).toBe("image-bytes");
        expect(cacheService.set).toHaveBeenCalledWith(file.contentHash, expect.any(String), {
            file: expect.anything(),
            metaData: { size: 11, contentType: "image/jpeg" },
        });
    });

    it("returns a cached image without requesting imgproxy", async () => {
        const fetchMock = mockFetch(new Response());
        const cachedFile = { pipe: vi.fn() } as unknown as NodeJS.ReadableStream;
        const { service } = createService({ cached: { file: cachedFile, metaData: { size: 1000, contentType: "image/png" } } });

        const scaledImage = await service.getScaledImage(file, smartParams, Extension.PNG);

        expect(fetchMock).not.toHaveBeenCalled();
        expect(scaledImage).toEqual({ status: 200, contentType: "image/png", contentLength: 1000, body: cachedFile });
    });

    it("passes on an error response of imgproxy without caching it", async () => {
        mockFetch(new Response("not found", { status: 404, headers: { "content-length": "9", "content-type": "text/plain" } }));
        const { service, cacheService } = createService();

        const scaledImage = await service.getScaledImage(file, smartParams, Extension.PNG);

        expect(scaledImage.status).toBe(404);
        expect(scaledImage.cacheWrite).toBeUndefined();
        expect(cacheService.set).not.toHaveBeenCalled();
    });
});
