import ts from "typescript";

export type StyleImport = { importName: string; modulePath: string };

export function parseStoryFile(code: string, fileName: string) {
    return ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

/**
 * Returns the name of the variable that a story file exports as its default export, the meta.
 */
export function metaNameOf(sourceFile: ts.SourceFile) {
    const defaultExport = sourceFile.statements.find(ts.isExportAssignment)?.expression;
    return defaultExport && ts.isIdentifier(defaultExport) ? defaultExport.text : undefined;
}

export function metaObjectOf(sourceFile: ts.SourceFile) {
    const defaultExport = sourceFile.statements.find(ts.isExportAssignment)?.expression;
    return defaultExport && objectLiteralOf(defaultExport, sourceFile);
}

/**
 * Returns the object literal that an expression is, or that a variable at the top level of the file holds.
 */
export function objectLiteralOf(expression: ts.Expression, sourceFile: ts.SourceFile) {
    if (!ts.isIdentifier(expression)) {
        return unwrapObjectLiteral(expression);
    }
    const declaration = sourceFile.statements
        .filter(ts.isVariableStatement)
        .flatMap((statement) => statement.declarationList.declarations)
        .find((candidate) => ts.isIdentifier(candidate.name) && candidate.name.text === expression.text);
    return declaration?.initializer && unwrapObjectLiteral(declaration.initializer);
}

export function metaComponentNameOf(storyFile: ts.SourceFile) {
    const meta = metaObjectOf(storyFile);
    const componentProperty = meta && findProperty(meta, "component");
    return componentProperty && ts.isPropertyAssignment(componentProperty) && ts.isIdentifier(componentProperty.initializer)
        ? componentProperty.initializer.text
        : undefined;
}

export function storyExportsOf(sourceFile: ts.SourceFile) {
    return sourceFile.statements
        .filter(isExportedVariableStatement)
        .flatMap((statement) => statement.declarationList.declarations)
        .map(storyExportOf)
        .filter((storyExport) => storyExport !== undefined);
}

/**
 * Returns the body of the `render` function that a story renders with: its own, the one of another story in the file that it
 * names (`render: Other.render`) or spreads (`...Other`), or the meta's.
 */
export function renderBodyOf(storyObject: ts.ObjectLiteralExpression, sourceFile: ts.SourceFile): ts.ConciseBody | undefined {
    const declaredRenderBody = declaredRenderBodyOf(storyObject, sourceFile);
    if (declaredRenderBody === "unknown") {
        return undefined;
    }
    if (declaredRenderBody === "meta") {
        const meta = metaObjectOf(sourceFile);
        return meta && meta !== storyObject ? renderBodyOf(meta, sourceFile) : undefined;
    }
    return declaredRenderBody;
}

export function rendersWithDefaultRender(storyObject: ts.ObjectLiteralExpression, sourceFile: ts.SourceFile) {
    const meta = metaObjectOf(sourceFile);
    return declaredRenderBodyOf(storyObject, sourceFile) === "meta" && (!meta || declaredRenderBodyOf(meta, sourceFile) === "meta");
}

function declaredRenderBodyOf(storyObject: ts.ObjectLiteralExpression, sourceFile: ts.SourceFile): ts.ConciseBody | "meta" | "unknown" {
    for (const property of [...storyObject.properties].reverse()) {
        if (ts.isSpreadAssignment(property)) {
            const spreadStory = localStoryObjectOf(property.expression, sourceFile);
            const spreadRenderBody = spreadStory ? declaredRenderBodyOf(spreadStory, sourceFile) : "unknown";
            if (spreadRenderBody !== "meta") {
                return spreadRenderBody;
            }
        } else if (property.name && ts.isIdentifier(property.name) && property.name.text === "render") {
            return ownRenderBodyOf(property, sourceFile);
        }
    }
    return "meta";
}

function ownRenderBodyOf(renderProperty: ts.ObjectLiteralElementLike, sourceFile: ts.SourceFile): ts.ConciseBody | "meta" | "unknown" {
    if (ts.isMethodDeclaration(renderProperty)) {
        return renderProperty.body ?? "unknown";
    }
    if (!ts.isPropertyAssignment(renderProperty)) {
        return "unknown";
    }
    const { initializer } = renderProperty;
    if (isFunctionLiteral(initializer)) {
        return initializer.body;
    }
    const referencedStory =
        ts.isPropertyAccessExpression(initializer) && initializer.name.text === "render" && localStoryObjectOf(initializer.expression, sourceFile);
    return referencedStory ? declaredRenderBodyOf(referencedStory, sourceFile) : "unknown";
}

export function localStoryObjectOf(expression: ts.Expression, sourceFile: ts.SourceFile) {
    if (!ts.isIdentifier(expression)) {
        return undefined;
    }
    return storyExportsOf(sourceFile).find(({ exportName }) => exportName === expression.text)?.storyObject;
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
    return nodesIn(node, (candidate) => isStyleImportReference(candidate, styleImports));
}

/**
 * Returns the style imports that the nodes read class names from.
 */
export function styleImportsUsedIn(nodes: ts.Node[], styleImports: StyleImport[]) {
    const usedImportNames = new Set(nodes.flatMap((node) => styleImportReferencesIn(node, styleImports)).map((reference) => reference.text));
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

export function nodesIn<Match extends ts.Node>(node: ts.Node, isMatch: (candidate: ts.Node) => candidate is Match): Match[] {
    const ownMatch = isMatch(node) ? [node] : [];
    return [...ownMatch, ...node.getChildren().flatMap((child) => nodesIn(child, isMatch))];
}

export function findProperty(objectLiteral: ts.ObjectLiteralExpression, name: string) {
    return objectLiteral.properties.find((property) => property.name && ts.isIdentifier(property.name) && property.name.text === name);
}

function isFunctionLiteral(expression: ts.Expression): expression is ts.ArrowFunction | ts.FunctionExpression {
    return ts.isArrowFunction(expression) || ts.isFunctionExpression(expression);
}

function isExportedVariableStatement(statement: ts.Statement): statement is ts.VariableStatement {
    return ts.isVariableStatement(statement) && (statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false);
}

function storyExportOf(declaration: ts.VariableDeclaration) {
    const storyObject = declaration.initializer && unwrapObjectLiteral(declaration.initializer);
    if (!ts.isIdentifier(declaration.name) || !storyObject) {
        return undefined;
    }
    return { exportName: declaration.name.text, storyObject };
}

function unwrapObjectLiteral(expression: ts.Expression): ts.ObjectLiteralExpression | undefined {
    if (ts.isObjectLiteralExpression(expression)) {
        return expression;
    }
    if (ts.isSatisfiesExpression(expression) || ts.isParenthesizedExpression(expression)) {
        return unwrapObjectLiteral(expression.expression);
    }
    return undefined;
}
