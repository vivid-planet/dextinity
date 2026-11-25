import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { compile } from "sass";
import ts from "typescript";

import { parseTokens, type TokenDefinition } from "../src/storybook/docs/parseTokens";
import { findProperty, metaComponentNameOf, metaObjectOf, parseStoryFile } from "./storyFile";

const sourceDirectory = path.resolve(import.meta.dirname, "../src");
const indexFile = path.join(sourceDirectory, "index.ts");
const componentsDirectory = path.join(sourceDirectory, "components");
const tokenReferencePattern = /var\(\s*(--dextinity-[a-z0-9-]+)/g;

type DeclaredToken = TokenDefinition & { tokensFile: string };

export type ComponentTokens = {
    tokens: TokenDefinition[];
    /** The files the tokens were read from, to read them again when one of them changes. */
    sourceFiles: string[];
};

/**
 * Lists the component tokens that the `meta.component` of a story file reads: those that its stylesheets and the stylesheets of the
 * internal parts it imports read, plus those that their values read. A story file that lists its tokens in `parameters.tokens`, e.g.
 * theme tokens that no component tokens file declares, gets those. Returns `undefined` for a story file without either.
 */
export function componentTokensOf(storyFilePath: string): ComponentTokens | undefined {
    const listedTokens = listedTokensOf(storyFilePath);
    if (listedTokens !== undefined) {
        return { tokens: parseTokens(listedTokens), sourceFiles: [storyFilePath] };
    }
    const componentFile = metaComponentFileOf(storyFilePath);
    if (componentFile === undefined) {
        return undefined;
    }
    const exportedModules = exportedModuleFiles();
    const { stylesheets, moduleFiles } = stylesheetsOf(componentFile, exportedModules);
    const compiledStylesheets = stylesheets.map((stylesheet) => compile(stylesheet));
    const readNames = new Set(compiledStylesheets.flatMap((compiled) => tokenNamesIn(compiled.css)));
    const declaredTokens = declaredComponentTokens();
    return {
        tokens: tokensReadThrough(readNames, declaredTokens, path.dirname(componentFile)),
        sourceFiles: [
            indexFile,
            ...moduleFiles,
            ...compiledStylesheets.flatMap((compiled) => compiled.loadedUrls.map((url) => fileURLToPath(url))),
            ...new Set(declaredTokens.map(({ tokensFile }) => tokensFile)),
        ],
    };
}

function listedTokensOf(storyFilePath: string) {
    const storyFile = parseStoryFile(readFileSync(storyFilePath, "utf-8"), storyFilePath);
    const meta = metaObjectOf(storyFile);
    const parametersProperty = meta && findProperty(meta, "parameters");
    const parameters =
        parametersProperty && ts.isPropertyAssignment(parametersProperty) && ts.isObjectLiteralExpression(parametersProperty.initializer)
            ? parametersProperty.initializer
            : undefined;
    const tokensProperty = parameters && findProperty(parameters, "tokens");
    return tokensProperty && ts.isPropertyAssignment(tokensProperty) ? stringValueOf(tokensProperty.initializer, storyFile) : undefined;
}

function stringValueOf(expression: ts.Expression, storyFile: ts.SourceFile): string | undefined {
    if (ts.isStringLiteral(expression) || ts.isNoSubstitutionTemplateLiteral(expression)) {
        return expression.text;
    }
    if (!ts.isIdentifier(expression)) {
        return undefined;
    }
    const declaration = storyFile.statements
        .filter(ts.isVariableStatement)
        .flatMap((statement) => statement.declarationList.declarations)
        .find((candidate) => ts.isIdentifier(candidate.name) && candidate.name.text === expression.text);
    return declaration?.initializer && stringValueOf(declaration.initializer, storyFile);
}

function metaComponentFileOf(storyFilePath: string) {
    const storyFile = parseStoryFile(readFileSync(storyFilePath, "utf-8"), storyFilePath);
    const componentName = metaComponentNameOf(storyFile);
    if (componentName === undefined) {
        return undefined;
    }
    const importDeclaration = storyFile.statements
        .filter(ts.isImportDeclaration)
        .find((statement) => importedNamesOf(statement).includes(componentName));
    return importDeclaration && resolveImport(importDeclaration, storyFilePath);
}

function importedNamesOf(importDeclaration: ts.ImportDeclaration) {
    const namedBindings = importDeclaration.importClause?.namedBindings;
    return namedBindings && ts.isNamedImports(namedBindings) ? namedBindings.elements.map((element) => element.name.text) : [];
}

function resolveImport(declaration: ts.ImportDeclaration | ts.ExportDeclaration, fromFile: string) {
    const specifier = declaration.moduleSpecifier;
    if (!specifier || !ts.isStringLiteral(specifier) || !specifier.text.startsWith(".")) {
        return undefined;
    }
    const basePath = path.resolve(path.dirname(fromFile), specifier.text);
    return [basePath, `${basePath}.tsx`, `${basePath}.ts`].find((candidate) => path.extname(candidate) !== "" && existsSync(candidate));
}

/**
 * The modules that `src/index.ts` exports a value from. Their components have their own docs page, so a component that imports one
 * doesn't list its tokens.
 */
function exportedModuleFiles() {
    const index = ts.createSourceFile(indexFile, readFileSync(indexFile, "utf-8"), ts.ScriptTarget.Latest, true);
    return new Set(
        index.statements
            .filter(ts.isExportDeclaration)
            .filter((statement) => !statement.isTypeOnly && exportsValue(statement))
            .map((statement) => resolveImport(statement, indexFile))
            .filter((file) => file !== undefined),
    );
}

function exportsValue(statement: ts.ExportDeclaration) {
    const exportClause = statement.exportClause;
    return exportClause === undefined || !ts.isNamedExports(exportClause) || exportClause.elements.some((element) => !element.isTypeOnly);
}

function stylesheetsOf(componentFile: string, exportedModules: Set<string>) {
    const stylesheets = new Set<string>();
    const moduleFiles = new Set<string>();
    const pendingFiles = [componentFile];
    for (let moduleFile = pendingFiles.pop(); moduleFile !== undefined; moduleFile = pendingFiles.pop()) {
        if (moduleFiles.has(moduleFile)) {
            continue;
        }
        moduleFiles.add(moduleFile);
        const sourceFile = ts.createSourceFile(moduleFile, readFileSync(moduleFile, "utf-8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
        for (const statement of sourceFile.statements.filter(ts.isImportDeclaration)) {
            const importedFile = resolveImport(statement, moduleFile);
            if (importedFile === undefined || statement.importClause?.isTypeOnly) {
                continue;
            }
            if (importedFile.endsWith(".module.scss")) {
                stylesheets.add(importedFile);
            } else if (/\.tsx?$/.test(importedFile) && !exportedModules.has(importedFile)) {
                pendingFiles.push(importedFile);
            }
        }
    }
    return { stylesheets: [...stylesheets], moduleFiles: [...moduleFiles] };
}

function tokenNamesIn(css: string) {
    return [...css.matchAll(tokenReferencePattern)].map((match) => match[1]);
}

function declaredComponentTokens(): DeclaredToken[] {
    return readdirSync(componentsDirectory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .flatMap((directory) => {
            const directoryPath = path.join(componentsDirectory, directory.name);
            return readdirSync(directoryPath)
                .filter((fileName) => fileName.endsWith(".tokens.scss"))
                .map((fileName) => path.join(directoryPath, fileName));
        })
        .sort()
        .flatMap((tokensFile) => parseTokens(readFileSync(tokensFile, "utf-8")).map((token) => ({ ...token, tokensFile })));
}

/**
 * The declared tokens among the read ones and those that their values read, the tokens files in the component's folder first, each
 * file's tokens in their order in the file.
 */
function tokensReadThrough(readNames: Set<string>, declaredTokens: DeclaredToken[], componentDirectory: string): TokenDefinition[] {
    const tokensByName = new Map(declaredTokens.map((token) => [token.name, token]));
    const keptNames = new Set<string>();
    const pendingNames = [...readNames];
    for (let name = pendingNames.pop(); name !== undefined; name = pendingNames.pop()) {
        const token = tokensByName.get(name);
        if (token === undefined || keptNames.has(name)) {
            continue;
        }
        keptNames.add(name);
        pendingNames.push(...tokenNamesIn([token.definition, token.darkDefinition, token.highContrastDefinition].join(" ")));
    }
    const isOwnToken = (token: DeclaredToken) => path.dirname(token.tokensFile) === componentDirectory;
    return [...declaredTokens.filter(isOwnToken), ...declaredTokens.filter((token) => !isOwnToken(token))]
        .filter((token) => keptNames.has(token.name))
        .map(({ tokensFile: _tokensFile, ...token }) => token);
}
