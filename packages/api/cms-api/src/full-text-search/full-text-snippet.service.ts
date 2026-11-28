import { AnyEntity, EntityManager } from "@mikro-orm/postgresql";
import { Injectable, Logger } from "@nestjs/common";

import { ENTITY_INFO_METADATA_KEY, EntityInfo } from "../entity-info/entity-info.decorator";
import { AttachedDocument } from "../page-tree/entities/attached-document.entity";
import { buildSnippet, HIGHLIGHT_END_MARKER, HIGHLIGHT_START_MARKER, parseMarkedText } from "./build-snippet";
import { FullTextSearchResult } from "./dto/full-text-search-result.object";
import { ANY_TERM_TSQUERY_SQL } from "./full-text-query";
import { FullTextSearchRow } from "./full-text-search-query.service";
import { paragraphsForEntity, stripControlCharacters } from "./snippet-source";

const headlineOptionsSql = `'HighlightAll=true, StartSel=' || chr(${HIGHLIGHT_START_MARKER.charCodeAt(0)}) || ', StopSel=' || chr(${HIGHLIGHT_END_MARKER.charCodeAt(0)})`;

@Injectable()
export class FullTextSnippetService {
    private readonly logger = new Logger(FullTextSnippetService.name);

    constructor(private readonly entityManager: EntityManager) {}

    /**
     * Adds the highlighted title and the best matching content paragraph to each row.
     * Only pass rows the current user is allowed to see: the source texts are loaded without further access checks.
     */
    async buildResults(rows: FullTextSearchRow[], search: string): Promise<FullTextSearchResult[]> {
        if (rows.length === 0) {
            return [];
        }

        const names = rows.map((row) => stripControlCharacters(row.name));
        const paragraphsPerRow = await this.loadParagraphs(rows, names);

        const [markedTitles, markedSnippets] = await Promise.all([
            this.highlightTitles(names, search),
            this.findBestParagraphs(paragraphsPerRow, search),
        ]);

        return rows.map((row, index) => {
            const markedSnippet = markedSnippets.get(index);
            return {
                id: row.id,
                entityName: row.entityName,
                type: row.type,
                name: row.name,
                secondaryInformation: row.secondaryInformation,
                visible: row.visible,
                titleMatch: row.titleScore > 0,
                title: { ...parseMarkedText(markedTitles[index] ?? names[index]), truncatedStart: false, truncatedEnd: false },
                snippet: markedSnippet !== undefined ? buildSnippet(parseMarkedText(markedSnippet)) : undefined,
            };
        });
    }

    private async loadParagraphs(rows: FullTextSearchRow[], names: string[]): Promise<string[][]> {
        // Never flushed: keeps the request's identity map clean and isolates the full-text callbacks.
        const entityManager = this.entityManager.fork({ clear: true });
        const paragraphsPerRow: string[][] = rows.map(() => []);

        const rowIndexesByEntityName = new Map<string, number[]>();
        for (const [index, row] of rows.entries()) {
            rowIndexesByEntityName.set(row.entityName, [...(rowIndexesByEntityName.get(row.entityName) ?? []), index]);
        }

        for (const [entityName, rowIndexes] of rowIndexesByEntityName) {
            try {
                const groupRows = rowIndexes.map((index) => ({ row: rows[index], name: names[index], index }));
                const paragraphsById =
                    entityName === "PageTreeNode"
                        ? await this.loadPageTreeNodeParagraphs(entityManager, groupRows)
                        : await this.loadEntityParagraphs(entityManager, entityName, groupRows);

                for (const { row, index } of groupRows) {
                    paragraphsPerRow[index] = paragraphsById.get(row.id) ?? [];
                }
            } catch (error) {
                this.logger.warn(`Failed to load full-text snippet sources for ${entityName}: ${error}`);
            }
        }

        return paragraphsPerRow;
    }

    private async loadEntityParagraphs(
        entityManager: EntityManager,
        entityName: string,
        groupRows: Array<{ row: FullTextSearchRow; name: string }>,
    ): Promise<Map<string, string[]>> {
        const metadata = entityManager.getMetadata().find(entityName);
        if (!metadata) {
            return new Map();
        }

        const entityInfo = Reflect.getMetadata(ENTITY_INFO_METADATA_KEY, metadata.class) as EntityInfo<AnyEntity> | undefined;
        const fullTextPropertyName = entityInfo && typeof entityInfo === "object" && "fullText" in entityInfo ? entityInfo.fullText : undefined;
        const primaryKey = metadata.primaryKeys[0];

        const entities = await entityManager.find(metadata.class, { [primaryKey]: { $in: groupRows.map(({ row }) => row.id) } });

        const paragraphsById = new Map<string, string[]>();
        for (const entity of entities) {
            const id = String((entity as Record<string, unknown>)[primaryKey]);
            const groupRow = groupRows.find(({ row }) => row.id === id);
            try {
                paragraphsById.set(
                    id,
                    await paragraphsForEntity({
                        entity,
                        metadata,
                        fullTextPropertyName,
                        name: groupRow?.name ?? "",
                        secondaryInformation: groupRow?.row.secondaryInformation,
                        entityManager,
                    }),
                );
            } catch (error) {
                this.logger.warn(`Failed to build full-text snippet source for ${entityName} ${id}: ${error}`);
            }
        }
        return paragraphsById;
    }

