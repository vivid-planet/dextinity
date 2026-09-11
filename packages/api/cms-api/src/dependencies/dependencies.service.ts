import { AnyEntity, Connection, EntityManager, type FindOptions, type ObjectQuery } from "@mikro-orm/postgresql";
import { Injectable, Logger, Optional } from "@nestjs/common";
import { subMinutes } from "date-fns";
import { v4 as uuid } from "uuid";

import { filtersToMikroOrmQuery, gqlSortToMikroOrmOrderBy } from "../common/filter/mikro-orm";
import { StringFilter } from "../common/filter/string.filter";
import { EntityInfoService } from "../entity-info/entity-info.service";
import { FullTextSearchService } from "../full-text-search/full-text-search.service";
import { PageTreeFullTextService } from "../page-tree/fullText/page-tree-full-text.service";
import { DiscoverService } from "./discover.service";
import { DependencyFilter, DependentFilter } from "./dto/dependencies.filter";
import { Dependency } from "./dto/dependency";
import { DependencySort } from "./dto/dependency-sort";
import { PaginatedDependencies } from "./dto/paginated-dependencies";
import { BlockIndexDependencyObject } from "./entities/block-index-dependency.object";

interface PGStatActivity {
    pid: number;
    state: string;
    query: string;
}

// Advisory lock key for block_index_dependencies refresh deduplication.
const BLOCK_INDEX_REFRESH_LOCK_KEY = 4201;

type RefreshBlockIndexViewsResult = "refreshed" | "skipped";

@Injectable()
export class DependenciesService {
    private connection: Connection;
    private readonly logger = new Logger(DependenciesService.name);
    private runningRefresh?: Promise<RefreshBlockIndexViewsResult>;

    constructor(
        private readonly discoverService: DiscoverService,
        private readonly entityInfoService: EntityInfoService,
        private entityManager: EntityManager,
        @Optional() private readonly pageTreeFullTextService?: PageTreeFullTextService,
        @Optional() private readonly fullTextSearchService?: FullTextSearchService,
    ) {
        this.connection = entityManager.getConnection();
    }

    async createViews(): Promise<void> {
        await this.dropViews();

        await this.createBlockIndexView();
        await this.pageTreeFullTextService?.createPageTreeFullTextView();
        await this.entityInfoService.createEntityInfoView();
        await this.fullTextSearchService?.createEntityInfoFullTextView();
        await this.createDependenciesView();
    }

    async dropViews(): Promise<void> {
        await this.connection.execute(`DROP MATERIALIZED VIEW IF EXISTS "block_index_dependencies"`);
        await this.connection.execute(`DROP VIEW IF EXISTS "block_index"`);
        await this.fullTextSearchService?.dropEntityInfoFullTextView();
        await this.entityInfoService.dropEntityInfoView();
        await this.pageTreeFullTextService?.dropPageTreeFullTextView();
    }

