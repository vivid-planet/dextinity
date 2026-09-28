import type { CrudGeneratorOptions } from "@dextinity/cms-api";
import type { EntityMetadata } from "@mikro-orm/core";
import * as path from "path";
import { Node, ts, type Type } from "ts-morph";

import type { Imports } from "./generate-imports-code";
import { findImportPath, morphTsClass } from "./ts-morph-helper";

function findReturnTypeImport(type: Type, serviceSourceFile: Node, targetDirectory: string): { name: string; importPath: string } | null {
    const symbol = type.getSymbol() ?? type.getAliasSymbol();
    if (!symbol) {
        // Primitive type, no import needed
        return null;
    }

    const typeName = symbol.getName();
    const declarations = symbol.getDeclarations();
    if (!declarations || declarations.length === 0) {
        return null;
    }

    const declaration = declarations[0];
    const declarationSourceFile = declaration.getSourceFile();
    const serviceFile = serviceSourceFile.getSourceFile();

    if (declarationSourceFile === serviceFile) {
        // Return type is defined in the same file as the hooks service
        const exportedDeclarations = serviceFile.getExportedDeclarations().get(typeName);
        if (!exportedDeclarations || exportedDeclarations.length === 0) {
            throw new Error(`Return type "${typeName}" is defined in ${serviceFile.getFilePath()} but is not exported`);
        }
        const importPath = `./${path.relative(targetDirectory, serviceFile.getFilePath()).replace(/\.ts$/, "")}`;
        return { name: typeName, importPath };
    } else {
        // Return type is imported from another file
        const importPath = `./${path.relative(targetDirectory, declarationSourceFile.getFilePath()).replace(/\.ts$/, "")}`;
        return { name: typeName, importPath };
    }
}

function unwrapPromiseType(type: Type): Type {
    if (type.getSymbol()?.getName() === "Promise") {
        const typeArgs = type.getTypeArguments();
        if (typeArgs.length > 0) {
            return typeArgs[0];
        }
    }
    return type;
}

function unwrapArrayType(type: Type): Type {
    if (type.isArray()) {
        return type.getArrayElementTypeOrThrow();
    }
    throw new Error(`Return type must be an array`);
}

export function findHooksService({
    generatorOptions,
    metadata,
    targetDirectory,
}: {
    generatorOptions: CrudGeneratorOptions;
    metadata: EntityMetadata;
    targetDirectory: string;
}): {
    validateCreateInput: { options?: string[]; returnType: string } | null;
    validateUpdateInput: { options?: string[]; returnType: string } | null;
    imports: Imports;
    className: string;
} | null {
    if (!generatorOptions.hooksService) {
        return null;
    }
    let validateCreateInput = null;
    let validateUpdateInput = null;
    const imports: Imports = [];

    const tsClass = morphTsClass(metadata);
    for (const decorator of tsClass.getDecorators()) {
        if (decorator.getName() === "CrudGenerator") {
            const decoratorArgs = decorator.getArguments();
            if (decoratorArgs.length < 1) {
                throw new Error(`CrudGenerator decorator has no arguments`);
            }
            const firstArg = decoratorArgs[0];
            if (!Node.isObjectLiteralExpression(firstArg)) {
                throw new Error("CrudGenerator decorator first argument is not an object literal");
            }
            const hooksServiceProp = firstArg.getProperty("hooksService");
            if (!hooksServiceProp) {
                throw new Error("hooksService property not found in CrudGenerator decorator");
            }
            if (!Node.isPropertyAssignment(hooksServiceProp)) {
                throw new Error("hooksService property is not a property assignment");
            }
            const initializer = hooksServiceProp.getInitializer();
            if (!initializer) {
                throw new Error("hooksService initializer not found");
            }
            if (!Node.isIdentifier(initializer)) {
                throw new Error("hooksService initializer is not an identifier");
            }
            const hooksServiceClassName = initializer.getText();
            const { importPath } = findImportPath(hooksServiceClassName, targetDirectory, metadata);
            if (importPath) {
                imports.push({ name: hooksServiceClassName, importPath });
            }

            const serviceClassRef = initializer.getSymbolOrThrow();
            const serviceClassDeclaration = (serviceClassRef.getAliasedSymbol() ?? serviceClassRef).getDeclarations().find(Node.isClassDeclaration);
            if (!serviceClassDeclaration) {
                throw new Error("hooksService class declaration not found");
            }

            for (const method of serviceClassDeclaration.getMethods()) {
                if (method.getName() == "validateCreateInput") {
                    validateCreateInput = {};
                    const unwrappedType = unwrapArrayType(unwrapPromiseType(method.getReturnType()));

                    const returnType = unwrappedType.getText(method, ts.TypeFormatFlags.None);
                    const returnTypeImport = findReturnTypeImport(unwrappedType, serviceClassDeclaration, targetDirectory);
                    if (returnTypeImport) {
                        imports.push(returnTypeImport);
                    }
                    const parameters = method.getParameters();
                    if (parameters.length >= 2) {
                        //has options
                        const options = parameters[1]
                            .getType()
                            .getProperties()
                            .map((prop) => prop.getName());

                        validateCreateInput = {
                            options,
                            returnType,
                        };
                    } else {
                        validateCreateInput = { returnType };
                    }
                } else if (method.getName() == "validateUpdateInput") {
                    validateUpdateInput = {};
                    const unwrappedType = unwrapArrayType(unwrapPromiseType(method.getReturnType()));
                    const returnType = unwrappedType.getText(method, ts.TypeFormatFlags.None);
                    const returnTypeImport = findReturnTypeImport(unwrappedType, serviceClassDeclaration, targetDirectory);
                    if (returnTypeImport) {
                        imports.push(returnTypeImport);
                    }
                    const parameters = method.getParameters();
                    if (parameters.length >= 2) {
                        //has options
                        const options = parameters[1]
                            .getType()
                            .getProperties()
                            .map((prop) => prop.getName());

                        validateUpdateInput = {
                            options,
                            returnType,
                        };
                    } else {
                        validateUpdateInput = { returnType };
                    }
                }
            }

            return {
                validateCreateInput,
                validateUpdateInput,
                imports,
                className: hooksServiceClassName,
            };
        }
    }
    throw new Error("CrudGenerator decorator not found");
}