    private async loadPageTreeNodeParagraphs(
        entityManager: EntityManager,
        groupRows: Array<{ row: FullTextSearchRow; name: string }>,
    ): Promise<Map<string, string[]>> {
        const documentTypeByNodeId = new Map(groupRows.map(({ row }) => [row.id, row.type]));
        const attachedDocuments = (await entityManager.find(AttachedDocument, { pageTreeNodeId: { $in: [...documentTypeByNodeId.keys()] } })).filter(
            (attachedDocument) => documentTypeByNodeId.get(attachedDocument.pageTreeNodeId) === attachedDocument.type,
        );

        const paragraphsById = new Map<string, string[]>();
        const documentTypes = new Set(attachedDocuments.map((attachedDocument) => attachedDocument.type));

        for (const documentType of documentTypes) {
            const metadata = entityManager.getMetadata().find(documentType);
            if (!metadata) {
                continue;
            }

            const attachedDocumentsOfType = attachedDocuments.filter((attachedDocument) => attachedDocument.type === documentType);
            const primaryKey = metadata.primaryKeys[0];
            const documents = await entityManager.find(metadata.class, {
                [primaryKey]: { $in: attachedDocumentsOfType.map((attachedDocument) => attachedDocument.documentId) },
            });

            for (const document of documents) {
                const documentId = String((document as Record<string, unknown>)[primaryKey]);
                const nodeId = attachedDocumentsOfType.find((attachedDocument) => attachedDocument.documentId === documentId)?.pageTreeNodeId;
                if (!nodeId) {
                    continue;
                }
                const groupRow = groupRows.find(({ row }) => row.id === nodeId);
                try {
                    paragraphsById.set(
                        nodeId,
                        await paragraphsForEntity({
                            entity: document,
                            metadata,
                            name: groupRow?.name ?? "",
                            secondaryInformation: groupRow?.row.secondaryInformation,
                            entityManager,
                        }),
                    );
                } catch (error) {
                    this.logger.warn(`Failed to build full-text snippet source for PageTreeNode ${nodeId}: ${error}`);
                }
            }
        }

        return paragraphsById;
    }

    private async highlightTitles(names: string[], search: string): Promise<Array<string | null>> {
        const rows: Array<{ marked: string | null }> = await this.entityManager.getConnection().execute(
            `SELECT ts_headline('simple', n, ${ANY_TERM_TSQUERY_SQL}, ${headlineOptionsSql}) AS "marked"
            FROM unnest(ARRAY[?]::text[]) WITH ORDINALITY AS x(n, i)
            ORDER BY i`,
            [search, names],
        );
        return rows.map((row) => row.marked);
    }

    /**
     * Returns the best matching paragraph per row index, with all search terms marked.
     */
    private async findBestParagraphs(paragraphsPerRow: string[][], search: string): Promise<Map<number, string>> {
        const rowIndexes: number[] = [];
        const paragraphIndexes: number[] = [];
        const paragraphs: string[] = [];
        for (const [rowIndex, rowParagraphs] of paragraphsPerRow.entries()) {
            for (const [paragraphIndex, paragraph] of rowParagraphs.entries()) {
                rowIndexes.push(rowIndex);
                paragraphIndexes.push(paragraphIndex);
                paragraphs.push(paragraph);
            }
        }

        if (paragraphs.length === 0) {
            return new Map();
        }

        // The any-term query also marks paragraphs that contain only some of the terms.
        const rows: Array<{ hit: number; marked: string | null }> = await this.entityManager.getConnection().execute(
            `WITH p AS (
                SELECT * FROM unnest(ARRAY[?]::int[], ARRAY[?]::int[], ARRAY[?]::text[]) AS p(hit, ord, t)
            ),
            scored AS (
                SELECT p.*, row_number() OVER (PARTITION BY hit ORDER BY ts_rank_cd(to_tsvector('simple', t), ${ANY_TERM_TSQUERY_SQL}) DESC, ord) AS rn
                FROM p
                WHERE to_tsvector('simple', t) @@ ${ANY_TERM_TSQUERY_SQL}
            )
            SELECT hit, ts_headline('simple', t, ${ANY_TERM_TSQUERY_SQL}, ${headlineOptionsSql}) AS "marked"
            FROM scored
            WHERE rn = 1`,
            [rowIndexes, paragraphIndexes, paragraphs, search, search, search],
        );

        return new Map(rows.filter((row) => row.marked !== null).map((row) => [row.hit, row.marked as string]));
    }
}
