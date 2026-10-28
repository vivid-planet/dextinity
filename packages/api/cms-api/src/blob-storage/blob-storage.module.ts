import { type DynamicModule, Global, Module } from "@nestjs/common";

import { BlobStorageBackendService } from "./backends/blob-storage-backend.service.js";
import type { BlobStorageConfig } from "./blob-storage.config.js";
import { BLOB_STORAGE_CONFIG } from "./blob-storage.constants.js";
import { ScaledImagesCacheService } from "./cache/scaled-images-cache.service.js";

@Global()
@Module({})
export class BlobStorageModule {
    static register(options: BlobStorageConfig): DynamicModule {
        const blobStorageConfigProvider = {
            provide: BLOB_STORAGE_CONFIG,
            useValue: options,
        };

        return {
            module: BlobStorageModule,
            providers: [blobStorageConfigProvider, BlobStorageBackendService, ScaledImagesCacheService],
            exports: [BlobStorageBackendService, blobStorageConfigProvider, ScaledImagesCacheService],
        };
    }
}
