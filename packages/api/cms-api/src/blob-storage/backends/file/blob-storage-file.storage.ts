import * as fs from "fs";
import * as path from "path";
import { type Readable, Stream } from "stream";

import type { BlobStorageBackendInterface, CreateFileOptions, StorageMetaData } from "../blob-storage-backend.interface";
import type { BlobStorageFileConfig } from "./blob-storage-file.config";

export class BlobStorageFileStorage implements BlobStorageBackendInterface {
    private readonly headersFile = "headers.json";
    private readonly path: string;

    constructor(config: BlobStorageFileConfig["file"]) {
        this.path = path.resolve(config.path);
    }

    async folderExists(folderName: string): Promise<boolean> {
        try {
            await fs.promises.access(`${this.path}/${folderName}`);
        } catch {
            return false;
        }

        return true;
    }

    async createFolder(folderName: string): Promise<void> {
        await fs.promises.mkdir(`${this.path}/${folderName}`, { recursive: true });
    }

    async removeFolder(folderName: string): Promise<void> {
        await fs.promises.rm(`${this.path}/${folderName}`, { recursive: true, force: true });
    }

    async fileExists(folderName: string, fileName: string): Promise<boolean> {
        if (!(await this.folderExists(`${folderName}/${path.dirname(fileName)}`))) {
            await this.createFolder(`${folderName}/${path.dirname(fileName)}`);
        }

        try {
            await fs.promises.access(`${this.path}/${folderName}/${fileName}`);
        } catch {
            return false;
        }

        return true;
    }

    async createFile(
        folderName: string,
        fileName: string,
        data: NodeJS.ReadableStream | Buffer | string,
        { contentType }: CreateFileOptions,
    ): Promise<void> {
        if (!(await this.folderExists(`${folderName}/${path.dirname(fileName)}`))) {
            await this.createFolder(`${folderName}/${path.dirname(fileName)}`);
        }

        await Promise.all([
            new Promise<void>((resolve, reject) => {
                const stream = fs.createWriteStream(`${this.path}/${folderName}/${fileName}`);
                stream.on("error", reject);
                stream.on("finish", resolve);

                if (typeof data === "string") {
                    fs.createReadStream(data).pipe(stream);
                } else if (data instanceof Stream) {
                    data.pipe(stream);
                } else {
                    stream.write(data);
                    stream.end();
                }
            }),
            await fs.promises.writeFile(
                `${this.path}/${folderName}/${fileName}-${this.headersFile}`,
                JSON.stringify({ "content-type": contentType }),
                {
                    encoding: "utf-8",
                },
            ),
        ]);
    }

    async getFile(folderName: string, fileName: string): Promise<Readable> {
        return fs.createReadStream(`${this.path}/${folderName}/${fileName}`);
    }

    async getPartialFile(folderName: string, fileName: string, offset: number, length: number): Promise<Readable> {
        return fs.createReadStream(`${this.path}/${folderName}/${fileName}`, {
            start: offset,
            end: offset + length - 1,
        });
    }

    async listFiles(folderName: string): Promise<string[]> {
        if (!(await this.folderExists(folderName))) {
            return [];
        }

        const basePath = path.resolve(this.path);
        const dirPath = path.join(basePath, folderName);
        const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

        return entries.filter((entry) => entry.isFile() && !entry.name.endsWith(`-${this.headersFile}`)).map((entry) => entry.name);
    }

    async removeFile(folderName: string, fileName: string): Promise<void> {
        await Promise.all([
            await fs.promises.rm(`${this.path}/${folderName}/${fileName}`, { force: true }),
            await fs.promises.rm(`${this.path}/${folderName}/${fileName}-${this.headersFile}`, { force: true }),
        ]);
    }

    async getFileMetaData(folderName: string, fileName: string): Promise<StorageMetaData> {
        const stat = await fs.promises.stat(`${this.path}/${folderName}/${fileName}`);
        const rawHeaders = await fs.promises.readFile(`${this.path}/${folderName}/${fileName}-${this.headersFile}`, {
            encoding: "utf-8",
        });
        const headers = JSON.parse(rawHeaders);

        return {
            size: stat.size,
            lastModified: stat.mtime,
            contentType: headers["content-type"],
        };
    }

    getBackendFilePathPrefix(): string {
        return "local:///";
    }
}
