import { Command } from "commander";
import { readFile, writeFile } from "fs/promises";
import { format, resolveConfig } from "prettier";

import type { BlockMeta, BlockMetaField } from "../BlockMeta";

let content = "";

function writeFieldType(field: BlockMetaField, blockNamePostfix: string) {
    if (field.kind === "String") {
        content += "string";

        if (field.array) {
            content += "[]";
        }
    } else if (field.kind === "Number") {
        content += "number";

        if (field.array) {
            content += "[]";
        }
    } else if (field.kind === "Boolean") {
        content += "boolean";

        if (field.array) {
            content += "[]";
        }
    } else if (field.kind === "Json") {
        content += "unknown";

        if (field.array) {
            content += "[]";
        }
    } else if (field.kind === "TipTapRichTextBlock") {
        content += "unknown";
    } else if (field.kind === "Enum") {
        const enumType = `"${field.enum.join('" | "')}"`;
        content += field.array ? `(${enumType})[]` : enumType;
    } else if (field.kind === "Block") {
        content += `${field.block}${blockNamePostfix}`;
    } else if (field.kind === "OneOfBlocks") {
        if (Object.values(field.blocks).length < 1) {
            content += "{}";
        } else {
            content += Object.values(field.blocks)
                .map((i) => {
                    return `${i}${blockNamePostfix}`;
                })
                .join(" | ");
        }
    } else if (field.kind === "NestedObject") {
        content += "{\n";
        field.object.fields.forEach((f) => {
            content += f.name;
            if (f.nullable) {
                content += "?";
            }
            content += ": ";
            writeFieldType(f, blockNamePostfix);
            content += ";\n";
        });
        content += "}\n";
    } else if (field.kind === "NestedObjectList") {
        content += "Array<{\n";
        field.object.fields.forEach((f) => {
            content += f.name;
            if (f.nullable) {
                content += "?";
            }
            content += ": ";
            writeFieldType(f, blockNamePostfix);
            content += ";\n";
        });
        content += "}>\n";
    }
}

type Options = {
    inputs: boolean;
    inputFile: string;
    outputFile: string;
};

const generateAllBlockNames = (blockMeta: BlockMeta[]): string => {
    const uniqueBlockNames = Array.from(new Set(blockMeta.map((block) => block.name))).sort();

    let content = "export type AllBlockNames =";
    uniqueBlockNames.forEach((blockName) => {
        content += ` | "${blockName}"`;
    });
    return content;
};

const generateBlockTypes = new Command("generate-block-types")
    .description("generate block types from block meta")
    .option("--inputs", "include block inputs")
    .option("--input-file <inputFile>", "file to read block meta from", "block-meta.json")
    .option("--output-file <outputFile>", "file to write block types to", "./src/blocks.generated.ts")
    .action(async (options: Options) => {
        const blockMeta = await readFile(options.inputFile).then((fileContents) => JSON.parse(fileContents.toString()) as BlockMeta[]);

        const sortedBlockMeta = blockMeta.sort((a, b) => a.name.localeCompare(b.name));

        sortedBlockMeta.forEach((block) => {
            content += `export interface ${block.name}BlockData {\n`;
            block.fields.forEach((field) => {
                content += field.name;
                if (field.nullable) {
                    content += "?";
                }
                content += ": ";
                writeFieldType(field, "BlockData");
                content += ";\n";
            });
            content += "}\n";
        });

        if (options.inputs) {
            sortedBlockMeta.forEach((block) => {
                content += `export interface ${block.name}BlockInput {\n`;
                block.inputFields.forEach((field) => {
                    content += field.name;
                    if (field.nullable) {
                        content += "?";
                    }
                    content += ": ";
                    writeFieldType(field, "BlockInput");
                    content += ";\n";
                });
                content += "}\n";
            });
        }

        content += generateAllBlockNames(blockMeta);

        const prettierOptions = await resolveConfig(process.cwd());
        content = await format(content, { ...prettierOptions, parser: "typescript" });

        await writeFile(options.outputFile, content);
    });

export { generateBlockTypes };