    private async createDependenciesView(): Promise<void> {
        const indexSelects: string[] = [];
        const targetEntities = this.discoverService.discoverTargetEntities();

        const targetEntitiesNameData = targetEntities.reduce((obj, entity) => {
            return {
                ...obj,
                [entity.entityName]: {
                    entityName: entity.entityName,
                    tableName: entity.metadata.tableName,
                    primary: entity.metadata.primaryKeys[0],
                    graphqlObjectType: entity.graphqlObjectType,
                },
            };
        }, {});

        for (const rootBlockEntity of this.discoverService.discoverRootBlocks()) {
            const { metadata, column, graphqlObjectType } = rootBlockEntity;
            const primary = metadata.primaryKeys[0];

            const select = `SELECT
                            "${metadata.tableName}"."${primary}"                                "rootId",
                            '${metadata.name}'                                                  "rootEntityName",
                            '${graphqlObjectType}'                                              "rootGraphqlObjectType",
                            '${metadata.tableName}'                                             "rootTableName",
                            '${column}'                                                         "rootColumnName",
                            '${primary}'                                                        "rootPrimaryKey",
                            indexObj->>'blockname'                                              "blockname",
                            indexObj->>'jsonPath'                                               "jsonPath",
                            indexObj->>'visible'                                                "blockVisible",
                            targetTableData->>'entityName'                                      "targetEntityName",
                            targetTableData->>'graphqlObjectType'                               "targetGraphqlObjectType",
                            targetTableData->>'tableName'                                       "targetTableName",
                            targetTableData->>'primary'                                         "targetPrimaryKey",
                            dependenciesObj->>'id'                                              "targetId"
                        FROM "${metadata.tableName}"
                        CROSS JOIN LATERAL json_array_elements("${metadata.tableName}"."${column}"->'index') indexObj
                        CROSS JOIN LATERAL json_array_elements(indexObj->'dependencies') dependenciesObj
                        CROSS JOIN LATERAL json_extract_path('${JSON.stringify(targetEntitiesNameData)}', dependenciesObj->>'targetEntityName') targetTableData`;

            indexSelects.push(select);
        }

        if (indexSelects.length === 0) {
            this.logger.log("Skipping block_index_dependencies materialized view creation: no root block entities found");
            return;
        }

        // Resolve the root and target entity's EntityInfo once over the union of all root blocks.
        // Joining EntityInfo inside each root block's SELECT instead re-evaluates the EntityInfo
        // view (a UNION over every entity, including a recursive DAM folder-path CTE) once per root
        // block, which dominates the refresh cost on large datasets.
        const viewSql = `SELECT
                        blockIndex."rootId",
                        blockIndex."rootEntityName",
                        blockIndex."rootGraphqlObjectType",
                        blockIndex."rootTableName",
                        blockIndex."rootColumnName",
                        blockIndex."rootPrimaryKey",
                        blockIndex."blockname",
                        blockIndex."jsonPath",
                        blockIndex."blockVisible",
                        COALESCE(ei_root."visible", true)                                            "entityVisible",
                        ((blockIndex."blockVisible")::boolean AND COALESCE(ei_root."visible", true)) "visible",
                        blockIndex."targetEntityName",
                        blockIndex."targetGraphqlObjectType",
                        blockIndex."targetTableName",
                        blockIndex."targetPrimaryKey",
                        blockIndex."targetId",
                        ei_root."name"                                                              "rootName",
                        ei_root."secondaryInformation"                                              "rootSecondaryInformation",
                        ei_target."name"                                                            "targetName",
                        ei_target."secondaryInformation"                                            "targetSecondaryInformation"
                    FROM (
                        ${indexSelects.join("\n UNION ALL \n")}
                    ) blockIndex
                    LEFT JOIN "EntityInfo" as ei_root ON ei_root."id" = blockIndex."rootId"::text
                        AND ei_root."entityName" = blockIndex."rootEntityName"
                    LEFT JOIN "EntityInfo" as ei_target ON ei_target."id" = blockIndex."targetId"
                        AND ei_target."entityName" = blockIndex."targetEntityName"`;

        console.time("creating block dependency materialized view");
        await this.connection.execute(`DROP MATERIALIZED VIEW IF EXISTS block_index_dependencies`);
        await this.connection.execute(`CREATE MATERIALIZED VIEW block_index_dependencies AS ${viewSql}`);
        await this.connection.execute(
            `CREATE UNIQUE INDEX ON block_index_dependencies ("rootId", "rootTableName", "rootColumnName", "blockname", "jsonPath", "targetTableName", "targetId")`,
        );
        console.timeEnd("creating block dependency materialized view");

        console.time("creating block dependency materialized view index");
        await this.connection.execute(`CREATE INDEX block_index_dependencies_targetId ON block_index_dependencies ("targetId")`);
        console.timeEnd("creating block dependency materialized view index");
    }

