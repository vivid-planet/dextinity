import type { StorageMetaData } from "../../backends/blob-storage-backend.interface";

export interface FileCache {
    file: NodeJS.ReadableStream;
    metaData: StorageMetaData;
}
