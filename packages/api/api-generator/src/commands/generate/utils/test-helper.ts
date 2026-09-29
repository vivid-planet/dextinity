import * as process from "node:process";

import type { Permission } from "@dextinity/cms-api";
import { format, type Options, resolveConfig } from "prettier";
import { Project, type SourceFile } from "ts-morph";

import type { GeneratedFile } from "./write-generated-files";

let options: Options | null;
export async function formatSource(sourceCode: string): Promise<string> {
    if (!options) {
        options = await resolveConfig(process.cwd());
    }

    return format(sourceCode, {
        ...options,
        filepath: "test.ts",
    });
}

export async function formatGeneratedFiles(files: GeneratedFile[]): Promise<GeneratedFile[]> {
    return Promise.all(
        files.map(async (file) => {
            return {
                ...file,
                content: await formatSource(file.content),
            };
        }),
    );
}

export function parseSource(source: string): SourceFile {
    const project = new Project({
        tsConfigFilePath: "./tsconfig.json",
        skipAddingFilesFromTsConfig: true,
    });
    return project.createSourceFile("test.ts", source);
}

export const testPermission = "crud" as Permission;
