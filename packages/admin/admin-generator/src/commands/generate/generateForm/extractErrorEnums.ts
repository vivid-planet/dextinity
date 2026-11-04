import type {
    IntrospectionField,
    IntrospectionListTypeRef,
    IntrospectionNamedTypeRef,
    IntrospectionObjectType,
    IntrospectionQuery,
    IntrospectionTypeRef,
} from "graphql";

interface ErrorEnumsResult {
    createErrorEnum?: string;
    updateErrorEnum?: string;
    useDifferentEnums: boolean;
}

/**
 * Extracts error enum type names from create and update mutations.
 * Navigates: Mutation → return type → payload object → errors field → LIST → error object → code field → ENUM
 */
export function extractErrorEnumsFromMutations({
    createMutationType,
    updateMutationType,
    gqlIntrospection,
}: {
    createMutationType: IntrospectionField | null;
    updateMutationType: IntrospectionField | null;
    gqlIntrospection: IntrospectionQuery;
}): ErrorEnumsResult {
    const createErrorEnum = createMutationType ? extractErrorEnumFromMutation(createMutationType, gqlIntrospection) : undefined;
    const updateErrorEnum = updateMutationType ? extractErrorEnumFromMutation(updateMutationType, gqlIntrospection) : undefined;

    const useDifferentEnums = Boolean(createErrorEnum && updateErrorEnum && createErrorEnum !== updateErrorEnum);

    return {
        createErrorEnum,
        updateErrorEnum,
        useDifferentEnums,
    };
}

/**
 * Extracts error enum type name from a single mutation field.
 * Returns undefined if mutation doesn't have error enum.
 */
function extractErrorEnumFromMutation(mutationType: IntrospectionField, gqlIntrospection: IntrospectionQuery): string | undefined {
    try {
        // 1. Get return type, unwrap NON_NULL if present
        let returnType: IntrospectionTypeRef = mutationType.type;
        if (returnType.kind === "NON_NULL") {
            returnType = returnType.ofType;
        }

        // 2. Check if return type is an OBJECT (payload type)
        if (returnType.kind !== "OBJECT") {
            return undefined;
        }

        // 3. Find the payload object type in introspection schema
        const payloadType = gqlIntrospection.__schema.types.find((type) => type.kind === "OBJECT" && type.name === returnType.name) as
            IntrospectionObjectType | undefined;

        if (!payloadType) {
            return undefined;
        }

        // 4. Find "errors" field in the payload object
        const errorsField = payloadType.fields.find((field) => field.name === "errors");
        if (!errorsField) {
            return undefined;
        }

        // 5. Extract enum from errors field
        return extractEnumFromErrorsField(errorsField, gqlIntrospection);
    } catch {
        // If anything goes wrong during traversal, return undefined
        return undefined;
    }
}

/**
 * Extracts enum type name from the errors field.
 * Traverses: errors field → unwrap NON_NULL → unwrap LIST → unwrap NON_NULL → error OBJECT → code field → ENUM
 */
function extractEnumFromErrorsField(errorsField: IntrospectionField, gqlIntrospection: IntrospectionQuery): string | undefined {
    try {
        // 1. Get errors field type, unwrap NON_NULL if present
        let errorsType: IntrospectionTypeRef = errorsField.type;
        if (errorsType.kind === "NON_NULL") {
            errorsType = errorsType.ofType;
        }

        // 2. Check if it's a LIST
        if (errorsType.kind !== "LIST") {
            return undefined;
        }

        // 3. Get the list item type, unwrap NON_NULL if present
        let errorItemType: IntrospectionTypeRef = (errorsType as IntrospectionListTypeRef).ofType;
        if (errorItemType.kind === "NON_NULL") {
            errorItemType = errorItemType.ofType;
        }

        // 4. Check if item type is an OBJECT (error type)
        if (errorItemType.kind !== "OBJECT") {
            return undefined;
        }

        // 5. Find the error object type in introspection schema
        const errorObjectType = gqlIntrospection.__schema.types.find(
            (type) => type.kind === "OBJECT" && type.name === (errorItemType as IntrospectionNamedTypeRef).name,
        ) as IntrospectionObjectType | undefined;

        if (!errorObjectType) {
            return undefined;
        }

        // 6. Find "code" field in the error object
        const codeField = errorObjectType.fields.find((field) => field.name === "code");
        if (!codeField) {
            return undefined;
        }

        // 7. Get code field type, unwrap NON_NULL if present
        let codeType: IntrospectionTypeRef = codeField.type;
        if (codeType.kind === "NON_NULL") {
            codeType = codeType.ofType;
        }

        // 8. Check if it's an ENUM
        if (codeType.kind !== "ENUM") {
            return undefined;
        }

        // 9. Return the enum type name
        return (codeType as IntrospectionNamedTypeRef).name;
    } catch {
        return undefined;
    }
}
