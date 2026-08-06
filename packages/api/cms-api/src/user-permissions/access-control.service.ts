import { Injectable, Logger } from "@nestjs/common";
import isEqual from "lodash.isequal";

import { CurrentUser, CurrentUserPermission } from "./dto/current-user";
import { ContentScope } from "./interfaces/content-scope.interface";
import { AccessControlServiceInterface, Permission } from "./user-permissions.types";

@Injectable()
export abstract class AbstractAccessControlService implements AccessControlServiceInterface {
    private static readonly logger = new Logger(AbstractAccessControlService.name);

    private checkContentScope(userContentScopes: ContentScope[], targetContentScope: ContentScope): boolean {
        return userContentScopes.some((userContentScope) =>
            Object.entries(targetContentScope).every(([dimension, targetContentScopeValue]) => {
                const userContentScopeValue = (userContentScope as Record<string, unknown>)[dimension];

                // A wildcard dimension allows any value for it
                if (userContentScopeValue === "*") {
                    return true;
                }

                // Treat null and undefined the same
                if (userContentScopeValue == null && targetContentScopeValue == null) {
                    return true;
                }

                return userContentScopeValue === targetContentScopeValue;
            }),
        );
    }
    isAllowed(user: CurrentUser, permission: Permission, contentScope?: ContentScope): boolean {
        if (!user.permissions) {
            return false;
        }
        return user.permissions.some((p) => p.permission === permission && (!contentScope || this.checkContentScope(p.contentScopes, contentScope)));
    }
    static isEqualOrMorePermissions(permissions: CurrentUserPermission[], targetPermissions: CurrentUserPermission[]): boolean {
        for (const permission of targetPermissions) {
            const currentUserPermission = permissions.find((p) => p.permission === permission.permission);
            if (!currentUserPermission) {
                this.logger.debug(`Missing permission "${permission.permission}".`);
                return false;
            }
            for (const contentScope of permission.contentScopes) {
                if (!currentUserPermission.contentScopes.find((cs) => isEqual(cs, contentScope))) {
                    this.logger.debug(`Missing content scope ${JSON.stringify(contentScope)} for permission "${permission.permission}".`);
                    return false;
                }
            }
        }
        return true;
    }
}
