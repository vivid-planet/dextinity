import { join, relative } from "node:path";

import ts from "typescript";
import { expect, it } from "vitest";

import { storyExportsOf } from "../../../.storybook/storyFile";

const packageDirectory = join(import.meta.dirname, "../../..");

function createDocsStoriesProgram() {
    const config = ts.getParsedCommandLineOfConfigFile(
        join(packageDirectory, "tsconfig.json"),
        {},
        { ...ts.sys, onUnRecoverableConfigFileDiagnostic: () => {} },
    );
    if (!config) {
        throw new Error("Can't read tsconfig.json");
    }
    const docsStoryFiles = config.fileNames.filter((fileName) => fileName.endsWith(".stories.tsx") && !fileName.endsWith(".dev.stories.tsx"));
    return ts.createProgram(docsStoryFiles, config.options);
}

const program = createDocsStoriesProgram();
const checker = program.getTypeChecker();

function unwrapExpression(expression: ts.Expression): ts.Expression {
    return ts.isSatisfiesExpression(expression) || ts.isParenthesizedExpression(expression) ? unwrapExpression(expression.expression) : expression;
}

function findProperty(objectLiteral: ts.ObjectLiteralExpression | undefined, name: string) {
    const property = objectLiteral?.properties.find(
        (candidate): candidate is ts.PropertyAssignment =>
            ts.isPropertyAssignment(candidate) && ts.isIdentifier(candidate.name) && candidate.name.text === name,
    );
    return property && unwrapExpression(property.initializer);
}

function findObjectProperty(objectLiteral: ts.ObjectLiteralExpression | undefined, name: string) {
    const value = findProperty(objectLiteral, name);
    return value && ts.isObjectLiteralExpression(value) ? value : undefined;
}

function findMeta(sourceFile: ts.SourceFile) {
    const initializer = sourceFile.statements
        .filter(ts.isVariableStatement)
        .flatMap((statement) => statement.declarationList.declarations)
        .find((declaration) => ts.isIdentifier(declaration.name) && declaration.name.text === "meta")?.initializer;
    const meta = initializer && unwrapExpression(initializer);
    return meta && ts.isObjectLiteralExpression(meta) ? meta : undefined;
}

function isOnDocsPage(storyObject: ts.ObjectLiteralExpression) {
    const tags = findProperty(storyObject, "tags");
    return !(tags && ts.isArrayLiteralExpression(tags) && tags.elements.some((tag) => ts.isStringLiteral(tag) && tag.text === "!autodocs"));
}

function controlsDisableOf(storyObject: ts.ObjectLiteralExpression) {
    return findProperty(findObjectProperty(findObjectProperty(storyObject, "parameters"), "controls"), "disable");
}

function showsControlsPanel(story: ts.ObjectLiteralExpression, meta: ts.ObjectLiteralExpression) {
    return (controlsDisableOf(story) ?? controlsDisableOf(meta))?.kind !== ts.SyntaxKind.TrueKeyword;
}

function isReactNodeType(typeNode: ts.TypeNode): boolean {
    if (ts.isParenthesizedTypeNode(typeNode)) {
        return isReactNodeType(typeNode.type);
    }
    if (ts.isUnionTypeNode(typeNode)) {
        return typeNode.types.some(isReactNodeType);
    }
    return ts.isTypeReferenceNode(typeNode) && ["ReactNode", "ReactElement"].includes(typeNode.typeName.getText());
}

function isDeclaredInPackage(declaration: ts.Declaration) {
    return !declaration.getSourceFile().fileName.includes("/node_modules/");
}

function takesReactNode(prop: ts.Symbol) {
    return (prop.declarations ?? []).some(
        (declaration) =>
            isDeclaredInPackage(declaration) &&
            ts.isPropertySignature(declaration) &&
            declaration.type !== undefined &&
            isReactNodeType(declaration.type),
    );
}

function reactNodePropNamesOf(component: ts.Expression) {
    const props = checker
        .getTypeAtLocation(component)
        .getCallSignatures()
        .flatMap((signature) => signature.getParameters().slice(0, 1))
        .map((propsParameter) => checker.getTypeOfSymbolAtLocation(propsParameter, component))
        .flatMap((propsType) => (propsType.isUnion() ? propsType.types : [propsType]))
        .flatMap((propsType) => propsType.getProperties());
    return [...new Set(props.filter(takesReactNode).map((prop) => prop.name))];
}

function controlledPropNamesOf(storyObject: ts.ObjectLiteralExpression) {
    const argTypes = findProperty(storyObject, "argTypes");
    if (!argTypes) {
        return [];
    }
    return checker
        .getTypeAtLocation(argTypes)
        .getProperties()
        .filter((argType) => {
            const argTypeType = checker.getTypeOfSymbolAtLocation(argType, argTypes);
            return argTypeType.getProperty("control") !== undefined || argTypeType.getProperty("options") !== undefined;
        })
        .map((argType) => argType.name);
}

function propNamesWithoutControlIn(sourceFile: ts.SourceFile) {
    const meta = findMeta(sourceFile);
    const component = findProperty(meta, "component");
    if (!meta || !component || !isOnDocsPage(meta)) {
        return [];
    }
    const metaControlledPropNames = controlledPropNamesOf(meta);
    const storiesWithControls = storyExportsOf(sourceFile)
        .map(({ storyObject }) => storyObject)
        .filter((story) => isOnDocsPage(story) && showsControlsPanel(story, meta));
    return reactNodePropNamesOf(component).filter(
        (propName) =>
            !metaControlledPropNames.includes(propName) && storiesWithControls.some((story) => !controlledPropNamesOf(story).includes(propName)),
    );
}

const docsStoryFiles = program
    .getRootFileNames()
    .map((fileName) => program.getSourceFile(fileName))
    .filter((sourceFile) => sourceFile !== undefined)
    .map((sourceFile) => ({ fileName: relative(packageDirectory, sourceFile.fileName), sourceFile }));

it.each(docsStoryFiles)("$fileName gives each ReactNode prop of its component a control", ({ sourceFile }) => {
    expect(
        propNamesWithoutControlIn(sourceFile),
        'Storybook shows a JSON editor for these props. Give each an argTypes control: `control: "text"` for text, a `select` with a `mapping` for an element, or `control: false`.',
    ).toEqual([]);
});
