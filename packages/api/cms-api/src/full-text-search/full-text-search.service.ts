import { AnyEntity, EntityManager, EntityMetadata } from "@mikro-orm/postgresql";
import { Injectable, Optional } from "@nestjs/common";

import { DiscoverService } from "../dependencies/discover.service";
import { ENTITY_INFO_METADATA_KEY, EntityInfo } from "../entity-info/entity-info.decorator";
import { isEntityInfoSql, requiredPermissionToSql } from "../entity-info/entity-info.utils";
import { resolveFieldToSql } from "../entity-info/resolve-field-to-sql";
import { resolveScopesToSql } from "../entity-info/resolve-scopes-to-sql";
import { PageTreeFullTextService } from "../page-tree/fullText/page-tree-full-text.service";
import { REQUIRED_PERMISSION_METADATA_KEY, RequiredPermissionMetadata } from "../user-permissions/decorators/required-permission.decorator";
import { SCOPED_ENTITY_METADATA_KEY, ScopedEntityMeta } from "../user-permissions/decorators/scoped-entity.decorator";

export interface FullTextSearchTypeDefinition {
    type: string;
    entityName: string;
    requiredPermission: string[];
}

type FullTextSource =
    | { kind: "pageTree"; metadata: EntityMetadata }
    | { kind: "entity"; entity: AnyEntity; entityName: string; metadata: EntityMetadata; fullText: string; requiredPermission: string[] };

// Page tree nodes don't carry a @RequiredPermission decorator, access is governed by the "pageTree" permission,
// matching the hardcoded value used for page tree documents in the EntityInfo view.
const pageTreePermission = "pageTree";

@Injectable()
export class FullTextSearchService {
    constructor(
        private readonly discoverService: DiscoverService,
        private entityManager: EntityManager,
        @Optional() private readonly pageTreeFullTextService?: PageTreeFullTextService,
    ) {}

    async createEntityInfoFullTextView(): Promise<void> {
        const indexSelects: string[] = [];

        for (const source of this.discoverFullTextSources()) {
            if (source.kind === "pageTree") {
                const requiredPermissionSql = requiredPermissionToSql(pageTreePermission);
                const scopesSql = resolveScopesToSql({ metadata: source.metadata, scopedEntity: undefined });

                indexSelects.push(`SELECT "PageTreeNodeEntityInfo"."id", 'PageTreeNode' AS "entityName", "PageTreeNodeFullText"."fullText",
                    ${requiredPermissionSql} AS "requiredPermission",
                    ${scopesSql} AS "scopes",
                    "PageTreeNode"."documentType" AS "type"
                    FROM "PageTreeNodeEntityInfo"
                    INNER JOIN "PageTreeNodeFullText" ON "PageTreeNodeFullText"."pageTreeNodeId" = "PageTreeNodeEntityInfo"."id"::uuid
                    INNER JOIN "PageTreeNode" ON "PageTreeNode"."id" = "PageTreeNodeEntityInfo"."id"::uuid`);
                continue;
            }

            const { entity, entityName, metadata, fullText, requiredPermission } = source;
            const primary = metadata.primaryKeys[0];

            const fullTextSql = resolveFieldToSql(fullText, metadata, metadata.tableName);
            const requiredPermissionSql = requiredPermissionToSql(requiredPermission);

            const scopedEntity = Reflect.getMetadata(SCOPED_ENTITY_METADATA_KEY, entity) as ScopedEntityMeta | undefined;
            const scopesSql = resolveScopesToSql({ metadata, scopedEntity });

            indexSelects.push(`SELECT
                            "${metadata.tableName}"."${primary}"::text "id",
                            '${entityName}' "entityName",
                            ${fullTextSql} AS "fullText",
                            ${requiredPermissionSql} AS "requiredPermission",
                            ${scopesSql} AS "scopes",
                            '${entityName}' AS "type"
                        FROM "${metadata.tableName}"`);
        }

        if (indexSelects.length === 0) {
            // Empty placeholder so the view always exists with the expected columns
            indexSelects.push(
                `SELECT NULL::text AS "id", NULL::text AS "entityName", NULL::tsvector AS "fullText", ARRAY[]::text[] AS "requiredPermission", NULL::jsonb AS "scopes", NULL::text AS "type" WHERE false`,
            );
        }

        const viewSql = indexSelects.join("\n UNION ALL \n");

        console.time("creating EntityInfoFullText view");
        await this.entityManager.getConnection().execute(`DROP VIEW IF EXISTS "EntityInfoFullText"`);
        await this.entityManager.getConnection().execute(`CREATE VIEW "EntityInfoFullText" AS ${viewSql}`);
        console.timeEnd("creating EntityInfoFullText view");
    }

    /**
     * Returns every type of the "EntityInfoFullText" view with the permissions that grant access to it, without checking
     * the permissions of a user.
     */
    getFullTextSearchTypes(): FullTextSearchTypeDefinition[] {
        const types = this.discoverFullTextSources().flatMap((source): FullTextSearchTypeDefinition[] =>
            source.kind === "pageTree"
                ? (this.pageTreeFullTextService?.getDocumentTypes() ?? []).map((documentType) => ({
                      type: documentType,
                      entityName: "PageTreeNode",
                      requiredPermission: [pageTreePermission],
                  }))
                : [{ type: source.entityName, entityName: source.entityName, requiredPermission: source.requiredPermission }],
        );

        return types.sort((a, b) => a.type.localeCompare(b.type, "en"));
    }

    private discoverFullTextSources(): FullTextSource[] {
        const sources: FullTextSource[] = [];

        for (const { entity, entityName, metadata } of this.discoverService.discoverTargetEntities()) {
            const entityInfo = Reflect.getMetadata(ENTITY_INFO_METADATA_KEY, entity) as EntityInfo<AnyEntity> | undefined;
            if (!entityInfo) {
                continue;
            }

            if (typeof entityInfo === "string" || isEntityInfoSql(entityInfo)) {
                if (this.pageTreeFullTextService && metadata.tableName === "PageTreeNode") {
                    sources.push({ kind: "pageTree", metadata });
                }
                continue;
            }

            if (!entityInfo.fullText) {
                continue;
            }

            const permissionMetadata = Reflect.getMetadata(REQUIRED_PERMISSION_METADATA_KEY, entity) as RequiredPermissionMetadata | undefined;
            sources.push({
                kind: "entity",
                entity,
                entityName,
                metadata,
                fullText: entityInfo.fullText,
                requiredPermission: permissionMetadata?.requiredPermission ?? [],
            });
        }

        return sources;
    }

    async dropEntityInfoFullTextView(): Promise<void> {
        await this.entityManager.getConnection().execute(`DROP VIEW IF EXISTS "EntityInfoFullText"`);
    }
}
