import type { BlobStorage, BlobStorageRange } from "./blob-storage.js";

export class MemoryBlobStorage implements BlobStorage {
    readonly files = new Map<string, Uint8Array<ArrayBuffer>>();

    async fileExists(folderName: string, fileName: string): Promise<boolean> {
        return this.files.has(`${folderName}/${fileName}`);
    }

    async createFile(folderName: string, fileName: string, data: Uint8Array<ArrayBuffer>): Promise<void> {
        this.files.set(`${folderName}/${fileName}`, data);
    }

    async getFile(folderName: string, fileName: string, range?: BlobStorageRange): Promise<ReadableStream<Uint8Array> | null> {
        const data = this.files.get(`${folderName}/${fileName}`);
        if (!data) {
            return null;
        }
        const bytes = range ? data.subarray(range.offset, range.offset + range.length) : data;
        return new Blob([bytes]).stream();
    }

    async removeFile(folderName: string, fileName: string): Promise<void> {
        this.files.delete(`${folderName}/${fileName}`);
    }
}
