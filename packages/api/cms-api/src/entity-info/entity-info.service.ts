import { type AnyEntity, EntityManager } from "@mikro-orm/postgresql";
import { Injectable, Logger } from "@nestjs/common";

import { DiscoverService } from "../dependencies/discover.service.js";
import { REQUIRED_PERMISSION_METADATA_KEY, type RequiredPermissionMetadata } from "../user-permissions/decorators/required-permission.decorator.js";
import { ENTITY_INFO_METADATA_KEY, type EntityInfo } from "./entity-info.decorator.js";
import { EntityInfoObject } from "./entity-info.object.js";
import { isEntityInfoSql, requiredPermissionToSql } from "./entity-info.utils.js";
import { resolveFieldToSql } from "./resolve-field-to-sql.js";

@Injectable()
export class EntityInfoService {
    private readonly logger = new Logger(EntityInfoService.name);

    constructor(
        private readonly discoverService: DiscoverService,
        private entityManager: EntityManager,
    ) {}

    async createEntityInfoView(): Promise<void> {
        const indexSelects: string[] = [];
        const targetEntities = this.discoverService.discoverTargetEntities();
        for (const targetEntity of targetEntities) {
            const entityInfo = Reflect.getMetadata(ENTITY_INFO_METADATA_KEY, targetEntity.entity) as EntityInfo<AnyEntity>;
            if (!entityInfo) {
                continue;
            }

            if (typeof entityInfo === "string" || isEntityInfoSql(entityInfo)) {
                const sql = typeof entityInfo === "string" ? entityInfo : entityInfo.sql;
                const permissionMetadata = Reflect.getMetadata(REQUIRED_PERMISSION_METADATA_KEY, targetEntity.entity) as
                    | RequiredPermissionMetadata
                    | undefined;
                const requiredPermissionSql = requiredPermissionToSql(permissionMetadata?.requiredPermission);

                indexSelects.push(
                    `SELECT sub."name", sub."secondaryInformation", sub."visible", sub."id", sub."entityName", ${requiredPermissionSql} AS "requiredPermission" FROM (${sql}) sub`,
                );
            } else {
                const { entityName, metadata } = targetEntity;
                const primary = metadata.primaryKeys[0];

                // Resolve the name field (must not be NULL)
                const nameSql = `COALESCE(${resolveFieldToSql(entityInfo.name, metadata, metadata.tableName)}, '')`;

                // Resolve the secondaryInformation field (if provided, can be NULL)
                let secondaryInformationSql = "null";
                if (entityInfo.secondaryInformation) {
                    secondaryInformationSql = resolveFieldToSql(entityInfo.secondaryInformation, metadata, metadata.tableName);
                }

                let visibleSql = "true";
                if (entityInfo.visible) {
                    const qb = this.entityManager.createQueryBuilder(targetEntity.entity.name, metadata.tableName);
                    const query = qb.select("*").where(entityInfo.visible);
                    const sql = query.getFormattedQuery();
                    const sqlWhereMatch = sql.match(/^select .*? from .*? where (.*)/);
                    if (!sqlWhereMatch) {
                        throw new Error(`Could not extract where clause from query: ${sql}`);
                    }
                    visibleSql = sqlWhereMatch[1];
                }

                const permissionMetadata = Reflect.getMetadata(REQUIRED_PERMISSION_METADATA_KEY, targetEntity.entity) as
                    | RequiredPermissionMetadata
                    | undefined;
                const requiredPermissionSql = requiredPermissionToSql(permissionMetadata?.requiredPermission);

                const select = `SELECT
                                ${nameSql} "name",
                                ${secondaryInformationSql} "secondaryInformation",
                                ${visibleSql} AS "visible",
                                "${metadata.tableName}"."${primary}"::text "id",
                                '${entityName}' "entityName",
                                ${requiredPermissionSql} AS "requiredPermission"
                            FROM "${metadata.tableName}"`;
                indexSelects.push(select);
            }
        }

        // add all PageTreeNode Documents (Page, Link etc) thru PageTreeNodeDocument (no @EntityInfo needed on Page/Link)
        indexSelects.push(`SELECT "PageTreeNodeEntityInfo"."name", "PageTreeNodeEntityInfo"."secondaryInformation", "PageTreeNodeEntityInfo"."visible", "PageTreeNodeDocument"."documentId"::text "id", "type" "entityName", ARRAY['pageTree']::text[] AS "requiredPermission"
            FROM "PageTreeNodeDocument"
            JOIN "PageTreeNodeEntityInfo" ON "PageTreeNodeEntityInfo"."id" = "PageTreeNodeDocument"."pageTreeNodeId"::text
        `);

        const viewSql = indexSelects.join("\n UNION ALL \n");

        console.time("creating EntityInfo view");
        await this.entityManager.getConnection().execute(`DROP VIEW IF EXISTS "EntityInfo"`);
        await this.entityManager.getConnection().execute(`CREATE VIEW "EntityInfo" AS ${viewSql}`);
        console.timeEnd("creating EntityInfo view");
    }

    async dropEntityInfoView() {
        await this.entityManager.getConnection().execute(`DROP VIEW IF EXISTS "EntityInfo"`);
    }

    async getEntityInfo(entityName: string, id: string): Promise<EntityInfoObject | undefined> {
        const entityInfo = await this.entityManager.findOne(EntityInfoObject, { id, entityName });

        if (!entityInfo) {
            this.logger.warn(
                `Warning: No entity info found for ${entityName}#${id}. Is the @EntityInfo() decorator missing on the ${entityName} class?`,
            );
            return undefined;
        }

        return entityInfo;
    }
}
