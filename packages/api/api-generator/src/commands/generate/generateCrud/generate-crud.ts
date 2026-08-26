/* eslint-disable @typescript-eslint/no-explicit-any */
import { CRUD_GENERATOR_METADATA_KEY, type CrudGeneratorOptions, hasCrudFieldFeature, REQUIRED_PERMISSION_METADATA_KEY } from "@dextinity/cms-api";
import { type EntityMetadata, ReferenceKind } from "@mikro-orm/postgresql";
import * as path from "path";
import { singular } from "pluralize";

import { generateCrudInput } from "../generateCrudInput/generate-crud-input";
import { buildNameVariants } from "../utils/build-name-variants";
import { integerTypes, numberTypes } from "../utils/constants";
import { findHooksService } from "../utils/find-hooks-service";
import { generateImportsCode, type Imports } from "../utils/generate-imports-code";
import { findBlockImportPath, findBlockName, findEnumImportPath, findEnumName } from "../utils/ts-morph-helper";
import type { GeneratedFile } from "../utils/write-generated-files";
import { buildOptions } from "./build-options";
import { generateEnumFilterDto } from "./generate-enum-filter-dto";
import { generatePayloadObjectTypes } from "./generate-payload-object-types";
import { generateServiceHookCall } from "./generate-service-hook-call";

function generateFilterDto({
    generatorOptions,
    metadata,
}: {
    generatorOptions: CrudGeneratorOptions;
    metadata: EntityMetadata<any>;
}): GeneratedFile[] {
    const { classNameSingular, fileNameSingular } = buildNameVariants(metadata);
    const { crudFilterProps, targetDirectory } = buildOptions(metadata, generatorOptions);

    const generatedFiles: GeneratedFile[] = [];

    const imports: Imports = [];
    imports.push({ name: "IsOptional", importPath: "class-validator" });
    imports.push({ name: "ValidateNested", importPath: "class-validator" });
    imports.push({ name: "Type", importPath: "class-transformer" });
    imports.push({ name: "Field", importPath: "@nestjs/graphql" });
    imports.push({ name: "InputType", importPath: "@nestjs/graphql" });

    crudFilterProps.map((prop) => {
        if (prop.type == "EnumArrayType" || prop.enum) {
            const enumName = findEnumName(prop.name, metadata);
            const enumImportPath = findEnumImportPath(enumName, targetDirectory, metadata);
            const enumFilter = generateEnumFilterDto(
                prop.type == "EnumArrayType" ? "enums" : "enum",
                enumName,
                `${targetDirectory}/${enumImportPath}`,
            );
            generatedFiles.push(enumFilter);
            imports.push({
                name: `${enumName}${prop.type == "EnumArrayType" ? "EnumsFilter" : "EnumFilter"}`,
                importPath: `./${path.relative(`${targetDirectory}/dto`, `${enumFilter.targetDirectory}/${enumFilter.name.replace(/\.ts$/, "")}`)}`,
            });
        }
    });

    const filterOut = `
    @InputType()
    export class ${classNameSingular}Filter {
        ${crudFilterProps
            .map((prop) => {
                if (prop.type == "EnumArrayType") {
                    const enumName = findEnumName(prop.name, metadata);
                    return `@Field(() => ${enumName}EnumsFilter, { nullable: true })
                    @ValidateNested()
                    @IsOptional()
                    @Type(() => ${enumName}EnumsFilter)
                    ${prop.name}?: ${enumName}EnumsFilter;
                    `;
                } else if (prop.enum) {
                    const enumName = findEnumName(prop.name, metadata);
                    return `@Field(() => ${enumName}EnumFilter, { nullable: true })
                    @ValidateNested()
                    @IsOptional()
                    @Type(() => ${enumName}EnumFilter)
                    ${prop.name}?: ${enumName}EnumFilter;
                    `;
                } else if (prop.type === "string" || prop.type === "text") {
                    imports.push({ name: "StringFilter", importPath: "@dextinity/cms-api" });
                    return `@Field(() => StringFilter, { nullable: true })
                    @ValidateNested()
                    @IsOptional()
                    @Type(() => StringFilter)
                    ${prop.name}?: StringFilter;
                    `;
                } else if (numberTypes.includes(prop.type)) {
                    imports.push({ name: "NumberFilter", importPath: "@dextinity/cms-api" });
                    return `@Field(() => NumberFilter, { nullable: true })
                    @ValidateNested()
                    @IsOptional()
                    @Type(() => NumberFilter)
                    ${prop.name}?: NumberFilter;
                    `;
                } else if (prop.type === "boolean" || prop.type === "BooleanType") {
                    imports.push({ name: "BooleanFilter", importPath: "@dextinity/cms-api" });
                    return `@Field(() => BooleanFilter, { nullable: true })
                    @ValidateNested()
                    @IsOptional()
                    @Type(() => BooleanFilter)
                    ${prop.name}?: BooleanFilter;
                    `;
                } else if (prop.type === "DateType") {
                    // ISO Date without time
                    imports.push({ name: "DateFilter", importPath: "@dextinity/cms-api" });
                    return `@Field(() => DateFilter, { nullable: true })
                    @ValidateNested()
                    @IsOptional()
                    @Type(() => DateFilter)
                    ${prop.name}?: DateFilter;
                    `;
                } else if (prop.type === "Date") {
                    // DateTime
                    imports.push({ name: "DateTimeFilter", importPath: "@dextinity/cms-api" });
                    return `@Field(() => DateTimeFilter, { nullable: true })
                    @ValidateNested()
                    @IsOptional()
                    @Type(() => DateTimeFilter)
                    ${prop.name}?: DateTimeFilter;
                    `;
                } else if (prop.kind === "m:1") {
                    imports.push({ name: "ManyToOneFilter", importPath: "@dextinity/cms-api" });
                    return `@Field(() => ManyToOneFilter, { nullable: true })
                    @ValidateNested()
                    @IsOptional()
                    @Type(() => ManyToOneFilter)
                    ${prop.name}?: ManyToOneFilter;
                    `;
                } else if (prop.kind === "1:m") {
                    imports.push({ name: "OneToManyFilter", importPath: "@dextinity/cms-api" });
                    return `@Field(() => OneToManyFilter, { nullable: true })
                    @ValidateNested()
                    @IsOptional()
                    @Type(() => OneToManyFilter)
                    ${prop.name}?: OneToManyFilter;
                    `;
                } else if (prop.kind === "m:n") {
                    imports.push({ name: "ManyToManyFilter", importPath: "@dextinity/cms-api" });
                    return `@Field(() => ManyToManyFilter, { nullable: true })
                    @ValidateNested()
                    @IsOptional()
                    @Type(() => ManyToManyFilter)
                    ${prop.name}?: ManyToManyFilter;
                    `;
                } else if (prop.type == "uuid") {
                    imports.push({ name: "IdFilter", importPath: "@dextinity/cms-api" });
                    return `@Field(() => IdFilter, { nullable: true })
                    @ValidateNested()
                    @IsOptional()
                    @Type(() => IdFilter)
                    ${prop.name}?: IdFilter;
                    `;
                } else {
                    //unsupported type TODO support more
                }
                return "";
            })
            .join("\n")}

        @Field(() => [${classNameSingular}Filter], { nullable: true })
        @Type(() => ${classNameSingular}Filter)
        @ValidateNested({ each: true })
        @IsOptional()
        and?: ${classNameSingular}Filter[];

        @Field(() => [${classNameSingular}Filter], { nullable: true })
        @Type(() => ${classNameSingular}Filter)
        @ValidateNested({ each: true })
        @IsOptional()
        or?: ${classNameSingular}Filter[];
    }
    `;

    generatedFiles.push({
        name: `dto/${fileNameSingular}.filter.ts`,
        content: generateImportsCode(imports) + filterOut,
        type: "filter",
    });

    return generatedFiles;
}

