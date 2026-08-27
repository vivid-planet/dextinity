import { PageTreeNodeInterface, PageTreeReadApiService, PageTreeService } from "@dextinity/cms-api";
import { Injectable } from "@nestjs/common";
import { PageTreeNodeScope } from "@src/page-tree/dto/page-tree-node-scope";

import { PredefinedPage, PredefinedPageType } from "./entities/predefined-page.entity";

@Injectable()
export class PredefinedPagesService {
    constructor(
        private readonly pageTreeService: PageTreeService,
        private readonly pageTreeReadApi: PageTreeReadApiService,
    ) {}

    async predefinedPagePath(type: PredefinedPageType, scope: PageTreeNodeScope): Promise<string> {
        const pageTreeNode = await this.pageTreeNodeForPredefinedPage(type, scope);

        if (!pageTreeNode) {
            switch (type) {
                case PredefinedPageType.news:
                    return "/news";
            }
        }

        return this.pageTreeReadApi.nodePath(pageTreeNode);
    }

    private async pageTreeNodeForPredefinedPage(type: PredefinedPageType, scope: PageTreeNodeScope): Promise<PageTreeNodeInterface | null> {
        const predefinedPageNodes = await this.pageTreeReadApi.getNodes({ scope, documentType: "PredefinedPage" });

        for (const node of predefinedPageNodes) {
            const attachedDocument = await this.pageTreeService.getActiveAttachedDocument(node.id, node.documentType);

            if (!attachedDocument) {
                continue;
            }

            const document = (await this.pageTreeService.resolveDocument(
                attachedDocument.type,
                attachedDocument.documentId,
            )) as PredefinedPage | null;

            if (!document) {
                continue;
            }

            if (document.type === type) {
                return node;
            }
        }

        return null;
    }
}
