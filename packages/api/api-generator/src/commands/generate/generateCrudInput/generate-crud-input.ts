import { hasCrudFieldFeature, type Permission } from "@dextinity/cms-api";
import type { EntityMetadata } from "@mikro-orm/postgresql";
import { getMetadataStorage } from "class-validator";
import { SyntaxKind } from "ts-morph";

import { buildOptions } from "../generateCrud/build-options";
import { buildNameVariants } from "../utils/build-name-variants";
import { integerTypes, numberTypes } from "../utils/constants";
import { generateImportsCode, type Imports } from "../utils/generate-imports-code";
import {
    findBlockImportPath,
    findBlockName,
    findEnumImportPath,
    findEnumName,
    findImportPath,
    findInputClassImportPath,
    findValidatorImportPath,
    getFieldDecoratorClassName,
    morphTsProperty,
} from "../utils/ts-morph-helper";
import type { GeneratedFile } from "../utils/write-generated-files";

function tsCodeRecordToString(object: Record<string, string | undefined>) {
    const filteredEntries = Object.entries(object).filter(([key, value]) => value !== undefined);
    if (filteredEntries.length == 0) {
        return "";
    }
    return `{${filteredEntries.map(([key, value]) => `${key}: ${value},`).join("\n")}}`;
}

function findReferenceTargetType(
    targetMeta: EntityMetadata<unknown> | undefined,
    referencedColumnName: string,
): "uuid" | "string" | "integer" | null {
    const referencedColumnProp = targetMeta?.props.find((p) => p.name == referencedColumnName);
    if (!referencedColumnProp) {
        throw new Error("referencedColumnProp not found");
    }
    if (referencedColumnProp.type == "uuid") {
        return "uuid";
    } else if (referencedColumnProp.type == "text") {
        return "string";
    } else if (referencedColumnProp.type == "string") {
        return "string";
    } else if (referencedColumnProp.type == "integer" || referencedColumnProp.type == "int") {
        return "integer";
    } else {
        return null;
    }
}

