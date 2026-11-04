import type { EntityMetadata } from "@mikro-orm/postgresql";
import * as path from "path";
import { type ArrowFunction, ClassDeclaration, type Identifier, Project, SyntaxKind } from "ts-morph";

/* eslint-disable @typescript-eslint/no-explicit-any */

const project = new Project({
    tsConfigFilePath: "tsconfig.json",
    skipAddingFilesFromTsConfig: true,
});
function morphTsSource(metadata: EntityMetadata<any>) {
    let tsSource = project.getSourceFile(metadata.path);
    if (!tsSource) {
        tsSource = project.addSourceFileAtPath(metadata.path);
    }
    return tsSource;
}

export function morphTsClass(metadata: EntityMetadata<any>) {
    const tsSource = morphTsSource(metadata);
    const tsClass = tsSource.getClass(metadata.className);
    if (!tsClass) {
        throw new Error(`Class ${metadata.className} not found in ${metadata.path}`);
    }
    return tsClass;
}
export function morphTsProperty(name: string, metadata: EntityMetadata<any>) {
    let currentClass: ClassDeclaration | undefined = morphTsClass(metadata);
    while (currentClass) {
        const prop = currentClass.getProperty(name);
        if (prop) {
            return prop;
        }

        currentClass = currentClass.getBaseClass();
    }
    throw new Error(`Property ${name} not found in ${metadata.className}`);
}

export function findImportPath(importName: string, targetDirectory: string, metadata: EntityMetadata<any>) {
    const tsSource = morphTsSource(metadata);
    for (const tsImport of tsSource.getImportDeclarations()) {
        for (const namedImport of tsImport.getNamedImports()) {
            if (namedImport.getAliasNode()?.getText() == importName) {
                throw new Error("Aliased enum import is not supported");
            }
            if (namedImport.getNameNode().getText() == importName) {
                const importPath = tsImport.getModuleSpecifierValue();
                const importSource = tsImport.getModuleSpecifierSourceFile();
                if (!importSource) {
                    throw new Error(`Can't resolve import ${importPath}`);
                }
                const exportedDeclarations = importSource.getExportedDeclarations().get(importName);
                if (!exportedDeclarations) {
                    throw new Error(`Can't get exported declaration for ${importName}`);
                }
                const exportedDeclaration = exportedDeclarations[0];

                if (importPath.startsWith("./") || importPath.startsWith("../")) {
                    const absolutePath = path.resolve(path.dirname(metadata.path), importPath);
                    let relativePath = path.relative(targetDirectory, absolutePath);
                    if (!relativePath.startsWith(".")) {
                        relativePath = `./${relativePath}`;
                    }
                    return {
                        importPath: relativePath,
                        exportedDeclaration,
                    };
                } else {
                    return { importPath, exportedDeclaration };
                }
            }
        }
    }
    return {
        importPath: null,
        exportedDeclaration: undefined,
    };
}

function findImportPathOrThrow(importName: string, targetDirectory: string, metadata: EntityMetadata<any>) {
    const ret = findImportPath(importName, targetDirectory, metadata);
    if (!ret.importPath) {
        throw new Error(`${importName} import not found in ${metadata.path}`);
    }
    return ret;
}

export function findEnumName(propertyName: string, metadata: EntityMetadata<any>): string {
    const tsProp = morphTsProperty(propertyName, metadata);
    return tsProp
        .getType()
        .getText(tsProp)
        .replace(/ ?\| ?undefined$/, "")
        .replace(/\[\]$/, "");
}

export function findEnumImportPath(enumName: string, targetDirectory: string, metadata: EntityMetadata<any>): string {
    const tsSource = morphTsSource(metadata);
    if (tsSource.getEnum(enumName)) {
        //enum defined in same file as entity
        if (!tsSource.getEnum(enumName)?.isExported()) {
            throw new Error(`Enum ${enumName} is not exported in ${metadata.path}`);
        }
        return path.relative(targetDirectory, metadata.path).replace(/\.ts$/, "");
    } else {
        //try to find import where enum is imported from
        const { importPath } = findImportPathOrThrow(enumName, targetDirectory, metadata);
        return importPath;
    }
}

