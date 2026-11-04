import { promises as fs, readFileSync } from "fs";
import { createJiti } from "jiti";
import { basename, dirname } from "path";

import { transformConfigFile } from "./transformConfig";

type TsConfig = {
    compilerOptions?: {
        paths?: Record<string, string[]>;
    };
};

let alias: Record<string, string> | undefined;

try {
    const tsConfigJson = readFileSync("tsconfig.json", "utf-8");
    const tsConfig = JSON.parse(tsConfigJson) as TsConfig;

    if (tsConfig.compilerOptions?.paths) {
        alias = {};
        for (const [key, value] of Object.entries(tsConfig.compilerOptions.paths)) {
            // Remove glob in alias as it doesn't work.
            // See https://github.com/unjs/jiti/issues/395.
            const cleanedKey = key.replace("/*", "");
            const cleanedValue = value[0].replace("/*", "");
            alias[cleanedKey] = `${process.cwd()}/${cleanedValue}`;
        }
    }
} catch (error) {
    console.warn("Failed to parse TSConfig paths, import aliases might not work. See original error below");
    console.warn(error);
}

const jiti = createJiti(import.meta.url, {
    alias,
    fsCache: false,
    jsx: { runtime: "automatic" },
});

export async function parseConfig(file: string) {
    //1. parse config file using TypeScript Complier Api and transform it (replace imports and functions that can't be executed)
    const transformedConfig = transformConfigFile(file, await fs.readFile(file, "utf-8"));

    //2. save modified config file to temp file
    const tempFileName = `${dirname(file)}/.temp-${basename(file)}`;
    await fs.writeFile(tempFileName, transformedConfig, "utf-8");

    //3. import (=execute) temp modified config file
    let executedConfig;
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        executedConfig = (await jiti.import(tempFileName.replace(/\.tsx?$/, ""), { default: true })) as any;
    } catch (e) {
        console.error(e);
        throw new Error(`Error executing config file ${file}: ${e}`);
    }
    await fs.rm(tempFileName);

    return executedConfig;
}
