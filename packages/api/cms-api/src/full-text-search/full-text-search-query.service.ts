import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import { buildFullTextSearchWhere, FullTextSearchWhereOptions } from "./build-full-text-search-where";
import { FullTextSearchTypeCount } from "./dto/full-text-search-results.object";
import { rankSql, titleScoreSql } from "./full-text-query";

export interface FullTextSearchRow {
    id: string;
    entityName: string;
    type: string;
    name: string;
    secondaryInformation?: string;
    visible: boolean;
    titleScore: number;
}

export interface FullTextSearchQueryResult {
    rows: FullTextSearchRow[];
    types: FullTextSearchTypeCount[];
    totalCount: number;
}

const letterOrNumberRegex = /[\p{L}\p{N}]/u;

@Injectable()
export class FullTextSearchQueryService {
    constructor(private readonly entityManager: EntityManager) {}

    /**
     * Searches the "EntityInfoFullText" view, ordered by how well the name matches, then by rank.
     * The type counts ignore the `types` filter, so clients can show them as filter options.
     * Only returns rows the given `permissions` grant access to, including their content scopes.
     */
    async search({
        offset,
        limit,
        ...whereOptions
    }: FullTextSearchWhereOptions & { offset: number; limit: number }): Promise<FullTextSearchQueryResult> {
        if (!letterOrNumberRegex.test(whereOptions.search) || whereOptions.permissions.length === 0) {
            return { rows: [], types: [], totalCount: 0 };
        }

        const [rows, types] = await Promise.all([this.findRows({ ...whereOptions, offset, limit }), this.countTypes(whereOptions)]);

        const selectedTypes = whereOptions.types?.length ? new Set(whereOptions.types) : undefined;
        const totalCount = types.filter(({ type }) => !selectedTypes || selectedTypes.has(type)).reduce((sum, { count }) => sum + count, 0);

        return { rows, types, totalCount };
    }

    private async findRows({
        offset,
        limit,
        ...whereOptions
    }: FullTextSearchWhereOptions & { offset: number; limit: number }): Promise<FullTextSearchRow[]> {
        const titleScore = titleScoreSql(`e."name"`);
        const where = buildFullTextSearchWhere(whereOptions);

        const rows: FullTextSearchRow[] = await this.entityManager.getConnection().execute(
            `SELECT f."id", f."entityName", f."type", e."name", e."secondaryInformation", e."visible", ${titleScore.sql} AS "titleScore"
            FROM "EntityInfoFullText" f
            JOIN "EntityInfo" e ON e."id" = f."id" AND e."entityName" = f."entityName"
            WHERE ${where.sql} AND f."type" IS NOT NULL
            ORDER BY "titleScore" DESC, ${rankSql(`f."fullText"`)} DESC, length(e."name"), f."entityName", f."id"
            LIMIT ? OFFSET ?`,
            [...Array(titleScore.bindingCount).fill(whereOptions.search), ...where.bindings, whereOptions.search, limit, offset],
        );

        return rows.map((row) => ({ ...row, secondaryInformation: row.secondaryInformation ?? undefined }));
    }

    private async countTypes(whereOptions: FullTextSearchWhereOptions): Promise<FullTextSearchTypeCount[]> {
        const where = buildFullTextSearchWhere({ ...whereOptions, types: undefined });

        return this.entityManager.getConnection().execute(
            `SELECT f."type", min(f."entityName") AS "entityName", count(*)::int AS "count"
            FROM "EntityInfoFullText" f
            JOIN "EntityInfo" e ON e."id" = f."id" AND e."entityName" = f."entityName"
            WHERE ${where.sql} AND f."type" IS NOT NULL
            GROUP BY f."type"
            ORDER BY "count" DESC, f."type"`,
            where.bindings,
        );
    }
}
