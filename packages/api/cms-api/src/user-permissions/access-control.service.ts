import { Injectable, Logger } from "@nestjs/common";

import { CurrentUser, CurrentUserPermission } from "./dto/current-user";
import { ContentScope } from "./interfaces/content-scope.interface";
import { AccessControlServiceInterface, Permission } from "./user-permissions.types";

// Whether `scope` is within `containingScope`: for every dimension of `scope`, `containingScope` holds the same value
// or the wildcard "*" (which matches any value); null and undefined are treated the same. `containingScope` may be
// broader than `scope` (e.g. via wildcards), but not narrower. Dimensions it constrains beyond `scope` are ignored.
export function isScopeWithin(scope: ContentScope, containingScope: ContentScope): boolean {
    return Object.keys(scope).every((dimension) => {
        const value = (scope as Record<string, unknown>)[dimension];
        const containingValue = (containingScope as Record<string, unknown>)[dimension];
        return containingValue === "*" || containingValue === value || (containingValue == null && value == null);
    });
}

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

@Injectable()
export abstract class AbstractAccessControlService implements AccessControlServiceInterface {
    private static readonly logger = new Logger(AbstractAccessControlService.name);

    isAllowed(user: CurrentUser, permission: Permission, contentScope?: ContentScope): boolean {
        if (!user.permissions) {
            return false;
        }
        return user.permissions.some(
            (p) => p.permission === permission && (!contentScope || p.contentScopes.some((cs) => isScopeWithin(contentScope, cs))),
        );
    }

    static isEqualOrMorePermissions(permissions: CurrentUserPermission[], targetPermissions: CurrentUserPermission[]): boolean {
        for (const permission of targetPermissions) {
            const currentUserPermission = permissions.find((p) => p.permission === permission.permission);
            if (!currentUserPermission) {
                this.logger.debug(`Missing permission "${permission.permission}".`);
                return false;
            }
            for (const contentScope of permission.contentScopes) {
                // The current user must have at least as much access as the target for this content scope. Unlike
                // isScopeWithin, the current user's scope must not be narrower on any dimension it constrains
                // beyond the target either, so the dimensions of both scopes are checked (a wildcard "*" matches any
                // value; null and undefined are treated the same).
                const hasCoveringContentScope = currentUserPermission.contentScopes.some((cs) => {
                    const dimensions = new Set([...Object.keys(cs), ...Object.keys(contentScope)]);
                    return [...dimensions].every((dimension) => {
                        const value = (cs as Record<string, unknown>)[dimension];
                        const targetValue = (contentScope as Record<string, unknown>)[dimension];
                        return value === "*" || value === targetValue || (value == null && targetValue == null);
                    });
                });
                if (!hasCoveringContentScope) {
                    this.logger.debug(`Missing content scope ${JSON.stringify(contentScope)} for permission "${permission.permission}".`);
                    return false;
                }
            }
        }
        return true;
    }
}
