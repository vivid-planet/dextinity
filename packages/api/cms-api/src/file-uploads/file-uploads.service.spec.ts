import { getRepositoryToken } from "@mikro-orm/nestjs";
import { EntityManager, type EventArgs, MikroORM } from "@mikro-orm/postgresql";
import { Test, type TestingModule } from "@nestjs/testing";
import { addSeconds } from "date-fns";
import { Readable } from "stream";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { BlobStorageBackendService } from "../blob-storage/backends/blob-storage-backend.service";
import { FileUpload } from "./entities/file-upload.entity";
import { FileUploadExpirationSubscriber } from "./file-upload-expiration.subscriber";
import type { FileUploadsConfig } from "./file-uploads.config";
import { FILE_UPLOADS_CONFIG } from "./file-uploads.constants";
import { FileUploadsService } from "./file-uploads.service";

const mockBlobStorageBackendService = {
    upload: vi.fn(),
    fileExists: vi.fn(),
    getFile: vi.fn(),
    removeFile: vi.fn(),
};

const mockEntityManager = {
    persist: vi.fn(),
    getEventManager: vi.fn().mockReturnValue({
        registerSubscriber: vi.fn(),
    }),
    remove: vi.fn(),
    flush: vi.fn(),
};

const mockOrm = {};

const mockRepository = {
    create: vi.fn(),
};

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
                { provide: getRepositoryToken(FileUpload), useValue: mockRepository },
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

    describe("getFileContent expiration", () => {
        it("should handle expired files correctly", async () => {
            // Advance time by 1 hour and 1 second (past expiration)
            vi.setSystemTime(addSeconds(baseDate, 3601));

            const buffer = Buffer.from("test");
            mockBlobStorageBackendService.fileExists.mockResolvedValue(true);
            mockBlobStorageBackendService.getFile.mockResolvedValue(Readable.from([buffer]));
            mockBlobStorageBackendService.removeFile.mockResolvedValue(undefined);

            // expiration is handled by the subscriber when the entity is loaded
            await expirationSubscriber.onLoad({ entity: fileUpload, em: mockEntityManager, meta: {} } as unknown as EventArgs<FileUpload>);

            expect(mockBlobStorageBackendService.fileExists).toHaveBeenCalled();
            expect(mockBlobStorageBackendService.removeFile).toHaveBeenCalled();
            mockBlobStorageBackendService.fileExists.mockResolvedValue(false);

            await expect(service.getFileContent(fileUpload)).rejects.toThrow("File not found");
        });
    });
});
