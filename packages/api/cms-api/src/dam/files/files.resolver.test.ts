import type { IncomingMessage } from "http";
import { describe, expect, it, vi } from "vitest";

import type { ImageInterface } from "../images/dto/image.interface";
import { createFileEntity, type FileInterface } from "./entities/file.entity";
import { createFolderEntity } from "./entities/folder.entity";
import { createFilesResolver } from "./files.resolver";
import type { FilesService } from "./files.service";

interface FilesResolverForTest {
    fileUrl(file: FileInterface, req: IncomingMessage): Promise<string>;
}

const Folder = createFolderEntity();
const FilesResolver = createFilesResolver({ File: createFileEntity({ Folder }), Folder });

const pixelImage = { id: "image", image: {} } as FileInterface;
const pdf = { id: "pdf" } as FileInterface;
const fallbackImage = { id: "fallback", image: {} } as FileInterface;

function createResolver({ hasInvalidLicense, fallback }: { hasInvalidLicense: boolean; fallback: FileInterface | null }) {
    const filesService = {
        findImageToDeliver: vi.fn((image: ImageInterface, { previewDamUrls }: { previewDamUrls: boolean }) =>
            Promise.resolve(!previewDamUrls && hasInvalidLicense ? (fallback ? { file: fallback } : null) : image),
        ),
        createFileUrl: vi.fn((file: FileInterface, { previewDamUrls }: { previewDamUrls: boolean }) =>
            Promise.resolve(`/dam/files/${previewDamUrls ? "preview/" : ""}${file.id}`),
        ),
    } as unknown as FilesService;

    return new (FilesResolver as unknown as new (...dependencies: unknown[]) => FilesResolverForTest)(filesService, null, null, null);
}

const publicRequest = { headers: {} } as IncomingMessage;
const previewRequest = { headers: { "x-preview-dam-urls": "1" } } as unknown as IncomingMessage;

describe("FilesResolver.fileUrl", () => {
    it("returns the file's URL when the license is valid", async () => {
        await expect(createResolver({ hasInvalidLicense: false, fallback: fallbackImage }).fileUrl(pixelImage, publicRequest)).resolves.toBe(
            "/dam/files/image",
        );
    });

    it("returns the fallback image's URL for a pixel image with an invalid license", async () => {
        await expect(createResolver({ hasInvalidLicense: true, fallback: fallbackImage }).fileUrl(pixelImage, publicRequest)).resolves.toBe(
            "/dam/files/fallback",
        );
    });

    it.each([
        { case: "a pixel image without fallback image", file: pixelImage, fallback: null },
        { case: "a file that isn't a pixel image", file: pdf, fallback: fallbackImage },
    ])("returns the file's own URL, which responds with 410 Gone, for $case with an invalid license", async ({ file, fallback }) => {
        await expect(createResolver({ hasInvalidLicense: true, fallback }).fileUrl(file, publicRequest)).resolves.toBe(`/dam/files/${file.id}`);
    });

    it("keeps returning the original file's preview URL for the Admin", async () => {
        await expect(createResolver({ hasInvalidLicense: true, fallback: fallbackImage }).fileUrl(pixelImage, previewRequest)).resolves.toBe(
            "/dam/files/preview/image",
        );
    });
});