export function generateSortDto({ generatorOptions, metadata }: { generatorOptions: CrudGeneratorOptions; metadata: EntityMetadata<any> }): string {
    const { classNameSingular } = buildNameVariants(metadata);
    const { crudSortProps } = buildOptions(metadata, generatorOptions);

    const sortOut = `import { SortDirection } from "@dextinity/cms-api";
    import { Field, InputType, registerEnumType } from "@nestjs/graphql";
    import { Type } from "class-transformer";
    import { IsEnum } from "class-validator";

    export enum ${classNameSingular}SortField {
        ${crudSortProps
            .map((prop) => {
                return `${prop.replace(".", "_")} = "${prop.replace(".", "_")}",`;
            })
            .join("\n")}
    }
    registerEnumType(${classNameSingular}SortField, {
        name: "${classNameSingular}SortField",
    });
    
    @InputType()
    export class ${classNameSingular}Sort {
        @Field(() => ${classNameSingular}SortField)
        @IsEnum(${classNameSingular}SortField)
        field: ${classNameSingular}SortField;
    
        @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
        @IsEnum(SortDirection)
        direction: SortDirection = SortDirection.ASC;
    }
    `;

    return sortOut;
}
function generatePaginatedDto({ generatorOptions, metadata }: { generatorOptions: CrudGeneratorOptions; metadata: EntityMetadata<any> }): string {
    const { classNamePlural } = buildNameVariants(metadata);
    const { targetDirectory } = buildOptions(metadata, generatorOptions);

    const paginatedOut = `import { ObjectType } from "@nestjs/graphql";
    import { PaginatedResponseFactory } from "@dextinity/cms-api";

    import { ${metadata.className} } from "${path.relative(`${targetDirectory}/dto`, metadata.path).replace(/\.ts$/, "")}";

    @ObjectType()
    export class Paginated${classNamePlural} extends PaginatedResponseFactory.create(${metadata.className}) {}
    `;

    return paginatedOut;
}

function generateArgsDto({ generatorOptions, metadata }: { generatorOptions: CrudGeneratorOptions; metadata: EntityMetadata<any> }): string {
    const { classNameSingular, fileNameSingular } = buildNameVariants(metadata);
    const {
        scopeProp,
        argsClassName,
        hasSearchArg,
        hasSortArg,
        hasFilterArg,
        dedicatedResolverArgProps,
        hasPositionProp,
        crudSortProps,
        hasPaging,
        targetDirectory,
    } = buildOptions(metadata, generatorOptions);
    const imports: Imports = [];
    if (scopeProp && scopeProp.targetMeta) {
        imports.push(generateEntityImport(scopeProp.targetMeta, `${targetDirectory}/dto`));
    }

    let defaultSortField: null | string = metadata.props.find((prop) => prop.primary)?.name || "id";
    if (hasPositionProp) {
        defaultSortField = "position";
    } else if (metadata.props.some((prop) => prop.name === "createdAt" && prop.type === "Date")) {
        defaultSortField = "createdAt";
    }
    if (!crudSortProps.includes(defaultSortField)) {
        defaultSortField = null;
    }

    const argsOut = `import { ArgsType, Field, IntersectionType, registerEnumType, ID } from "@nestjs/graphql";
    import { Type } from "class-transformer";
    import { IsOptional, IsString, ValidateNested, IsEnum, IsUUID } from "class-validator";
    ${hasPaging ? `import { OffsetBasedPaginationArgs, SortDirection } from "@dextinity/cms-api";` : ``}
    ${hasPaging && hasFilterArg ? `import { ${classNameSingular}Filter } from "./${fileNameSingular}.filter";` : ``}
    ${hasPaging && hasSortArg ? `import { ${classNameSingular}Sort, ${classNameSingular}SortField } from "./${fileNameSingular}.sort";` : ``}

    ${generateImportsCode(imports)}

    @ArgsType()
    export class ${argsClassName}${hasPaging ? ` extends OffsetBasedPaginationArgs` : ""} {
        ${
            scopeProp
                ? `
        @Field(() => ${scopeProp.type})
        @ValidateNested()
        @Type(() => ${scopeProp.type})
        scope: ${scopeProp.type};
        `
                : ""
        }

        ${dedicatedResolverArgProps
            .map((dedicatedResolverArgProp) => {
                if (integerTypes.includes(dedicatedResolverArgProp.type)) {
                    return `@Field(() => ID)
                    @Transform(({ value }) => value.map((id: string) => parseInt(id)))
                    @IsInt()
                    ${dedicatedResolverArgProp.name}: number;`;
                } else {
                    return `@Field(() => ID)
                    @IsUUID()
                    ${dedicatedResolverArgProp.name}: string;`;
                }
            })
            .join("")}

        ${
            hasPaging && hasSearchArg
                ? `
        @Field({ nullable: true })
        @IsOptional()
        @IsString()
        search?: string;
        `
                : ""
        }

        ${
            hasPaging && hasFilterArg
                ? `
        @Field(() => ${classNameSingular}Filter, { nullable: true })
        @ValidateNested()
        @Type(() => ${classNameSingular}Filter)
        @IsOptional()
        filter?: ${classNameSingular}Filter;
        `
                : ""
        }

        ${
            hasPaging && hasSortArg
                ? `
        @Field(() => [${classNameSingular}Sort], { ${defaultSortField === null ? "nullable: true" : `defaultValue: [{ field: ${classNameSingular}SortField.${defaultSortField}, direction: SortDirection.ASC }]`} })
        @ValidateNested({ each: true })
        @Type(() => ${classNameSingular}Sort)
        ${defaultSortField === null ? "@IsOptional()" : ""}
        sort${defaultSortField === null ? "?" : ""}: ${classNameSingular}Sort[];
        `
                : ""
        }
    }
    `;
    return argsOut;
}

