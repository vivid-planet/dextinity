import type { Readable } from "stream";

import type { PipeMetadata } from "../pipes/importer-pipe.type.js";

export type StreamChunkAndMetadata = {
    chunk: Buffer | string;
    metadata: PipeMetadata;
};
export abstract class ImporterDataStream {
    abstract getDataStreamAndMetadata(): Promise<Readable | null>;
}
