import { createReadStream, existsSync, statSync } from "node:fs";
import { Readable } from "node:stream";

import { Logger } from "@nestjs/common";
import path from "path";

import type { StreamChunkAndMetadata } from "./data-stream";
import { FileDataStream, type FileStreamAndMetadata } from "./file-data-stream";

export class ImporterLocalFileDataStream extends FileDataStream {
    private readonly logger = new Logger();
    fileKey: string;

    constructor(fileKey: string) {
        super();
        this.fileKey = fileKey;
    }

    async getDataStreamAndMetadata() {
        const dataStreamAndSize = await this.getFileStreamAndSizeOfLocalFile({ filePath: this.fileKey });
        if (!dataStreamAndSize) {
            return null;
        }
        const fileStreamAndMetadata = await this.getFileStreamResult(dataStreamAndSize);

        return Readable.from(this.generateFileIterator(fileStreamAndMetadata));
    }

    private async *generateFileIterator(fileStreamAndMetadata: FileStreamAndMetadata) {
        const { dataStream, metadata } = fileStreamAndMetadata;

        for await (const chunk of dataStream) {
            const chunkAndMetadata: StreamChunkAndMetadata = { chunk, metadata };
            yield chunkAndMetadata;
        }
    }

    protected async getFileStreamAndSizeOfLocalFile({ filePath, encoding }: { filePath?: string; encoding?: BufferEncoding }) {
        if (!filePath) {
            this.logger.error(`File ${filePath} does not exist`);
            return null;
        }
        // check if file exists
        if (!existsSync(filePath)) {
            this.logger.error(`File ${filePath} does not exist`);
            return null;
        }

        const fileSize = statSync(filePath).size;
        // gzip file must be read as binary, without encoding
        const fileStream = createReadStream(filePath, filePath.endsWith(".gz") && !encoding ? {} : { encoding: encoding || "utf-8" });
        this.logger.log(`Providing fileStreams for local file (${filePath} fileSize: ${fileSize}).`);
        return { fileSize, fileStream, fileName: path.basename(filePath) };
    }
}