function generateService({ generatorOptions, metadata }: { generatorOptions: CrudGeneratorOptions; metadata: EntityMetadata<any> }): string {
    const { classNameSingular, fileNameSingular, classNamePlural } = buildNameVariants(metadata);
    const { hasPositionProp, positionGroupProps, targetDirectory } = buildOptions(metadata, generatorOptions);

    const positionGroupType = positionGroupProps.length
        ? `{ ${positionGroupProps
              .map((prop) => {
                  const notSupportedReferenceKinds = [ReferenceKind.ONE_TO_MANY, ReferenceKind.MANY_TO_MANY];
                  if (notSupportedReferenceKinds.includes(prop.kind)) {
                      throw new Error(`Not supported reference-type for position-group. ${prop.name}`);
                  }
                  return `${prop.name}${prop.nullable ? `?` : ``}: ${
                      [ReferenceKind.MANY_TO_ONE, ReferenceKind.ONE_TO_ONE].includes(prop.kind) ? "string" : prop.type
                  }`;
              })
              .join(",")} }`
        : false;

    const serviceOut = `import { EntityManager, FilterQuery, raw } from "@mikro-orm/postgresql";
    import { Injectable } from "@nestjs/common";

    ${generateImportsCode([generateEntityImport(metadata, targetDirectory)])}
    ${generateImportsCode(
        positionGroupProps.reduce<Imports>((acc, prop) => {
            if (prop.targetMeta) {
                acc.push(generateEntityImport(prop.targetMeta, targetDirectory));
            }
            return acc;
        }, []),
    )}
    import { ${classNameSingular}Filter } from "./dto/${fileNameSingular}.filter";

    @Injectable()
    export class ${classNamePlural}Service {    
        ${
            hasPositionProp
                ? `constructor(
                    protected readonly entityManager: EntityManager,
                ) {}`
                : ""
        }

        ${
            hasPositionProp
                ? `
                async incrementPositions(${
                    positionGroupProps.length ? `group: ${positionGroupType},` : ``
                }lowestPosition: number, highestPosition?: number) {
                    // Increment positions between newPosition (inclusive) and oldPosition (exclusive)
                    await this.entityManager.nativeUpdate(${metadata.className},
                    ${
                        positionGroupProps.length
                            ? `{
                            $and: [
                                { position: { $gte: lowestPosition, ...(highestPosition ? { $lt: highestPosition } : {}) } },
                                this.getPositionGroupCondition(group),
                            ],
                        },`
                            : `{ position: { $gte: lowestPosition, ...(highestPosition ? { $lt: highestPosition } : {}) } },`
                    }
                        { position: raw("position + 1") },
                    );
                }

                async decrementPositions(${
                    positionGroupProps.length ? `group: ${positionGroupType},` : ``
                }lowestPosition: number, highestPosition?: number) {
                    // Decrement positions between oldPosition (exclusive) and newPosition (inclusive)
                    await this.entityManager.nativeUpdate(${metadata.className},
                    ${
                        positionGroupProps.length
                            ? `{
                            $and: [
                                { position: { $gt: lowestPosition, ...(highestPosition ? { $lte: highestPosition } : {}) } },
                                this.getPositionGroupCondition(group),
                            ],
                        },`
                            : `{ position: { $gt: lowestPosition, ...(highestPosition ? { $lte: highestPosition } : {}) } },`
                    }
                        { position: raw("position - 1") },
                    );
                }

                async getLastPosition(${positionGroupProps.length ? `group: ${positionGroupType}` : ``}) {
                    return this.entityManager.count(${metadata.className}, ${positionGroupProps.length ? `this.getPositionGroupCondition(group)` : `{}`});
                }

                ${
                    positionGroupProps.length
                        ? `getPositionGroupCondition(group: ${positionGroupType}): FilterQuery<${metadata.className}> {
                    return {
                        ${positionGroupProps.map((field) => `${field.name}: group.${field.name}`).join(",")}
                    };
                }`
                        : ``
                }
                `
                : ""
        }
    }
    `;
    return serviceOut;
}

function generateEntityImport(targetMetadata: EntityMetadata<any>, relativeTo: string): Imports[0] {
    const libMatch = targetMetadata.path.match(/(packages\/api|@dextinity)\/cms-api\/lib\/(.*)/);
    if (libMatch) {
        // Import from cms-api package
        return {
            name: targetMetadata.className,
            importPath: "@dextinity/cms-api",
        };
    }
    return {
        name: targetMetadata.className,
        importPath: path.relative(relativeTo, targetMetadata.path).replace(/\.ts$/, ""),
    };
}

