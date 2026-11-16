import {
    DisablePermissionCheck,
    REQUIRED_PERMISSION_METADATA_KEY,
    type RequiredPermissionMetadata,
} from "../user-permissions/decorators/required-permission.decorator";

export function entityChecksScope(entity: object): boolean {
    const metadata = Reflect.getMetadata(REQUIRED_PERMISSION_METADATA_KEY, entity) as RequiredPermissionMetadata | undefined;
    return metadata !== undefined && !metadata.requiredPermission.includes(DisablePermissionCheck) && !metadata.options?.skipScopeCheck;
}
