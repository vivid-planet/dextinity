import { Injectable } from "@nestjs/common";

import { BlockTransformerServiceInterface } from "../../blocks/block";
import { PageTreeReadApiService } from "../page-tree-read-api.service";
import type { ScopeInterface } from "../types";
import type { InternalLinkBlockData } from "./internal-link.block";

type TransformResponse = {
    targetPage: {
        id: string;
        name: string;
        path: string;
        documentType: string;
        scope: ScopeInterface | null;
    } | null;
    targetPageAnchor?: string;
};

@Injectable()
export class InternalLinkBlockTransformerService implements BlockTransformerServiceInterface<InternalLinkBlockData, TransformResponse> {
    constructor(private readonly pageTreeReadApiService: PageTreeReadApiService) {}

    async transformToPlain(block: InternalLinkBlockData) {
        if (!block.targetPageId) {
            return {
                targetPage: null,
            };
        }

        const node = await this.pageTreeReadApiService.getNode(block.targetPageId);

        if (!node) {
            return { targetPage: null };
        }

        return {
            targetPage: {
                id: node.id,
                name: node.name,
                path: await this.pageTreeReadApiService.nodePath(node),
                documentType: node.documentType,
                scope: node.scope ? node.scope : null,
            },
            targetPageAnchor: block.targetPageAnchor,
        };
    }
}
