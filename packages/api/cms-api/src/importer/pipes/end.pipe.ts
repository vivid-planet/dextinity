import { Transform, type TransformCallback } from "stream";

import type { ImporterPipe } from "./importer-pipe.type";

export class ImporterEndPipe implements ImporterPipe {
    getPipe() {
        return new EndHandler();
    }
}

class EndHandler extends Transform {
    constructor() {
        super({ writableObjectMode: true, objectMode: true });
    }

    _transform(inputData: { chunk: Buffer | string; metadata: Record<string, unknown> }, encoding: BufferEncoding, callback: TransformCallback) {
        callback();
    }
}
