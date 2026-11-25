import ts from "typescript";
import type { Plugin } from "vite";

import { argsSpreadMarker, childrenPlaceholder } from "../src/storybook/renderSourceMarkers";
import type { ShownArg } from "../src/storybook/renderSourceWithArgs";
import {
    findProperty,
    localStoryObjectOf,
    metaComponentNameOf,
    metaObjectOf,
    nodesIn,
    objectLiteralOf,
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
 * - `writtenArgs` and `writtenMappingOptions`: the args and the `mapping` options as written in the meta and the story.
 * - `styleSource`: the `.module.scss` files that the body, the args and the `mapping` options use.
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

export type StoryCode = {
    exportName: string;
    renderSource: string;
    writtenArgs: Record<string, ShownArg>;
    writtenMappingOptions: Record<string, Record<string, ShownArg>>;
    usedStyleImports: StyleImport[];
};

export function storyCodesOf(storyFile: ts.SourceFile): StoryCode[] {
    const styleImports = styleImportsOf(storyFile);
    const shownSourceEdits = [...styleImportRenameEdits(storyFile, styleImports), ...actionsPanelSpyEdits(storyFile)];
    const renderSourceEdits = [...childrenPlaceholderEdits(storyFile), ...argsSpreadEdits(storyFile), ...controlledArgEdits(storyFile)];
    const renderSourceFile = parseStoryFile(applyEdits(storyFile.text, [...renderSourceEdits, ...shownSourceEdits]), storyFile.fileName);
    const renderSources = new Map(
        storyExportsOf(renderSourceFile).map(({ exportName, storyObject }) => [exportName, renderSourceOf(storyObject, renderSourceFile)]),
    );
    return storyExportsOf(storyFile).flatMap(({ exportName, storyObject }) => {
        const renderBody = renderBodyOf(storyObject, storyFile);
        const renderSource = renderBody ? renderSources.get(exportName) : defaultRenderSourceOf(storyObject, storyFile);
        if (renderSource === undefined) {
            return [];
        }
        const argNodes = argNodesOf(storyObject, storyFile);
        const mappingNodes = mappingNodesOf(storyObject, storyFile);
        const shownNodes = [...(renderBody ? [renderBody] : []), ...Object.values(argNodes), ...Object.values(mappingNodes).flatMap(Object.values)];
        const writtenArgOf = (node: ts.Expression) => writtenValueOf(node, storyFile, shownSourceEdits);
        return [
            {
                exportName,
                renderSource,
                writtenArgs: mapValues(argNodes, writtenArgOf),
                writtenMappingOptions: mapValues(mappingNodes, (optionNodes) => mapValues(optionNodes, writtenArgOf)),
                usedStyleImports: styleImportsUsedIn(shownNodes, styleImports),
            },
        ];
    });
}

function writtenValueOf(node: ts.Expression, storyFile: ts.SourceFile, edits: TextEdit[]): ShownArg {
    if (isLoggingOnlyHandler(node)) {
        return { value: undefined };
    }
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        return { value: node.text };
    }
    if (ts.isNumericLiteral(node)) {
        return { value: Number(node.text) };
    }
    if (node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword) {
        return { value: node.kind === ts.SyntaxKind.TrueKeyword };
    }
    if (node.kind === ts.SyntaxKind.NullKeyword) {
        return { value: null };
    }
    return ts.isIdentifier(node) && node.text === "undefined" ? { value: undefined } : { source: editedSourceOf(node, storyFile, edits) };
}

function mapValues<Value, MappedValue>(record: Record<string, Value>, mapValue: (value: Value) => MappedValue) {
    return Object.fromEntries(Object.entries(record).map(([key, value]) => [key, mapValue(value)]));
}

function argNodesOf(storyObject: ts.ObjectLiteralExpression, storyFile: ts.SourceFile) {
    const meta = metaObjectOf(storyFile);
    return { ...(meta && ownArgNodesOf(meta, storyFile)), ...ownArgNodesOf(storyObject, storyFile) };
}

/**
 * A later `args` replaces the args of a story spread before it, as in JavaScript.
 */
