export type Imports = Array<{
    name: string;
    importPath: string;
    isTypeOnly?: boolean;
}>;

// generate imports code and filter duplicates
export function generateImportsCode(imports: Imports): string {
    const importsByName: Map<string, Imports[0]> = new Map();
    for (const imp of imports) {
        const existingImport = importsByName.get(imp.name);
        if (existingImport) {
            if (existingImport.importPath !== imp.importPath) {
                throw new Error(`Duplicate import name ${imp.name} with different importPaths: ${imp.importPath} vs ${existingImport.importPath}`);
            }
            // a value import also covers type usages
            importsByName.set(imp.name, { ...existingImport, isTypeOnly: existingImport.isTypeOnly && imp.isTypeOnly });
        } else {
            importsByName.set(imp.name, imp);
        }
    }

    const importsByPath: Record<string, Imports> = {};
    for (const imp of importsByName.values()) {
        if (!importsByPath[imp.importPath]) {
            importsByPath[imp.importPath] = [];
        }
        importsByPath[imp.importPath].push(imp);
    }

    let importsString = "";
    for (const [importPath, pathImports] of Object.entries(importsByPath)) {
        pathImports.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
        if (pathImports.every((imp) => imp.isTypeOnly)) {
            importsString += `import type { ${pathImports.map((imp) => imp.name).join(", ")} } from "${importPath}";\n`;
        } else {
            importsString += `import { ${pathImports.map((imp) => (imp.isTypeOnly ? `type ${imp.name}` : imp.name)).join(", ")} } from "${importPath}";\n`;
        }
    }
    return importsString;
}
