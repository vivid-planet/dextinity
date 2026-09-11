import * as path from "path";

import { generateImportsCode, type Imports } from "../utils/generate-imports-code";
import type { GeneratedFile } from "../utils/write-generated-files";

export function generateEnumFilterDto(type: "enum" | "enums", enumName: string, enumPath: string): GeneratedFile {
    const imports: Imports = [];

    const enumFile = path.basename(enumPath);
    const enumFileDirectory = path.dirname(enumPath);
    let enumImportPath;
    let targetDirectory;
    if (enumFileDirectory.endsWith("/entities")) {
        targetDirectory = `${enumFileDirectory.replace(/\/entities$/, "")}/generated`;
        enumImportPath = `../../entities/${enumFile}`;
    } else {
        targetDirectory = `${enumFileDirectory}/generated`;
        enumImportPath = `../../${enumFile}`;
    }
    targetDirectory = path.normalize(targetDirectory);
    imports.push({ name: enumName, importPath: enumImportPath });
    imports.push({ name: "InputType", importPath: "@nestjs/graphql" });
    let enumFilterOut;
    if (type == "enums") {
        imports.push({ name: "createEnumsFilter", importPath: "@dextinity/cms-api" });
        enumFilterOut = `@InputType()
        export class ${enumName}EnumsFilter extends createEnumsFilter(${enumName}) {}
    `;
    } else {
        imports.push({ name: "createEnumFilter", importPath: "@dextinity/cms-api" });
        enumFilterOut = `@InputType()
        export class ${enumName}EnumFilter extends createEnumFilter(${enumName}) {}
    `;
    }
    const enumNameKebabCase = enumName[0].toLocaleLowerCase() + enumName.slice(1).replace(/[A-Z]/g, (i) => `-${i.toLocaleLowerCase()}`);

    return {
        targetDirectory,
        name: `dto/${enumNameKebabCase}.${type}-filter.ts`,
        content: generateImportsCode(imports) + enumFilterOut,
        type: `${type}-filter`,
    };
}
