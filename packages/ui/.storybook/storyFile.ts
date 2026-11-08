import ts from "typescript";

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

export function findProperty(objectLiteral: ts.ObjectLiteralExpression, name: string) {
    return objectLiteral.properties.find((property) => property.name && ts.isIdentifier(property.name) && property.name.text === name);
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
