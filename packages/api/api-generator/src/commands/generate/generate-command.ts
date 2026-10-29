import { Command } from "commander";

import { generateFiles } from "./generateFiles.js";
import { watchMode } from "./watchMode/watchMode.js";

type GenerateOptions = {
    watch: boolean;
    file?: string;
};

export const generateCommand = new Command("generate")
    .action(async (options: GenerateOptions) => {
        if (options.watch) {
            await generateFiles();
            console.log("Watching for modified entities...");
            await watchMode();
        } else {
            generateFiles(options.file);
        }
    })
    .option("-f, --file <file>", "path to entity file")
    .option("-w, --watch", "Watch for changes");
