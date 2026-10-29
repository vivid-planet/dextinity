import { Injectable } from "@nestjs/common";

import type { DocumentInterface } from "../document/dto/document-interface.js";
import type { EntityScopeServiceInterface } from "../user-permissions/decorators/scoped-entity.decorator.js";
import type { ContentScope } from "../user-permissions/interfaces/content-scope.interface.js";
import { PageTreeService } from "./page-tree.service.js";

@Injectable()
export class PageTreeNodeDocumentEntityScopeService implements EntityScopeServiceInterface<DocumentInterface> {
    constructor(private readonly pageTreeService: PageTreeService) {}

    async getEntityScope(document: DocumentInterface): Promise<ContentScope> {
        const pageTreeReadApiService = this.pageTreeService.createReadApi({ visibility: "all" });

        const pageTreeNode = await pageTreeReadApiService.getFirstNodeByAttachedPageId(document.id);

        if (!pageTreeNode) {
            throw new Error(`PageTreeNode not found for document with id: ${document.id}`);
        }

        return pageTreeNode.scope ?? {};
    }
}
