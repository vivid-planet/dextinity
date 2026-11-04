import type { Imports } from "./generateImportsCode";

// generated code is one level below config, this function converts relative imports to go one level up
export function convertConfigImport(imprt: { name: string; import: string; defaultImport?: boolean }): Imports[0] {
    let importPath = imprt.import;
    if (importPath.startsWith("../")) {
        importPath = `../${importPath}`;
    } else if (importPath.startsWith("./")) {
        importPath = `.${importPath}`;
    }
    return { name: imprt.name, importPath, defaultImport: imprt.defaultImport };
}
