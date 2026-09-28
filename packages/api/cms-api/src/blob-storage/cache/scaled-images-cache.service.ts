import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { createHash } from "crypto";
import { sep } from "path";

import { BlobStorageBackendService } from "../backends/blob-storage-backend.service";
import { BlobStorageConfig } from "../blob-storage.config";
import { BLOB_STORAGE_CONFIG } from "../blob-storage.constants";
import { createHashedPath } from "../utils/create-hashed-path.util";
import { FileCache } from "./dto/file-cache.interface";

@Injectable()
export class ScaledImagesCacheService {
    constructor(
        @Inject(BLOB_STORAGE_CONFIG) private readonly config: BlobStorageConfig,
        @Inject(forwardRef(() => BlobStorageBackendService)) private readonly blobStorageBackendService: BlobStorageBackendService,
    ) {}

    async get(fileIdentifier: string, scaleSettingsCacheKey: string): Promise<FileCache | undefined> {
        const path = [createHashedPath(fileIdentifier), createHash("md5").update(scaleSettingsCacheKey).digest("hex")].join(sep);

        if (await this.blobStorageBackendService.fileExists(this.config.cacheDirectory, path)) {
            const [file, metaData] = await Promise.all([
                this.blobStorageBackendService.getFile(this.config.cacheDirectory, path),
                this.blobStorageBackendService.getFileMetaData(this.config.cacheDirectory, path),
            ]);

            return {
                file,
                metaData,
            };
        }

        return undefined;
    }

    async set(fileIdentifier: string, scaleSettingsCacheKey: string, { file, metaData }: FileCache): Promise<void> {
        if (!(await this.blobStorageBackendService.folderExists(this.config.cacheDirectory))) {
            await this.blobStorageBackendService.createFolder(this.config.cacheDirectory);
        }

        const path = [createHashedPath(fileIdentifier), createHash("md5").update(scaleSettingsCacheKey).digest("hex")].join(sep);
        await this.blobStorageBackendService.createFile(this.config.cacheDirectory, path, file, {
            size: metaData.size,
            contentType: metaData.contentType,
        });
    }

    async delete(fileIdentifier: string, scaleSettingsCacheKey?: string): Promise<void> {
        const fileDirectory = createHashedPath(fileIdentifier);

        if (scaleSettingsCacheKey) {
            const path = [fileDirectory, createHash("md5").update(scaleSettingsCacheKey).digest("hex")].join(sep);
            try {
                await this.blobStorageBackendService.removeFile(this.config.cacheDirectory, path);
            } catch {
                // empty
            }
        } else {
            try {
                await this.blobStorageBackendService.removeFile(this.config.cacheDirectory, fileDirectory);
            } catch {
                // empty
            }
        }
    }
}
