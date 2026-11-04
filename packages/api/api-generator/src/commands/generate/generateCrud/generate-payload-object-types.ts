import type { findHooksService } from "../utils/find-hooks-service";
import type { Imports } from "../utils/generate-imports-code";

export function generatePayloadObjectTypes({
    hooksService,
    instanceNameSingular,
    entityName,
}: {
    hooksService: ReturnType<typeof findHooksService>;
    instanceNameSingular: string;
    entityName: string;
}) {
    const ret: { createPayloadType: string | null; updatePayloadType: string | null; code: string; imports: Imports } = {
        createPayloadType: null,
        updatePayloadType: null,
        code: "",
        imports: [],
    };
    const createReturnType = hooksService?.validateCreateInput?.returnType;
    if (createReturnType) {
        ret.createPayloadType = `Create${entityName}Payload`;
        ret.code += generate({ className: ret.createPayloadType, returnType: createReturnType, instanceNameSingular, entityName });
    }
    const updateReturnType = hooksService?.validateUpdateInput?.returnType;
    if (updateReturnType) {
        ret.updatePayloadType = `Update${entityName}Payload`;
        ret.code += generate({ className: ret.updatePayloadType, returnType: updateReturnType, instanceNameSingular, entityName });
    }
    if (createReturnType || updateReturnType) {
        ret.imports.push({ name: "ObjectType", importPath: "@nestjs/graphql" });
        ret.imports.push({ name: "Field", importPath: "@nestjs/graphql" });
    }

    return ret;
}

function generate({
    className,
    returnType,
    instanceNameSingular,
    entityName,
}: {
    className: string;
    returnType: string;
    instanceNameSingular: string;
    entityName: string;
}) {
    return `
        @ObjectType()
        class ${className} {
            @Field(() => ${entityName}, { nullable: true })
            ${instanceNameSingular}?: ${entityName};

            @Field(() => [${returnType}], { nullable: false })
            errors: ${returnType}[];
        }
    `;
}
