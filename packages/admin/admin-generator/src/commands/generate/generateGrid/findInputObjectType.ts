import type { IntrospectionInputObjectType, IntrospectionInputValue, IntrospectionQuery } from "graphql";

export function findInputObjectType(input: IntrospectionInputValue, schema: IntrospectionQuery) {
    let type = input.type;
    if (type.kind == "NON_NULL") {
        type = type.ofType;
    }
    if (type.kind !== "INPUT_OBJECT") {
        throw new Error("must be INPUT_OBJECT");
    }
    const typeName = type.name;
    const filterType = schema.__schema.types.find((type) => type.kind === "INPUT_OBJECT" && type.name === typeName) as
        IntrospectionInputObjectType | undefined;
    return filterType;
}
