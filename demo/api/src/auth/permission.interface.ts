import type { AppPermission } from "@src/auth/app-permission.enum";

declare module "@dextinity/cms-api" {
    export interface PermissionOverrides {
        app: AppPermission;
    }
}