function ownArgNodesOf(storyObject: ts.ObjectLiteralExpression, storyFile: ts.SourceFile): Record<string, ts.Expression> | undefined {
    let argNodes: Record<string, ts.Expression> | undefined;
    for (const property of storyObject.properties) {
        if (ts.isSpreadAssignment(property)) {
            const spreadStory = localStoryObjectOf(property.expression, storyFile);
            argNodes = (spreadStory && ownArgNodesOf(spreadStory, storyFile)) ?? argNodes;
        } else if (propertyNameOf(property) === "args" && ts.isPropertyAssignment(property)) {
            argNodes = argObjectNodesOf(property.initializer, storyFile);
        }
    }
    return argNodes;
}

function argObjectNodesOf(expression: ts.Expression, storyFile: ts.SourceFile) {
    if (isArgsAccess(expression)) {
        const argsStory = localStoryObjectOf(expression.expression, storyFile);
        return (argsStory && ownArgNodesOf(argsStory, storyFile)) ?? {};
    }
    const argObject = objectLiteralOf(expression, storyFile);
    return argObject ? propertyNodesOf(argObject, storyFile) : {};
}

function propertyNodesOf(objectLiteral: ts.ObjectLiteralExpression, storyFile: ts.SourceFile): Record<string, ts.Expression> {
    return Object.fromEntries(
        objectLiteral.properties.flatMap((property): Array<[string, ts.Expression]> => {
            if (ts.isSpreadAssignment(property)) {
                return Object.entries(argObjectNodesOf(property.expression, storyFile));
            }
            const name = propertyNameOf(property);
            if (ts.isShorthandPropertyAssignment(property)) {
                return [[property.name.text, property.name]];
            }
            if (name === undefined || !ts.isPropertyAssignment(property)) {
                return [];
            }
            return [[name, unwrapParentheses(property.initializer)]];
        }),
    );
}

function isLoggingOnlyHandler(expression: ts.Expression) {
    return isActionsPanelSpyCall(expression) && expression.arguments.length === 0;
}

function isActionsPanelSpyCall(node: ts.Node): node is ts.CallExpression {
    return ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "fn";
}

function isArgsAccess(expression: ts.Expression): expression is ts.PropertyAccessExpression {
    return ts.isPropertyAccessExpression(expression) && expression.name.text === "args";
}

function mappingNodesOf(storyObject: ts.ObjectLiteralExpression, storyFile: ts.SourceFile) {
    const meta = metaObjectOf(storyFile);
    return { ...(meta && ownMappingNodesOf(meta, storyFile)), ...ownMappingNodesOf(storyObject, storyFile) };
}

function ownMappingNodesOf(storyObject: ts.ObjectLiteralExpression, storyFile: ts.SourceFile): Record<string, Record<string, ts.Expression>> {
    const argTypes = objectLiteralPropertyOf(storyObject, "argTypes", storyFile);
    return Object.fromEntries(
        (argTypes?.properties ?? []).flatMap((argType) => {
            const name = propertyNameOf(argType);
            const argTypeObject = ts.isPropertyAssignment(argType) ? objectLiteralOf(argType.initializer, storyFile) : undefined;
            const mapping = argTypeObject && objectLiteralPropertyOf(argTypeObject, "mapping", storyFile);
            return name !== undefined && mapping ? [[name, propertyNodesOf(mapping, storyFile)]] : [];
        }),
    );
}

function objectLiteralPropertyOf(objectLiteral: ts.ObjectLiteralExpression, name: string, storyFile: ts.SourceFile) {
    const property = findProperty(objectLiteral, name);
    return property && ts.isPropertyAssignment(property) ? objectLiteralOf(property.initializer, storyFile) : undefined;
}

function propertyNameOf(property: ts.ObjectLiteralElementLike) {
    return property.name && (ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)) ? property.name.text : undefined;
}

function defaultRenderSourceOf(storyObject: ts.ObjectLiteralExpression, storyFile: ts.SourceFile) {
    const componentName = rendersWithDefaultRender(storyObject, storyFile) ? metaComponentNameOf(storyFile) : undefined;
    return componentName && `<${componentName} ${argsSpreadMarker([])}>${childrenPlaceholder}</${componentName}>`;
}

