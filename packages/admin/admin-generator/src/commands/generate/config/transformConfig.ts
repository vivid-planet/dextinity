import * as ts from "typescript";

const supportedImportPaths = [
    "[type=grid].columns.filterOperators",
    "[type=grid].columns.block",
    "[type=grid].columns.component",
    // TODO implement in generator "[type=grid].columns.renderCell",

    //support in up to 5 levels of nested fields (eg. fieldSet)
    ...Array.from(Array(5).keys()).map((i) => `[type=form]${".fields".repeat(i + 1)}.validate`),
    ...Array.from(Array(5).keys()).map((i) => `[type=form]${".fields".repeat(i + 1)}.block`),
    ...Array.from(Array(5).keys()).map((i) => `[type=form]${".fields".repeat(i + 1)}.component`),
];
const supportedInlineCodePaths = [
    // TODO implement in generator "[type=grid].columns.filterOperators",
    "[type=grid].columns.renderCell",

    //support in up to 5 levels of nested fields (eg. fieldSet)
    ...Array.from(Array(5).keys()).map((i) => `[type=form]${".fields".repeat(i + 1)}.validate`),
];

// transform the config file to replace all imports and inline code with a { code, imports } object
// this is needed to be able to execute the config file in a node environment
export function transformConfigFile(fileName: string, sourceText: string) {
    const sourceFile = ts.createSourceFile(
        fileName,
        sourceText,
        ts.ScriptTarget.ES2024, // language version
        true, // setParentNodes (useful for some traversals)
    );

    const importedIdentifiers = collectImports(sourceFile);

    function configTransformer(): ts.TransformerFactory<ts.Node> {
        return (context) => {
            const visit = (node: ts.Node, path: string): ts.Node => {
                if (ts.isCallExpression(node)) {
                    if (node.expression.getText() === "injectFormVariables") {
                        if (!path.startsWith("[type=form].fields")) {
                            throw new Error(`injectFormVariables can only be used in form field definitions: ${path}`);
                        }
                        if (node.arguments.length !== 1) {
                            throw new Error(`injectFormVariables expects exactly one argument`);
                        }
                        const injectFormVariablesArg = node.arguments[0];
                        if (!ts.isArrowFunction(injectFormVariablesArg)) {
                            throw new Error(`injectFormVariables expects an arrow function as its argument`);
                        }
                        node = injectFormVariablesArg.body;
                    }
                }

                if (ts.isArrowFunction(node)) {
                    if (supportedInlineCodePaths.includes(path)) {
                        let code = node.getText();
                        if (code.endsWith(",")) {
                            code = code.slice(0, -1);
                        } // for some unknown reason node can contain the trailing comma
                        const imports = findUsedImports(node.body, importedIdentifiers); //find all imports used in the function body
                        // replace inline code with { code, imports } object
                        return ts.factory.createObjectLiteralExpression(
                            [
                                ts.factory.createPropertyAssignment("code", ts.factory.createStringLiteral(code)),
                                ts.factory.createPropertyAssignment(
                                    "imports",
                                    ts.factory.createArrayLiteralExpression(
                                        imports.map((imprt) => {
                                            return ts.factory.createObjectLiteralExpression([
                                                ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(imprt.name)),
                                                ts.factory.createPropertyAssignment("import", ts.factory.createStringLiteral(imprt.import)),
                                                ...(imprt.defaultImport
                                                    ? [ts.factory.createPropertyAssignment("defaultImport", ts.factory.createTrue())]
                                                    : []),
                                            ]);
                                        }),
                                    ),
                                ),
                            ],
                            true,
                        );
                    } else {
                        throw new Error(`Inline Function is not allowed here and calling the function is not supported: ${path}`);
                    }
                } else if (ts.isIdentifier(node)) {
                    const imported = importedIdentifiers.get(node.text);
                    if (imported) {
                        if (supportedImportPaths.includes(path)) {
                            // replace imported identifier with { name, import } object
                            return ts.factory.createObjectLiteralExpression(
                                [
                                    ts.factory.createPropertyAssignment("name", ts.factory.createStringLiteral(node.text)),
                                    ts.factory.createPropertyAssignment("import", ts.factory.createStringLiteral(imported.import)),
                                ],
                                true,
                            );
                        }
                    }
                }

                const transformKinds = [
                    ts.SyntaxKind.Identifier,
                    ts.SyntaxKind.ArrayLiteralExpression,
                    ts.SyntaxKind.ObjectLiteralExpression,
                    ts.SyntaxKind.TaggedTemplateExpression,
                    ts.SyntaxKind.SpreadElement,
                    ts.SyntaxKind.PropertyAssignment,
                    ts.SyntaxKind.ShorthandPropertyAssignment,
                ];
                if (!transformKinds.includes(node.kind)) {
                    // if the node is not one of the transformKinds, stop transformation at this level return it as is
                    return node;
                }
                let newPath = path;
                if (path == "") {
                    // first entry of path is the type, then property names (. separated) are added
                    if (ts.isObjectLiteralExpression(node)) {
                        const typeProperty = getTypePropertyFromObjectLiteral(node);
                        newPath = typeProperty ? `[type=${typeProperty}]` : "";
                    }
                } else {
                    if (ts.isPropertyAssignment(node)) {
                        newPath = `${path}.${node.name.getText()}`;
                    }
                }
                return ts.visitEachChild(
                    node,
                    (child) => {
                        return visit(child, newPath);
                    },
                    context,
                );
            };
            return (node: ts.Node) => ts.visitNode(node, (child) => visit(child, ""));
        };
    }

    const configNode = findConfigNode(sourceFile);
    const transformedConfigNode = ts.transform(configNode, [configTransformer()]).transformed[0];

    const updatedSource = ts.transform(sourceFile, [
        (context) => {
            const visitor: ts.Visitor = (node) => {
                if (node === configNode) {
                    return transformedConfigNode;
                }
                return ts.visitEachChild(node, visitor, context);
            };
            return (node: ts.SourceFile) => ts.visitNode(node, visitor) as ts.SourceFile;
        },
    ]).transformed[0] as ts.SourceFile;

    const printer = ts.createPrinter();
    return printer.printFile(updatedSource);
}

