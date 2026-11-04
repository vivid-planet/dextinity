import type { ReadStream } from "node:fs";

import type { SdkStream } from "@smithy/types";
import type { IncomingMessage } from "http";

import { ImporterDataStream } from "./data-stream";

type FileStream = SdkStream<IncomingMessage> | ReadStream;

interface FileStreamAndSize {
    fileStream: FileStream;
    fileName?: string;
    fileSize?: number;
}

export type FileStreamAndMetadata = {
    dataStream: FileStream;
    metadata: {
        fileName?: string;
        fileSize?: number;
    };
};

export abstract class FileDataStream extends ImporterDataStream {
    getFileStreamResult(fileStreamAndSize: FileStreamAndSize): FileStreamAndMetadata {
        return {
            dataStream: fileStreamAndSize.fileStream,
            metadata: {
                fileName: fileStreamAndSize.fileName,
            },
        };
    }
}
