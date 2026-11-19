import type { IntrospectionEnumType, IntrospectionQuery } from "graphql";

import { camelCaseToHumanReadable } from "../utils/camelCaseToHumanReadable";

/**
 * Generates TypeScript code for submissionErrorMessages object(s).
 * Creates a mapped type object with FormattedMessage components for each error code.
 */
export function generateErrorMessagesCode({
    enumName,
    gqlType,
    variableName,
    gqlIntrospection,
}: {
    enumName: string;
    gqlType: string;
    variableName: string;
    gqlIntrospection: IntrospectionQuery;
}): string {
    // Find enum type in introspection
    const enumType = gqlIntrospection.__schema.types.find((type) => type.kind === "ENUM" && type.name === enumName) as
        IntrospectionEnumType | undefined;

    if (!enumType || enumType.enumValues.length === 0) {
        return "";
    }

    // Generate error message entries
    const errorEntries = enumType.enumValues
        .map((enumValue) => {
            const errorCode = enumValue.name;
            const defaultMessage = enumValue.description || camelCaseToHumanReadable(errorCode);
            const i18nId = `${gqlType.toLowerCase()}.form.error.${errorCode}`;

            return `${errorCode}: <FormattedMessage id="${i18nId}" defaultMessage="${defaultMessage}" />`;
        })
        .join(",\n");

    // Generate complete error messages object
    return `const ${variableName}: Record<GQL${enumName}, ReactNode> = {
${errorEntries},
};`;
}
