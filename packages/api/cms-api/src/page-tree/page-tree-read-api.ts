import { type EntityRepository, NotFoundError, type QueryBuilder } from "@mikro-orm/postgresql";
import opentelemetry from "@opentelemetry/api";
import DataLoader from "dataloader";
import { compareAsc, compareDesc, isEqual } from "date-fns";

import { SortDirection } from "../common/sorting/sort-direction.enum";
import { type PageTreeNodeSort, PageTreeNodeSortField } from "./dto/page-tree-node.sort";
import type { AttachedDocument } from "./entities/attached-document.entity";
import { type PageTreeNodeCategory, type PageTreeNodeInterface, PageTreeNodeVisibility as Visibility, type ScopeInterface } from "./types";
import pathBuilder from "./utils/path-builder";

const tracer = opentelemetry.trace.getTracer("@dextinity/cms-api");

interface PageTreeNodeFilterOptions {
    parentId?: string | null;
    excludeHiddenInMenu?: boolean;
    category?: string;
    documentType?: string;
    slug?: string;
}
export interface PageTreeReadApiOptions {
    category?: PageTreeNodeCategory;
    scope?: ScopeInterface;
    documentType?: string;
    sort?: PageTreeNodeSort[];
    offset?: number;
    limit?: number;
}

export interface PageTreeReadApi {
    nodePathById(id: string): Promise<string>;
    nodePath(node: Pick<PageTreeNodeInterface, "id" | "slug" | "parentId" | "scope">): Promise<string>;
    parentNodes(node: PageTreeNodeInterface): Promise<PageTreeNodeInterface[]>;
    getNode(id: string): Promise<PageTreeNodeInterface | null>;
    getNodeOrFail(id: string): Promise<PageTreeNodeInterface>;
    getNodesByIds(ids: string[]): Promise<PageTreeNodeInterface[]>;
    getParentNode(node: PageTreeNodeInterface): Promise<PageTreeNodeInterface | null>;
    getNodes(options?: PageTreeReadApiOptions): Promise<PageTreeNodeInterface[]>;
    getNodesCount(options?: PageTreeReadApiOptions): Promise<number>;
    getChildNodes(node: PageTreeNodeInterface): Promise<PageTreeNodeInterface[]>;
    getNodeByPath(path: string, options?: PageTreeReadApiOptions): Promise<PageTreeNodeInterface | null>;
    pageTreeRootNodeList(options?: PageTreeReadApiOptions & { excludeHiddenInMenu?: boolean }): Promise<PageTreeNodeInterface[]>;
    getDescendants(node: PageTreeNodeInterface): Promise<PageTreeNodeInterface[]>;
    getFirstNodeByAttachedPageId(pageId: string): Promise<PageTreeNodeInterface | null>;
    preloadNodes(scope: ScopeInterface): Promise<void>;
}

// hash from scope object used as key for preloadedNodes Map
function scopeHash(scope: ScopeInterface | undefined): string {
    if (!scope) {
        return "";
    }
    return JSON.stringify(scope);
}

interface ChildNodesKey {
    scope: ScopeInterface | undefined;
    parentId: string | null;
}

function childNodesKey({ scope, parentId }: ChildNodesKey): string {
    return `${scopeHash(scope)}|${parentId ?? ""}`;
}

