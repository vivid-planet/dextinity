import { writeGeneratedFile } from "./write-generated-file";

export interface GeneratedFile {
    targetDirectory?: string;
    name: string;
    content: string;
    type: "resolver" | "input" | "filter" | "enum-filter" | "enums-filter" | "sort" | "service" | "args";
}

export async function writeGeneratedFiles(files: GeneratedFile[], targetDirectory: string): Promise<void> {
    for (const file of files) {
        await writeGeneratedFile(`${file.targetDirectory ?? targetDirectory}/${file.name}`, file.content);
    }
}
