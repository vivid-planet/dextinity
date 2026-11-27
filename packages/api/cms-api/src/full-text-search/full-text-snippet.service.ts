import { type AnyEntity, EntityManager } from "@mikro-orm/postgresql";
import { Injectable, Logger } from "@nestjs/common";

import { ENTITY_INFO_METADATA_KEY, EntityInfo } from "../entity-info/entity-info.decorator.js";
import { AttachedDocument } from "../page-tree/entities/attached-document.entity.js";
import { FullTextSearchResult } from "./dto/full-text-search-result.object.js";
import { markedTextsQuery, parseMarkedText, stripControlCharacters, toSnippet } from "./full-text-highlights.js";
import { documentSourceText, entitySourceText } from "./snippet-source.js";

export type FullTextSearchRow = Omit<FullTextSearchResult, "titleHighlights" | "snippet">;

@Injectable()
export class FullTextSnippetService {
    private readonly logger = new Logger(FullTextSnippetService.name);

    constructor(private readonly entityManager: EntityManager) {}

    /**
     * Adds the highlights in the name and a snippet of the matching content to each row.
     * Only pass rows the user may see: the content is loaded without access checks.
     */
    async addHighlights(rows: FullTextSearchRow[], search: string): Promise<FullTextSearchResult[]> {
        if (rows.length === 0) {
            return [];
        }

        const texts = await this.loadSourceTexts(rows);
        const names = rows.map((row) => stripControlCharacters(row.name));
        const { sql, params } = markedTextsQuery({ search, names, texts });
        const markedTexts = await this.entityManager.execute<Array<{ markedName: string; markedText: string }>>(sql, params);

        return rows.map((row, index) => ({
            ...row,
            titleHighlights: parseMarkedText(markedTexts[index].markedName).highlights,
            snippet: toSnippet(markedTexts[index].markedText, texts[index]),
        }));
    }

    private async loadSourceTexts(rows: FullTextSearchRow[]): Promise<string[]> {
        // Never flushed: keeps the request's identity map clean and isolates the full-text callbacks
        const entityManager = this.entityManager.fork({ clear: true });
        const textsById = new Map<string, string>();

        for (const entityName of new Set(rows.map((row) => row.entityName))) {
            const rowsOfEntity = rows.filter((row) => row.entityName === entityName);
            try {
                const texts =
                    entityName === "PageTreeNode"
                        ? await this.loadPageTreeNodeTexts(entityManager, rowsOfEntity)
                        : await this.loadEntityTexts(entityManager, entityName, rowsOfEntity);
                for (const [id, text] of texts) {
                    textsById.set(`${entityName}:${id}`, text);
                }
            } catch (error) {
                // The texts come from application code (full-text callbacks, blocks), which must not break the search
                this.logger.warn(`Failed to load the full-text snippets of ${entityName}: ${error}`);
            }
        }

        return rows.map((row) => textsById.get(`${row.entityName}:${row.id}`) ?? "");
    }

    private async loadEntityTexts(entityManager: EntityManager, entityName: string, rows: FullTextSearchRow[]): Promise<Map<string, string>> {
        const metadata = entityManager.getMetadata().getByClassName(entityName, false);
        const entityInfo = metadata && (Reflect.getMetadata(ENTITY_INFO_METADATA_KEY, metadata.class) as EntityInfo<AnyEntity> | undefined);
        if (!metadata || !entityInfo || typeof entityInfo !== "object" || !("fullText" in entityInfo) || !entityInfo.fullText) {
            return new Map();
        }

        const primaryKey = metadata.primaryKeys[0];
        const entities = await entityManager.find(metadata.class, { [primaryKey]: { $in: rows.map((row) => row.id) } });

        const texts = new Map<string, string>();
        for (const entity of entities) {
            const id = String((entity as Record<string, unknown>)[primaryKey]);
            const row = rows.find((row) => row.id === id);
            texts.set(
                id,
                await entitySourceText({
                    entity,
                    metadata,
                    fullTextPropertyName: entityInfo.fullText,
                    textsShownInResult: [row?.name, row?.secondaryInformation],
                    entityManager,
                }),
            );
        }
        return texts;
    }

    private async loadPageTreeNodeTexts(entityManager: EntityManager, rows: FullTextSearchRow[]): Promise<Map<string, string>> {
        const documentTypeByNodeId = new Map(rows.map((row) => [row.id, row.type]));
        const attachedDocuments = (await entityManager.find(AttachedDocument, { pageTreeNodeId: { $in: [...documentTypeByNodeId.keys()] } })).filter(
            (attachedDocument) => documentTypeByNodeId.get(attachedDocument.pageTreeNodeId) === attachedDocument.type,
        );

        const texts = new Map<string, string>();
        for (const documentType of new Set(attachedDocuments.map((attachedDocument) => attachedDocument.type))) {
            const metadata = entityManager.getMetadata().getByClassName(documentType);
            const primaryKey = metadata.primaryKeys[0];
            const attachedDocumentsOfType = attachedDocuments.filter((attachedDocument) => attachedDocument.type === documentType);
            const documents = await entityManager.find(metadata.class, {
                [primaryKey]: { $in: attachedDocumentsOfType.map((attachedDocument) => attachedDocument.documentId) },
            });

            for (const document of documents) {
                const documentId = String((document as Record<string, unknown>)[primaryKey]);
                const nodeId = attachedDocumentsOfType.find((attachedDocument) => attachedDocument.documentId === documentId)?.pageTreeNodeId;
                if (nodeId) {
                    texts.set(nodeId, documentSourceText(document, metadata));
                }
            }
        }
        return texts;
    }
}
