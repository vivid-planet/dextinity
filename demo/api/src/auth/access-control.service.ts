import { AbstractAccessControlService, ContentScopesForUser, Permission, PermissionsForUser, User, UserPermissions } from "@comet/cms-api";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AccessControlService extends AbstractAccessControlService {
    getPermissionsForUser(user: User, availablePermissions: Permission[]): PermissionsForUser {
        if (user.isAdmin) {
            return UserPermissions.allPermissions;
        } else {
            const deniedPermissions: Permission[] = ["userPermissions"];
            return availablePermissions.filter((permission) => !deniedPermissions.includes(permission)).map((permission) => ({ permission }));
        }
    }
    getContentScopesForUser(user: User): ContentScopesForUser {
        if (user.isAdmin) {
            return UserPermissions.allContentScopes;
        }
        // Assign each non-admin user a deterministic subset of the available content scopes,
        // so users have (varied) scope assignments to inspect in the user permissions UI.
        // The organization is derived from the user id (see `availableContentScopes` in app.module.ts for the full set).
        const userId = parseInt(user.id, 10);
        const organization = `organization-${Number.isNaN(userId) ? 1 : ((userId - 1) % 25) + 1}`;
        return ["main", "secondary"].flatMap((domain) =>
            ["en", "de"].flatMap((language) =>
                ["country-1", "country-2", "country-3"].map((country) => ({ domain, language, organization, country })),
            ),
        );
    }
}