    private async createBlockIndexView(): Promise<void> {
        const indexSelects: string[] = [];

        for (const rootBlockEntity of this.discoverService.discoverRootBlocks()) {
            const { metadata, column, graphqlObjectType } = rootBlockEntity;
            const primary = metadata.primaryKeys[0];

            const select = `SELECT
                            "${metadata.tableName}"."${primary}"  "rootId",
                            '${metadata.name}'                    "rootEntityName",
                            '${graphqlObjectType}'                "rootGraphqlObjectType",
                            '${metadata.tableName}'               "rootTableName",
                            '${column}'                           "rootColumnName",
                            '${primary}'                          "rootPrimaryKey",
                            indexObj->>'blockname'                "blockname",
                            indexObj->>'jsonPath'                 "jsonPath",
                            (indexObj->>'visible')::boolean       "visible"
                        FROM "${metadata.tableName}",
                            json_array_elements("${metadata.tableName}"."${column}"->'index') indexObj`;

            indexSelects.push(select);
        }

        if (indexSelects.length === 0) {
            this.logger.log("Skipping block_index view creation: no root block entities found");
            return;
        }

        const viewSql = indexSelects.join("\n UNION ALL \n");

        console.time("creating block index view");
        await this.connection.execute(`DROP VIEW IF EXISTS block_index`);
        await this.connection.execute(`CREATE VIEW block_index AS ${viewSql}`);
        console.timeEnd("creating block index view");
    }

