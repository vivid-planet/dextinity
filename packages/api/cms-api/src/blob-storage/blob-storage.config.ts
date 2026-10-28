import type { BlobStorageAzureConfig } from "./backends/azure/blob-storage-azure.config.js";
import type { BlobStorageFileConfig } from "./backends/file/blob-storage-file.config.js";
import type { BlobStorageS3Config } from "./backends/s3/blob-storage-s3.config.js";

export interface BlobStorageConfig {
    backend: BlobStorageFileConfig | BlobStorageAzureConfig | BlobStorageS3Config;
    cacheDirectory: string;
}
