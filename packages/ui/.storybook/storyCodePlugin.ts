import ts from "typescript";
import type { Plugin } from "vite";

import { childrenPlaceholder } from "../src/storybook/childrenPlaceholder";
import {
    parseStoryFile,
    renderBodyOf,
    storyExportsOf,
    type StyleImport,
    styleImportReferencesIn,
    styleImportsOf,
    styleImportsUsedIn,
} from "./storyFile";

type TextEdit = { start: number; end: number; text: string };

/**
 * Adds parameters to each story with a `render` function:
 *
 * - `renderSource`: the function's body as written in the story file.
 * - `styleSource`: the `.module.scss` files that the body uses.
 */
export function storyCodePlugin(): Plugin {
    return {
        name: "dextinity-ui-story-code",
        enforce: "pre",
        transform(code, id) {
            if (!id.endsWith(".stories.tsx")) {
                return undefined;
            }
            const storyFile = parseStoryFile(code, id);
            const styleImports = styleImportsOf(storyFile);
            const renderSourceFile = parseStoryFile(withRenderSourceEdits(storyFile, styleImports), id);
            const renderSources = new Map(
                storyExportsOf(renderSourceFile).map(({ exportName, storyObject }) => [exportName, renderSourceOf(storyObject, renderSourceFile)]),
            );
            const storyParametersAssignments = storyExportsOf(storyFile).flatMap(({ exportName, storyObject }) => {
                const renderSource = renderSources.get(exportName);
                const renderBody = renderBodyOf(storyObject);
                if (renderSource === undefined || !renderBody) {
                    return [];
                }
                return [storyParametersAssignment(exportName, renderSource, styleImportsUsedIn(renderBody, styleImports))];
            });
            if (storyParametersAssignments.length === 0) {
                return undefined;
            }
            return { code: [code, ...styleImports.map(rawStyleImport), ...storyParametersAssignments].join("\n"), map: null };
        },
    };
}

function withRenderSourceEdits(storyFile: ts.SourceFile, styleImports: StyleImport[]) {
    const edits = [...childrenPlaceholderEdits(storyFile), ...styleImportRenameEdits(storyFile, styleImports)].sort(
        (first, second) => first.start - second.start,
    );
    let editedCode = "";
    let copiedUntil = 0;
    for (const edit of edits) {
        editedCode += storyFile.text.slice(copiedUntil, edit.start) + edit.text;
        copiedUntil = edit.end;
    }
    return editedCode + storyFile.text.slice(copiedUntil);
}

function childrenPlaceholderEdits(storyFile: ts.SourceFile): TextEdit[] {
    return selfClosingElementsSpreadingArgs(storyFile).map((element) => ({
        start: element.attributes.getEnd(),
        end: element.getEnd(),
        text: `>${childrenPlaceholder}</${element.tagName.getText()}>`,
    }));
}

function styleImportRenameEdits(storyFile: ts.SourceFile, styleImports: StyleImport[]): TextEdit[] {
    return styleImportReferencesIn(storyFile, styleImports).map((reference) => ({
        start: reference.getStart(),
        end: reference.getEnd(),
        text: "styles",
    }));
}

function selfClosingElementsSpreadingArgs(node: ts.Node): ts.JsxSelfClosingElement[] {
    const ownMatch = ts.isJsxSelfClosingElement(node) && node.attributes.properties.some(isArgsSpread) ? [node] : [];
    return [...ownMatch, ...node.getChildren().flatMap(selfClosingElementsSpreadingArgs)];
}

function isArgsSpread(attribute: ts.JsxAttributeLike) {
    return ts.isJsxSpreadAttribute(attribute) && ts.isIdentifier(attribute.expression) && attribute.expression.text === "args";
}

function renderSourceOf(storyObject: ts.ObjectLiteralExpression, sourceFile: ts.SourceFile) {
    const body = renderBodyOf(storyObject);
    if (!body) {
        return undefined;
    }
    return ts.isBlock(body) ? blockSourceWithoutReturnKeyword(body, sourceFile) : dedentedSourceOf(unwrapParentheses(body), sourceFile);
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

function rawStyleImport({ importName, modulePath }: StyleImport) {
    return `import ${rawStyleSourceName(importName)} from ${JSON.stringify(`${modulePath}?raw`)};`;
}

function rawStyleSourceName(importName: string) {
    return `rawStyleSourceOf_${importName}`;
}

function storyParametersAssignment(exportName: string, renderSource: string, usedStyleImports: StyleImport[]) {
    const parameters = `${exportName}.parameters`;
    const renderSourceParameter = `renderSource: ${JSON.stringify(renderSource)}`;
    const styleSourceNames = usedStyleImports.map(({ importName }) => rawStyleSourceName(importName));
    const styleSourceParameter = styleSourceNames.length > 0 ? `styleSource: [${styleSourceNames.join(", ")}].join("\\n\\n")` : undefined;
    const assignedParameters = [`...${parameters}`, renderSourceParameter, styleSourceParameter].filter((parameter) => parameter !== undefined);
    return `${parameters} = { ${assignedParameters.join(", ")} };`;
}
