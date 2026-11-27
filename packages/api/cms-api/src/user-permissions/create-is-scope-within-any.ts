import { isScopeWithin } from "./access-control.service";
import type { ContentScope } from "./interfaces/content-scope.interface";

type ScopeValueKey = string | number | boolean | null;

function toScopeValueKey(value: unknown): ScopeValueKey | undefined {
    if (value == null) {
        return null;
    }
    if (typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) {
        return value;
    }
    return undefined;
}

// Same result as `(scope) => containingScopes.some((containingScope) => isScopeWithin(scope, containingScope))`, but
// without scanning all containing scopes for every scope. Containing scopes are indexed per set of dimensions by their
// projected values; only those with a wildcard or a value that can't be keyed by JSON (objects, NaN, …) on these
// dimensions are checked linearly.
export function createIsScopeWithinAny(containingScopes: ContentScope[]): (scope: ContentScope) => boolean {
    const indexesByDimensions = new Map<string, { exactKeys: Set<string>; linearlyCheckedScopes: ContentScope[] }>();

    const getIndex = (dimensions: string[]) => {
        const dimensionsKey = JSON.stringify(dimensions);
        let index = indexesByDimensions.get(dimensionsKey);
        if (!index) {
            index = { exactKeys: new Set(), linearlyCheckedScopes: [] };
            const seenLinearlyCheckedKeys = new Set<string>();
            for (const containingScope of containingScopes) {
                const values = dimensions.map((dimension) => (containingScope as Record<string, unknown>)[dimension]);
                const valueKeys = values.map(toScopeValueKey);
                if (valueKeys.includes(undefined)) {
                    index.linearlyCheckedScopes.push(containingScope);
                } else if (valueKeys.includes("*")) {
                    const key = JSON.stringify(valueKeys);
                    if (!seenLinearlyCheckedKeys.has(key)) {
                        seenLinearlyCheckedKeys.add(key);
                        index.linearlyCheckedScopes.push(containingScope);
                    }
                } else {
                    index.exactKeys.add(JSON.stringify(valueKeys));
                }
            }
            indexesByDimensions.set(dimensionsKey, index);
        }
        return index;
    };

    return (scope) => {
        const dimensions = Object.keys(scope).sort();
        const index = getIndex(dimensions);
        const valueKeys = dimensions.map((dimension) => toScopeValueKey((scope as Record<string, unknown>)[dimension]));
        if (!valueKeys.includes(undefined) && index.exactKeys.has(JSON.stringify(valueKeys))) {
            return true;
        }
        return index.linearlyCheckedScopes.some((containingScope) => isScopeWithin(scope, containingScope));
    };
}
