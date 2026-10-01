import { Inject, Injectable, type OnModuleInit, Optional } from "@nestjs/common";

import type { CurrentUser } from "../user-permissions/dto/current-user";
import { ACCESS_CONTROL_SERVICE } from "../user-permissions/user-permissions.constants";
import type { AccessControlServiceInterface } from "../user-permissions/user-permissions.types";
import { DAM_DISABLE_SCOPE_ACCESS_CONTROL } from "./dam.constants";
import type { DamScopeInterface } from "./types";

/**
 * The DAM checks scope access through the `AccessControlService` provided by `UserPermissionsModule`. Without that service, its REST
 * endpoints deny every scoped request and its GraphQL resolvers lose the guard that enforces `@RequiredPermission` — so the DAM refuses
 * to start rather than run half-protected. Opting out with `disableScopeAccessControl` puts that responsibility on the application.
 */
@Injectable()
export class DamScopeAccessControlService implements OnModuleInit {
    constructor(
        @Inject(DAM_DISABLE_SCOPE_ACCESS_CONTROL) private readonly disableScopeAccessControl: boolean,
        @Optional() @Inject(ACCESS_CONTROL_SERVICE) private readonly accessControlService?: AccessControlServiceInterface,
    ) {}

    onModuleInit(): void {
        if (this.disableScopeAccessControl) {
            return;
        }

        if (!this.accessControlService) {
            throw new Error(
                "DamFilesModule: no AccessControlService is available, so the DAM cannot check who may access a scope. Register UserPermissionsModule, or pass disableScopeAccessControl: true to run the DAM behind your own authentication guard.",
            );
        }
    }

    isAllowed(user: CurrentUser, scope: DamScopeInterface | undefined): boolean {
        if (this.disableScopeAccessControl) {
            return true;
        }

        if (!this.accessControlService) {
            // Fail closed: without an access control service and without explicitly disabling the check, access is denied.
            return false;
        }

        return this.accessControlService.isAllowed(user, "dam", scope);
    }
}