export function createReadApi(
    {
        pageTreeNodeRepository,
        attachedDocumentsRepository,
    }: {
        pageTreeNodeRepository: EntityRepository<PageTreeNodeInterface>;
        attachedDocumentsRepository: EntityRepository<AttachedDocument>;
    },
    options: {
        visibility?: Visibility | Visibility[] | "all";
    } = {},
): PageTreeReadApi {
    const { visibility = [Visibility.Published] } = options; // @TODO: What is the best default value? 'all' (most needed) or [Published] (safe)
    const visibilityFilter: Array<PageTreeNodeInterface["visibility"]> =
        visibility === "all"
            ? [Visibility.Published, Visibility.Unpublished, Visibility.Archived]
            : typeof visibility === "string"
              ? [visibility]
              : visibility.length === 0 // empty array is not allowed, as someone might unintendedly query all visibilites (empty array means no filter)
                ? [Visibility.Published]
                : [...visibility];

    const preloadedNodes = new Map<string, PageTreeNodeInterface[]>();
    const nodesById = new Map<string, PageTreeNodeInterface>();

    // Batches all node loads happening in the same tick into a single query. Without batching, concurrently resolved
    // blocks (BlocksBlock, ListBlock, …) containing internal links cause one query per link and per path segment.
    const nodeLoader = new DataLoader<string, PageTreeNodeInterface | null>(async (ids) => {
        return tracer.startActiveSpan("live query PageTree loadNodes", async (span) => {
            span.setAttribute("ids count", ids.length);
            const nodes = await pageTreeNodeRepository.find({ id: { $in: [...ids] }, visibility: { $in: visibilityFilter } });

            const loadedNodesById = new Map(nodes.map((node) => [node.id, node]));
            for (const node of nodes) {
                nodesById.set(node.id, node);
            }

            span.end();
            return ids.map((id) => loadedNodesById.get(id) ?? null);
        });
    });

    // Batches "children of node X" lookups happening in the same tick into one query per scope. Without batching,
    // walking a tree (menus, getDescendants, resolving a path segment by segment) causes one query per node.
    const childNodesLoader = new DataLoader<ChildNodesKey, PageTreeNodeInterface[], string>(
        async (keys) => {
            return tracer.startActiveSpan("live query PageTree loadChildNodes", async (span) => {
                span.setAttribute("keys count", keys.length);

                const keysByScope = new Map<string, { scope: ScopeInterface | undefined; parentIds: Array<string | null> }>();
                for (const key of keys) {
                    const hash = scopeHash(key.scope);
                    const group = keysByScope.get(hash) ?? { scope: key.scope, parentIds: [] };
                    group.parentIds.push(key.parentId);
                    keysByScope.set(hash, group);
                }

                const childNodesByKey = new Map<string, PageTreeNodeInterface[]>();
                await Promise.all(
                    Array.from(keysByScope.values()).map(async ({ scope, parentIds }) => {
                        const qb = pageTreeNodeRepository.createQueryBuilder().where({ visibility: visibilityFilter });
                        if (scope) {
                            qb.andWhere({ scope });
                        }

                        // `parentId: null` (root nodes) can't be expressed inside `$in`, so it becomes its own condition
                        const ids = parentIds.filter((parentId): parentId is string => parentId !== null);
                        const parentConditions: Array<{ parentId: { $in: string[] } | null }> = [];
                        if (ids.length > 0) {
                            parentConditions.push({ parentId: { $in: ids } });
                        }
                        if (parentIds.includes(null)) {
                            parentConditions.push({ parentId: null });
                        }
                        qb.andWhere({ $or: parentConditions });
                        qb.orderBy({ pos: "ASC" });

                        for (const node of await qb.getResultList()) {
                            nodesById.set(node.id, node);
                            const key = childNodesKey({ scope, parentId: node.parentId });
                            const childNodes = childNodesByKey.get(key) ?? [];
                            childNodes.push(node);
                            childNodesByKey.set(key, childNodes);
                        }
                    }),
                );

                span.end();
                return keys.map((key) => childNodesByKey.get(childNodesKey(key)) ?? []);
            });
        },
        { cacheKeyFn: childNodesKey },
    );

    const queryNodes = async (
        scope: ScopeInterface | undefined,
        where: PageTreeNodeFilterOptions,
        sort?: PageTreeNodeSort[],
        limit?: number,
        offset?: number,
    ): Promise<PageTreeNodeInterface[]> => {
        await waitForPreloadDone();
        if (scope && preloadedNodes.has(scopeHash(scope))) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            let nodes = preloadedNodes.get(scopeHash(scope))!;

            nodes = filterPreloadedNodes(nodes, where);

            if (sort) {
                nodes = sortPreloadedNodes(nodes, sort);
            }

            if (offset !== undefined && limit !== undefined) {
                nodes = paginatePreloadedNodes(nodes, { offset, limit });
            }

            return nodes;
        } else if (where.parentId !== undefined && sort === undefined && limit === undefined && offset === undefined) {
            // Children of a node are batchable; the remaining filters are applied in memory, as for preloaded nodes
            return filterPreloadedNodes(await childNodesLoader.load({ scope, parentId: where.parentId }), where);
        } else {
            return tracer.startActiveSpan("live query PageTree queryNodes", async (span) => {
                span.setAttribute("scope", JSON.stringify(scope));
                span.setAttribute("where", JSON.stringify(where));
                let qb = pageTreeNodeRepository.createQueryBuilder().where({
                    visibility: visibilityFilter,
                });

                qb = filterLiveQuery(qb, where, scope);

                if (sort) {
                    sort.forEach((sortItem) => {
                        qb.orderBy({ [`${sortItem.field}`]: sortItem.direction });
                    });
                } else {
                    qb.orderBy({ pos: "ASC" });
                }

                if (offset !== undefined && limit !== undefined) {
                    qb.limit(limit, offset);
                }

                const nodes = await qb.getResultList();

                for (const node of nodes) {
                    nodesById.set(node.id, node);
                }
                span.end();
                return nodes;
            });
        }
    };

    function filterPreloadedNodes(nodes: PageTreeNodeInterface[], where: PageTreeNodeFilterOptions): PageTreeNodeInterface[] {
        if (where.parentId !== undefined) {
            nodes = nodes.filter((node) => node.parentId === where.parentId);
        }
        if (where.excludeHiddenInMenu) {
            nodes = nodes.filter((node) => node.hideInMenu === false);
        }
        if (where.category) {
            nodes = nodes.filter((node) => node.category === where.category);
        }
        if (where.documentType) {
            nodes = nodes.filter((node) => node.documentType === where.documentType);
        }
        if (where.slug) {
            nodes = nodes.filter((node) => node.slug === where.slug);
        }

        return nodes;
    }

    function filterLiveQuery(
        qb: QueryBuilder<PageTreeNodeInterface>,
        where: PageTreeNodeFilterOptions,
        scope: ScopeInterface | undefined,
    ): QueryBuilder<PageTreeNodeInterface> {
        if (scope) {
            qb.andWhere({ scope });
        }
        if (where.parentId !== undefined) {
            qb.andWhere({ parentId: where.parentId });
        }

        if (where.excludeHiddenInMenu) {
            qb.andWhere({ hideInMenu: false });
        }
        if (where.category) {
            qb.andWhere({ category: where.category });
        }
        if (where.documentType) {
            qb.andWhere({ documentType: where.documentType });
        }
        if (where.slug) {
            qb.andWhere({ slug: where.slug });
        }

        return qb;
    }

    const countNodes = async (scope: ScopeInterface | undefined, where: PageTreeNodeFilterOptions): Promise<number> => {
        await waitForPreloadDone();
        if (scope && preloadedNodes.has(scopeHash(scope))) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            let nodes = preloadedNodes.get(scopeHash(scope))!;

            nodes = filterPreloadedNodes(nodes, where);

            return nodes.length;
        } else {
            return tracer.startActiveSpan("live query PageTree countNodes", async (span) => {
                span.setAttribute("scope", JSON.stringify(scope));
                span.setAttribute("where", JSON.stringify(where));
                let qb = pageTreeNodeRepository.createQueryBuilder().where({
                    visibility: visibilityFilter,
                });

                qb = filterLiveQuery(qb, where, scope);

                const nodesCout = await qb.getCount();

                span.end();
                return nodesCout;
            });
        }
    };

    let preloadRunning = false;
    const waitForPreloadingResolvers: Array<() => void> = [];
    const waitForPreloadDone = async (): Promise<void> => {
        if (!preloadRunning) {
            return;
        }
        return new Promise((resolve, reject) => {
            waitForPreloadingResolvers.push(resolve);
        });
    };

    return {
        async nodePathById(id) {
            const node = await this.getNodeOrFail(id);
            return this.nodePath(node);
        },

        async nodePath(node) {
            await waitForPreloadDone();
            let parentNode = node;
            const slugs = [node.slug];
            const loopLimit = 5000;
            let count = 0;
            while (parentNode.parentId) {
                if (count >= loopLimit) {
                    throw new Error("Loop limit reached");
                }

                const currentParentNode = await this.getNode(parentNode.parentId);
                if (!currentParentNode) {
                    console.error(`Could not find parent with id ${parentNode.parentId}`);
                    return "";
                }
                parentNode = currentParentNode;
                slugs.push(parentNode.slug);
                count++;
            }

            return pathBuilder(slugs);
        },
        async parentNodes(node) {
            let parentNode: PageTreeNodeInterface | null = node;
            const parentNodes: PageTreeNodeInterface[] = [];
            while (parentNode?.parentId) {
                parentNode = await this.getNode(parentNode.parentId);

                if (parentNode) {
                    parentNodes.push(parentNode);
                }
            }
            return parentNodes.reverse();
        },

        async getNode(id) {
            await waitForPreloadDone();
            const preloadedNode = nodesById.get(id);
            if (preloadedNode) {
                return preloadedNode;
            }
            return nodeLoader.load(id);
        },

        async getNodeOrFail(id) {
            const node = await this.getNode(id);
            if (!node) {
                throw new NotFoundError(
                    `Cannot find PageTreeNode with ID ${id} and visibility ${Array.isArray(visibility) ? visibility.join(" or ") : visibility}`,
                );
            }
            return node;
        },

        async getNodesByIds(ids) {
            const nodes = await Promise.all(ids.map((id) => this.getNode(id)));

            // Return in the same order as input ids, throw if any not found
            return nodes.map((node, index) => {
                if (!node) {
                    throw new NotFoundError(
                        `Cannot find PageTreeNode with ID ${ids[index]} and visibility ${
                            Array.isArray(visibility) ? visibility.join(" or ") : visibility
                        }`,
                    );
                }
                return node;
            });
        },

        async getParentNode(node) {
            if (!node.parentId) {
                return null;
            }

            return this.getNodeOrFail(node.parentId);
        },

        async getNodes(options = {}): Promise<PageTreeNodeInterface[]> {
            return queryNodes(
                options.scope,
                {
                    category: options.category,
                    documentType: options.documentType,
                },
                options.sort,
                options.limit,
                options.offset,
            );
        },

        async getChildNodes(node) {
            return queryNodes(node.scope, {
                parentId: node.id,
            });
        },

        async getNodeByPath(path, options = {}) {
            if (path === "/home") {
                return null;
            }

            if (path === "/") {
                const nodes = await queryNodes(options.scope, {
                    slug: "home",
                });

                if (!nodes.length) {
                    return null;
                }

                return nodes[0];
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let node: any = null;
            let parentId = null;
            for (const slug of path.substr(1).split("/")) {
                const nodes = await queryNodes(options.scope, {
                    slug,
                    parentId: parentId ?? null,
                });
                node = nodes[0];

                if (!node) {
                    return null;
                }
                parentId = node.id;
            }
            return node;
        },
        async pageTreeRootNodeList(options = {}): Promise<PageTreeNodeInterface[]> {
            return queryNodes(options.scope, {
                category: options.category,
                excludeHiddenInMenu: options.excludeHiddenInMenu,
                parentId: null,
            });
        },

        async getDescendants(node: PageTreeNodeInterface): Promise<PageTreeNodeInterface[]> {
            const childNodes = await this.getChildNodes(node);

            // Descend into all children at once so each level of the tree is loaded in a single query
            const descendantsPerChildNode = await Promise.all(childNodes.map((childNode) => this.getDescendants(childNode)));

            return [...childNodes, ...descendantsPerChildNode.flat()];
        },

        async getFirstNodeByAttachedPageId(pageId: string): Promise<PageTreeNodeInterface | null> {
            const attachedDocument = await attachedDocumentsRepository.findOne({ documentId: pageId });
            if (!attachedDocument) {
                return null;
            }
            return this.getNode(attachedDocument.pageTreeNodeId);
        },

        async preloadNodes(scope?: ScopeInterface) {
            const hash = scopeHash(scope);
            if (preloadedNodes.has(hash)) {
                return;
            } //don't double-preload
            return tracer.startActiveSpan("preload PageTreeNode", async (span) => {
                span.setAttribute("scope", JSON.stringify(scope));
                preloadRunning = true;
                const qb = pageTreeNodeRepository
                    .createQueryBuilder()
                    .where({
                        visibility: visibilityFilter,
                    })
                    .orderBy({ pos: "ASC" });
                qb.andWhere({ scope });
                const allNodes = await qb.getResultList();
                const allNodesById = new Map<string, PageTreeNodeInterface>();
                for (const node of allNodes) {
                    allNodesById.set(node.id, node);
                }

                //filter nodes without parent (happens when parent is not visible)
                //TODO this is not done for live queries
                const nodes = allNodes.filter((node) => {
                    let n = node;
                    while (n.parentId) {
                        if (!allNodesById.has(n.parentId)) {
                            return false;
                        }
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        n = allNodesById.get(n.parentId)!;
                    }
                    return true;
                });

                preloadedNodes.set(hash, nodes);
                for (const node of nodes) {
                    nodesById.set(node.id, node);
                }
                preloadRunning = false;
                waitForPreloadingResolvers.forEach((resolve) => resolve());
                span.end();
            });
        },

        async getNodesCount(options = {}): Promise<number> {
            return countNodes(options.scope, {
                category: options.category,
                documentType: options.documentType,
            });
        },
    };
}

