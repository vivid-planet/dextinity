import ts from "typescript";
import type { Plugin } from "vite";

import { childrenPlaceholder } from "../src/storybook/childrenPlaceholder";
import {
    metaComponentNameOf,
    parseStoryFile,
    renderBodyOf,
    rendersWithDefaultRender,
    storyExportsOf,
    type StyleImport,
    styleImportReferencesIn,
    styleImportsOf,
    styleImportsUsedIn,
} from "./storyFile";

type TextEdit = { start: number; end: number; text: string };

/**
 * Adds parameters to each story, for the code that its docs show:
 *
 * - `renderSource`: the body of the `render` function that the story renders with, with `useState` in place of the story-only
 *   `useControlledArg`. For a story without one: `meta.component` with `{...args}`.
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
            const storyCodes = storyCodesOf(storyFile);
            if (storyCodes.length === 0) {
                return undefined;
            }
            const rawStyleImports = styleImportsOf(storyFile).map(rawStyleImport);
            return { code: [code, ...rawStyleImports, ...storyCodes.map(storyParametersAssignment)].join("\n"), map: null };
        },
    };
}

type StoryCode = { exportName: string; renderSource: string; usedStyleImports: StyleImport[] };

export function storyCodesOf(storyFile: ts.SourceFile): StoryCode[] {
    const styleImports = styleImportsOf(storyFile);
    const renderSourceFile = parseStoryFile(withRenderSourceEdits(storyFile, styleImports), storyFile.fileName);
    const renderSources = new Map(
        storyExportsOf(renderSourceFile).map(({ exportName, storyObject }) => [exportName, renderSourceOf(storyObject, renderSourceFile)]),
    );
    return storyExportsOf(storyFile).flatMap(({ exportName, storyObject }) => {
        const renderBody = renderBodyOf(storyObject, storyFile);
        const renderSource = renderBody ? renderSources.get(exportName) : defaultRenderSourceOf(storyObject, storyFile);
        if (renderSource === undefined) {
            return [];
        }
        return [{ exportName, renderSource, usedStyleImports: renderBody ? styleImportsUsedIn(renderBody, styleImports) : [] }];
    });
}

function defaultRenderSourceOf(storyObject: ts.ObjectLiteralExpression, storyFile: ts.SourceFile) {
    const componentName = rendersWithDefaultRender(storyObject, storyFile) ? metaComponentNameOf(storyFile) : undefined;
    return componentName && `<${componentName} {...args}>${childrenPlaceholder}</${componentName}>`;
}

function withRenderSourceEdits(storyFile: ts.SourceFile, styleImports: StyleImport[]) {
    const edits = [...childrenPlaceholderEdits(storyFile), ...styleImportRenameEdits(storyFile, styleImports), ...controlledArgEdits(storyFile)].sort(
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

// A reader copies the shown code, which can't import the story-only helper; `useState` keeps the value just as well outside Storybook
function controlledArgEdits(storyFile: ts.SourceFile): TextEdit[] {
    return controlledArgCalls(storyFile).flatMap((call) => {
        const [argsExpression, keyExpression] = call.arguments;
        if (!argsExpression || !keyExpression || !ts.isStringLiteral(keyExpression)) {
            return [];
        }
        return [{ start: call.getStart(), end: call.getEnd(), text: `useState(${argsExpression.getText()}.${keyExpression.text})` }];
    });
}

function controlledArgCalls(node: ts.Node): ts.CallExpression[] {
    const ownMatch = ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "useControlledArg" ? [node] : [];
    return [...ownMatch, ...node.getChildren().flatMap(controlledArgCalls)];
}

function selfClosingElementsSpreadingArgs(node: ts.Node): ts.JsxSelfClosingElement[] {
    const ownMatch = ts.isJsxSelfClosingElement(node) && node.attributes.properties.some(isArgsSpread) ? [node] : [];
    return [...ownMatch, ...node.getChildren().flatMap(selfClosingElementsSpreadingArgs)];
}

function isArgsSpread(attribute: ts.JsxAttributeLike) {
    return ts.isJsxSpreadAttribute(attribute) && ts.isIdentifier(attribute.expression) && attribute.expression.text === "args";
}

function renderSourceOf(storyObject: ts.ObjectLiteralExpression, sourceFile: ts.SourceFile) {
    const body = renderBodyOf(storyObject, sourceFile);
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

function storyParametersAssignment({ exportName, renderSource, usedStyleImports }: StoryCode) {
    const parameters = `${exportName}.parameters`;
    const renderSourceParameter = `renderSource: ${JSON.stringify(renderSource)}`;
    const styleSourceNames = usedStyleImports.map(({ importName }) => rawStyleSourceName(importName));
    const styleSourceParameter = styleSourceNames.length > 0 ? `styleSource: [${styleSourceNames.join(", ")}].join("\\n\\n")` : undefined;
    const assignedParameters = [`...${parameters}`, renderSourceParameter, styleSourceParameter].filter((parameter) => parameter !== undefined);
    return `${parameters} = { ${assignedParameters.join(", ")} };`;
}
