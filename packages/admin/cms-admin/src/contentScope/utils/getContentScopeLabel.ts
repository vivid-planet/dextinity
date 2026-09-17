import type { ContentScope, ContentScopeValues } from "../Provider";

function capitalizeString(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Builds a human-readable label for a scope, for instance "Main Domain / English".
 *
 * The label of each scope dimension is taken from the matching content scope value, falling back to the capitalized
 * value itself. Dimensions without a value are omitted, which also supports incomplete scopes.
 */
export function getContentScopeLabel({ scope, values }: { scope: ContentScope; values: ContentScopeValues }): string {
    return Object.keys(scope)
        .map((dimension) => {
            const label = values.find((value) => value.scope[dimension] === scope[dimension])?.label;
            return label?.[dimension] ?? (scope[dimension] ? capitalizeString(scope[dimension]) : undefined);
        })
        .filter((label) => typeof label === "string")
        .join(" / ");
}
