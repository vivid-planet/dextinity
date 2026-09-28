import { Type } from "@mikro-orm/postgresql";
import opentelemetry from "@opentelemetry/api";

import { type Block, type BlockDataInterface, isBlockInputInterface, transformToBlockSave, type TraversableTransformBlockResponse } from "./block";
import { transformToBlockSaveIndex } from "./transformToBlockSaveIndex/transformToBlockSaveIndex";

const tracer = opentelemetry.trace.getTracer("@dextinity/cms-api");

export class RootBlockType extends Type<BlockDataInterface | null, TraversableTransformBlockResponse | null> {
    public block: Block;

    constructor(block: Block) {
        super();
        this.block = block;
    }

    convertToDatabaseValue(value: BlockDataInterface | null): TraversableTransformBlockResponse | null {
        return tracer.startActiveSpan("RootBlockType::convertToDatabaseValue", (span) => {
            span.setAttribute("rootBlock.name", this.block.name);
            if (!value) {
                span.end();
                return null;
            }
            if (!value.transformToSave) {
                span.end();
                if (isBlockInputInterface(value)) {
                    throw new Error("Can't save Block Input directly into database, you need to run transformToBlockData on it");
                } else {
                    throw new Error("Value doesn't look like BlockData");
                }
            }
            const data = transformToBlockSave(value);
            const index = transformToBlockSaveIndex(this.block, value);
            span.end();
            return { data, index };
        });
    }

    convertToJSValue(value: TraversableTransformBlockResponse | null): BlockDataInterface | null {
        return tracer.startActiveSpan("RootBlockType::convertToJSValue", (span) => {
            span.setAttribute("rootBlock.name", this.block.name);
            if (!value) {
                span.end();
                return null;
            }
            let ret: BlockDataInterface;
            if (value.data && value.index) {
                ret = this.block.blockDataFactory(value.data);
            } else {
                // legacy data (from pre-index era): do a live migration
                ret = this.block.blockDataFactory(value);
            }
            span.end();
            return ret;
        });
    }

    getColumnType(): string {
        return "json";
    }
}
