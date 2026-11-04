import type { LoggerService } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { Transform as StreamTransform, type TransformCallback } from "stream";

import type { ImporterInputClass } from "../../importer-input.type";
import type { ImporterPipe, PipeData, PipeMetadata } from "../importer-pipe.type";

export class DataTransformerPipe implements ImporterPipe {
    constructor(private readonly inputClass: ImporterInputClass) {}

    getPipe(runLogger: LoggerService) {
        return new DataTransformer(runLogger, this.inputClass);
    }
}

class DataTransformer extends StreamTransform {
    constructor(
        private readonly logger: LoggerService,
        private readonly inputClass: ImporterInputClass,
    ) {
        super({ writableObjectMode: true, objectMode: true });
    }

    async _transform(inputData: { data: PipeData; metadata: PipeMetadata }, encoding: BufferEncoding, callback: TransformCallback) {
        try {
            const instance = plainToInstance(this.inputClass, inputData.data) as Record<string, unknown>;
            this.push({ data: instance, metadata: inputData.metadata });
        } catch (error: unknown) {
            await this.logger.error(`Error transforming Data: ${error}`);
            if (error instanceof Error) {
                callback(error);
            } else {
                callback(new Error(`An unknown error occurred: ${error}`));
            }
        }

        callback();
    }
}
