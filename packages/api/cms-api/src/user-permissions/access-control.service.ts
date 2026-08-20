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
