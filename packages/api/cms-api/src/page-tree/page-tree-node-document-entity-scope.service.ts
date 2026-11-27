import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import type { DocumentInterface } from "../document/dto/document-interface.js";
import type { EntityScopeServiceInterface } from "../user-permissions/decorators/scoped-entity.decorator.js";
import type { ContentScope } from "../user-permissions/interfaces/content-scope.interface.js";
import { AttachedDocument } from "./entities/attached-document.entity.js";
import { PageTreeService } from "./page-tree.service.js";

@Injectable()
export class PageTreeNodeDocumentEntityScopeService implements EntityScopeServiceInterface<DocumentInterface> {
    constructor(
        private readonly pageTreeService: PageTreeService,
        private readonly entityManager: EntityManager,
    ) {}

    async getEntityScope(document: DocumentInterface): Promise<ContentScope> {
        const pageTreeReadApiService = this.pageTreeService.createReadApi({ visibility: "all" });

        // A new document and its attachment are persisted in one flush, so a flush subscriber asking for the scope
        // doesn't find the attachment in the database yet.
        const pendingAttachedDocument = [...this.entityManager.getUnitOfWork().getPersistStack()].find(
            (entity): entity is AttachedDocument => entity instanceof AttachedDocument && entity.documentId === document.id,
        );

        const pageTreeNode = pendingAttachedDocument
            ? await pageTreeReadApiService.getNode(pendingAttachedDocument.pageTreeNodeId)
            : await pageTreeReadApiService.getFirstNodeByAttachedPageId(document.id);

        if (!pageTreeNode) {
            throw new Error(`PageTreeNode not found for document with id: ${document.id}`);
        }

        return pageTreeNode.scope ?? {};
    }
}