export function findValidatorImportPath(validatorName: string, targetDirectory: string, metadata: EntityMetadata<any>): string {
    const tsSource = morphTsSource(metadata);
    //validator defined in same file as entity
    if (tsSource.getVariableDeclaration(validatorName) || tsSource.getFunction(validatorName)) {
        if (!(tsSource.getVariableDeclaration(validatorName)?.isExported() || tsSource.getFunction(validatorName)?.isExported())) {
            throw new Error(`Validator ${validatorName} is not exported in ${metadata.path}`);
        }
        return path.relative(`${targetDirectory}/dto`, metadata.path).replace(/\.ts$/, "");
    } else {
        const { importPath } = findImportPathOrThrow(validatorName, targetDirectory, metadata);
        return importPath;
    }
}

export function findBlockName(propertyName: string, metadata: EntityMetadata<any>): string {
    const tsProp = morphTsProperty(propertyName, metadata);
    if (!tsProp) {
        throw new Error("property not found");
    }
    const rootBlockDecorator = tsProp.getDecorators().find((i) => i.getName() == "RootBlock");
    if (!rootBlockDecorator) {
        throw new Error(`RootBlock decorator not found for property ${propertyName}`);
    }
    return rootBlockDecorator.getArguments()[0].getText();
}

export function findBlockImportPath(blockName: string, targetDirectory: string, metadata: EntityMetadata<any>): string {
    const tsSource = morphTsSource(metadata);

    if (tsSource.getVariableDeclaration(blockName)) {
        //block defined in same file as entity
        if (!tsSource.getVariableDeclaration(blockName)?.isExported()) {
            throw new Error(`Block ${blockName} is not exported in ${metadata.path}`);
        }
        return path.relative(targetDirectory, metadata.path).replace(/\.ts$/, "");
    } else {
        //try to find import where block is imported from
        const { importPath } = findImportPathOrThrow(blockName, targetDirectory, metadata);
        return importPath;
    }
}

export function findInputClassImportPath(className: string, targetDirectory: string, metadata: EntityMetadata<any>): string {
    const tsSource = morphTsSource(metadata);

    let returnImportPath: string;
    let classDeclaration: ClassDeclaration;

    if (tsSource.getClass(className)) {
        //block defined in same file as entity
        if (!tsSource.getClass(className)?.isExported()) {
            throw new Error(`Class ${className} is not exported in ${metadata.path}`);
        }
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        classDeclaration = tsSource.getClass(className)!;
        returnImportPath = path.relative(targetDirectory, metadata.path).replace(/\.ts$/, "");
    } else {
        //try to find import where block is imported from
        const { importPath, exportedDeclaration } = findImportPathOrThrow(className, targetDirectory, metadata);
        if (!(exportedDeclaration instanceof ClassDeclaration)) {
            throw new Error(`Exported declaration for ${className} is not a class`);
        }
        classDeclaration = exportedDeclaration;
        returnImportPath = importPath;
    }
    if (!classDeclaration.getDecorators().some((i) => i.getName() == "InputType")) {
        throw new Error(`Exported declaration for ${className} is not decorated with @InputType`);
    }
    return returnImportPath;
}

export function getFieldDecoratorClassName(propertyName: string, metadata: EntityMetadata<any>) {
    const definedDecorators = morphTsProperty(propertyName, metadata).getDecorators();
    const fieldDecorator = definedDecorators.find((decorator) => decorator.getName() == "Field");
    if (!fieldDecorator) {
        return false;
    }
    const typeFnArg = fieldDecorator.getArguments()[0];
    if (!typeFnArg) {
        throw new Error(`${propertyName}: @Field is missing argument`);
    }
    if (typeFnArg.getKind() != SyntaxKind.ArrowFunction) {
        throw new Error(`${propertyName}: @Field first argument must be an ArrowFunction`);
    }
    const typeReturningArrowFunction = typeFnArg as ArrowFunction;
    const body = typeReturningArrowFunction.getBody();
    if (body.getKind() != SyntaxKind.Identifier) {
        throw new Error(`${propertyName}: @Field first argument must be an ArrowFunction returning an Identifier`);
    }
    const identifier = body as Identifier;
    const className = identifier.getText();
    return className;
}