// finds the config node in the source file (=default export, might be wrapped in defineConfig or uses satisfies)
function findConfigNode(sourceFile: ts.SourceFile): ts.Node {
    let ret: ts.Node | undefined;
    sourceFile.forEachChild((node) => {
        if (ts.isExportAssignment(node)) {
            const exportedNode = node.expression;
            if (ts.isCallExpression(exportedNode) && exportedNode.expression.getText() == "defineConfig") {
                //export default defineConfig<Foo>({ ... });
                const args = exportedNode.arguments;
                if (args.length != 1) {
                    throw new Error(`Expected exactly one argument for defineConfig`);
                }
                ret = args[0];
                return false;
            } else if (ts.isSatisfiesExpression(exportedNode)) {
                //export default { ... } satisfies GeneratorConfig<Foo>;
                if (ts.isObjectLiteralExpression(exportedNode.expression)) {
                    ret = exportedNode.expression;
                    return false;
                }
            } else if (ts.isObjectLiteralExpression(exportedNode)) {
                //export default { ... };
                ret = exportedNode;
                return false;
            }
        }
    });
    if (!ret) {
        throw new Error(`No default export found, please export the GeneratorConfig as default, preferrable using defineConfig helper.`);
    }
    return ret;
}

// simple helper that extracts the value of the type property from a object literal ({ type: "grid" } returns "grid")
function getTypePropertyFromObjectLiteral(node: ts.ObjectLiteralExpression) {
    for (const property of node.properties) {
        if (ts.isPropertyAssignment(property)) {
            if (property.name.getText() == "type") {
                const propertyAssignmentInitializer = property.initializer;
                if (ts.isStringLiteral(propertyAssignmentInitializer)) {
                    return propertyAssignmentInitializer.text;
                }
            }
        }
    }
    return null;
}

// visits ast and collects all imports statements in the source file
export function collectImports(rootNode: ts.Node) {
    const importedIdentifiers = new Map<string, { name: string; import: string; defaultImport?: boolean }>();

    function visit(node: ts.Node) {
        if (ts.isImportDeclaration(node) && node.importClause) {
            const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;
            if (node.importClause.namedBindings && ts.isNamedImports(node.importClause.namedBindings)) {
                //named import
                for (const element of node.importClause.namedBindings.elements) {
                    const localName = element.name.text;
                    const originalName = element.propertyName ? element.propertyName.text : localName;
                    importedIdentifiers.set(localName, {
                        name: originalName,
                        import: moduleSpecifier,
                    });
                }
            } else if (node.importClause.name && ts.isIdentifier(node.importClause.name)) {
                //default import
                const localName = node.importClause.name.text;
                importedIdentifiers.set(localName, {
                    defaultImport: true,
                    name: localName,
                    import: moduleSpecifier,
                });
            }
        }
        ts.forEachChild(node, visit);
    }
    visit(rootNode);
    return importedIdentifiers;
}

// visits ast and collects all identifiers that are an import
function findUsedImports(rootNode: ts.Node, importedIdentifiers: Map<string, { name: string; import: string; defaultImport?: boolean }>) {
    const imports: { name: string; import: string; defaultImport?: boolean }[] = [];
    const usedNames = new Set<string>();

    // Collect all identifiers used in the rootNode
    function collectUsedIdentifiers(node: ts.Node) {
        if (ts.isIdentifier(node)) {
            usedNames.add(node.text);
        }
        ts.forEachChild(node, collectUsedIdentifiers);
    }
    collectUsedIdentifiers(rootNode);

    // Match used identifiers to imported ones
    // NOTE: this is not 100% correct as it doesn't recognize cases where a import is overwritten by a local variable. But it is fast.
    for (const name of usedNames) {
        const imported = importedIdentifiers.get(name);
        if (imported) {
            imports.push(imported);
        }
    }

    return imports;
}
