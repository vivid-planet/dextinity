import type { BlobStorageAzureConfig } from "./backends/azure/blob-storage-azure.config";
import type { BlobStorageFileConfig } from "./backends/file/blob-storage-file.config";
import type { BlobStorageS3Config } from "./backends/s3/blob-storage-s3.config";

export interface BlobStorageConfig {
    backend: BlobStorageFileConfig | BlobStorageAzureConfig | BlobStorageS3Config;
    cacheDirectory: string;
}
