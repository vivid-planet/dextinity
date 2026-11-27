import { type AnyEntity, EntityManager, type EntityMetadata } from "@mikro-orm/postgresql";
import { Injectable, Optional } from "@nestjs/common";

import { DiscoverService } from "../dependencies/discover.service.js";
import { ENTITY_INFO_METADATA_KEY, type EntityInfo } from "../entity-info/entity-info.decorator.js";
import { isEntityInfoSql, requiredPermissionToSql } from "../entity-info/entity-info.utils.js";
import { resolveFieldToSql } from "../entity-info/resolve-field-to-sql.js";
import { resolveScopesToSql } from "../entity-info/resolve-scopes-to-sql.js";
import { PageTreeFullTextService } from "../page-tree/fullText/page-tree-full-text.service.js";
import { REQUIRED_PERMISSION_METADATA_KEY, type RequiredPermissionMetadata } from "../user-permissions/decorators/required-permission.decorator.js";
import { SCOPED_ENTITY_METADATA_KEY, type ScopedEntityMeta } from "../user-permissions/decorators/scoped-entity.decorator.js";
import type { FullTextSearchType } from "./dto/full-text-search-type.object.js";

type FullTextSource =
    | { kind: "pageTree"; metadata: EntityMetadata }
    | { kind: "entity"; entity: AnyEntity; entityName: string; metadata: EntityMetadata; fullText: string; requiredPermission: string[] };

// Page tree nodes don't carry a @RequiredPermission decorator; access is governed by the "pageTree" permission,
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

    async dropEntityInfoFullTextView(): Promise<void> {
        await this.entityManager.getConnection().execute(`DROP VIEW IF EXISTS "EntityInfoFullText"`);
    }

    /**
     * Returns the types of the "EntityInfoFullText" view for which one of the `permissions` is a required permission:
     * the page tree document types in the order of their registration first, then the entities.
     */
    getFullTextSearchTypes(permissions: string[]): FullTextSearchType[] {
        const pageTreeTypes: FullTextSearchType[] = [];
        const entityTypes: FullTextSearchType[] = [];

        for (const source of this.discoverFullTextSources()) {
            if (source.kind === "pageTree") {
                if (permissions.includes(pageTreePermission)) {
                    pageTreeTypes.push(
                        ...(this.pageTreeFullTextService?.getDocumentTypes() ?? []).map((type) => ({ type, entityName: "PageTreeNode" })),
                    );
                }
            } else if (source.requiredPermission.some((permission) => permissions.includes(permission))) {
                entityTypes.push({ type: source.entityName, entityName: source.entityName });
            }
        }

        return [...pageTreeTypes, ...entityTypes.sort((a, b) => a.type.localeCompare(b.type, "en"))];
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
}
