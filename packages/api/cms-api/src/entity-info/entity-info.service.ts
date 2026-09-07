import { AnyEntity, EntityManager, EntityMetadata } from "@mikro-orm/postgresql";
import { Injectable, Logger } from "@nestjs/common";

import { DiscoverService } from "../dependencies/discover.service";
import { PAGE_TREE_ENTITY } from "../page-tree/page-tree.constants";
import { REQUIRED_PERMISSION_METADATA_KEY, RequiredPermissionMetadata } from "../user-permissions/decorators/required-permission.decorator";
import { SCOPED_ENTITY_METADATA_KEY, ScopedEntityMeta } from "../user-permissions/decorators/scoped-entity.decorator";
import { ENTITY_INFO_METADATA_KEY, EntityInfo } from "./entity-info.decorator";
import { EntityInfoObject } from "./entity-info.object";
import { isEntityInfoSql, requiredPermissionToSql } from "./entity-info.utils";
import { resolveFieldToSql } from "./resolve-field-to-sql";
import { NO_SCOPES_SQL, resolveScopesToSql } from "./resolve-scopes-to-sql";

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

                const { metadata } = targetEntity;
                const scopesSql = this.resolveScopesSql(targetEntity);

                // The raw SQL may select from a dedicated view that doesn't know about the entity's scope. Join the
                // entity's own table (on the id the SQL is required to return) to resolve the scope from it.
                const scopeJoin =
                    scopesSql === NO_SCOPES_SQL
                        ? ""
                        : ` LEFT JOIN "${metadata.tableName}" ON "${metadata.tableName}"."${metadata.primaryKeys[0]}"::text = sub."id"`;

                indexSelects.push(
                    `SELECT sub."name", sub."secondaryInformation", sub."visible", sub."id", sub."entityName", ${requiredPermissionSql} AS "requiredPermission", ${scopesSql} AS "scopes" FROM (${sql}) sub${scopeJoin}`,
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
                                ${requiredPermissionSql} AS "requiredPermission",
                                ${this.resolveScopesSql(targetEntity)} AS "scopes"
                            FROM "${metadata.tableName}"`;
                indexSelects.push(select);
            }
        }

        // add all PageTreeNode Documents (Page, Link etc) thru PageTreeNodeDocument (no @EntityInfo needed on Page/Link)
        // Documents are scoped by their page tree node, which is why the scope is resolved from it instead of from the
        // document entity (whose @ScopedEntity is a service and therefore not convertible to SQL).
        const pageTreeNode = targetEntities.find((targetEntity) => targetEntity.metadata.tableName === PAGE_TREE_ENTITY);
        const pageTreeNodeScopesSql = pageTreeNode ? this.resolveScopesSql(pageTreeNode) : NO_SCOPES_SQL;
        const pageTreeNodeScopeJoin =
            pageTreeNodeScopesSql === NO_SCOPES_SQL
                ? ""
                : `LEFT JOIN "${PAGE_TREE_ENTITY}" ON "${PAGE_TREE_ENTITY}"."id" = "PageTreeNodeDocument"."pageTreeNodeId"`;

        indexSelects.push(`SELECT "PageTreeNodeEntityInfo"."name", "PageTreeNodeEntityInfo"."secondaryInformation", "PageTreeNodeEntityInfo"."visible", "PageTreeNodeDocument"."documentId"::text "id", "type" "entityName", ARRAY['pageTree']::text[] AS "requiredPermission", ${pageTreeNodeScopesSql} AS "scopes"
            FROM "PageTreeNodeDocument"
            JOIN "PageTreeNodeEntityInfo" ON "PageTreeNodeEntityInfo"."id" = "PageTreeNodeDocument"."pageTreeNodeId"::text
            ${pageTreeNodeScopeJoin}
        `);

        const viewSql = indexSelects.join("\n UNION ALL \n");

        console.time("creating EntityInfo view");
        await this.entityManager.getConnection().execute(`DROP VIEW IF EXISTS "EntityInfo"`);
        await this.entityManager.getConnection().execute(`CREATE VIEW "EntityInfo" AS ${viewSql}`);
        console.timeEnd("creating EntityInfo view");
    }

    private resolveScopesSql(targetEntity: { entity: AnyEntity; metadata: EntityMetadata }): string {
        const scopedEntity = Reflect.getMetadata(SCOPED_ENTITY_METADATA_KEY, targetEntity.entity) as ScopedEntityMeta | undefined;

        // The EntityInfo view is created on every application start, so an entity whose scope cannot be resolved must
        // not break the view creation. It contributes no scope instead.
        return resolveScopesToSql({ metadata: targetEntity.metadata, scopedEntity, onUnsupported: "null" });
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