    /**
     * Refreshes the block index materialized views with intelligent refresh strategies
     * based on data staleness and options.
     *
     * @remarks
     * This method uses PostgreSQL advisory locks to prevent duplicate concurrent refreshes.
     * The refresh strategy depends on the age of the last completed refresh:
     * - Fresh (< 5 minutes): Skip refresh
     * - Moderately stale (5–15 minutes): Concurrent background refresh
     * - Very stale (> 15 minutes): Synchronous refresh (caller waits)
     * - No prior refresh: Synchronous refresh (initialization)
     *
     * @param options - Configuration options for the refresh operation
     * @param options.force - If true, cancels any running refresh and performs a full synchronous refresh
     * @param options.awaitRefresh - If true, waits for background concurrent refreshes to complete. Intended to be used by CLI commands.
     *
     * @returns `"refreshed"` if a refresh was performed (or triggered in the background), `"skipped"` if the views were fresh enough
     */
    async refreshViews(options?: { force?: boolean; awaitRefresh?: boolean }): Promise<RefreshBlockIndexViewsResult> {
        const knex = this.entityManager.getKnex("write");

        const refresh = async (refreshOptions?: { concurrently: boolean }): Promise<RefreshBlockIndexViewsResult> => {
            return knex.transaction(async (trx) => {
                if (refreshOptions?.concurrently) {
                    // Non-blocking lock: Try to acquire the lock. Only acquire if available.
                    const lockResult = await trx.raw(`SELECT pg_try_advisory_xact_lock(?) AS locked`, [BLOCK_INDEX_REFRESH_LOCK_KEY]);

                    if (!lockResult.rows[0]?.locked) {
                        // If another refresh already holds the lock (= a refresh is already in
                        // progress), skip this refresh entirely
                        return "skipped";
                    }
                } else {
                    // Blocking lock: Wait until the lock is available (= the currently running
                    // refresh completes). Then acquire the lock.
                    await trx.raw(`SELECT pg_advisory_xact_lock(?)`, [BLOCK_INDEX_REFRESH_LOCK_KEY]);

                    // After acquiring the lock, check if the previous holder already completed a fresh
                    // refresh. This prevents redundant work when multiple callers were blocked waiting.
                    const recentRefresh = await trx("BlockIndexRefresh").whereNotNull("finishedAt").orderBy("finishedAt", "desc").first();

                    if (recentRefresh && new Date(recentRefresh.finishedAt) > subMinutes(new Date(), 5)) {
                        // A refresh was completed within the last 5 minutes, which is fresh enough.
                        // Skip this refresh.
                        return "skipped";
                    }
                }

                const id = uuid();
                this.logger.log(`Starting block index refresh ${id}`);

                await trx("BlockIndexRefresh").insert({ id, startedAt: new Date(), finishedAt: null });

                await trx.raw(`REFRESH MATERIALIZED VIEW ${refreshOptions?.concurrently ? "CONCURRENTLY" : ""} block_index_dependencies`);

                await trx("BlockIndexRefresh").where({ id }).update({ finishedAt: new Date() });

                this.logger.log(`Completed block index refresh ${id}`);

                return "refreshed";
            });
        };

        if (options?.force) {
            // Force refresh: cancel any currently running refresh query so we can start clean.
            // We look up active backends running the REFRESH MATERIALIZED VIEW statement and
            // send pg_cancel_backend to each. After cancellation, we still need to acquire the
            // advisory lock (blocking) to wait for the cancelled query to actually release it.
            const activeRefreshes: PGStatActivity[] = await this.entityManager
                .getKnex("read")
                .select("pid", "state", "query")
                .from("pg_stat_activity")
                .where({ state: "active" })
                .andWhereILike("query", "REFRESH MATERIALIZED VIEW%")
                .andWhereILike("query", "%block_index_dependencies%");

            for (const activeRefresh of activeRefreshes) {
                await knex.raw(`SELECT pg_cancel_backend(?)`, [activeRefresh.pid]);
            }

            // Acquire the lock (waits for cancelled queries to finish rolling back), then
            // truncate the tracking table and perform a full non-concurrent refresh.
            await knex.transaction(async (trx) => {
                await trx.raw(`SELECT pg_advisory_xact_lock(?)`, [BLOCK_INDEX_REFRESH_LOCK_KEY]);
                await trx("BlockIndexRefresh").truncate();
                await trx.raw(`REFRESH MATERIALIZED VIEW block_index_dependencies`);
                await trx("BlockIndexRefresh").insert({ id: uuid(), startedAt: new Date(), finishedAt: new Date() });
            });

            return "refreshed";
        }

        // Decide refresh strategy based on age of the last completed refresh
        const lastRefresh = await this.entityManager
            .getKnex("read")
            .select("*")
            .from("BlockIndexRefresh")
            .whereNotNull("finishedAt")
            .orderBy("finishedAt", "desc")
            .first();

        const now = new Date();

        if (lastRefresh && new Date(lastRefresh.finishedAt) > subMinutes(now, 5)) {
            // Fresh enough (< 5 minutes) — skip refresh entirely
            return "skipped";
        }

        // Moderately stale (5–15 min): background concurrent refresh, caller doesn't wait.
        // Very stale (> 15 min) or uninitialized: synchronous refresh, caller waits for fresh data.
        const runRefreshInBackground = lastRefresh != null && new Date(lastRefresh.finishedAt) > subMinutes(now, 15);

        // Deduplicate parallel refreshes within this instance (e.g. one per DAM "Usages" row): share a
        // single in-flight refresh so they don't each open a transaction and pile up on the advisory lock.
        if (!this.runningRefresh) {
            const runningRefresh = refresh({ concurrently: runRefreshInBackground }).finally(() => {
                this.runningRefresh = undefined;
            });
            this.runningRefresh = runningRefresh;
            // A backgrounded refresh has no awaiter — log failures instead of leaving an unhandled rejection.
            runningRefresh.catch((error) => {
                this.logger.error(`Block index refresh failed: ${error instanceof Error ? error.message : error}`);
            });
        }

        if (!runRefreshInBackground || options?.awaitRefresh) {
            // Wait when synchronous (very stale/uninitialized) or when explicitly requested (CLI awaitRefresh).
            return this.runningRefresh;
        }

        // Backgrounded refresh the caller doesn't wait for — the refresh has been triggered.
        return "refreshed";
    }