export function paginatePreloadedNodes(nodes: PageTreeNodeInterface[], { offset, limit }: { offset: number; limit: number }) {
    if (offset < 0) {
        throw new Error(`Invalid offset '${offset}'`);
    } else if (limit <= 0) {
        throw new Error(`Invalid limit '${limit}'`);
    }

    const start = offset;
    const end = offset + limit;

    return nodes.slice(start, end);
}

export function sortPreloadedNodes(nodes: PageTreeNodeInterface[], sort: PageTreeNodeSort[]): PageTreeNodeInterface[] {
    if (sort.length === 1 && sort[0].field === PageTreeNodeSortField.pos && sort[0].direction === SortDirection.ASC) {
        // Preloaded nodes are already sorted by position ascending, so we can skip sorting
        return nodes;
    }

    return nodes.sort((a, b) => {
        for (const { field, direction } of sort) {
            if (field === PageTreeNodeSortField.pos) {
                if (a.pos === b.pos) {
                    // Can't use position for sorting, continue with next sort field
                    continue;
                }

                if (direction === SortDirection.ASC) {
                    return a.pos - b.pos;
                } else {
                    return b.pos - a.pos;
                }
            }

            if (field === PageTreeNodeSortField.updatedAt) {
                if (isEqual(a.updatedAt, b.updatedAt)) {
                    // Can't use updatedAt for sorting, continue with next sort field
                    continue;
                }

                if (direction === SortDirection.ASC) {
                    return compareAsc(a.updatedAt, b.updatedAt);
                } else {
                    return compareDesc(a.updatedAt, b.updatedAt);
                }
            }
        }

        return 0;
    });
}
