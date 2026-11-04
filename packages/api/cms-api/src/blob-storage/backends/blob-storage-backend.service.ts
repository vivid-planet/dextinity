import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Readable } from "stream";

import { BlobStorageConfig } from "../blob-storage.config";
import { BLOB_STORAGE_CONFIG } from "../blob-storage.constants";
import { BlobStorageFileUploadInterface } from "../dto/blob-storage-file-upload.interface";
import { createHashedPath } from "../utils/create-hashed-path.util";
import { BlobStorageBackendInterface, CreateFileOptions, StorageMetaData } from "./blob-storage-backend.interface";

@Injectable()
export class BlobStorageBackendService implements BlobStorageBackendInterface, OnModuleInit {
    private backend!: BlobStorageBackendInterface;

    constructor(@Inject(BLOB_STORAGE_CONFIG) readonly config: BlobStorageConfig) {}

    async onModuleInit(): Promise<void> {
        if (this.config.backend.driver === "file") {
            const { BlobStorageFileStorage } = await import("./file/blob-storage-file.storage");
            this.backend = new BlobStorageFileStorage(this.config.backend.file);
        } else if (this.config.backend.driver === "azure") {
            const { BlobStorageAzureStorage } = await import("./azure/blob-storage-azure.storage");
            this.backend = new BlobStorageAzureStorage(this.config.backend.azure);
        } else if (this.config.backend.driver === "s3") {
            const { BlobStorageS3Storage } = await import("./s3/blob-storage-s3.storage");
            this.backend = new BlobStorageS3Storage(this.config.backend.s3);
        } else {
            throw new Error(
                `Unsupported blob storage driver: ${(this.config.backend as { driver: string }).driver}. Supported drivers are: file, azure, s3`,
            );
        }
    }

    async folderExists(folderName: string): Promise<boolean> {
        return this.backend.folderExists(folderName);
    }

    async createFolder(folderName: string): Promise<void> {
        return this.backend.createFolder(folderName);
    }

    async removeFolder(folderName: string): Promise<void> {
        return this.backend.removeFolder(folderName);
    }

    async fileExists(folderName: string, fileName: string): Promise<boolean> {
        return this.backend.fileExists(folderName, fileName);
    }

    async createFile(
        folderName: string,
        fileName: string,
        data: NodeJS.ReadableStream | Buffer | string,
        { contentType, ...options }: CreateFileOptions,
    ): Promise<void> {
        return this.backend.createFile(folderName, fileName, data, { ...options, contentType: contentType });
    }

    async getFile(folderName: string, fileName: string): Promise<Readable> {
        return this.backend.getFile(folderName, fileName);
    }

    async getPartialFile(folderName: string, fileName: string, offset: number, length: number): Promise<Readable> {
        return this.backend.getPartialFile(folderName, fileName, offset, length);
    }

    async removeFile(folderName: string, fileName: string): Promise<void> {
        return this.backend.removeFile(folderName, fileName);
    }

    async listFiles(folderName: string): Promise<string[]> {
        return this.backend.listFiles(folderName);
    }

    async getFileMetaData(folderName: string, fileName: string): Promise<StorageMetaData> {
        return this.backend.getFileMetaData(folderName, fileName);
    }

    getBackendFilePathPrefix(): string {
        return this.backend.getBackendFilePathPrefix();
    }

    async upload(file: BlobStorageFileUploadInterface, contentHash: string, folderName: string): Promise<void> {
        if (!(await this.folderExists(folderName))) {
            await this.createFolder(folderName);
        }

        const objectName = createHashedPath(contentHash);

        if (!(await this.fileExists(folderName, objectName))) {
            await this.createFile(folderName, objectName, file.path, {
                size: file.size,
                contentType: file.mimetype,
            });
        }
    }
}
