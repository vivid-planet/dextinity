import { ImporterCsvParseAndTransformPipes, type ImporterDataStream, ImporterEndPipe, type ImporterInputClass } from "@dextinity/cms-api";
import type { EntityManager } from "@mikro-orm/core";
import { Logger } from "@nestjs/common";
import { pipeline, type Readable, Transform } from "stream";

import { ProductImporterInput } from "./product-importer.input";
import { ProductPersistPipe } from "./product-persist.pipe";
import { ProductPrePersistPipe } from "./product-pre-persist.pipe";

export class ProductImporter {
    private readonly logger = new Logger(ProductImporter.name);
    dataStream: Readable | null = null;
    name = "productImport";
    importTarget: ImporterInputClass = ProductImporterInput;
    transformPipes: Transform[] = [];

    constructor(private readonly em: EntityManager) {
        this.logger = new Logger("product-importer");
        const parsePipes = new ImporterCsvParseAndTransformPipes(this.importTarget, this.em).getPipes(this.logger, { encoding: "utf-8" });
        this.transformPipes = [
            ...parsePipes,
            new ProductPrePersistPipe(this.em).getPipe(this.logger),
            new ProductPersistPipe(this.em).getPipe(this.logger),
            new Transform({
                objectMode: true,
                transform: this.displayData.bind(this),
            }),
            new ImporterEndPipe().getPipe(),
        ];
    }

    async init({ dataStream }: { dataStream: ImporterDataStream }): Promise<void> {
        this.dataStream = await dataStream.getDataStreamAndMetadata();
    }

    async executeRun(): Promise<boolean> {
        const dataStream = this.dataStream;
        if (dataStream) {
            return new Promise((resolve, reject) => {
                return pipeline([dataStream, ...this.transformPipes], (error) => {
                    this.transformPipes.map((stream) => stream.end());
                    if (error) {
                        this.logger.error(error);
                        reject(error);
                    } else {
                        this.logger.log("DataStream piped successfully");
                        resolve(true);
                    }
                });
            });
        }
        return false;
    }

    async displayData(row: Record<string, unknown>, encoding: string, callback: (error?: Error | null, data?: object[]) => void): Promise<void> {
        this.logger.log("row: ", JSON.stringify(row, null, 2));
        for (const key in row) {
            if (Object.prototype.hasOwnProperty.call(row, key)) {
                const element = row[key];
                this.logger.log(`${key}: ${element} (${typeof element})`);
            }
        }
        return callback(null);
    }
}
