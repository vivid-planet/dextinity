import { type BlobHTTPHeaders, BlobServiceClient, RestError, StorageSharedKeyCredential } from "@azure/storage-blob";
import { Logger } from "@nestjs/common";
import { Readable } from "stream";

import type { BlobStorageBackendInterface, CreateFileOptions, StorageMetaData } from "../blob-storage-backend.interface";
import type { BlobStorageAzureConfig } from "./blob-storage-azure.config";

export class BlobStorageAzureStorage implements BlobStorageBackendInterface {
    private readonly logger = new Logger(BlobStorageAzureStorage.name);
    private readonly client: BlobServiceClient;

    constructor(readonly config: BlobStorageAzureConfig["azure"]) {
        const sharedKeyCredential = new StorageSharedKeyCredential(config.accountName, config.accountKey);
        this.client = new BlobServiceClient(`https://${config.accountName}.blob.core.windows.net`, sharedKeyCredential);
    }

    async folderExists(folderName: string): Promise<boolean> {
        return this.client.getContainerClient(folderName).exists();
    }

    async createFolder(folderName: string): Promise<void> {
        const maxNumberOfAttempts = 3;
        let currentAttempt = 1;

        while (currentAttempt <= maxNumberOfAttempts) {
            try {
                await this.client.createContainer(folderName);
                return;
            } catch (error) {
                // When a container is deleted, Azure doesn't allow to create a container with the same name for at least 30 seconds. We therefore
                // retry the creation for three times if the container is being deleted, waiting 30 seconds between each attempt.
                // See https://docs.microsoft.com/en-us/rest/api/storageservices/delete-container#remarks for more information.
                if (error instanceof RestError && error.code === "ContainerBeingDeleted") {
                    this.logger.log(`Container (${folderName}) is being deleted, retrying in 30s`);
                    await this.sleep(30);
                    currentAttempt++;
                    this.logger.log(`Retrying to create container (${folderName})... (Attempt ${currentAttempt} of ${maxNumberOfAttempts})`);
                    continue;
                }

                throw error;
            }
        }
    }

    async removeFolder(folderName: string): Promise<void> {
        await this.client.deleteContainer(folderName);
    }

    async fileExists(folderName: string, fileName: string): Promise<boolean> {
        return this.client.getContainerClient(folderName).getBlobClient(fileName).exists();
    }

    async createFile(
        folderName: string,
        fileName: string,
        data: NodeJS.ReadableStream | Buffer | string,
        { contentType }: CreateFileOptions,
    ): Promise<void> {
        const blobHTTPHeaders: BlobHTTPHeaders = {
            blobContentType: contentType,
        };

        const blockBlobClient = this.client.getContainerClient(folderName).getBlockBlobClient(fileName);
        if (typeof data === "string") {
            await blockBlobClient.uploadFile(data, { blobHTTPHeaders });
        } else if (Buffer.isBuffer(data)) {
            await blockBlobClient.uploadData(data, { blobHTTPHeaders });
        } else {
            await blockBlobClient.uploadStream(new Readable().wrap(data), undefined, undefined, {
                blobHTTPHeaders,
            });
        }
    }

    async getFile(folderName: string, fileName: string): Promise<Readable> {
        const response = await this.client.getContainerClient(folderName).getBlobClient(fileName).download();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return Readable.from(response.readableStreamBody!); // is defined in node.js but not for browsers
    }

    async getPartialFile(folderName: string, fileName: string, offset: number, length: number): Promise<Readable> {
        const response = await this.client.getContainerClient(folderName).getBlobClient(fileName).download(offset, length);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return Readable.from(response.readableStreamBody!); // is defined in node.js but not for browsers
    }

    async listFiles(folderName: string): Promise<string[]> {
        const containerClient = this.client.getContainerClient(folderName);
        const fileNames: string[] = [];

        for await (const blob of containerClient.listBlobsFlat()) {
            fileNames.push(blob.name);
        }

        return fileNames;
    }

    async removeFile(folderName: string, fileName: string): Promise<void> {
        await this.client.getContainerClient(folderName).deleteBlob(fileName);
    }

    async getFileMetaData(folderName: string, fileName: string): Promise<StorageMetaData> {
        const properties = await this.client.getContainerClient(folderName).getBlobClient(fileName).getProperties();

        return {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            size: properties.contentLength!, // is defined in node.js but not for browsers
            etag: properties.etag,
            lastModified: properties.lastModified,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            contentType: properties.contentType!,
        };
    }

    getBackendFilePathPrefix(): string {
        return "abs://";
    }

    private async sleep(s: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, s * 1000);
        });
    }
}
