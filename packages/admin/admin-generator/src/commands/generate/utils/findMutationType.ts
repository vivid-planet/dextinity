import type { IntrospectionObjectType, IntrospectionQuery } from "graphql";

export function findMutationType(mutationName: string, schema: IntrospectionQuery) {
    if (!schema.__schema.mutationType) {
        throw new Error("Schema has no Mutation type");
    }
    const queryType = schema.__schema.types.find((type) => type.name === schema.__schema.mutationType?.name) as IntrospectionObjectType | undefined;
    if (!queryType) {
        throw new Error("Can't find Mutation type in gql schema");
    }
    return queryType.fields.find((field) => field.name === mutationName);
}

export function findMutationTypeOrThrow(mutationName: string, schema: IntrospectionQuery) {
    const ret = findMutationType(mutationName, schema);
    if (!ret) {
        throw new Error(`Can't find Mutation ${mutationName} in gql schema`);
    }
    return ret;
}
