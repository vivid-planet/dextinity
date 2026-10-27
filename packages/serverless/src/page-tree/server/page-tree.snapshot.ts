import { homeSlug } from "./page-tree.config.js";
import type { PageTreeNode, PageTreeNodeRecord } from "./page-tree.types.js";

/**
 * All nodes of one scope, loaded with a single query. Paths, children and descendants are calculated in memory, which is portable
 * between D1 and PostgreSQL and fast for the size of page trees (the counterpart of `preloadNodes` of the NestJS read API).
 */
export class PageTreeSnapshot {
    private readonly nodesById: Map<string, PageTreeNodeRecord>;
    private readonly childrenByParentId = new Map<string | null, PageTreeNodeRecord[]>();
    private readonly slugPaths = new Map<string, string>();

    constructor(records: PageTreeNodeRecord[]) {
        this.nodesById = new Map(records.map((record) => [record.id, record]));
        for (const record of records) {
            const siblings = this.childrenByParentId.get(record.parentId) ?? [];
            siblings.push(record);
            this.childrenByParentId.set(record.parentId, siblings);
        }
        for (const siblings of this.childrenByParentId.values()) {
            siblings.sort((a, b) => a.pos - b.pos);
        }
    }

    /** In tree order: each node followed by its descendants, siblings by position */
    get nodes(): PageTreeNode[] {
        const ordered: PageTreeNode[] = [];
        const visit = (parentId: string | null) => {
            for (const child of this.childrenByParentId.get(parentId) ?? []) {
                ordered.push(this.withPath(child));
                visit(child.id);
            }
        };
        visit(null);
        return ordered;
    }

    node(id: string): PageTreeNode | undefined {
        const record = this.nodesById.get(id);
        return record && this.withPath(record);
    }

    /** Ordered by position. Root nodes (`parentId` null) are filtered by category, children always share their parent's category. */
    children(parentId: string | null, category?: string): PageTreeNode[] {
        return (this.childrenByParentId.get(parentId) ?? [])
            .filter((child) => parentId !== null || category === undefined || child.category === category)
            .map((child) => this.withPath(child));
    }

    descendants(id: string): PageTreeNode[] {
        return this.children(id).flatMap((child) => [child, ...this.descendants(child.id)]);
    }

    /** Root first, without the node itself */
    ancestors(id: string): PageTreeNode[] {
        const parentId = this.nodesById.get(id)?.parentId;
        if (!parentId) {
            return [];
        }
        return [...this.ancestors(parentId), this.node(parentId) as PageTreeNode];
    }

    isAncestorOrSelf(ancestorId: string, id: string): boolean {
        return id === ancestorId || this.ancestors(id).some((ancestor) => ancestor.id === ancestorId);
    }

    /** The path a node with the slug would have below the parent */
    pathFor(parentId: string | null, slug: string): string {
        return toPath(`${parentId ? this.slugPath(parentId) : ""}/${slug}`);
    }

    /** Archived nodes are ignored: their paths can be reused. */
    nodeByPath(path: string, { except = [] }: { except?: string[] } = {}): PageTreeNode | undefined {
        for (const record of this.nodesById.values()) {
            if (record.visibility !== "Archived" && !except.includes(record.id) && toPath(this.slugPath(record.id)) === path) {
                return this.withPath(record);
            }
        }
        return undefined;
    }

    private withPath(record: PageTreeNodeRecord): PageTreeNode {
        return { ...record, path: toPath(this.slugPath(record.id)) };
    }

    /** The slugs joined, e.g. `/home` for the home page and `/home/news` for its child */
    private slugPath(id: string): string {
        let path = this.slugPaths.get(id);
        if (path === undefined) {
            const record = this.nodesById.get(id);
            if (!record) {
                throw new Error(`Page tree node ${id} not found`);
            }
            path = `${record.parentId ? this.slugPath(record.parentId) : ""}/${record.slug}`;
            this.slugPaths.set(id, path);
        }
        return path;
    }
}

function toPath(slugPath: string): string {
    return slugPath === `/${homeSlug}` ? "/" : slugPath;
}
