import type { AnyEntity } from "@mikro-orm/postgresql";

import type { EntityInfo, EntityInfoSql } from "./entity-info.decorator";

export function isEntityInfoSql(entityInfo: EntityInfo<AnyEntity>): entityInfo is EntityInfoSql {
    return typeof entityInfo === "object" && "sql" in entityInfo;
}

export function requiredPermissionToSql(requiredPermission: string | string[] | undefined): string {
    if (!requiredPermission) {
        return "ARRAY[]::text[]";
    }
    const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    return `ARRAY[${permissions.map((p) => `'${p}'`).join(", ")}]::text[]`;
}
