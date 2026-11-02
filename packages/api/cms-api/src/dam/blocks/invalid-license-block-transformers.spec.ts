import { describe, expect, it, vi } from "vitest";

import type { BlockContext } from "../../blocks/block";
import type { FileInterface } from "../files/entities/file.entity";
import type { FilesService } from "../files/files.service";
import { type DamFileDownloadLinkBlockData, OpenFileTypeMethod } from "./dam-file-download-link.block";
import { DamFileDownloadLinkBlockTransformerService } from "./dam-file-download-link-block-transformer.service";
import type { SvgImageBlockData } from "./svg-image.block";
import { SvgImageBlockTransformerService } from "./svg-image-block-transformer.service";
import type { DamVideoBlockData } from "./video/dam-video.block";
import { DamVideoBlockTransformerService } from "./video/dam-video-block-transformer.service";

const context = { includeInvisibleContent: false, previewDamUrls: false } as BlockContext;

function createFile(id: string, alternatives: Array<{ id: string; language: string; type: string; alternative: FileInterface }> = []): FileInterface {
    return {
        id,
        name: `${id}.file`,
        alternativesForThisFile: {
            loadItems: () => Promise.resolve(alternatives.map((a) => ({ ...a, alternative: { loadOrFail: () => Promise.resolve(a.alternative) } }))),
        },
    } as unknown as FileInterface;
}

function createFilesService({ file, invalidLicenseFileIds }: { file: FileInterface; invalidLicenseFileIds: string[] }) {
    return {
        findOneById: vi.fn().mockResolvedValue(file),
        isBlockedByLicense: vi.fn(
            (f: FileInterface, { previewDamUrls }: { previewDamUrls: boolean }) => !previewDamUrls && invalidLicenseFileIds.includes(f.id),
        ),
        createFileUrl: vi.fn((f: FileInterface) => Promise.resolve(`/dam/files/${f.id}`)),
        createFileDownloadUrl: vi.fn((f: FileInterface) => Promise.resolve(`/dam/files/download/${f.id}`)),
    } as unknown as FilesService;
}

describe("SvgImageBlockTransformerService", () => {
    const block = { damFileId: "svg" } as SvgImageBlockData;

    it("renders the file when its license is valid", async () => {
        const transformer = new SvgImageBlockTransformerService(createFilesService({ file: createFile("svg"), invalidLicenseFileIds: [] }));

        expect((await transformer.transformToPlain(block, context)).damFile?.fileUrl).toBe("/dam/files/svg");
    });

    it("renders no file when its license is invalid", async () => {
        const transformer = new SvgImageBlockTransformerService(createFilesService({ file: createFile("svg"), invalidLicenseFileIds: ["svg"] }));

        await expect(transformer.transformToPlain(block, context)).resolves.toEqual({});
    });

    it("keeps the file with an invalid license for the Admin", async () => {
        const transformer = new SvgImageBlockTransformerService(createFilesService({ file: createFile("svg"), invalidLicenseFileIds: ["svg"] }));

        expect((await transformer.transformToPlain(block, { ...context, previewDamUrls: true })).damFile?.id).toBe("svg");
    });
});

describe("DamFileDownloadLinkBlockTransformerService", () => {
    const block = { fileId: "pdf", openFileType: OpenFileTypeMethod.Download } as DamFileDownloadLinkBlockData;

    it("links the file when its license is valid", async () => {
        const transformer = new DamFileDownloadLinkBlockTransformerService(
            createFilesService({ file: createFile("pdf"), invalidLicenseFileIds: [] }),
        );

        expect((await transformer.transformToPlain(block, context)).file?.fileUrl).toBe("/dam/files/download/pdf");
    });

    it("links no file when its license is invalid", async () => {
        const transformer = new DamFileDownloadLinkBlockTransformerService(
            createFilesService({ file: createFile("pdf"), invalidLicenseFileIds: ["pdf"] }),
        );

        await expect(transformer.transformToPlain(block, context)).resolves.toEqual({ openFileType: OpenFileTypeMethod.Download });
    });
});

describe("DamVideoBlockTransformerService", () => {
    const block = { damFileId: "video" } as DamVideoBlockData;
    const video = createFile("video", [
        { id: "caption-en", language: "en", type: "captions", alternative: createFile("captions-en") },
        { id: "caption-de", language: "de", type: "captions", alternative: createFile("captions-de") },
    ]);

    it("renders no video when its license is invalid", async () => {
        const transformer = new DamVideoBlockTransformerService(createFilesService({ file: video, invalidLicenseFileIds: ["video"] }));

        expect((await transformer.transformToPlain(block, context)).damFile).toBeUndefined();
    });

    it("leaves out captions whose license is invalid", async () => {
        const transformer = new DamVideoBlockTransformerService(createFilesService({ file: video, invalidLicenseFileIds: ["captions-de"] }));

        const result = await transformer.transformToPlain(block, context);

        expect(result.damFile).toMatchObject({
            fileUrl: "/dam/files/video",
            captions: [{ id: "caption-en", language: "en", fileUrl: "/dam/files/captions-en" }],
        });
    });
});