export function generateInputHandling(
    options: { mode: "create" | "update" | "updateNested"; inputName: string; assignEntityCode: string; excludeFields?: string[] },
    metadata: EntityMetadata<any>,
    generatorOptions: CrudGeneratorOptions,
    targetDirectory: string,
): { code: string; imports: Imports } {
    const { instanceNameSingular } = buildNameVariants(metadata);
    const { blockProps, scopeProp, hasPositionProp, dedicatedResolverArgProps } = buildOptions(metadata, generatorOptions);

    const imports: Imports = [];

    const props = metadata.props.filter((prop) => !options.excludeFields || !options.excludeFields.includes(prop.name));

    const relationManyToOneProps = props.filter((prop) => prop.kind === "m:1");
    const relationOneToManyProps = props.filter((prop) => prop.kind === "1:m");
    const relationManyToManyProps = props.filter((prop) => prop.kind === "m:n");
    const relationOneToOneProps = props.filter((prop) => prop.kind === "1:1");

    const inputRelationManyToOneProps = relationManyToOneProps
        .filter((prop) => hasCrudFieldFeature(metadata.class, prop.name, "input"))
        .filter((prop) => {
            //filter out props that are dedicatedResolverArgProp
            return !dedicatedResolverArgProps.some((dedicatedResolverArgProp) => dedicatedResolverArgProp.name === prop.name);
        })
        .map((prop) => {
            const targetMeta = prop.targetMeta;
            if (!targetMeta) {
                throw new Error("targetMeta is not set for relation");
            }
            imports.push(generateEntityImport(targetMeta, targetDirectory));
            return {
                name: prop.name,
                singularName: singular(prop.name),
                nullable: prop.nullable,
                type: prop.type,
            };
        });

    const inputRelationOneToOneProps = relationOneToOneProps
        .filter((prop) => hasCrudFieldFeature(metadata.class, prop.name, "input"))
        .map((prop) => {
            const targetMeta = prop.targetMeta;
            if (!targetMeta) {
                throw new Error("targetMeta is not set for relation");
            }
            return {
                name: prop.name,
                singularName: singular(prop.name),
                nullable: prop.nullable,
                type: prop.type,
                targetMeta,
            };
        });
    const inputRelationToManyProps = [...relationOneToManyProps, ...relationManyToManyProps]
        .filter((prop) => hasCrudFieldFeature(metadata.class, prop.name, "input"))
        .map((prop) => {
            const targetMeta = prop.targetMeta;
            if (!targetMeta) {
                throw new Error("targetMeta is not set for relation");
            }
            return {
                name: prop.name,
                singularName: singular(prop.name),
                nullable: prop.nullable,
                type: prop.type,
                orphanRemoval: prop.orphanRemoval,
                targetMeta,
            };
        });

    const noAssignProps = [...inputRelationToManyProps, ...inputRelationManyToOneProps, ...inputRelationOneToOneProps, ...blockProps];
    const code = `
    ${
        noAssignProps.length
            ? `const { ${noAssignProps.map((prop) => `${prop.name}: ${prop.name}Input`).join(", ")}, ...assignInput } = ${options.inputName};`
            : ""
    }
    ${options.assignEntityCode}
    ...${noAssignProps.length ? `assignInput` : options.inputName},
        ${options.mode == "create" && scopeProp ? `scope,` : ""}${options.mode == "create" && hasPositionProp ? `position,` : ""}
        ${
            options.mode == "create"
                ? dedicatedResolverArgProps
                      .map((dedicatedResolverArgProp) => {
                          return `${dedicatedResolverArgProp.name}: Reference.create(await this.entityManager.findOneOrFail(${dedicatedResolverArgProp.type}, ${dedicatedResolverArgProp.name})), `;
                      })
                      .join("")
                : ""
        }
        ${
            options.mode == "create" || options.mode == "updateNested"
                ? inputRelationManyToOneProps
                      .map(
                          (prop) =>
                              `${prop.name}: ${prop.nullable ? `${prop.name}Input ? ` : ""}Reference.create(await this.entityManager.findOneOrFail(${prop.type}, ${prop.name}Input))${prop.nullable ? ` : undefined` : ""}, `,
                      )
                      .join("")
                : ""
        }
        ${
            options.mode == "create" || options.mode == "updateNested"
                ? blockProps.map((prop) => `${prop.name}: ${prop.name}Input.transformToBlockData(),`).join("")
                : ""
        }
});
${inputRelationToManyProps
    .map((prop) => {
        if (prop.orphanRemoval) {
            imports.push(generateEntityImport(prop.targetMeta, targetDirectory));
            const { code, imports: nestedImports } = generateInputHandling(
                {
                    mode: "updateNested",
                    inputName: `${prop.singularName}Input`,

                    // alternative `const ${prop.singularName} = this.entityManager.create(${prop.type}, {` requires back relation to be set
                    assignEntityCode: `const ${prop.singularName} = this.entityManager.assign(new ${prop.type}(), {`,

                    excludeFields: prop.targetMeta.props
                        .filter((prop) => prop.kind == "m:1" && prop.targetMeta == metadata) //filter out referencing back to this entity
                        .map((prop) => prop.name),
                },
                prop.targetMeta,
                generatorOptions,
                targetDirectory,
            );
            imports.push(...nestedImports);
            const isAsync = code.includes("await ");
            return `if (${prop.name}Input) {
        await ${instanceNameSingular}.${prop.name}.loadItems();
        ${instanceNameSingular}.${prop.name}.set(
            ${isAsync ? `await Promise.all(` : ""}
            ${prop.name}Input.map(${isAsync ? `async ` : ""}(${prop.singularName}Input) => {
                ${code}
                return ${prop.singularName};
            })
            ${isAsync ? `)` : ""}
        );
        }`;
        } else {
            return `
            if (${prop.name}Input) {
                const ${prop.name} = await this.entityManager.find(${prop.type}, { id: ${prop.name}Input });
                if (${prop.name}.length != ${prop.name}Input.length) throw new Error("Couldn't find all ${prop.name} that were passed as input");
                await ${instanceNameSingular}.${prop.name}.loadItems();
                ${instanceNameSingular}.${prop.name}.set(${prop.name}.map((${prop.singularName}) => Reference.create(${prop.singularName})));
            }`;
        }
    })
    .join("")}

${inputRelationOneToOneProps
    .map((prop) => {
        imports.push(generateEntityImport(prop.targetMeta, targetDirectory));
        const { code, imports: nestedImports } = generateInputHandling(
            {
                mode: "updateNested",
                inputName: `${prop.name}Input`,
                assignEntityCode: `this.entityManager.assign(${prop.singularName}, {`,
                excludeFields: prop.targetMeta.props
                    .filter((prop) => prop.kind == "1:1" && prop.targetMeta == metadata) //filter out referencing back to this entity
                    .map((prop) => prop.name),
            },
            prop.targetMeta,
            generatorOptions,
            targetDirectory,
        );
        imports.push(...nestedImports);

        return `
            ${options.mode != "create" || prop.nullable ? `if (${prop.name}Input) {` : "{"}
                const ${prop.singularName} = ${
                    (options.mode == "update" || options.mode == "updateNested") && prop.nullable
                        ? `${instanceNameSingular}.${prop.name} ? await ${instanceNameSingular}.${prop.name}.loadOrFail() : new ${prop.type}();`
                        : `new ${prop.type}();`
                }
                ${code}
                ${options.mode != "create" || prop.nullable ? `}` : "}"}`;
    })
    .join("")}
${
    options.mode == "update"
        ? inputRelationManyToOneProps
              .map(
                  (prop) => `if (${prop.name}Input !== undefined) {
                        ${instanceNameSingular}.${prop.name} =
                            ${prop.nullable ? `${prop.name}Input ? ` : ""}
                            Reference.create(await this.entityManager.findOneOrFail(${prop.type}, ${prop.name}Input))
                            ${prop.nullable ? ` : undefined` : ""};
                        }`,
              )
              .join("")
        : ""
}
${
    options.mode == "update"
        ? blockProps
              .map(
                  (prop) => `
                    if (${prop.name}Input) {
                        ${instanceNameSingular}.${prop.name} = ${prop.name}Input.transformToBlockData();
                    }`,
              )
              .join("")
        : ""
}
    `;

    return { code, imports };
}

function generateNestedEntityResolver({ generatorOptions, metadata }: { generatorOptions: CrudGeneratorOptions; metadata: EntityMetadata<any> }) {
    const { classNameSingular } = buildNameVariants(metadata);
    const { skipScopeCheck, targetDirectory } = buildOptions(metadata, generatorOptions);

    const entityHasRequiredPermission = !!Reflect.getMetadata(REQUIRED_PERMISSION_METADATA_KEY, metadata.class);

    const imports: Imports = [];

    const {
        imports: fieldImports,
        code,
        hasOutputRelations,
        needsBlocksTransformer,
    } = generateRelationsFieldResolver({ generatorOptions, metadata });
    if (!hasOutputRelations) {
        return null;
    }
    imports.push(...fieldImports);

    imports.push(generateEntityImport(metadata, targetDirectory));

    return `
    import { ${entityHasRequiredPermission ? "" : "RequiredPermission, "}RootBlockDataScalar, BlocksTransformerService } from "@dextinity/cms-api";
    import { Args, ID, Info, Mutation, Query, Resolver, ResolveField, Parent } from "@nestjs/graphql";
    ${generateImportsCode(imports)}

    @Resolver(() => ${metadata.className})
    ${entityHasRequiredPermission ? "" : `@RequiredPermission(${JSON.stringify(generatorOptions.requiredPermission)}${skipScopeCheck ? `, { skipScopeCheck: true }` : ""})`}
    export class ${classNameSingular}Resolver {
        ${needsBlocksTransformer ? `constructor(protected readonly blocksTransformer: BlocksTransformerService) {}` : ""}
        ${code}
    }
    `;
}

function generateRelationsFieldResolver({ generatorOptions, metadata }: { generatorOptions: CrudGeneratorOptions; metadata: EntityMetadata<any> }) {
    const { instanceNameSingular } = buildNameVariants(metadata);
    const { targetDirectory } = buildOptions(metadata, generatorOptions);

    const relationManyToOneProps = metadata.props.filter((prop) => prop.kind === "m:1");
    const relationOneToManyProps = metadata.props.filter((prop) => prop.kind === "1:m");
    const relationManyToManyProps = metadata.props.filter((prop) => prop.kind === "m:n");
    const relationOneToOneProps = metadata.props.filter((prop) => prop.kind === "1:1");
    const outputRelationManyToOneProps = relationManyToOneProps.filter((prop) => hasCrudFieldFeature(metadata.class, prop.name, "resolveField"));
    const outputRelationOneToManyProps = relationOneToManyProps.filter((prop) => hasCrudFieldFeature(metadata.class, prop.name, "resolveField"));
    const outputRelationManyToManyProps = relationManyToManyProps.filter((prop) => hasCrudFieldFeature(metadata.class, prop.name, "resolveField"));
    const outputRelationOneToOneProps = relationOneToOneProps.filter((prop) => hasCrudFieldFeature(metadata.class, prop.name, "resolveField"));
    for (const prop of metadata.props) {
        if (
            !hasCrudFieldFeature(metadata.class, prop.name, "resolveField") &&
            !relationManyToOneProps.includes(prop) &&
            !relationOneToManyProps.includes(prop) &&
            !relationManyToManyProps.includes(prop) &&
            !relationOneToOneProps.includes(prop)
        ) {
            throw new Error(
                `${prop.name}: @CrudField resolveField=false is only used for relations, for other props simply remove @Field() to disable its output`,
            );
        }
    }

    const resolveFieldBlockProps = metadata.props.filter((prop) => {
        return hasCrudFieldFeature(metadata.class, prop.name, "resolveField") && prop.type === "RootBlockType";
    });

    const hasOutputRelations =
        outputRelationManyToOneProps.length > 0 ||
        outputRelationOneToManyProps.length > 0 ||
        outputRelationManyToManyProps.length > 0 ||
        outputRelationOneToOneProps.length > 0;

    const imports: Imports = [];

    for (const prop of [...relationManyToOneProps, ...relationOneToManyProps, ...relationManyToManyProps, ...relationOneToOneProps]) {
        if (!prop.targetMeta) {
            throw new Error(`Relation ${prop.name} has targetMeta not set`);
        }
        imports.push(generateEntityImport(prop.targetMeta, targetDirectory));
    }

    for (const prop of resolveFieldBlockProps) {
        const blockName = findBlockName(prop.name, metadata);
        const importPath = findBlockImportPath(blockName, `${targetDirectory}`, metadata);
        imports.push({ name: blockName, importPath });
    }

    const code = `
    ${outputRelationManyToOneProps
        .map(
            (prop) => `
        @ResolveField(() => ${prop.type}${prop.nullable ? `, { nullable: true }` : ""})
        async ${prop.name}(@Parent() ${instanceNameSingular}: ${metadata.className}): Promise<${prop.type}${prop.nullable ? ` | undefined` : ""}> {
            return ${instanceNameSingular}.${prop.name}${prop.nullable ? `?` : ""}.loadOrFail();
        }    
    `,
        )
        .join("\n")}

    ${outputRelationOneToManyProps
        .map(
            (prop) => `
        @ResolveField(() => [${prop.type}])
        async ${prop.name}(@Parent() ${instanceNameSingular}: ${metadata.className}): Promise<${prop.type}[]> {
            return ${instanceNameSingular}.${prop.name}.loadItems();
        }   
    `,
        )
        .join("\n")}

    ${outputRelationManyToManyProps
        .map(
            (prop) => `
        @ResolveField(() => [${prop.type}])
        async ${prop.name}(@Parent() ${instanceNameSingular}: ${metadata.className}): Promise<${prop.type}[]> {
            return ${instanceNameSingular}.${prop.name}.loadItems();
        }
    `,
        )
        .join("\n")}

    ${outputRelationOneToOneProps
        .map(
            (prop) => `
        @ResolveField(() => ${prop.type}${prop.nullable ? `, { nullable: true }` : ""})
        async ${prop.name}(@Parent() ${instanceNameSingular}: ${metadata.className}): Promise<${prop.type}${prop.nullable ? ` | undefined` : ""}> {
            return ${instanceNameSingular}.${prop.name}${prop.nullable ? `?` : ""}.loadOrFail();
        }
    `,
        )
        .join("\n")}

        ${resolveFieldBlockProps
            .map(
                (prop) => `
        @ResolveField(() => RootBlockDataScalar(${findBlockName(prop.name, metadata)}))
        async ${prop.name}(@Parent() ${instanceNameSingular}: ${metadata.className}): Promise<object> {
            return this.blocksTransformer.transformToPlain(${instanceNameSingular}.${prop.name});
        }
        `,
            )
            .join("\n")}

    `.trim();

    return {
        code,
        imports,
        hasOutputRelations,
        needsBlocksTransformer: resolveFieldBlockProps.length > 0,
    };
}

function generateResolver({ generatorOptions, metadata }: { generatorOptions: CrudGeneratorOptions; metadata: EntityMetadata<any> }): string {
    const { classNameSingular, fileNameSingular, instanceNameSingular, classNamePlural, fileNamePlural, instanceNamePlural } =
        buildNameVariants(metadata);
    const {
        scopeProp,
        skipScopeCheck,
        argsClassName,
        argsFileName,
        hasSlugProp,
        hasSearchArg,
        hasSortArg,
        hasFilterArg,
        hasPositionProp,
        positionGroupProps,
        hasDeletedAtProp,
        dedicatedResolverArgProps,
        targetDirectory,
        hasPaging,
        hasArgsClass,
    } = buildOptions(metadata, generatorOptions);

    const imports: Imports = [];

    const { code: createInputHandlingCode, imports: createInputHandlingImports } = generateInputHandling(
        {
            mode: "create",
            inputName: "input",
            assignEntityCode: `const ${instanceNameSingular} = this.entityManager.create(${metadata.className}, {`,
        },
        metadata,
        generatorOptions,
        targetDirectory,
    );
    imports.push(...createInputHandlingImports);

    const { code: updateInputHandlingCode, imports: updateInputHandlingImports } = generateInputHandling(
        { mode: "update", inputName: "input", assignEntityCode: `${instanceNameSingular}.assign({` },
        metadata,
        generatorOptions,
        targetDirectory,
    );
    imports.push(...updateInputHandlingImports);

    const {
        imports: relationsFieldResolverImports,
        code: relationsFieldResolverCode,
        needsBlocksTransformer,
    } = generateRelationsFieldResolver({
        generatorOptions,
        metadata,
    });
    imports.push(...relationsFieldResolverImports);

    imports.push(generateEntityImport(metadata, targetDirectory));
    if (scopeProp && scopeProp.targetMeta) {
        imports.push(generateEntityImport(scopeProp.targetMeta, targetDirectory));
    }

    const hooksService = findHooksService({ generatorOptions, metadata, targetDirectory });
    if (hooksService) {
        imports.push(...hooksService.imports);
        if (
            hooksService.validateCreateInput?.options?.includes("currentUser") ||
            hooksService.validateUpdateInput?.options?.includes("currentUser")
        ) {
            imports.push({ name: "GetCurrentUser", importPath: "@dextinity/cms-api" });
            imports.push({ name: "CurrentUser", importPath: "@dextinity/cms-api" });
        }
    }

    function generateIdArg(name: string, metadata: EntityMetadata<any>): string {
        if (integerTypes.includes(metadata.properties[name].type)) {
            return `@Args("${name}", { type: () => ID }, { transform: (value) => parseInt(value) }) ${name}: number`;
        } else {
            return `@Args("${name}", { type: () => ID }) ${name}: string`;
        }
    }

    const payloadObjectTypes = generatePayloadObjectTypes({ hooksService, instanceNameSingular, entityName: metadata.className });
    imports.push(...payloadObjectTypes.imports);

    const entityHasRequiredPermission = !!Reflect.getMetadata(REQUIRED_PERMISSION_METADATA_KEY, metadata.class);

    imports.push({ name: "SortDirection", importPath: "@dextinity/cms-api" });
    if (!entityHasRequiredPermission) {
        imports.push({ name: "RequiredPermission", importPath: "@dextinity/cms-api" });
    }
    imports.push({ name: "AffectedEntity", importPath: "@dextinity/cms-api" });
    imports.push({ name: "validateNotModified", importPath: "@dextinity/cms-api" });
    imports.push({ name: "RootBlockDataScalar", importPath: "@dextinity/cms-api" });
    imports.push({ name: "BlocksTransformerService", importPath: "@dextinity/cms-api" });
    imports.push({ name: "gqlArgsToMikroOrmQuery", importPath: "@dextinity/cms-api" });
    imports.push({ name: "gqlSortToMikroOrmOrderBy", importPath: "@dextinity/cms-api" });

    const resolverOut = `import { EntityManager, FindOptions, ObjectQuery, Reference } from "@mikro-orm/postgresql";
    import { Args, ID, Mutation, Query, Resolver, ResolveField, Parent } from "@nestjs/graphql";

    ${hasPositionProp ? `import { ${classNamePlural}Service } from "./${fileNamePlural}.service";` : ``}
    import { ${classNameSingular}Input, ${classNameSingular}UpdateInput } from "./dto/${fileNameSingular}.input";
    ${hasPaging ? `import { Paginated${classNamePlural} } from "./dto/paginated-${fileNamePlural}";` : ""}
    ${hasArgsClass ? `import { ${argsClassName} } from "./dto/${argsFileName}";` : ""}
    ${generateImportsCode(imports)}

    ${payloadObjectTypes.code}

    @Resolver(() => ${metadata.className})
    ${entityHasRequiredPermission ? "" : `@RequiredPermission(${JSON.stringify(generatorOptions.requiredPermission)}${skipScopeCheck ? `, { skipScopeCheck: true }` : ""})`}
    export class ${classNameSingular}Resolver {
        constructor(
            protected readonly entityManager: EntityManager,${
                hasPositionProp ? `protected readonly ${instanceNamePlural}Service: ${classNamePlural}Service,` : ``
            }
            ${needsBlocksTransformer ? `private readonly blocksTransformer: BlocksTransformerService,` : ""}
            ${hooksService ? `protected readonly ${instanceNameSingular}Service: ${hooksService.className},` : ""}
        ) {}

        ${
            generatorOptions.single
                ? `
        @Query(() => ${metadata.className})
        @AffectedEntity(${metadata.className})
        async ${instanceNameSingular}(${generateIdArg("id", metadata)}): Promise<${metadata.className}> {
            const ${instanceNameSingular} = await this.entityManager.findOneOrFail(${metadata.className}, id);
            return ${instanceNameSingular};
        }
        `
                : ""
        }

        ${
            hasSlugProp
                ? `
        @Query(() => ${metadata.className}, { nullable: true })
        async ${instanceNameSingular}BySlug(
            @Args("slug") slug: string
            ${scopeProp ? `, @Args("scope", { type: () => ${scopeProp.type} }) scope: ${scopeProp.type}` : ""}
        ): Promise<${metadata.className} | null> {
            const ${instanceNameSingular} = await this.entityManager.findOne(${metadata.className}, { slug${scopeProp ? `, scope` : ""}});

            return ${instanceNameSingular} ?? null;
        }
        `
                : ""
        }

        ${
            generatorOptions.list
                ? `
        @Query(() => ${hasPaging ? `Paginated${classNamePlural}` : `[${metadata.className}]`})
        ${dedicatedResolverArgProps
            .map((dedicatedResolverArgProp) => {
                return `@AffectedEntity(${dedicatedResolverArgProp.targetMeta?.className}, { idArg: "${dedicatedResolverArgProp.name}" })`;
            })
            .join("")}
        async ${instanceNameSingular != instanceNamePlural ? instanceNamePlural : `${instanceNamePlural}List`}(
            ${
                hasArgsClass
                    ? `@Args() {${Object.entries({
                          scope: !!scopeProp,
                          ...dedicatedResolverArgProps.reduce(
                              (acc, dedicatedResolverArgProp) => {
                                  acc[dedicatedResolverArgProp.name] = true;
                                  return acc;
                              },
                              {} as Record<string, boolean>,
                          ),
                          search: hasPaging && !!hasSearchArg,
                          filter: hasPaging && !!hasFilterArg,
                          sort: hasPaging && !!hasSortArg,
                          offset: hasPaging,
                          limit: hasPaging,
                      })
                          .filter(([key, use]) => use)
                          .map(([key]) => key)
                          .join(", ")}}: ${argsClassName}`
                    : ""
            }
        ): Promise<${hasPaging ? `Paginated${classNamePlural}` : `${metadata.className}[]`}> {
            const where${
                hasPaging && (hasSearchArg || hasFilterArg)
                    ? ` = gqlArgsToMikroOrmQuery({ ${hasSearchArg ? `search, ` : ""}${hasFilterArg ? `filter, ` : ""} }, this.entityManager.getMetadata(${metadata.className}));`
                    : `: ObjectQuery<${metadata.className}> = {}`
            }
            ${scopeProp ? `where.scope = scope;` : ""}
            ${dedicatedResolverArgProps
                .map((dedicatedResolverArgProp) => {
                    return `where.${dedicatedResolverArgProp.name} = ${dedicatedResolverArgProp.name};`;
                })
                .join("\n")}

            const options: FindOptions<${metadata.className}> = { ${hasPaging ? "offset, limit" : ""}};

            ${
                hasPaging && hasSortArg
                    ? `if (sort) {
                options.orderBy = gqlSortToMikroOrmOrderBy(sort);
            }`
                    : ""
            }

            ${
                hasPaging
                    ? `const [entities, totalCount] = await this.entityManager.findAndCount(${metadata.className}, where, options);
            return new Paginated${classNamePlural}(entities, totalCount);`
                    : `const entities = await this.entityManager.find(${metadata.className}, where, options);
            return entities;`
            }
        }
        `
                : ""
        }

        ${
            generatorOptions.create
                ? `

        @Mutation(() => ${payloadObjectTypes.createPayloadType || metadata.className})
        ${dedicatedResolverArgProps
            .map((dedicatedResolverArgProp) => {
                return `@AffectedEntity(${dedicatedResolverArgProp.targetMeta?.className}, { idArg: "${dedicatedResolverArgProp.name}" })`;
            })
            .join("")}
        async create${classNameSingular}(
            ${scopeProp ? `@Args("scope", { type: () => ${scopeProp.type} }) scope: ${scopeProp.type},` : ""}${dedicatedResolverArgProps
                .map((dedicatedResolverArgProp) => {
                    return `${generateIdArg(dedicatedResolverArgProp.name, metadata)}, `;
                })
                .join("")}@Args("input", { type: () => ${classNameSingular}Input }) input: ${classNameSingular}Input
                ${hooksService?.validateCreateInput?.options?.includes("currentUser") ? `, @GetCurrentUser() user: CurrentUser` : ""}
        ): Promise<${payloadObjectTypes.createPayloadType || metadata.className}> {
            ${generateServiceHookCall("validateCreateInput", { hooksService, instanceNameSingular, scopeProp, dedicatedResolverArgProps })}

            ${
                // use local position-var because typescript does not narrow down input.position, keeping "| undefined" typing resulting in typescript error in create-function
                hasPositionProp
                    ? `
            const lastPosition = await this.${instanceNamePlural}Service.getLastPosition(${
                positionGroupProps.length
                    ? `{ ${positionGroupProps
                          .map((prop) =>
                              prop.name === "scope"
                                  ? `scope`
                                  : dedicatedResolverArgProps.find((dedicatedResolverArgProp) => dedicatedResolverArgProp.name === prop.name) !==
                                      undefined
                                    ? prop.name
                                    : `${prop.name}: input.${prop.name}`,
                          )
                          .join(",")} }`
                    : ``
            });
            let position = input.position;
            if (position !== undefined && position < lastPosition + 1) {
                await this.${instanceNamePlural}Service.incrementPositions(${
                    positionGroupProps.length
                        ? `{ ${positionGroupProps
                              .map((prop) =>
                                  prop.name === "scope"
                                      ? `scope`
                                      : dedicatedResolverArgProps.find((dedicatedResolverArgProp) => dedicatedResolverArgProp.name === prop.name) !==
                                          undefined
                                        ? prop.name
                                        : `${prop.name}: input.${prop.name}`,
                              )
                              .join(",")} }, `
                        : ``
                }position);
            } else {
                position = lastPosition + 1;
            }`
                    : ""
            }

            ${createInputHandlingCode}

            await this.entityManager.flush();

            return ${payloadObjectTypes.createPayloadType ? `{ ${instanceNameSingular}, errors: [] }` : instanceNameSingular};
        }
        `
                : ""
        }

        ${
            generatorOptions.update
                ? `
        @Mutation(() => ${payloadObjectTypes.updatePayloadType || metadata.className})
        @AffectedEntity(${metadata.className})
        async update${classNameSingular}(
            ${generateIdArg("id", metadata)},
            @Args("input", { type: () => ${classNameSingular}UpdateInput }) input: ${classNameSingular}UpdateInput
            ${hooksService?.validateUpdateInput?.options?.includes("currentUser") ? `, @GetCurrentUser() user: CurrentUser` : ""}
        ): Promise<${payloadObjectTypes.updatePayloadType || metadata.className}> {
            const ${instanceNameSingular} = await this.entityManager.findOneOrFail(${metadata.className}, id);
            ${generateServiceHookCall("validateUpdateInput", { hooksService, instanceNameSingular, scopeProp, dedicatedResolverArgProps })}

            ${
                hasPositionProp
                    ? `
            if (input.position !== undefined) {
                const lastPosition = await this.${instanceNamePlural}Service.getLastPosition(${
                    positionGroupProps.length
                        ? `{ ${positionGroupProps
                              .map(
                                  (prop) =>
                                      `${prop.name}: ${instanceNameSingular}.${prop.name}${
                                          [ReferenceKind.MANY_TO_ONE, ReferenceKind.ONE_TO_ONE].includes(prop.kind)
                                              ? `${prop.nullable ? `?` : ``}.id`
                                              : ``
                                      }`,
                              )
                              .join(",")} }`
                        : ``
                });
                if (input.position > lastPosition) {
                    input.position = lastPosition;
                }
                if (${instanceNameSingular}.position < input.position) {
                    await this.${instanceNamePlural}Service.decrementPositions(${
                        positionGroupProps.length
                            ? `{ ${positionGroupProps
                                  .map(
                                      (prop) =>
                                          `${prop.name}: ${instanceNameSingular}.${prop.name}${
                                              [ReferenceKind.MANY_TO_ONE, ReferenceKind.ONE_TO_ONE].includes(prop.kind)
                                                  ? `${prop.nullable ? `?` : ``}.id`
                                                  : ``
                                          }`,
                                  )
                                  .join(",")} },`
                            : ``
                    }${instanceNameSingular}.position, input.position);
                } else if (${instanceNameSingular}.position > input.position) {
                    await this.${instanceNamePlural}Service.incrementPositions(${
                        positionGroupProps.length
                            ? `{ ${positionGroupProps
                                  .map(
                                      (prop) =>
                                          `${prop.name}: ${instanceNameSingular}.${prop.name}${
                                              [ReferenceKind.MANY_TO_ONE, ReferenceKind.ONE_TO_ONE].includes(prop.kind)
                                                  ? `${prop.nullable ? `?` : ``}.id`
                                                  : ``
                                          }`,
                                  )
                                  .join(",")} },`
                            : ``
                    }input.position, ${instanceNameSingular}.position);
                }
            }`
                    : ""
            }

            ${updateInputHandlingCode}

            await this.entityManager.flush();

            return ${payloadObjectTypes.updatePayloadType ? `{ ${instanceNameSingular}, errors: [] }` : instanceNameSingular};
        }
        `
                : ""
        }

        ${
            generatorOptions.delete
                ? `
        @Mutation(() => Boolean)
        @AffectedEntity(${metadata.className})
        async delete${metadata.className}(${generateIdArg("id", metadata)}): Promise<boolean> {
            const ${instanceNameSingular} = await this.entityManager.findOneOrFail(${metadata.className}, id);
            ${hasDeletedAtProp ? `${instanceNameSingular}.assign({ deletedAt: new Date() });` : `this.entityManager.remove(${instanceNameSingular});`}
            ${
                hasPositionProp
                    ? `await this.${instanceNamePlural}Service.decrementPositions(${
                          positionGroupProps.length
                              ? `{ ${positionGroupProps
                                    .map(
                                        (prop) =>
                                            `${prop.name}: ${instanceNameSingular}.${prop.name}${
                                                [ReferenceKind.MANY_TO_ONE, ReferenceKind.ONE_TO_ONE].includes(prop.kind)
                                                    ? `${prop.nullable ? `?` : ``}.id`
                                                    : ``
                                            }`,
                                    )
                                    .join(",")} },`
                              : ``
                      }${instanceNameSingular}.position);`
                    : ""
            }
            await this.entityManager.flush();
            return true;
        }
        `
                : ""
        }

        ${relationsFieldResolverCode}
    }
    `;
    return resolverOut;
}

export async function generateCrud(generatorOptionsParam: CrudGeneratorOptions, metadata: EntityMetadata<any>): Promise<GeneratedFile[]> {
    const generatorOptions = {
        ...generatorOptionsParam,
        create: generatorOptionsParam.create ?? true,
        update: generatorOptionsParam.update ?? true,
        delete: generatorOptionsParam.delete ?? true,
        list: generatorOptionsParam.list ?? true,
        single: generatorOptionsParam.single ?? true,
    };
    if (!generatorOptions.create && !generatorOptions.update && !generatorOptions.delete && !generatorOptions.list && !generatorOptions.single) {
        throw new Error("At least one of create, update, delete, list or single must be true");
    }

    const generatedFiles: GeneratedFile[] = [];

    const { fileNameSingular, fileNamePlural } = buildNameVariants(metadata);
    const { hasFilterArg, hasSortArg, argsFileName, hasPositionProp, hasPaging, hasArgsClass } = buildOptions(metadata, generatorOptions);

    async function generateCrudResolver(): Promise<GeneratedFile[]> {
        if (hasPaging && hasFilterArg) {
            generatedFiles.push(...generateFilterDto({ generatorOptions, metadata }));
        }
        if (hasPaging && hasSortArg) {
            generatedFiles.push({
                name: `dto/${fileNameSingular}.sort.ts`,
                content: generateSortDto({ generatorOptions, metadata }),
                type: "sort",
            });
        }
        if (hasPaging) {
            generatedFiles.push({
                name: `dto/paginated-${fileNamePlural}.ts`,
                content: generatePaginatedDto({ generatorOptions, metadata }),
                type: "sort",
            });
        }
        if (hasArgsClass) {
            generatedFiles.push({
                name: `dto/${argsFileName}.ts`,
                content: generateArgsDto({ generatorOptions, metadata }),
                type: "args",
            });
        }
        if (hasPositionProp) {
            generatedFiles.push({
                name: `${fileNamePlural}.service.ts`,
                content: generateService({ generatorOptions, metadata }),
                type: "service",
            });
        }
        generatedFiles.push({
            name: `${fileNameSingular}.resolver.ts`,
            content: generateResolver({ generatorOptions, metadata }),
            type: "resolver",
        });

        metadata.props
            .filter((prop) => {
                if (prop.kind === "1:m" && prop.orphanRemoval) {
                    if (!prop.targetMeta) {
                        throw new Error(`Target metadata not set`);
                    }
                    const hasOwnCrudGenerator = Reflect.getMetadata(CRUD_GENERATOR_METADATA_KEY, prop.targetMeta.class);
                    if (!hasOwnCrudGenerator) {
                        //generate nested resolver only if target entity has no own crud generator
                        return true;
                    }
                }
            })
            .forEach((prop) => {
                if (!prop.targetMeta) {
                    throw new Error(`Target metadata not set`);
                }
                const { fileNameSingular } = buildNameVariants(prop.targetMeta);
                const content = generateNestedEntityResolver({ generatorOptions, metadata: prop.targetMeta });

                //can be null if no relations exist
                if (content) {
                    generatedFiles.push({
                        name: `${fileNameSingular}.resolver.ts`,
                        content,
                        type: "resolver",
                    });
                }
            });

        return generatedFiles;
    }

    const crudInput = await generateCrudInput(generatorOptions, metadata);
    const crudResolver = await generateCrudResolver();

    return [...crudInput, ...crudResolver];
}
