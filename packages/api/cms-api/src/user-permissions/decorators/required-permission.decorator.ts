import { type CustomDecorator, SetMetadata } from "@nestjs/common";

import type { Permission } from "../user-permissions.types";

type RequiredPermissionOptions = {
    skipScopeCheck?: boolean;
};

export const DisablePermissionCheck = "disablePermissionCheck";
type DisablePermissionCheckType = typeof DisablePermissionCheck;

export type RequiredPermissionMetadata = {
    requiredPermission: Array<Permission | DisablePermissionCheckType>;
    options: RequiredPermissionOptions | undefined;
};

export const REQUIRED_PERMISSION_METADATA_KEY = "requiredPermission";

export const RequiredPermission = (
    requiredPermission: Permission | Permission[] | DisablePermissionCheckType,
    options?: RequiredPermissionOptions,
): CustomDecorator<string> => {
    return SetMetadata<string, RequiredPermissionMetadata>(REQUIRED_PERMISSION_METADATA_KEY, {
        requiredPermission: Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission],
        options,
    });
};
