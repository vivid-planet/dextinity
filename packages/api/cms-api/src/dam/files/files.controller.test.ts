import { HttpStatus } from "@nestjs/common";
import type { Response } from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { HashFileParams } from "./dto/file.params";
import type { FileInterface } from "./entities/file.entity";
import { createFilesController } from "./files.controller";
import type { FilesService } from "./files.service";

const FILE_ID = "11111111-1111-1111-1111-111111111111";
const HASH = "signed-hash";
const CANONICAL_URL = "/dam/files/canonical-url";

interface FilesControllerForTest {
    downloadFile(params: HashFileParams, res: Response, range?: string): Promise<void>;
    hashedFileUrl(params: HashFileParams, res: Response, range?: string): Promise<void>;
}

function createControllerWithMockFilesService(file: FileInterface) {
    const filesService = {
        createHash: vi.fn().mockReturnValue(HASH),
        findOneById: vi.fn().mockResolvedValue(file),
        createFileUrl: vi.fn().mockResolvedValue(CANONICAL_URL),
        createFileDownloadUrl: vi.fn().mockResolvedValue(CANONICAL_URL),
    } as unknown as FilesService;

    const FilesController = createFilesController({ damBasePath: "dam" });
    const controller = new (FilesController as unknown as new (
        damConfig: never,
        filesService: FilesService,
        blobStorageBackendService: never,
        foldersService: never,
        scopeAccessControl: never,
    ) => FilesControllerForTest)(null as never, filesService, null as never, null as never, null as never);

    return { controller, filesService };
}

function createMockResponse(): Response {
    return {
        setHeader: vi.fn(),
        redirect: vi.fn(),
    } as unknown as Response;
}

const handlers = [
    { name: "downloadFile", urlBuilder: "createFileDownloadUrl" as const },
    { name: "hashedFileUrl", urlBuilder: "createFileUrl" as const },
];

describe.each(handlers)("FilesController.$name", ({ name, urlBuilder }) => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    function callHandler(controller: FilesControllerForTest, params: HashFileParams, res: Response) {
        return name === "downloadFile" ? controller.downloadFile(params, res) : controller.hashedFileUrl(params, res);
    }

    it("redirects permanently to the canonical URL when the filename segment is stale", async () => {
        const file = { id: FILE_ID, name: "current-name.pdf", contentHash: "content-hash", scope: undefined } as FileInterface;
        const { controller, filesService } = createControllerWithMockFilesService(file);
        const res = createMockResponse();

        await callHandler(controller, { hash: HASH, contentHash: undefined, fileId: FILE_ID, filename: "old-name" }, res);

        expect(res.redirect).toHaveBeenCalledWith(HttpStatus.MOVED_PERMANENTLY, CANONICAL_URL);
        expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", expect.any(String));
        expect(filesService[urlBuilder]).toHaveBeenCalledWith(file, {});
    });

    it("does not redirect when the filename segment matches the file's current name", async () => {
        const file = { id: FILE_ID, name: "current-name.pdf", contentHash: "content-hash", scope: undefined } as FileInterface;
        const { controller } = createControllerWithMockFilesService(file);
        const res = createMockResponse();

        // Streaming the (mocked-away) blob storage backend throws past this point — that's expected and irrelevant here.
        await callHandler(controller, { hash: HASH, contentHash: undefined, fileId: FILE_ID, filename: "current-name.pdf" }, res).catch(
            () => undefined,
        );

        expect(res.redirect).not.toHaveBeenCalled();
    });

    it("rejects a request whose hash doesn't match the given filename", async () => {
        const file = { id: FILE_ID, name: "current-name.pdf", contentHash: "content-hash", scope: undefined } as FileInterface;
        const { controller } = createControllerWithMockFilesService(file);
        const res = createMockResponse();

        await expect(
            callHandler(controller, { hash: "wrong-hash", contentHash: undefined, fileId: FILE_ID, filename: "current-name.pdf" }, res),
        ).rejects.toThrow("Invalid hash");
        expect(res.redirect).not.toHaveBeenCalled();
    });
});
