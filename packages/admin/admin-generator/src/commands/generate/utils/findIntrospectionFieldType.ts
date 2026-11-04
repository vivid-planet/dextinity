import type { IntrospectionObjectType, IntrospectionQuery } from "graphql";

export function findIntrospectionFieldType({
    name,
    gqlType,
    gqlIntrospection,
}: {
    name: string;
    gqlType: string;
    gqlIntrospection: IntrospectionQuery;
}) {
    let introspectionFieldType;
    for (const namePart of name.split(".")) {
        const introspectionObject = gqlIntrospection.__schema.types.find((type) => type.kind === "OBJECT" && type.name === gqlType) as
            IntrospectionObjectType | undefined;
        if (!introspectionObject) {
            throw new Error(`didn't find object ${gqlType} in gql introspection`);
        }

        const introspectionField = (introspectionObject as IntrospectionObjectType).fields.find((field) => field.name === namePart);
        introspectionFieldType = introspectionField
            ? introspectionField.type.kind === "NON_NULL"
                ? introspectionField.type.ofType
                : introspectionField.type
            : undefined;
        if (introspectionFieldType?.kind === "OBJECT") {
            // for next loop iteration (nested fields)
            gqlType = introspectionFieldType.name;
        }
    }
    return introspectionFieldType;
}
