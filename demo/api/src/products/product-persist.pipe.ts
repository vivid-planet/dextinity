import { type BlockDataInterface, DamImageBlock, type ImporterPipe } from "@dextinity/cms-api";
import type { Connection, EntityManager, FilterQuery, IDatabaseDriver, Reference } from "@mikro-orm/core";
import type { LoggerService } from "@nestjs/common";
import { Transform, type TransformCallback } from "stream";
import { v4 as uuid } from "uuid";

import { Product } from "./entities/product.entity";
import type { ProductCategory } from "./entities/product-category.entity";
import { ProductColor } from "./entities/product-color.entity";
import type { ProductImporterInput } from "./product-importer.input";

type ProductData = Omit<ProductImporterInput, "image"> & {
    id: string;
    colors: string;
    category: Reference<ProductCategory>;
    image: BlockDataInterface;
};

export class ProductPersistPipe implements ImporterPipe {
    constructor(private readonly em: EntityManager<IDatabaseDriver<Connection>>) {}

    getPipe(logger: LoggerService) {
        return new ProductPersist(this.em, logger);
    }
}

class ProductPersist extends Transform {
    private persistedEntitiesAmount = 0;

    constructor(
        private readonly em: EntityManager<IDatabaseDriver<Connection>>,
        private readonly logger: LoggerService,
    ) {
        super({ writableObjectMode: true, objectMode: true });
    }

    getPersistedEntitiesAmount() {
        return this.persistedEntitiesAmount;
    }

    async _transform(
        inputDataAndMetadata: { data: ProductData; metadata: Record<string, unknown> },
        encoding: BufferEncoding,
        callback: TransformCallback,
    ) {
        try {
            const { data } = inputDataAndMetadata;
            const { colors: colorString, category, colors: colorCollection, ...productData } = data;

            const updateQuery: FilterQuery<object> | undefined = { slug: data.slug };
            const record = updateQuery ? await this.em.findOne(Product, updateQuery, { fields: ["id"] }) : null;

            productData.image = DamImageBlock.blockInputFactory({
                activeType: "pixelImage",
                attachedBlocks: [
                    {
                        props: {},
                        type: "pixelImage",
                    },
                ],
            }).transformToBlockData();

            // TODO: use upsert
            // const product = await this.em.upsert(Product, productInput, {
            //     onConflictFields: ["slug"],
            //     onConflictAction: "merge",
            //     onConflictExcludeFields: ["id", "createdAt"],
            // });
            if (record) {
                await this.logger.log(`Existing record for ${JSON.stringify(updateQuery)} with id ${record.id} found, updating...`);
                // keeping the id from the input data (in the DataTransformer plainToInstance always creates a new Entity instance, which is populated with the new id)
                data.id = record.id;
                // nativeUpdate is used for performance reasons
                await this.em.nativeUpdate(Product.name, { id: record.id }, { ...productData, category, id: data.id, updatedAt: new Date() });
            } else {
                // in case the id is not provided
                data.id = data?.id || uuid();
                await this.logger.log(
                    `${updateQuery ? `No record for query ${JSON.stringify(updateQuery)} found` : "No query provided"}, inserting with id ${
                        data.id
                    }...`,
                );
                await this.em.insert(Product, {
                    ...productData,
                    id: data.id,
                    category,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });
                await this.logger.log(`Inserted record with id ${data.id}`, false);
            }

            let colorsArray: { hex: string; name: string }[] = [];
            try {
                colorsArray = JSON.parse(colorString);
            } catch {
                await this.logger.warn(`Invalid JSON string for colors: "${colorString}". Defaulting to an empty array.`);
            }

            await this.em.nativeDelete(ProductColor, { product: data.id });

            if (colorsArray.length > 0) {
                const productColors = colorsArray.map((color) => ({
                    id: uuid(),
                    name: color.name,
                    hexCode: color.hex,
                    product: data.id,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }));

                await this.em.insertMany(ProductColor, productColors);
            }

            this.persistedEntitiesAmount++;
            await this.logger.log(`Persisted entities amount: ${this.persistedEntitiesAmount}`);
            // clear entity manager to prevent memory leak
            if (this.persistedEntitiesAmount % 100 === 0) {
                this.em.clear();
            }
            const outputData = inputDataAndMetadata;
            outputData.metadata.persistedEntitiesAmount = this.persistedEntitiesAmount;
            this.push(outputData);
        } catch (error: unknown) {
            await this.logger.error(`Error persisting Data: ${error}`);
            if (error instanceof Error) {
                callback(error);
            } else {
                callback(new Error(`An unknown error occurred: ${error}`));
            }
        }

        callback();
    }
}
