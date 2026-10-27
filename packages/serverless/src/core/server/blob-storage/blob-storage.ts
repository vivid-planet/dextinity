export interface BlobStorageRange {
    offset: number;
    length: number;
}

/**
 * Storage for binary files. Uses Web Streams instead of Node.js streams, so implementations work on every runtime Hono supports.
 */
export interface BlobStorage {
    fileExists(folderName: string, fileName: string): Promise<boolean>;
    createFile(folderName: string, fileName: string, data: Uint8Array<ArrayBuffer>, options: { contentType: string }): Promise<void>;
    getFile(folderName: string, fileName: string, range?: BlobStorageRange): Promise<ReadableStream<Uint8Array> | null>;
    removeFile(folderName: string, fileName: string): Promise<void>;
}

export function createHashedPath(contentHash: string): string {
    return [contentHash.substring(0, 2), contentHash.substring(2, 4), contentHash].join("/");
}
