import type { IntrospectionObjectType, IntrospectionQuery } from "graphql";

function findQueryType(queryName: string, schema: IntrospectionQuery) {
    const queryType = schema.__schema.types.find((type) => type.name === schema.__schema.queryType.name) as IntrospectionObjectType | undefined;
    if (!queryType) {
        throw new Error("Can't find Query type in gql schema");
    }
    const ret = queryType.fields.find((field) => field.name === queryName);
    if (!ret) {
        throw new Error(`Can't find query ${queryName} in gql schema`);
    }
    return ret;
}

export function findQueryTypeOrThrow(queryName: string, schema: IntrospectionQuery) {
    const ret = findQueryType(queryName, schema);
    if (!ret) {
        throw new Error(`Can't find query ${queryName} in gql schema`);
    }
    return ret;
}
