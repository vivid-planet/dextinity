import { AnyEntity, EntityManager } from "@mikro-orm/postgresql";
import { Injectable, Optional } from "@nestjs/common";

import { DiscoverService } from "../dependencies/discover.service";
import { ENTITY_INFO_METADATA_KEY, EntityInfo } from "../entity-info/entity-info.decorator";
import { isEntityInfoSql, requiredPermissionToSql } from "../entity-info/entity-info.utils";
import { resolveFieldToSql } from "../entity-info/resolve-field-to-sql";
import { resolveScopesToSql } from "../entity-info/resolve-scopes-to-sql";
import { PageTreeFullTextService } from "../page-tree/fullText/page-tree-full-text.service";
import { REQUIRED_PERMISSION_METADATA_KEY, RequiredPermissionMetadata } from "../user-permissions/decorators/required-permission.decorator";
import { SCOPED_ENTITY_METADATA_KEY, ScopedEntityMeta } from "../user-permissions/decorators/scoped-entity.decorator";

@Injectable()
export class FullTextSearchService {
    constructor(
        private readonly discoverService: DiscoverService,
        private entityManager: EntityManager,
        @Optional() private readonly pageTreeFullTextService?: PageTreeFullTextService,
    ) {}

    async createEntityInfoFullTextView(): Promise<void> {
        const indexSelects: string[] = [];
        const targetEntities = this.discoverService.discoverTargetEntities();
        const pageTreeFullText = !!this.pageTreeFullTextService;

        for (const targetEntity of targetEntities) {
            const entityInfo = Reflect.getMetadata(ENTITY_INFO_METADATA_KEY, targetEntity.entity) as EntityInfo<AnyEntity>;
            if (!entityInfo) {
                continue;
            }

            if (typeof entityInfo === "string" || isEntityInfoSql(entityInfo)) {
                if (pageTreeFullText && targetEntity.metadata.tableName === "PageTreeNode") {
                    // Page tree nodes don't carry a @RequiredPermission decorator; access is governed by the "pageTree"
                    // permission, matching the hardcoded value used for page tree documents in the EntityInfo view.
                    const requiredPermissionSql = requiredPermissionToSql("pageTree");
                    const scopesSql = resolveScopesToSql({ metadata: targetEntity.metadata, scopedEntity: undefined });

                    indexSelects.push(`SELECT "PageTreeNodeEntityInfo"."id", 'PageTreeNode' AS "entityName", "PageTreeNodeFullText"."fullText",
                        ${requiredPermissionSql} AS "requiredPermission",
                        ${scopesSql} AS "scopes"
                        FROM "PageTreeNodeEntityInfo"
                        INNER JOIN "PageTreeNodeFullText" ON "PageTreeNodeFullText"."pageTreeNodeId" = "PageTreeNodeEntityInfo"."id"::uuid
                        INNER JOIN "PageTreeNode" ON "PageTreeNode"."id" = "PageTreeNodeEntityInfo"."id"::uuid`);
                }
                continue;
            }

            if (!entityInfo.fullText) {
                continue;
            }

            const { entityName, metadata } = targetEntity;
            const primary = metadata.primaryKeys[0];

            const fullTextSql = resolveFieldToSql(entityInfo.fullText, metadata, metadata.tableName);
            const permissionMetadata = Reflect.getMetadata(REQUIRED_PERMISSION_METADATA_KEY, targetEntity.entity) as
                | RequiredPermissionMetadata
                | undefined;
            const requiredPermissionSql = requiredPermissionToSql(permissionMetadata?.requiredPermission);

            const scopedEntity = Reflect.getMetadata(SCOPED_ENTITY_METADATA_KEY, targetEntity.entity) as ScopedEntityMeta | undefined;
            const scopesSql = resolveScopesToSql({ metadata, scopedEntity });

            indexSelects.push(`SELECT
                            "${metadata.tableName}"."${primary}"::text "id",
                            '${entityName}' "entityName",
                            ${fullTextSql} AS "fullText",
                            ${requiredPermissionSql} AS "requiredPermission",
                            ${scopesSql} AS "scopes"
                        FROM "${metadata.tableName}"`);
        }

        if (indexSelects.length === 0) {
            // Empty placeholder so the view always exists with the expected columns
            indexSelects.push(
                `SELECT NULL::text AS "id", NULL::text AS "entityName", NULL::tsvector AS "fullText", ARRAY[]::text[] AS "requiredPermission", NULL::jsonb AS "scopes" WHERE false`,
            );
        }

        const viewSql = indexSelects.join("\n UNION ALL \n");

        console.time("creating EntityInfoFullText view");
        await this.entityManager.getConnection().execute(`DROP VIEW IF EXISTS "EntityInfoFullText"`);
        await this.entityManager.getConnection().execute(`CREATE VIEW "EntityInfoFullText" AS ${viewSql}`);
        console.timeEnd("creating EntityInfoFullText view");
    }

    async dropEntityInfoFullTextView(): Promise<void> {
        await this.entityManager.getConnection().execute(`DROP VIEW IF EXISTS "EntityInfoFullText"`);
    }
}
