import type { StorageMetaData } from "../../backends/blob-storage-backend.interface.js";

export interface FileCache {
    file: NodeJS.ReadableStream;
    metaData: StorageMetaData;
}