function applyEdits(text: string, edits: TextEdit[], textStart = 0) {
    let editedText = "";
    let copiedUntil = textStart;
    for (const edit of [...edits].sort((first, second) => first.start - second.start)) {
        editedText += text.slice(copiedUntil - textStart, edit.start - textStart) + edit.text;
        copiedUntil = edit.end;
    }
    return editedText + text.slice(copiedUntil - textStart);
}

function editedSourceOf(node: ts.Node, storyFile: ts.SourceFile, edits: TextEdit[]) {
    const start = node.getStart();
    const editsInNode = edits.filter((edit) => edit.start >= start && edit.end <= node.getEnd());
    return dedented(applyEdits(node.getText(storyFile), editsInNode, start), indentationOfLineAt(start, storyFile));
}

function actionsPanelSpyEdits(storyFile: ts.SourceFile): TextEdit[] {
    return nodesIn(storyFile, isActionsPanelSpyCall).flatMap((call) => {
        const [handler] = call.arguments;
        if (!handler) {
            return [{ start: call.getStart(), end: call.getEnd(), text: "() => {}" }];
        }
        return [
            { start: call.getStart(), end: handler.getStart(), text: "" },
            { start: handler.getEnd(), end: call.getEnd(), text: "" },
        ];
    });
}

function childrenPlaceholderEdits(storyFile: ts.SourceFile): TextEdit[] {
    return nodesIn(storyFile, isArgsSpread)
        .filter((spread) => ts.isJsxSelfClosingElement(spread.parent.parent) && !attributeNamesAfter(spread).includes("children"))
        .map(({ parent: { parent: element } }) => ({
            start: element.attributes.getEnd(),
            end: element.getEnd(),
            text: `>${childrenPlaceholder}</${element.tagName.getText()}>`,
        }));
}

function argsSpreadEdits(storyFile: ts.SourceFile): TextEdit[] {
    return nodesIn(storyFile, isArgsSpread).map((spread) => ({
        start: spread.getStart(),
        end: spread.getEnd(),
        text: argsSpreadMarker(attributeNamesAfter(spread)),
    }));
}

function attributeNamesAfter(spread: ts.JsxSpreadAttribute) {
    const attributes = spread.parent.properties;
    return attributes
        .slice(attributes.indexOf(spread) + 1)
        .filter(ts.isJsxAttribute)
        .map((attribute) => attribute.name.getText());
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
    return nodesIn(storyFile, isControlledArgCall).flatMap((call) => {
        const [argsExpression, keyExpression] = call.arguments;
        if (!argsExpression || !keyExpression || !ts.isStringLiteral(keyExpression)) {
            return [];
        }
        return [{ start: call.getStart(), end: call.getEnd(), text: `useState(${argsExpression.getText()}.${keyExpression.text})` }];
    });
}

function isControlledArgCall(node: ts.Node): node is ts.CallExpression {
    return ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "useControlledArg";
}

function isArgsSpread(node: ts.Node): node is ts.JsxSpreadAttribute {
    return ts.isJsxSpreadAttribute(node) && ts.isIdentifier(node.expression) && node.expression.text === "args";
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
    return dedented(node.getText(sourceFile), indentationOfLineAt(node.getStart(), sourceFile));
}

function dedented(text: string, indentation: string) {
    return text
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

function storyParametersAssignment({ exportName, usedStyleImports, ...sources }: StoryCode) {
    const parameters = `${exportName}.parameters`;
    const sourceParameters = Object.entries(sources).map(([name, source]) => `${name}: ${JSON.stringify(source)}`);
    const styleSourceNames = usedStyleImports.map(({ importName }) => rawStyleSourceName(importName));
    const styleSourceParameter = styleSourceNames.length > 0 ? `styleSource: [${styleSourceNames.join(", ")}].join("\\n\\n")` : undefined;
    const assignedParameters = [`...${parameters}`, ...sourceParameters, styleSourceParameter].filter((parameter) => parameter !== undefined);
    return `${parameters} = { ${assignedParameters.join(", ")} };`;
}