export async function generateCrudInput(
    generatorOptions: { requiredPermission: Permission | Permission[] },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: EntityMetadata<any>,
    options: { nested: boolean; fileName?: string; className?: string; excludeFields: string[]; generateUpdateInput?: boolean } = {
        nested: false,
        excludeFields: [],
        generateUpdateInput: true,
    },
): Promise<GeneratedFile[]> {
    const generatedFiles: GeneratedFile[] = [];

    const { dedicatedResolverArgProps, targetDirectory } = buildOptions(metadata, generatorOptions);

    const props = metadata.props
        .filter((prop) => {
            return !prop.embedded;
        })
        .filter((prop) => {
            return hasCrudFieldFeature(metadata.class, prop.name, "input");
        })
        .filter((prop) => {
            //filter out props that are dedicatedResolverArgProps
            return !dedicatedResolverArgProps.some((dedicatedResolverArgProp) => dedicatedResolverArgProp.name === prop.name);
        })
        .filter((prop) => !options.excludeFields.includes(prop.name));

    let fieldsOut = "";
    const imports: Imports = [
        { name: "IsSlug", importPath: "@dextinity/cms-api" },
        { name: "RootBlockInputScalar", importPath: "@dextinity/cms-api" },
        { name: "IsNullable", importPath: "@dextinity/cms-api" },
        { name: "PartialType", importPath: "@dextinity/cms-api" },
        { name: "BlockInputInterface", importPath: "@dextinity/cms-api" },
        { name: "isBlockInputInterface", importPath: "@dextinity/cms-api" },
        { name: "IsString", importPath: "class-validator" },
        { name: "IsNotEmpty", importPath: "class-validator" },
        { name: "ValidateNested", importPath: "class-validator" },
        { name: "IsNumber", importPath: "class-validator" },
        { name: "IsBoolean", importPath: "class-validator" },
        { name: "IsDate", importPath: "class-validator" },
        { name: "IsDateString", importPath: "class-validator" },
        { name: "IsOptional", importPath: "class-validator" },
        { name: "IsEnum", importPath: "class-validator" },
        { name: "IsUUID", importPath: "class-validator" },
        { name: "IsArray", importPath: "class-validator" },
        { name: "IsInt", importPath: "class-validator" },
    ];
    for (const prop of props) {
        let type = prop.type;
        const fieldName = prop.name;
        const definedDecorators = morphTsProperty(prop.name, metadata).getDecorators();
        const decorators = [] as Array<string>;
        let isOptional = prop.nullable;

        if (prop.name != "position") {
            if (!prop.nullable) {
                decorators.push("@IsNotEmpty()");
            } else {
                decorators.push("@IsNullable()");
            }
        }
        if (["id", "createdAt", "updatedAt", "scope"].includes(prop.name)) {
            //skip those (TODO find a non-magic solution?)
            continue;
        } else if (prop.name == "position") {
            const initializer = morphTsProperty(prop.name, metadata).getInitializer()?.getText();
            const defaultValue = initializer == "undefined" || initializer == "null" ? "null" : initializer;
            const fieldOptions = tsCodeRecordToString({ nullable: "true", defaultValue });
            isOptional = true;
            decorators.push(`@IsOptional()`);
            imports.push({ name: "Min", importPath: "class-validator" });
            decorators.push(`@Min(1)`);
            decorators.push("@IsInt()");
            decorators.push(`@Field(() => Int, ${fieldOptions})`);

            type = "number";
        } else if (prop.enum) {
            const initializer = morphTsProperty(prop.name, metadata).getInitializer()?.getText();
            const defaultValue =
                prop.nullable && (initializer == "undefined" || initializer == "null" || initializer === undefined) ? "null" : initializer;
            const fieldOptions = tsCodeRecordToString({ nullable: prop.nullable ? "true" : undefined, defaultValue });
            const enumName = findEnumName(prop.name, metadata);
            const importPath = findEnumImportPath(enumName, `${targetDirectory}/dto`, metadata);
            imports.push({ name: enumName, importPath });
            decorators.push(`@IsEnum(${enumName})`);
            decorators.push(`@Field(() => ${enumName}, ${fieldOptions})`);
            type = enumName;
        } else if (prop.type === "EnumArrayType") {
            if (prop.nullable) {
                console.warn(`${prop.name}: Nullable enum arrays are not supported`);
            }
            decorators.length = 0; //remove @IsNotEmpty
            const initializer = morphTsProperty(prop.name, metadata).getInitializer()?.getText();
            const fieldOptions = tsCodeRecordToString({ defaultValue: initializer });
            const enumName = findEnumName(prop.name, metadata);
            const importPath = findEnumImportPath(enumName, `${targetDirectory}/dto`, metadata);
            imports.push({ name: enumName, importPath });
            decorators.push(`@IsEnum(${enumName}, { each: true })`);
            decorators.push(`@Field(() => [${enumName}], ${fieldOptions})`);
            type = `${enumName}[]`;
        } else if (prop.type === "string" || prop.type === "text") {
            const initializer = morphTsProperty(prop.name, metadata).getInitializer()?.getText();
            const defaultValue =
                prop.nullable && (initializer == "undefined" || initializer == "null" || initializer === undefined) ? "null" : initializer;
            const fieldOptions = tsCodeRecordToString({ nullable: prop.nullable ? "true" : undefined, defaultValue });
            decorators.push("@IsString()");
            if (prop.name.startsWith("scope_")) {
                continue;
            } else if (prop.name === "slug") {
                //TODO find a non-magic solution
                decorators.push("@IsSlug()");
            }
            decorators.push(`@Field(${fieldOptions})`);
            type = "string";
        } else if (numberTypes.includes(prop.type)) {
            const initializer = morphTsProperty(prop.name, metadata).getInitializer()?.getText();
            const defaultValue =
                prop.nullable && (initializer == "undefined" || initializer == "null" || initializer === undefined) ? "null" : initializer;
            const fieldOptions = tsCodeRecordToString({ nullable: prop.nullable ? "true" : undefined, defaultValue });
            if (integerTypes.includes(prop.columnTypes[0])) {
                decorators.push("@IsInt()");
                decorators.push(`@Field(() => Int, ${fieldOptions})`);
            } else {
                decorators.push("@IsNumber()");
                decorators.push(`@Field(${fieldOptions})`);
            }
            type = "number";
        } else if (prop.type === "DateType") {
            // ISO Date without time
            const initializer = morphTsProperty(prop.name, metadata).getInitializer()?.getText();
            const defaultValue =
                prop.nullable && (initializer == "undefined" || initializer == "null" || initializer === undefined) ? "null" : initializer;
            const fieldOptions = tsCodeRecordToString({ nullable: prop.nullable ? "true" : undefined, defaultValue });
            decorators.push("@IsDateString()");
            decorators.push(`@Field(() => GraphQLLocalDate, ${fieldOptions})`);
            type = "string";
        } else if (prop.type === "Date") {
            // DateTime
            const initializer = morphTsProperty(prop.name, metadata).getInitializer()?.getText();
            const defaultValue =
                prop.nullable && (initializer == "undefined" || initializer == "null" || initializer === undefined) ? "null" : initializer;
            const fieldOptions = tsCodeRecordToString({ nullable: prop.nullable ? "true" : undefined, defaultValue });
            decorators.push("@IsDate()");
            decorators.push(`@Field(${fieldOptions})`);
            type = "Date";
        } else if (prop.type === "BooleanType" || prop.type === "boolean") {
            const initializer = morphTsProperty(prop.name, metadata).getInitializer()?.getText();
            const defaultValue =
                prop.nullable && (initializer == "undefined" || initializer == "null" || initializer === undefined) ? "null" : initializer;
            const fieldOptions = tsCodeRecordToString({ nullable: prop.nullable ? "true" : undefined, defaultValue });
            decorators.push("@IsBoolean()");
            decorators.push(`@Field(${fieldOptions})`);
            type = "boolean";
        } else if (prop.type === "RootBlockType") {
            const blockName = findBlockName(prop.name, metadata);
            const importPath = findBlockImportPath(blockName, `${targetDirectory}/dto`, metadata);
            imports.push({ name: blockName, importPath });

            decorators.push(`@Field(() => RootBlockInputScalar(${blockName})${prop.nullable ? ", { nullable: true }" : ""})`);
            decorators.push(
                `@Transform(({ value }) => (isBlockInputInterface(value) ? value : ${blockName}.blockInputFactory(value)), { toClassOnly: true })`,
            );
            decorators.push("@ValidateNested()");
            type = "BlockInputInterface";
        } else if (prop.kind == "m:1") {
            const initializer = morphTsProperty(prop.name, metadata).getInitializer()?.getText();
            const defaultValueNull = prop.nullable && (initializer == "undefined" || initializer == "null" || initializer === undefined);
            const fieldOptions = tsCodeRecordToString({
                nullable: prop.nullable ? "true" : undefined,
                defaultValue: defaultValueNull ? "null" : undefined,
            });
            decorators.push(`@Field(() => ID, ${fieldOptions})`);

            if (prop.referencedColumnNames.length > 1) {
                console.warn(`${prop.name}: Composite keys are not supported`);
                continue;
            }
            const refType = findReferenceTargetType(prop.targetMeta, prop.referencedColumnNames[0]);
            if (refType == "uuid") {
                type = "string";
                decorators.push("@IsUUID()");
            } else if (refType == "string") {
                type = "string";
                decorators.push("@IsString()");
            } else if (refType == "integer") {
                type = "number";
                decorators.push("@Transform(({ value }) => (value ? parseInt(value) : null))");
                decorators.push("@IsInt()");
            } else {
                console.warn(`${prop.name}: Unsupported referenced type`);
                continue;
            }
        } else if (prop.kind == "1:m") {
            if (prop.orphanRemoval) {
                //if orphanRemoval is enabled, we need to generate a nested input type
                decorators.length = 0;
                if (!prop.targetMeta) {
                    throw new Error("No targetMeta");
                }
                const inputNameClassName = `${metadata.className}Nested${prop.targetMeta.className}Input`;
                {
                    const excludeFields = prop.targetMeta.props.filter((p) => p.kind == "m:1" && p.targetMeta == metadata).map((p) => p.name);

                    const { fileNameSingular } = buildNameVariants(metadata);
                    const { fileNameSingular: targetFileNameSingular } = buildNameVariants(prop.targetMeta);
                    const fileName = `dto/${fileNameSingular}-nested-${targetFileNameSingular}.input.ts`;

                    const nestedInputFiles = await generateCrudInput(generatorOptions, prop.targetMeta, {
                        nested: true,
                        fileName,
                        className: inputNameClassName,
                        excludeFields,
                    });
                    generatedFiles.push(...nestedInputFiles);
                    imports.push({
                        name: inputNameClassName,
                        importPath: nestedInputFiles[nestedInputFiles.length - 1].name.replace(/^dto/, ".").replace(/\.ts$/, ""),
                    });
                }
                decorators.push(`@Field(() => [${inputNameClassName}], {${prop.nullable ? "nullable: true" : "defaultValue: []"}})`);
                decorators.push(`@IsArray()`);
                decorators.push(`@Type(() => ${inputNameClassName})`);
                type = `${inputNameClassName}[]`;
            } else {
                //if orphanRemoval is disabled, we reference the id in input
                decorators.length = 0;
                decorators.push(`@Field(() => [ID], {${prop.nullable ? "nullable: true" : "defaultValue: []"}})`);
                decorators.push(`@IsArray()`);

                if (prop.referencedColumnNames.length > 1) {
                    console.warn(`${prop.name}: Composite keys are not supported`);
                    continue;
                }
                const refType = findReferenceTargetType(prop.targetMeta, prop.referencedColumnNames[0]);
                if (refType == "uuid") {
                    type = "string[]";
                    decorators.push("@IsUUID(undefined, { each: true })");
                } else if (refType == "string") {
                    type = "string[]";
                    decorators.push("@IsString({ each: true })");
                } else if (refType == "integer") {
                    type = "number[]";
                    decorators.push("@Transform(({ value }) => value.map((id: string) => parseInt(id)))");
                    decorators.push("@IsInt({ each: true })");
                } else {
                    console.warn(`${prop.name}: Unsupported referenced type`);
                }
            }
        } else if (prop.kind == "m:n") {
            decorators.length = 0;
            decorators.push(`@Field(() => [ID], {${prop.nullable ? "nullable: true" : "defaultValue: []"}})`);
            decorators.push(`@IsArray()`);

            if (prop.referencedColumnNames.length > 1) {
                console.warn(`${prop.name}: Composite keys are not supported`);
                continue;
            }
            const refType = findReferenceTargetType(prop.targetMeta, prop.referencedColumnNames[0]);
            if (refType == "uuid") {
                type = "string[]";
                decorators.push("@IsUUID(undefined, { each: true })");
            } else if (refType == "string") {
                type = "string[]";
                decorators.push("@IsString({ each: true })");
            } else if (refType == "integer") {
                type = "number[]";
                decorators.push("@Transform(({ value }) => value.map((id: string) => parseInt(id)))");
            } else {
                console.warn(`${prop.name}: Unsupported referenced type`);
            }
        } else if (prop.kind == "1:1") {
            if (!prop.targetMeta) {
                throw new Error("No targetMeta");
            }
            const inputNameClassName = `${metadata.className}Nested${prop.targetMeta.className}Input`;
            {
                const excludeFields = prop.targetMeta.props.filter((p) => p.kind == "1:1" && p.targetMeta == metadata).map((p) => p.name);
                const { fileNameSingular } = buildNameVariants(metadata);
                const { fileNameSingular: targetFileNameSingular } = buildNameVariants(prop.targetMeta);
                const fileName = `dto/${fileNameSingular}-nested-${targetFileNameSingular}.input.ts`;
                const nestedInputFiles = await generateCrudInput(generatorOptions, prop.targetMeta, {
                    nested: true,
                    fileName,
                    className: inputNameClassName,
                    excludeFields,
                });
                generatedFiles.push(...nestedInputFiles);
                imports.push({
                    name: inputNameClassName,
                    importPath: nestedInputFiles[nestedInputFiles.length - 1].name.replace(/^dto/, ".").replace(/\.ts$/, ""),
                });
            }
            decorators.push(`@Field(() => ${inputNameClassName}${prop.nullable ? ", { nullable: true }" : ""})`);
            decorators.push(`@Type(() => ${inputNameClassName})`);
            decorators.push("@ValidateNested()");
            type = `${inputNameClassName}`;
        } else if (prop.type == "JsonType" || prop.embeddable || prop.type == "ArrayType") {
            const tsProp = morphTsProperty(prop.name, metadata);

            let tsType = tsProp.getType();
            if (tsType.isUnion() && tsType.getUnionTypes().length == 2 && tsType.getUnionTypes()[0].getText() == "undefined") {
                // undefinded | type (or prop?: type) -> type
                tsType = tsType.getUnionTypes()[1];
            }
            type = tsType.getText(tsProp);
            if (tsType.isArray()) {
                const initializer = tsProp.getInitializer()?.getText();
                const defaultValue =
                    prop.nullable && (initializer == "undefined" || initializer == "null" || initializer === undefined)
                        ? "null"
                        : initializer == "[]"
                          ? "[]"
                          : undefined;
                const fieldOptions = tsCodeRecordToString({
                    nullable: prop.nullable ? "true" : undefined,
                    defaultValue: defaultValue,
                });

                decorators.push(`@IsArray()`);
                if (type == "string[]") {
                    decorators.push(`@Field(() => [String], ${fieldOptions})`);
                    decorators.push("@IsString({ each: true })");
                } else if (type == "number[]") {
                    decorators.push(`@Field(() => [Number], ${fieldOptions})`);
                    decorators.push("@IsNumber({ each: true })");
                } else if (type == "boolean[]") {
                    decorators.push(`@Field(() => [Boolean], ${fieldOptions})`);
                    decorators.push("@IsBoolean({ each: true })");
                } else if (tsType.getArrayElementTypeOrThrow().isClass()) {
                    const nestedClassName = tsType.getArrayElementTypeOrThrow().getText(tsProp);
                    const importPath = findInputClassImportPath(nestedClassName, `${targetDirectory}/dto`, metadata);
                    imports.push({ name: nestedClassName, importPath });
                    decorators.push(`@ValidateNested()`);
                    decorators.push(`@Type(() => ${nestedClassName})`);
                    decorators.push(`@Field(() => [${nestedClassName}], ${fieldOptions})`);
                } else {
                    const typeNode = tsProp.getTypeNodeOrThrow().asKindOrThrow(SyntaxKind.ArrayType);
                    const elementTypeNode = typeNode.getElementTypeNode();
                    if (elementTypeNode.isKind(SyntaxKind.TypeReference)) {
                        // if the element type is a type reference, we need to find the import path
                        const { importPath } = findImportPath(elementTypeNode.getText(), `${targetDirectory}/dto`, metadata);
                        if (importPath) {
                            imports.push({ name: elementTypeNode.getText(), importPath });
                        }
                    }
                    decorators.push(`@Field(() => [GraphQLJSONObject], ${fieldOptions}) // Warning: this input is not validated properly`);
                }
            } else if (tsType.isClass()) {
                const nestedClassName = tsType.getText(tsProp);
                const importPath = findInputClassImportPath(nestedClassName, `${targetDirectory}/dto`, metadata);
                imports.push({ name: nestedClassName, importPath });
                decorators.push(`@ValidateNested()`);
                decorators.push(`@Type(() => ${nestedClassName})`);
                decorators.push(`@Field(() => ${nestedClassName}${prop.nullable ? ", { nullable: true }" : ""})`);
            } else {
                const typeNode = tsProp.getTypeNodeOrThrow();
                if (typeNode.isKind(SyntaxKind.TypeReference)) {
                    // if the element type is a type reference, we need to find the import path
                    const { importPath } = findImportPath(typeNode.getText(), `${targetDirectory}/dto`, metadata);
                    if (importPath) {
                        imports.push({ name: typeNode.getText(), importPath });
                    }
                }
                decorators.push(
                    `@Field(() => GraphQLJSONObject${prop.nullable ? ", { nullable: true }" : ""}) // Warning: this input is not validated properly`,
                );
            }
        } else if (prop.type == "uuid") {
            const initializer = morphTsProperty(prop.name, metadata).getInitializer()?.getText();
            const defaultValueNull = prop.nullable && (initializer == "undefined" || initializer == "null" || initializer === undefined);
            const fieldOptions = tsCodeRecordToString({
                nullable: prop.nullable ? "true" : undefined,
                defaultValue: defaultValueNull ? "null" : undefined,
            });
            decorators.push(`@Field(() => ID, ${fieldOptions})`);
            decorators.push("@IsUUID()");
            type = "string";
        } else if (getFieldDecoratorClassName(prop.name, metadata)) {
            //for custom mikro-orm type
            const className = getFieldDecoratorClassName(prop.name, metadata) as string;
            const importPath = findInputClassImportPath(className, `${targetDirectory}/dto`, metadata);
            imports.push({ name: className, importPath });
            decorators.push(`@ValidateNested()`);
            decorators.push(`@Type(() => ${className})`);
            decorators.push(`@Field(() => ${className}${prop.nullable ? ", { nullable: true }" : ""})`);
            type = className;
        } else {
            console.warn(`${prop.name}: unsupported type ${type}`);
            continue;
        }

        const classValidatorValidators = getMetadataStorage().getTargetValidationMetadatas(metadata.class, prop.name, false, false, undefined);
        for (const validator of classValidatorValidators) {
            if (validator.propertyName !== prop.name) {
                continue;
            }
            const constraints = getMetadataStorage().getTargetValidatorConstraints(validator.constraintCls);
            for (const constraint of constraints) {
                const decorator = definedDecorators.find((decorator) => {
                    return (
                        // ignore casing since class validator is inconsistent with casing
                        decorator.getName().toUpperCase() === constraint.name.toUpperCase() ||
                        // some class validator decorators have a prefix "Is" but not in the constraint name
                        `Is${decorator.getName()}`.toUpperCase() === constraint.name.toUpperCase()
                    );
                });
                if (decorator) {
                    const importPath = findValidatorImportPath(decorator.getName(), targetDirectory, metadata);
                    if (importPath) {
                        imports.push({ name: decorator.getName(), importPath });
                        if (!decorators.includes(decorator.getText())) {
                            decorators.unshift(decorator.getText());
                        }
                    }
                } else {
                    console.warn(`Decorator import for constraint ${constraint.name} not found`);
                }
            }
        }

        fieldsOut += `${decorators.join("\n")}
    ${fieldName}${isOptional ? "?" : ""}: ${type};
    
    `;
    }
    const className = options.className ?? `${metadata.className}Input`;
    const inputOut = `import { Field, InputType, ID, Int } from "@nestjs/graphql";
import { Transform, Type } from "class-transformer";
import { GraphQLJSONObject, GraphQLLocalDate } from "graphql-scalars";
${generateImportsCode(imports)}

@InputType()
export class ${className} {
    ${fieldsOut}
}

${
    options.generateUpdateInput && !options.nested
        ? `
@InputType()
export class ${className.replace(/Input$/, "")}UpdateInput extends PartialType(${className}) {}
`
        : ""
}
`;

    const { fileNameSingular } = buildNameVariants(metadata);
    const fileName = options.fileName ?? `dto/${fileNameSingular}.input.ts`;
    generatedFiles.push({
        name: fileName,
        content: inputOut,
        type: "input",
    });
    return generatedFiles;
}
