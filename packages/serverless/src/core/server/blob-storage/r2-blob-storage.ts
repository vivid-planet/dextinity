import type { BlobStorage, BlobStorageRange } from "./blob-storage.js";

/**
 * The subset of Cloudflare's `R2Bucket` binding the storage uses. Declared here so the library doesn't depend on
 * `@cloudflare/workers-types`, whose globals conflict with the DOM and Node.js types.
 */
export interface R2BucketLike {
    head(key: string): Promise<object | null>;
    get(key: string, options?: { range?: { offset: number; length: number } }): Promise<{ body: ReadableStream } | null>;
    put(key: string, value: Uint8Array<ArrayBuffer>, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
    delete(key: string): Promise<void>;
}

export class R2BlobStorage implements BlobStorage {
    constructor(private readonly bucket: R2BucketLike) {}

    async fileExists(folderName: string, fileName: string): Promise<boolean> {
        return (await this.bucket.head(this.key(folderName, fileName))) !== null;
    }

    async createFile(folderName: string, fileName: string, data: Uint8Array<ArrayBuffer>, { contentType }: { contentType: string }): Promise<void> {
        await this.bucket.put(this.key(folderName, fileName), data, { httpMetadata: { contentType } });
    }

    async getFile(folderName: string, fileName: string, range?: BlobStorageRange): Promise<ReadableStream<Uint8Array> | null> {
        const object = await this.bucket.get(this.key(folderName, fileName), range ? { range } : undefined);
        return object?.body ?? null;
    }

    async removeFile(folderName: string, fileName: string): Promise<void> {
        await this.bucket.delete(this.key(folderName, fileName));
    }

    private key(folderName: string, fileName: string): string {
        return `${folderName}/${fileName}`;
    }
}
