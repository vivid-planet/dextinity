import { EntityManager, type EventArgs, MikroORM } from "@mikro-orm/postgresql";
import { Test, type TestingModule } from "@nestjs/testing";
import { addSeconds } from "date-fns";
import { Readable } from "stream";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BlobStorageBackendService } from "../blob-storage/backends/blob-storage-backend.service.js";
import { FileUpload } from "./entities/file-upload.entity.js";
import { FileUploadExpirationSubscriber } from "./file-upload-expiration.subscriber.js";
import type { FileUploadsConfig } from "./file-uploads.config.js";
import { FILE_UPLOADS_CONFIG } from "./file-uploads.constants.js";
import { FileUploadsService } from "./file-uploads.service.js";

const mockBlobStorageBackendService = {
    upload: vi.fn(),
    fileExists: vi.fn(),
    getFile: vi.fn(),
    removeFile: vi.fn(),
};

const mockEntityManager = {
    create: vi.fn(),
    persist: vi.fn(),
    getEventManager: vi.fn().mockReturnValue({
        registerSubscriber: vi.fn(),
    }),
    remove: vi.fn(),
    flush: vi.fn(),
    fork: vi.fn(),
    count: vi.fn(),
    find: vi.fn(),
};
mockEntityManager.fork.mockReturnValue(mockEntityManager);

// @CreateRequestContext() on deleteExpiredFiles() requires a real MikroORM instance
const mockOrm = Object.assign(Object.create(MikroORM.prototype), { em: mockEntityManager });

const mockConfig: FileUploadsConfig = {
    directory: "test-dir",
    download: {
        secret: "test-secret",
    },
    maxFileSize: 10485760, // 10 MB
    acceptedMimeTypes: ["image/png", "image/jpeg", "application/pdf"],
    expiresIn: 3600, // 1 hour in seconds
};

const fileUpload = {
    id: "mock-uuid",
    name: "testfile.txt",
    size: 123456,
    mimetype: "text/plain",
    contentHash: "abc123def456abc123def456abc123de",
    createdAt: new Date("2023-01-01T00:00:00Z"),
    updatedAt: new Date("2023-01-01T00:00:00Z"),
    expiresAt: addSeconds(new Date("2023-01-01T00:00:00Z"), 3600), // 1 hour from creation
} as FileUpload;

describe("FileUploadsService", () => {
    let service: FileUploadsService;
    let expirationSubscriber: FileUploadExpirationSubscriber;
    let baseDate: Date;

    beforeEach(async () => {
        // Set a fixed base date for consistent testing
        baseDate = new Date("2023-01-01T00:00:00Z");
        vi.useFakeTimers();
        vi.setSystemTime(baseDate);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FileUploadsService,
                { provide: BlobStorageBackendService, useValue: mockBlobStorageBackendService },
                { provide: FILE_UPLOADS_CONFIG, useValue: mockConfig },
                { provide: EntityManager, useValue: mockEntityManager },
                { provide: MikroORM, useValue: mockOrm },
                FileUploadExpirationSubscriber,
            ],
        }).compile();

        service = module.get<FileUploadsService>(FileUploadsService);
        expirationSubscriber = module.get<FileUploadExpirationSubscriber>(FileUploadExpirationSubscriber);

        vi.clearAllMocks();
    });

    describe("getFileContent", () => {
        it("should return file buffer if file exists", async () => {
            const buffer = Buffer.from("test");
            mockBlobStorageBackendService.fileExists.mockResolvedValue(true);
            mockBlobStorageBackendService.getFile.mockResolvedValue(Readable.from([buffer]));

            const result = await service.getFileContent(fileUpload);

            expect(result).toEqual(buffer);
            expect(mockBlobStorageBackendService.fileExists).toHaveBeenCalled();
            expect(mockBlobStorageBackendService.getFile).toHaveBeenCalled();
        });

        it("should throw if file does not exist", async () => {
            mockBlobStorageBackendService.fileExists.mockResolvedValue(false);

            await expect(service.getFileContent(fileUpload)).rejects.toThrow("File not found");
        });
    });

    describe("delete", () => {
        it("should remove the blob if no other file upload has the same content", async () => {
            mockEntityManager.count.mockResolvedValue(0);
            mockBlobStorageBackendService.fileExists.mockResolvedValue(true);

            await service.delete(fileUpload);

            expect(mockEntityManager.count).toHaveBeenCalledWith(FileUpload, { contentHash: fileUpload.contentHash, id: { $ne: fileUpload.id } });
            expect(mockBlobStorageBackendService.removeFile).toHaveBeenCalled();
            expect(mockEntityManager.remove).toHaveBeenCalledWith(fileUpload);
        });

        it("should keep the blob if another file upload has the same content", async () => {
            mockEntityManager.count.mockResolvedValue(1);
            mockBlobStorageBackendService.fileExists.mockResolvedValue(true);

            await service.delete(fileUpload);

            expect(mockBlobStorageBackendService.removeFile).not.toHaveBeenCalled();
            expect(mockEntityManager.remove).toHaveBeenCalledWith(fileUpload);
        });
    });

    describe("deleteExpiredFiles", () => {
        it("should remove a blob shared by expired file uploads only after the last of them is deleted", async () => {
            const firstFileUpload = { ...fileUpload, id: "first" } as FileUpload;
            const secondFileUpload = { ...fileUpload, id: "second" } as FileUpload;
            const storedFileUploads = new Set([firstFileUpload, secondFileUpload]);
            const removedFileUploads = new Set<FileUpload>();

            mockEntityManager.find.mockResolvedValueOnce([firstFileUpload, secondFileUpload]);
            mockEntityManager.count.mockImplementation(
                async (_entity: unknown, { contentHash, id }: { contentHash: string; id: { $ne: string } }) =>
                    [...storedFileUploads].filter((upload) => upload.contentHash === contentHash && upload.id !== id.$ne).length,
            );
            mockEntityManager.remove.mockImplementation((upload: FileUpload) => removedFileUploads.add(upload));
            mockEntityManager.flush.mockImplementation(async () => {
                removedFileUploads.forEach((upload) => storedFileUploads.delete(upload));
                removedFileUploads.clear();
            });
            mockBlobStorageBackendService.fileExists.mockResolvedValue(true);

            await service.deleteExpiredFiles();

            expect(storedFileUploads.size).toBe(0);
            expect(mockBlobStorageBackendService.removeFile).toHaveBeenCalledTimes(1);
        });
    });

    describe("getFileContent expiration", () => {
        it("should handle expired files correctly", async () => {
            // Advance time by 1 hour and 1 second (past expiration)
            vi.setSystemTime(addSeconds(baseDate, 3601));

            const buffer = Buffer.from("test");
            mockBlobStorageBackendService.fileExists.mockResolvedValue(true);
            mockBlobStorageBackendService.getFile.mockResolvedValue(Readable.from([buffer]));
            mockBlobStorageBackendService.removeFile.mockResolvedValue(undefined);
            mockEntityManager.count.mockResolvedValue(0);

            // expiration is handled by the subscriber when the entity is loaded
            await expirationSubscriber.onLoad({ entity: fileUpload, em: mockEntityManager, meta: {} } as unknown as EventArgs<FileUpload>);

            expect(mockBlobStorageBackendService.fileExists).toHaveBeenCalled();
            expect(mockBlobStorageBackendService.removeFile).toHaveBeenCalled();
            mockBlobStorageBackendService.fileExists.mockResolvedValue(false);

            await expect(service.getFileContent(fileUpload)).rejects.toThrow("File not found");
        });
    });
});
