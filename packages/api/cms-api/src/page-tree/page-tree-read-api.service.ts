import { EntityClass, EntityManager } from "@mikro-orm/postgresql";
import { Inject, Injectable } from "@nestjs/common";
import { CONTEXT } from "@nestjs/graphql";

import { getRequestContextHeadersFromRequest } from "../common/decorators/request-context.decorator";
import { PAGE_TREE_NODE_ENTITY } from "./page-tree.constants";
import { createReadApi, PageTreeReadApi, PageTreeReadApiOptions } from "./page-tree-read-api";
import { PageTreeNodeInterface, PageTreeNodeVisibility as Visibility, ScopeInterface } from "./types";

@Injectable()
export class PageTreeReadApiService {
    private api: PageTreeReadApi;
    constructor(
        private readonly entityManager: EntityManager,
        @Inject(PAGE_TREE_NODE_ENTITY) private readonly PageTreeNode: EntityClass<PageTreeNodeInterface>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        @Inject(CONTEXT) private context: any,
    ) {
        let includeInvisiblePages: Visibility[] = [];
        if (this.context) {
            let headers;
            if (this.context.req) {
                headers = this.context.req.headers;
            } else if (this.context.headers) {
                headers = this.context.headers;
            } else {
                throw new Error("Can't extract request headers from context");
            }
            const ctx = getRequestContextHeadersFromRequest({ headers });

            includeInvisiblePages = ctx.includeInvisiblePages || [];
        }
        this.api = createReadApi(
            {
                entityManager: this.entityManager,
                PageTreeNode: this.PageTreeNode,
            },
            {
                visibility: [Visibility.Published, ...includeInvisiblePages],
            },
        );
    }
    async nodePathById(id: string): Promise<string> {
        return this.api.nodePathById(id);
    }
    async nodePath(node: Pick<PageTreeNodeInterface, "id" | "slug" | "parentId" | "scope">): Promise<string> {
        return this.api.nodePath(node);
    }
    async parentNodes(node: PageTreeNodeInterface): Promise<PageTreeNodeInterface[]> {
        return this.api.parentNodes(node);
    }
    async getNode(id: string): Promise<PageTreeNodeInterface | null> {
        return this.api.getNode(id);
    }
    async getNodeOrFail(id: string): Promise<PageTreeNodeInterface> {
        return this.api.getNodeOrFail(id);
    }
    async getNodesByIds(ids: string[]): Promise<PageTreeNodeInterface[]> {
        return this.api.getNodesByIds(ids);
    }
    async getParentNode(node: PageTreeNodeInterface): Promise<PageTreeNodeInterface | null> {
        return this.api.getParentNode(node);
    }
    async getNodes(options?: PageTreeReadApiOptions): Promise<PageTreeNodeInterface[]> {
        return this.api.getNodes(options);
    }
    async getNodesCount(options?: PageTreeReadApiOptions): Promise<number> {
        return this.api.getNodesCount(options);
    }
    async getChildNodes(node: PageTreeNodeInterface): Promise<PageTreeNodeInterface[]> {
        return this.api.getChildNodes(node);
    }
    async getNodeByPath(path: string, options?: PageTreeReadApiOptions): Promise<PageTreeNodeInterface | null> {
        return this.api.getNodeByPath(path, options);
    }
    async pageTreeRootNodeList(options?: PageTreeReadApiOptions & { excludeHiddenInMenu?: boolean }): Promise<PageTreeNodeInterface[]> {
        return this.api.pageTreeRootNodeList(options);
    }
    async getDescendants(node: PageTreeNodeInterface): Promise<PageTreeNodeInterface[]> {
        return this.api.getDescendants(node);
    }
    async getFirstNodeByAttachedPageId(pageId: string): Promise<PageTreeNodeInterface | null> {
        return this.api.getFirstNodeByAttachedPageId(pageId);
    }
    async preloadNodes(scope: ScopeInterface): Promise<void> {
        return this.api.preloadNodes(scope);
    }
}
