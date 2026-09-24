import type { ContentScope, ContentScopeValues } from "../contentScope/Provider";
import { isScopePartOf } from "../contentScope/utils/isScopePartOf";

/**
 * Determines the scope an entry must be opened in, or undefined when the user has access to none.
 *
 * An entry's scope can be incomplete (e.g. a DAM file scoped by domain only), which is why it is merged into the active
 * scope instead of replacing it. Should the user have no access to that combination, the first of their scopes
 * containing the entry's scope is used.
 */
export function resolveDependencyScope({
    scope,
    activeScope,
    availableScopes,
}: {
    scope: ContentScope;
    activeScope: ContentScope;
    availableScopes: ContentScopeValues;
}): ContentScope | undefined {
    const scopeInActiveScope = { ...activeScope, ...scope };

    if (availableScopes.length === 0) {
        return scopeInActiveScope;
    }

    if (availableScopes.some(({ scope: availableScope }) => isScopePartOf(scopeInActiveScope, availableScope))) {
        return scopeInActiveScope;
    }

    return availableScopes.find(({ scope: availableScope }) => isScopePartOf(scope, availableScope))?.scope;
}
