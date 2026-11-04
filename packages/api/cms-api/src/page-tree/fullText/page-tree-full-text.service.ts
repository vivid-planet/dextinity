import { EntityManager } from "@mikro-orm/postgresql";
import { Inject, Injectable, Type } from "@nestjs/common";

import { DocumentInterface } from "../../document/dto/document-interface";
import { PAGE_TREE_DOCUMENTS, PAGE_TREE_ENTITY } from "../page-tree.constants";

@Injectable()
export class PageTreeFullTextService {
    constructor(
        @Inject(PAGE_TREE_DOCUMENTS) private readonly documents: Type<DocumentInterface>[],
        private entityManager: EntityManager,
    ) {}

    async createPageTreeFullTextView(): Promise<void> {
        const indexSelects: string[] = [];

        const metadataStorage = this.entityManager.getMetadata();

        for (const entity of this.documents) {
            const metadata = metadataStorage.get(entity.name);
            const primary = metadata.primaryKeys[0];

            // Find all tsvector (FullTextType) columns
            const fulltextColumns = metadata.props.filter((prop) => prop.columnTypes && prop.columnTypes.some((ct) => ct === "tsvector"));

            if (fulltextColumns.length === 0) {
                continue;
            }

            const fulltextExpr = fulltextColumns.map((col) => `COALESCE("${metadata.tableName}"."${col.fieldNames[0]}", ''::tsvector)`).join(" || ");

            const select = `SELECT
                            "${metadata.tableName}"."${primary}" AS "documentId",
                            '${metadata.name}' AS "type",
                            ${fulltextExpr} AS "fullText"
                        FROM "${metadata.tableName}"`;

            indexSelects.push(select);
        }

        if (indexSelects.length === 0) {
            throw new Error("PageTree fulltext is enabled but no document entities with fulltext columns found");
        }

        const viewSql = indexSelects.join("\n UNION ALL \n");

        console.time("creating PageTreeDocumentFullText view");
        await this.entityManager.getConnection().execute(`CREATE VIEW "PageTreeDocumentFullText" AS ${viewSql}`);
        console.timeEnd("creating PageTreeDocumentFullText view");

        console.time("creating PageTreeNodeFullText view");
        await this.entityManager.getConnection().execute(
            `CREATE VIEW "PageTreeNodeFullText" AS
                SELECT "ptn"."id" "pageTreeNodeId", "ft"."fullText" || COALESCE("ptn"."fullText", ''::tsvector) AS "fullText"
                FROM "PageTreeNode" "ptn"
                INNER JOIN "PageTreeNodeDocument" "ad" ON "ad"."pageTreeNodeId" = "ptn"."id" AND "ad"."type" = "ptn"."documentType"
                INNER JOIN "PageTreeDocumentFullText" "ft" ON "ad"."documentId" = "ft"."documentId" AND "ft"."type" = "ptn"."documentType"    
            `,
        );
        console.timeEnd("creating PageTreeNodeFullText view");
    }

    async dropPageTreeFullTextView(): Promise<void> {
        await this.entityManager.getConnection().execute(`DROP VIEW IF EXISTS "PageTreeNodeFullText"`);
        await this.entityManager.getConnection().execute(`DROP VIEW IF EXISTS "PageTreeDocumentFullText"`);
    }

    /**
     * for initial filling of fulltext column when column is added. Queries for NULL entries and updates them to at least empty tsvector.
     *
     * Not needed anymore after a single run, even nullable could be removed
     */
    async migrateDocuments(): Promise<void> {
        const metadataStorage = this.entityManager.getMetadata();

        for (const entity of this.documents) {
            const metadata = metadataStorage.get(entity.name);
            const primary = metadata.primaryKeys[0];

            const fulltextColumns = metadata.props
                .filter((prop) => prop.columnTypes && prop.columnTypes.some((ct) => ct === "tsvector"))
                .filter((prop) => prop.nullable); //only nullable
            if (fulltextColumns.length === 0) {
                continue;
            }

            const pageSize = 100;
            let updatedCount = 0;

            while (true) {
                const em = this.entityManager;
                const where = { $or: fulltextColumns.map((col) => ({ [col.name]: null })) };

                const entities = await em.find(entity, where, { limit: pageSize, offset: 0, orderBy: { [primary]: "ASC" } });
                if (entities.length === 0) {
                    break;
                }
                for (const entity of entities) {
                    for (const col of fulltextColumns) {
                        entity[col.name] = " "; //trigger onUpdate
                    }
                }

                await em.flush();
                await em.clear();
                updatedCount += entities.length;
            }

            if (updatedCount > 0) {
                console.log(`Migrated fulltext for ${updatedCount} ${metadata.name} entities`);
            }
        }

        // Migrate PageTreeNode fullText column
        {
            const pageTreeNodeMetadata = metadataStorage.get(PAGE_TREE_ENTITY);
            const primary = pageTreeNodeMetadata.primaryKeys[0];
            const fullTextProp = pageTreeNodeMetadata.props.find((prop) => prop.name === "fullText");

            if (fullTextProp?.nullable) {
                const pageSize = 100;
                let updatedCount = 0;

                while (true) {
                    const em = this.entityManager;
                    const entities = await em.find(
                        PAGE_TREE_ENTITY,
                        { fullText: null },
                        { limit: pageSize, offset: 0, orderBy: { [primary]: "ASC" } },
                    );
                    if (entities.length === 0) {
                        break;
                    }
                    for (const entity of entities) {
                        (entity as Record<string, unknown>).fullText = " "; // trigger onUpdate
                    }

                    await em.flush();
                    await em.clear();
                    updatedCount += entities.length;
                }

                if (updatedCount > 0) {
                    console.log(`Migrated fulltext for ${updatedCount} PageTreeNode entities`);
                }
            }
        }
    }
}
