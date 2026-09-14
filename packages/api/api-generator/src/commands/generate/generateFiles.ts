import console from "node:console";
import { realpathSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";

import {
    CRUD_GENERATOR_METADATA_KEY,
    CRUD_SINGLE_GENERATOR_METADATA_KEY,
    type CrudGeneratorOptions,
    type CrudSingleGeneratorOptions,
} from "@dextinity/cms-api";
import { CLIHelper } from "@mikro-orm/cli";
import type { MikroORM } from "@mikro-orm/core";
import { LazyMetadataStorage } from "@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage.js";
import { format, resolveConfig } from "prettier";

import { buildOptions } from "./generateCrud/build-options";
import { generateCrud } from "./generateCrud/generate-crud";
import { generateCrudSingle } from "./generateCrudSingle/generate-crud-single";
import { writeGeneratedFiles } from "./utils/write-generated-files";
/**
 * Generate mode for the generator.
 *
 * Generates CRUD files for all entities or a specific entity available at file path.
 * @param file
 */
export const generateFiles = async (
    /**
     * File path to the entity for which to generate CRUD files.
     *
     * @default undefined -> generate all entities
     */
    file?: string,
) => {
    let orm: MikroORM | null = null;
    try {
        orm = await CLIHelper.getORM(undefined, undefined, { dbName: "generator" });
    } catch (e) {
        console.warn(e);
    }

    if (orm != null) {
        const writtenFiles: string[] = [];

        const entities = orm.em.getMetadata().getAll();
        LazyMetadataStorage.load();

        for (const name in entities) {
            const entity = entities[name];
            if (!entity.class) {
                // Ignore e.g. relation entities that don't have a class
                continue;
            }
            if (file == null || entity.path === `./${file}`) {
                {
                    const generatorOptions = Reflect.getMetadata(CRUD_GENERATOR_METADATA_KEY, entity.class) as CrudGeneratorOptions | undefined;
                    if (generatorOptions) {
                        console.log(`🚀 start generateCrud for Entity ${entity.path}`);
                        const files = await generateCrud(generatorOptions, entity);
                        const { targetDirectory } = buildOptions(entity, generatorOptions);
                        await writeGeneratedFiles(files, targetDirectory);
                        writtenFiles.push(...files.map((f) => realpathSync(`${f.targetDirectory ?? targetDirectory}/${f.name}`)));
                    }
                }
                {
                    const generatorOptions = Reflect.getMetadata(CRUD_SINGLE_GENERATOR_METADATA_KEY, entity.class) as
                        | CrudSingleGeneratorOptions
                        | undefined;
                    if (generatorOptions) {
                        console.log(`🚀 start generateCrudSingle for Entity ${entity.path}`);
                        const files = await generateCrudSingle(generatorOptions, entity);
                        const { targetDirectory } = buildOptions(entity, generatorOptions);
                        await writeGeneratedFiles(files, targetDirectory);
                        writtenFiles.push(...files.map((f) => realpathSync(`${f.targetDirectory ?? targetDirectory}/${f.name}`)));
                    }
                }
            }
        }
        if (writtenFiles.length > 0) {
            console.log(`Formatting ${writtenFiles.length} generated files...`);
            await Promise.all(
                writtenFiles.map(async (filepath) => {
                    const [content, options] = await Promise.all([readFile(filepath, "utf-8"), resolveConfig(filepath)]);
                    const formatted = await format(content, { ...options, filepath });
                    await writeFile(filepath, formatted);
                }),
            );
        }
    }
};
