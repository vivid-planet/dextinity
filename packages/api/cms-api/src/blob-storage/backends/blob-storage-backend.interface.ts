import type { Readable } from "stream";

export type StorageMetaData = {
    size: number;
    etag?: string; // TODO: currently unused, consider removing
    lastModified?: Date; // TODO: currently unused, consider removing
    contentType: string;
};

export type CreateFileOptions = {
    size: number;
    contentType: string;
};

export interface BlobStorageBackendInterface {
    folderExists(folderName: string): Promise<boolean>;
    createFolder(folderName: string): Promise<void>;
    removeFolder(folderName: string): Promise<void>;
    fileExists(folderName: string, fileName: string): Promise<boolean>;
    createFile(folderName: string, fileName: string, data: NodeJS.ReadableStream | Buffer | string, options: CreateFileOptions): Promise<void>;
    getFile(folderName: string, fileName: string): Promise<Readable>;
    getPartialFile(folderName: string, fileName: string, offset: number, length: number): Promise<Readable>;
    getFileMetaData(folderName: string, fileName: string): Promise<StorageMetaData>;
    removeFile(folderName: string, fileName: string): Promise<void>;
    listFiles(folderName: string): Promise<string[]>;
    getBackendFilePathPrefix(): string;
}
