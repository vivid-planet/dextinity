import ts from "typescript";
import type { Plugin } from "vite";

import { childrenPlaceholder } from "../src/storybook/childrenPlaceholder";
import { findProperty, parseStoryFile, storyExportsOf } from "./storyFile";

/**
 * Adds parameters to each story with a `render` function:
 *
 * - `renderSource`: the function's body as written in the story file.
 */
export function storyCodePlugin(): Plugin {
    return {
        name: "dextinity-ui-story-code",
        enforce: "pre",
        transform(code, id) {
            if (!id.endsWith(".stories.tsx")) {
                return undefined;
            }
            const renderSourceFile = parseStoryFile(withChildrenPlaceholders(code, id), id);
            const storyParametersAssignments = storyExportsOf(renderSourceFile).flatMap(({ exportName, storyObject }) => {
                const renderSource = renderSourceOf(storyObject, renderSourceFile);
                return renderSource === undefined ? [] : [storyParametersAssignment(exportName, renderSource)];
            });
            if (storyParametersAssignments.length === 0) {
                return undefined;
            }
            return { code: [code, ...storyParametersAssignments].join("\n"), map: null };
        },
    };
}

function withChildrenPlaceholders(code: string, fileName: string) {
    let codeWithPlaceholders = "";
    let copiedUntil = 0;
    for (const element of selfClosingElementsSpreadingArgs(parseStoryFile(code, fileName))) {
        codeWithPlaceholders += code.slice(copiedUntil, element.attributes.getEnd());
        codeWithPlaceholders += `>${childrenPlaceholder}</${element.tagName.getText()}>`;
        copiedUntil = element.getEnd();
    }
    return codeWithPlaceholders + code.slice(copiedUntil);
}

function selfClosingElementsSpreadingArgs(node: ts.Node): ts.JsxSelfClosingElement[] {
    const ownMatch = ts.isJsxSelfClosingElement(node) && node.attributes.properties.some(isArgsSpread) ? [node] : [];
    return [...ownMatch, ...node.getChildren().flatMap(selfClosingElementsSpreadingArgs)];
}

function isArgsSpread(attribute: ts.JsxAttributeLike) {
    return ts.isJsxSpreadAttribute(attribute) && ts.isIdentifier(attribute.expression) && attribute.expression.text === "args";
}

function renderSourceOf(storyObject: ts.ObjectLiteralExpression, sourceFile: ts.SourceFile) {
    const body = renderBodyOf(findProperty(storyObject, "render"));
    if (!body) {
        return undefined;
    }
    return ts.isBlock(body) ? blockSourceWithoutReturnKeyword(body, sourceFile) : dedentedSourceOf(unwrapParentheses(body), sourceFile);
}

function renderBodyOf(renderProperty: ts.ObjectLiteralElementLike | undefined) {
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

function isFunctionLiteral(expression: ts.Expression): expression is ts.ArrowFunction | ts.FunctionExpression {
    return ts.isArrowFunction(expression) || ts.isFunctionExpression(expression);
}

function blockSourceWithoutReturnKeyword(block: ts.Block, sourceFile: ts.SourceFile) {
    const lastStatement = block.statements.at(-1);
    const returnedExpression = lastStatement && ts.isReturnStatement(lastStatement) ? lastStatement.expression : undefined;
    const statementsBeforeReturn = returnedExpression ? block.statements.slice(0, -1) : block.statements;
    const statementsBeforeReturnSource = statementsBeforeReturn.map((statement) => dedentedSourceOf(statement, sourceFile)).join("\n");
    const returnedExpressionSource = returnedExpression ? dedentedSourceOf(unwrapParentheses(returnedExpression), sourceFile) : "";
    return [statementsBeforeReturnSource, returnedExpressionSource].filter((part) => part !== "").join("\n\n");
}

function unwrapParentheses(expression: ts.Expression): ts.Expression {
    return ts.isParenthesizedExpression(expression) ? unwrapParentheses(expression.expression) : expression;
}

function dedentedSourceOf(node: ts.Node, sourceFile: ts.SourceFile) {
    const indentation = indentationOfLineAt(node.getStart(), sourceFile);
    return node
        .getText(sourceFile)
        .split("\n")
        .map((textLine) => (textLine.startsWith(indentation) ? textLine.slice(indentation.length) : textLine))
        .join("\n");
}

function indentationOfLineAt(position: number, sourceFile: ts.SourceFile) {
    const { line } = sourceFile.getLineAndCharacterOfPosition(position);
    const textBeforePosition = sourceFile.text.slice(sourceFile.getLineStarts()[line], position);
    return textBeforePosition.slice(0, textBeforePosition.length - textBeforePosition.trimStart().length);
}

function storyParametersAssignment(exportName: string, renderSource: string) {
    const parameters = `${exportName}.parameters`;
    return `${parameters} = { ...${parameters}, renderSource: ${JSON.stringify(renderSource)} };`;
}
