import { type CrudSingleGeneratorOptions, hasCrudFieldFeature, REQUIRED_PERMISSION_METADATA_KEY } from "@dextinity/cms-api";
import type { EntityMetadata } from "@mikro-orm/postgresql";
import * as path from "path";

import { buildOptions } from "../generateCrud/build-options";
import { generateCrudInput } from "../generateCrudInput/generate-crud-input";
import type { GeneratedFile } from "../utils/write-generated-files";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateCrudSingle(generatorOptions: CrudSingleGeneratorOptions, metadata: EntityMetadata<any>): Promise<GeneratedFile[]> {
    const classNameSingular = metadata.className;
    const classNamePlural = !metadata.className.endsWith("s") ? `${metadata.className}s` : metadata.className;
    const instanceNameSingular = classNameSingular[0].toLocaleLowerCase() + classNameSingular.slice(1);
    const instanceNamePlural = classNamePlural[0].toLocaleLowerCase() + classNamePlural.slice(1);
    const fileNameSingular = instanceNameSingular.replace(/[A-Z]/g, (i) => `-${i.toLocaleLowerCase()}`);
    const fileNamePlural = instanceNamePlural.replace(/[A-Z]/g, (i) => `-${i.toLocaleLowerCase()}`);
    const { targetDirectory } = buildOptions(metadata, generatorOptions);

    async function generateCrudResolver(): Promise<GeneratedFile[]> {
        const generatedFiles: GeneratedFile[] = [];

        const entityHasRequiredPermission = !!Reflect.getMetadata(REQUIRED_PERMISSION_METADATA_KEY, metadata.class);

        const scopeProp = metadata.props.find((prop) => prop.name == "scope");
        if (scopeProp && !scopeProp.targetMeta) {
            throw new Error("Scope prop has no targetMeta");
        }
        const blockProps = metadata.props.filter((prop) => {
            return hasCrudFieldFeature(metadata.class, prop.name, "input") && prop.type === "RootBlockType";
        });

        const serviceOut = `import { ObjectQuery } from "@mikro-orm/postgresql";
    import { Injectable } from "@nestjs/common";
    import { ${metadata.className} } from "${path.relative(targetDirectory, metadata.path).replace(/\.ts$/, "")}";
    
    @Injectable()
    export class ${classNamePlural}Service {    
        
    }
    `;
        generatedFiles.push({ name: `${fileNamePlural}.service.ts`, content: serviceOut, type: "service" });

        const resolverOut = `import { FindOptions, EntityManager } from "@mikro-orm/postgresql";
    import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
    import { ${entityHasRequiredPermission ? "" : "RequiredPermission, "}SortDirection, validateNotModified } from "@dextinity/cms-api";
    
    import { ${metadata.className} } from "${path.relative(targetDirectory, metadata.path).replace(/\.ts$/, "")}";
    ${
        scopeProp && scopeProp.targetMeta
            ? `import { ${scopeProp.targetMeta.className} } from "${path.relative(targetDirectory, scopeProp.targetMeta.path).replace(/\.ts$/, "")}";`
            : ""
    }
    import { ${classNamePlural}Service } from "./${fileNamePlural}.service";
    import { ${classNameSingular}Input } from "./dto/${fileNameSingular}.input";

    @Resolver(() => ${metadata.className})
    ${entityHasRequiredPermission ? "" : `@RequiredPermission(${JSON.stringify(generatorOptions.requiredPermission)}${!scopeProp ? `, { skipScopeCheck: true }` : ""})`}
    export class ${classNameSingular}Resolver {
        constructor(
            protected readonly entityManager: EntityManager,
            protected readonly ${instanceNamePlural}Service: ${classNamePlural}Service,
        ) {}
    
        @Query(() => ${metadata.className}, { nullable: true })
        async ${instanceNameSingular}(
                ${scopeProp ? `@Args("scope", { type: () => ${scopeProp.type} }) scope: ${scopeProp.type},` : ""}
            ): Promise<${metadata.className} | null> {
            const ${instanceNamePlural} = await this.entityManager.find(${metadata.className}, {${scopeProp ? `scope` : ""}});
            if (${instanceNamePlural}.length > 1) {
                throw new Error("There must be only one ${instanceNameSingular}");
            }
    
            return ${instanceNamePlural}.length > 0 ? ${instanceNamePlural}[0] : null;
        }
    
        @Mutation(() => ${metadata.className})
        async save${classNameSingular}(
            ${scopeProp ? `@Args("scope", { type: () => ${scopeProp.type} }) scope: ${scopeProp.type},` : ""}
            @Args("input", { type: () => ${classNameSingular}Input }) input: ${classNameSingular}Input
        ): Promise<${metadata.className}> {
            let ${instanceNameSingular} = await this.entityManager.findOne(${metadata.className}, {${scopeProp ? `scope` : ""}});

            if (!${instanceNameSingular}) {
                ${instanceNameSingular} = this.entityManager.create(${metadata.className}, {
                    ...input,
                    ${blockProps.length ? `${blockProps.map((prop) => `${prop.name}: input.${prop.name}.transformToBlockData()`).join(", ")}, ` : ""}
                    ${scopeProp ? `scope,` : ""} 
                });
            }

            ${instanceNameSingular}.assign({
                ...input,
                ${blockProps.length ? `${blockProps.map((prop) => `${prop.name}: input.${prop.name}.transformToBlockData()`).join(", ")}, ` : ""}
            });
    
            await this.entityManager.flush();
    
            return ${instanceNameSingular};
        }
    }
    `;

        generatedFiles.push({ name: `${fileNameSingular}.resolver.ts`, content: resolverOut, type: "resolver" });

        return generatedFiles;
    }

    return [
        ...(await generateCrudInput(generatorOptions, metadata, { nested: false, excludeFields: [], generateUpdateInput: false })),
        ...(await generateCrudResolver()),
    ];
}
