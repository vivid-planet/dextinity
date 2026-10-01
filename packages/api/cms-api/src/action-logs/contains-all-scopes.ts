import { isDeepStrictEqual } from "node:util";

import type { ContentScope } from "../user-permissions/interfaces/content-scope.interface";

export function containsAllScopes(scopes: ContentScope[] | undefined | null, requiredScopes: ContentScope[] | undefined | null): boolean {
    if (!scopes || !requiredScopes) {
        return !scopes && !requiredScopes;
    }
    return requiredScopes.every((requiredScope) => scopes.some((scope) => isDeepStrictEqual(scope, requiredScope)));
}