    async getDependents(
        target: AnyEntity<{ id: string }> | { entityName: string; id: string },
        options?: {
            filter?: DependentFilter & { rootEntityName?: string };
            offset?: number;
            limit?: number;
            forceRefresh?: boolean;
            sort?: DependencySort[];
        },
    ): Promise<PaginatedDependencies> {
        await this.refreshViews({ force: options?.forceRefresh });
        const { rootEntityName, ...filter } = options?.filter ?? {};

        const entityName = "entityName" in target ? target.entityName : target.constructor.name;

        const where = filtersToMikroOrmQuery(this.remapFilter(filter, "dependents")) as ObjectQuery<BlockIndexDependencyObject>;
        where.targetEntityName = entityName;
        where.targetId = target.id;
        if (rootEntityName) {
            where.rootEntityName = rootEntityName;
        }

        const findOptions: FindOptions<BlockIndexDependencyObject> = { offset: options?.offset, limit: options?.limit };
        if (options?.sort) {
            findOptions.orderBy = gqlSortToMikroOrmOrderBy(this.remapSort(options.sort, "dependents"));
        }

        const [entities, totalCount] = await this.entityManager.findAndCount(BlockIndexDependencyObject, where, findOptions);

        const results = entities.map((entity) => this.mapToResult(entity, "dependents"));
        return new PaginatedDependencies(results, totalCount);
    }

    async getDependencies(
        root: AnyEntity<{ id: string }> | { entityName: string; id: string },
        options?: {
            filter?: DependencyFilter & { targetEntityName?: string };
            offset?: number;
            limit?: number;
            forceRefresh?: boolean;
            sort?: DependencySort[];
        },
    ): Promise<PaginatedDependencies> {
        await this.refreshViews({ force: options?.forceRefresh });
        const { targetEntityName, ...filter } = options?.filter ?? {};

        const entityName = "entityName" in root ? root.entityName : root.constructor.name;

        const where = filtersToMikroOrmQuery(this.remapFilter(filter, "dependencies")) as ObjectQuery<BlockIndexDependencyObject>;
        where.rootEntityName = entityName;
        where.rootId = root.id;
        if (targetEntityName) {
            where.targetEntityName = targetEntityName;
        }

        const findOptions: FindOptions<BlockIndexDependencyObject> = { offset: options?.offset, limit: options?.limit };
        if (options?.sort) {
            findOptions.orderBy = gqlSortToMikroOrmOrderBy(this.remapSort(options.sort, "dependencies"));
        }

        const [entities, totalCount] = await this.entityManager.findAndCount(BlockIndexDependencyObject, where, findOptions);

        const results = entities.map((entity) => this.mapToResult(entity, "dependencies"));
        return new PaginatedDependencies(results, totalCount);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private remapFilter(filter: Record<string, any>, context: "dependencies" | "dependents"): Record<string, any> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const remapped: Record<string, any> = {};

        for (const [key, value] of Object.entries(filter)) {
            if (value === undefined) {
                continue;
            }

            if (key === "and" || key === "or") {
                remapped[key] = (value as Record<string, unknown>[]).map((f) => this.remapFilter(f, context));
                continue;
            }

            const mappedKey = this.remapColumnName(key, context);

            // Convert plain string values to StringFilter so filtersToMikroOrmQuery can handle them
            if (typeof value === "string") {
                const stringFilter = new StringFilter();
                stringFilter.equal = value;
                remapped[mappedKey] = stringFilter;
            } else {
                remapped[mappedKey] = value;
            }
        }

        return remapped;
    }

    private remapColumnName(key: string, context: "dependencies" | "dependents"): string {
        const prefix = context === "dependents" ? "root" : "target";
        switch (key) {
            case "name":
                return `${prefix}Name`;
            case "secondaryInformation":
                return `${prefix}SecondaryInformation`;
            case "graphqlObjectType":
                return `${prefix}GraphqlObjectType`;
            default:
                return key;
        }
    }

    private remapSort(sort: DependencySort[], context: "dependencies" | "dependents") {
        return sort.map(({ field, direction }) => ({ field: this.remapColumnName(field, context), direction }));
    }

    private mapToResult(entity: BlockIndexDependencyObject, context: "dependencies" | "dependents"): Dependency {
        const result = new Dependency();
        Object.assign(result, entity);
        result.name = context === "dependents" ? entity.rootName : entity.targetName;
        result.secondaryInformation = context === "dependents" ? entity.rootSecondaryInformation : entity.targetSecondaryInformation;
        return result;
    }
}
