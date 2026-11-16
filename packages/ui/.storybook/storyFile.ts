import ts from "typescript";

export type StyleImport = { importName: string; modulePath: string };

export function parseStoryFile(code: string, fileName: string) {
    return ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

export function storyExportsOf(sourceFile: ts.SourceFile) {
    return sourceFile.statements
        .filter(isExportedVariableStatement)
        .flatMap((statement) => statement.declarationList.declarations)
        .map(storyExportOf)
        .filter((storyExport) => storyExport !== undefined);
}

export function renderBodyOf(storyObject: ts.ObjectLiteralExpression) {
    const renderProperty = findProperty(storyObject, "render");
    if (!renderProperty) {
        return undefined;
    }
    if (ts.isMethodDeclaration(renderProperty)) {
        return renderProperty.body;
    }
    if (ts.isPropertyAssignment(renderProperty) && isFunctionLiteral(renderProperty.initializer)) {
        return renderProperty.initializer.body;
    }
    return undefined;
}

/**
 * Returns the default imports of `.module.scss` files in a story file.
 */
export function styleImportsOf(sourceFile: ts.SourceFile): StyleImport[] {
    return sourceFile.statements.filter(ts.isImportDeclaration).flatMap((statement) => {
        const importName = statement.importClause?.name?.text;
        const modulePath = ts.isStringLiteral(statement.moduleSpecifier) ? statement.moduleSpecifier.text : "";
        return importName && modulePath.endsWith(".module.scss") ? [{ importName, modulePath }] : [];
    });
}

/**
 * Returns the identifiers in a node that read a class name from a style import, such as `styles` in `styles.largeIcon`.
 */
export function styleImportReferencesIn(node: ts.Node, styleImports: StyleImport[]): ts.Identifier[] {
    const ownMatch = isStyleImportReference(node, styleImports) ? [node] : [];
    return [...ownMatch, ...node.getChildren().flatMap((child) => styleImportReferencesIn(child, styleImports))];
}

/**
 * Returns the style imports that a node reads class names from.
 */
export function styleImportsUsedIn(node: ts.Node, styleImports: StyleImport[]) {
    const usedImportNames = new Set(styleImportReferencesIn(node, styleImports).map((reference) => reference.text));
    return styleImports.filter((styleImport) => usedImportNames.has(styleImport.importName));
}

function isStyleImportReference(node: ts.Node, styleImports: StyleImport[]): node is ts.Identifier {
    return (
        ts.isIdentifier(node) &&
        styleImports.some((styleImport) => styleImport.importName === node.text) &&
        ts.isPropertyAccessExpression(node.parent) &&
        node.parent.expression === node
    );
}

function findProperty(objectLiteral: ts.ObjectLiteralExpression, name: string) {
    return objectLiteral.properties.find((property) => property.name && ts.isIdentifier(property.name) && property.name.text === name);
}

function isFunctionLiteral(expression: ts.Expression): expression is ts.ArrowFunction | ts.FunctionExpression {
    return ts.isArrowFunction(expression) || ts.isFunctionExpression(expression);
}

function isExportedVariableStatement(statement: ts.Statement): statement is ts.VariableStatement {
    return ts.isVariableStatement(statement) && (statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false);
}

function storyExportOf(declaration: ts.VariableDeclaration) {
    const storyObject = declaration.initializer && unwrapStoryObject(declaration.initializer);
    if (!ts.isIdentifier(declaration.name) || !storyObject) {
        return undefined;
    }
    return { exportName: declaration.name.text, storyObject };
}

function unwrapStoryObject(expression: ts.Expression): ts.ObjectLiteralExpression | undefined {
    if (ts.isObjectLiteralExpression(expression)) {
        return expression;
    }
    if (ts.isSatisfiesExpression(expression) || ts.isParenthesizedExpression(expression)) {
        return unwrapStoryObject(expression.expression);
    }
    return undefined;
}
