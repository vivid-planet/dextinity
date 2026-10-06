export type Imports = Array<{
    name: string;
    importPath: string;
    isTypeOnly?: boolean;
}>;

// generate imports code and filter duplicates
export function generateImportsCode(imports: Imports): string {
    const importsNameToPath: Map<string, string> = new Map(); // name -> importPath
    const filteredImports = imports.filter((imp) => {
        if (importsNameToPath.has(imp.name)) {
            if (importsNameToPath.get(imp.name) !== imp.importPath) {
                throw new Error(
                    `Duplicate import name ${imp.name} with different importPaths: ${imp.importPath} vs ${importsNameToPath.get(imp.name)}`,
                );
            } else {
                // duplicate import, skip
                return false;
            }
        }
        importsNameToPath.set(imp.name, imp.importPath);
        return true;
    });

    const importsPathToName: Record<string, Imports> = {};
    for (const imp of filteredImports) {
        if (!importsPathToName[imp.importPath]) {
            importsPathToName[imp.importPath] = [];
        }
        importsPathToName[imp.importPath].push(imp);
    }

    let importsString = "";
    for (const [importPath, pathImports] of Object.entries(importsPathToName)) {
        const sortedImports = pathImports.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
        if (sortedImports.every((imp) => imp.isTypeOnly)) {
            importsString += `import type { ${sortedImports.map((imp) => imp.name).join(", ")} } from "${importPath}";\n`;
        } else {
            const importNames = sortedImports.map((imp) => (imp.isTypeOnly ? `type ${imp.name}` : imp.name));
            importsString += `import { ${importNames.join(", ")} } from "${importPath}";\n`;
        }
    }
    return importsString;
}
