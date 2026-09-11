import type { ImporterPipe } from "@dextinity/cms-api";
import { type Connection, type EntityManager, type IDatabaseDriver, Reference } from "@mikro-orm/core";
import type { LoggerService } from "@nestjs/common";
import slugify from "slugify";
import { Transform, type TransformCallback } from "stream";
import { v4 as uuid } from "uuid";

import { ProductCategory } from "./entities/product-category.entity";
import type { ProductImporterInput } from "./product-importer.input";

type RawProductData = Omit<ProductImporterInput, "category"> & {
    category: string;
};

export class ProductPrePersistPipe implements ImporterPipe {
    constructor(private readonly em: EntityManager<IDatabaseDriver<Connection>>) {}

    getPipe(logger: LoggerService) {
        return new ProductPrePersist(this.em, logger);
    }
}

class ProductPrePersist extends Transform {
    private persistedEntitiesAmount: number;

    constructor(
        private readonly em: EntityManager<IDatabaseDriver<Connection>>,
        private readonly logger: LoggerService,
    ) {
        super({ writableObjectMode: true, objectMode: true });
        this.persistedEntitiesAmount = 0;
    }

    getPersistedEntitiesAmount() {
        return this.persistedEntitiesAmount;
    }

    async _transform(
        inputDataAndMetadata: { data: RawProductData; metadata: Record<string, unknown> },
        encoding: BufferEncoding,
        callback: TransformCallback,
    ) {
        try {
            const { data } = inputDataAndMetadata;
            const slug = slugify(`${data.category}`, { lower: true });

            const categoryData = {
                id: uuid(),
                title: data.category,
                slug,
                position: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const category = await this.em.upsert(ProductCategory, categoryData, {
                onConflictFields: ["slug"],
                onConflictAction: "merge",
                onConflictExcludeFields: ["id"],
            });

            const outputData = { ...inputDataAndMetadata, data: { ...data, category: Reference.create(category) } };

            this.push(outputData);
        } catch (error: unknown) {
            await this.logger.error(`Error persisting Data (prePersist): ${error}`);
            if (error instanceof Error) {
                callback(error);
            } else {
                callback(new Error(`An unknown error occurred: ${error}`));
            }
        }

        callback();
    }
}
