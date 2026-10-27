import { and, eq, inArray, type SQL } from "drizzle-orm";
import type { SQLiteColumn } from "drizzle-orm/sqlite-core";

import {
    badRequest,
    type BatchQuery,
    conflict,
    type ContentScope,
    type Database,
    notFound,
    type PortableDrizzle,
    type ScopeColumns,
} from "../../core/server/index.js";
import { defaultReservedPaths, homeSlug, type PageTreeConfig } from "./page-tree.config.js";
import type { PageTreeNodeVisibility, PageTreeSchema } from "./page-tree.schema.js";
import { PageTreeSnapshot } from "./page-tree.snapshot.js";
import type { PageTreeDocument, PageTreeNode, SlugAvailability } from "./page-tree.types.js";

export interface PageTreeServiceDependencies {
    database: Database;
    schema: PageTreeSchema;
    scopeColumns: ScopeColumns;
    config: PageTreeConfig;
}

export interface CreatePageTreeNodeInput {
    name: string;
    slug: string;
    parentId?: string | null;
    /** 1-based position among the siblings. Without it, the node is added as the last one. */
    pos?: number;
    hideInMenu?: boolean;
    documentType: string;
    /** Only used for root nodes, subpages get the category of their parent */
    category: string;
}

export interface SavePageTreeDocumentInput {
    /** Validated against the root blocks of the node's document type by the caller */
    data: Record<string, unknown>;
    /**
     * The `updatedAt` of the document the editor loaded, `null` for a node without a document. Saving fails if the document changed
     * since, so concurrent editors don't overwrite each other. Without it, the document is saved anyway.
     */
    lastUpdatedAt?: Date | null;
}

export interface UpdatePageTreeNodeInput {
    name?: string;
    slug?: string;
    hideInMenu?: boolean;
    documentType?: string;
}

/** Builds a condition from the column of each scope dimension, e.g. `{ domain: table.scope_domain }` */
export type PageTreeScopeFilter = (columns: Record<string, SQLiteColumn>) => SQL;

export class PageTreeService {
    constructor(private readonly deps: PageTreeServiceDependencies) {}

    private get db(): PortableDrizzle {
        return this.deps.database.drizzle;
    }

    private get reservedPaths(): string[] {
        return this.deps.config.reservedPaths ?? defaultReservedPaths;
    }

    async loadTree(scope: ContentScope | undefined, { scopeFilter }: { scopeFilter?: PageTreeScopeFilter } = {}): Promise<PageTreeSnapshot> {
        const { pageTreeNodes } = this.deps.schema;
        const { scopeColumns } = this.deps;
        const rows = await this.db
            .select({ node: pageTreeNodes, scope: scopeColumns.select(pageTreeNodes) })
            .from(pageTreeNodes)
            .where(and(scopeColumns.equals(pageTreeNodes, scope), scopeFilter?.(scopeColumns.byDimension(pageTreeNodes))));
        return new PageTreeSnapshot(rows.map(({ node, scope }) => ({ ...node, scope: scopeColumns.fromRow(scope) })));
    }

    async findOneById(id: string): Promise<PageTreeNode | null> {
        const { pageTreeNodes } = this.deps.schema;
        const [row] = await this.db
            .select({ scope: this.deps.scopeColumns.select(pageTreeNodes) })
            .from(pageTreeNodes)
            .where(eq(pageTreeNodes.id, id));
        if (!row) {
            return null;
        }
        return (await this.loadTree(this.scopeOrNothing(this.deps.scopeColumns.fromRow(row.scope)))).node(id) ?? null;
    }

    /** The document of the node's current document type */
    async findDocument(node: PageTreeNode): Promise<PageTreeDocument | null> {
        const { pageTreeDocuments } = this.deps.schema;
        const [document] = await this.db
            .select({ type: pageTreeDocuments.type, data: pageTreeDocuments.data, updatedAt: pageTreeDocuments.updatedAt })
            .from(pageTreeDocuments)
            .where(and(eq(pageTreeDocuments.pageTreeNodeId, node.id), eq(pageTreeDocuments.type, node.documentType)));
        return document ?? null;
    }

    async saveDocument(node: PageTreeNode, { data, lastUpdatedAt }: SavePageTreeDocumentInput): Promise<PageTreeDocument> {
        const { pageTreeDocuments } = this.deps.schema;
        const existingDocument = await this.findDocument(node);
        const changedConcurrently = () => conflict("The document was changed in the meantime, reload it to see the changes");
        const returnedColumns = { type: pageTreeDocuments.type, data: pageTreeDocuments.data, updatedAt: pageTreeDocuments.updatedAt };

        if (!existingDocument) {
            if (lastUpdatedAt) {
                throw changedConcurrently();
            }
            const [document] = await this.db
                .insert(pageTreeDocuments)
                .values({ pageTreeNodeId: node.id, type: node.documentType, data })
                .onConflictDoNothing()
                .returning(returnedColumns);
            if (!document) {
                throw changedConcurrently();
            }
            return document;
        }

        if (lastUpdatedAt === null || (lastUpdatedAt && lastUpdatedAt.getTime() !== existingDocument.updatedAt.getTime())) {
            throw changedConcurrently();
        }
        // The condition on updatedAt makes the check and the update atomic, D1 has no transactions to lock the row with
        const [document] = await this.db
            .update(pageTreeDocuments)
            .set({ data, updatedAt: new Date() })
            .where(
                and(
                    eq(pageTreeDocuments.pageTreeNodeId, node.id),
                    eq(pageTreeDocuments.type, node.documentType),
                    eq(pageTreeDocuments.updatedAt, existingDocument.updatedAt),
                ),
            )
            .returning(returnedColumns);
        if (!document) {
            throw changedConcurrently();
        }
        return document;
    }

    async slugAvailability(
        { parentId, slug }: { parentId: string | null; slug: string },
        scope: ContentScope | undefined,
    ): Promise<SlugAvailability> {
        const tree = await this.loadTree(scope);
        const path = tree.pathFor(parentId, slug);
        if (this.isReserved(path, slug)) {
            return "Reserved";
        }
        return tree.nodeByPath(path) ? "Taken" : "Available";
    }

    async create(input: CreatePageTreeNodeInput, scope: ContentScope | undefined): Promise<PageTreeNode> {
        const tree = await this.loadTree(scope);
        const parentId = input.parentId ?? null;
        const parent = parentId ? this.nodeOrFail(tree, parentId) : null;
        if (parent?.visibility === "Archived") {
            throw badRequest("Can't add a subpage to an archived page");
        }
        this.assertPathAvailable(tree, { parentId, slug: input.slug });

        const id = crypto.randomUUID();
        const category = parent?.category ?? input.category;
        const siblings = tree.children(parentId, category);
        const index = input.pos === undefined ? siblings.length : clamp(input.pos - 1, 0, siblings.length);

        await this.deps.database.batch((db) => [
            db.insert(this.deps.schema.pageTreeNodes).values({
                id,
                parentId,
                pos: index + 1,
                name: input.name,
                slug: input.slug,
                visibility: input.slug === homeSlug ? "Published" : "Unpublished",
                documentType: input.documentType,
                category,
                hideInMenu: input.hideInMenu ?? false,
                ...this.deps.scopeColumns.toValues(scope),
            }),
            ...this.reorder(db, siblings.slice(index), { startPos: index + 2 }),
        ]);

        return this.nodeOrFail(await this.loadTree(scope), id);
    }

    async update(node: PageTreeNode, input: UpdatePageTreeNodeInput): Promise<PageTreeNode> {
        if (node.visibility === "Archived") {
            throw badRequest("Can't update an archived page");
        }
        if (input.slug !== undefined && input.slug !== node.slug) {
            if (node.slug === homeSlug) {
                throw badRequest(`The slug of the page "${homeSlug}" can't be changed`);
            }
            this.assertPathAvailable(await this.loadTree(this.scopeOrNothing(node.scope)), {
                parentId: node.parentId,
                slug: input.slug,
                except: node.id,
            });
        }

        const values = Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined));
        if (Object.keys(values).length > 0) {
            const { pageTreeNodes } = this.deps.schema;
            await this.db.update(pageTreeNodes).set(values).where(eq(pageTreeNodes.id, node.id));
        }
        return (await this.findOneById(node.id)) as PageTreeNode;
    }

    /** Archiving archives the subpages too. Restoring a page whose path is taken in the meantime appends a number to its slug. */
    async updateVisibility(node: PageTreeNode, visibility: PageTreeNodeVisibility): Promise<PageTreeNode> {
        if (node.slug === homeSlug && visibility !== "Published") {
            throw badRequest(`The page "${homeSlug}" must stay published`);
        }
        const { pageTreeNodes } = this.deps.schema;
        const tree = await this.loadTree(this.scopeOrNothing(node.scope));

        if (visibility === "Archived") {
            const ids = [node.id, ...tree.descendants(node.id).map((descendant) => descendant.id)];
            await this.db.update(pageTreeNodes).set({ visibility }).where(inArray(pageTreeNodes.id, ids));
        } else {
            let slug = node.slug;
            if (node.visibility === "Archived") {
                if (tree.ancestors(node.id).some((ancestor) => ancestor.visibility === "Archived")) {
                    throw badRequest("Restore the parent page first");
                }
                slug = this.nextAvailableSlug(tree, { parentId: node.parentId, slug: node.slug, except: [node.id] });
            }
            await this.db.update(pageTreeNodes).set({ visibility, slug }).where(eq(pageTreeNodes.id, node.id));
        }

        return (await this.findOneById(node.id)) as PageTreeNode;
    }

    /**
     * Moves the nodes, in their order, to the 1-based position among the parent's children. A node whose path is taken at the target
     * gets a number appended to its slug.
     */
    async move(
        { ids, parentId, pos, category }: { ids: string[]; parentId: string | null; pos: number; category?: string },
        scope: ContentScope | undefined,
    ): Promise<PageTreeNode[]> {
        const tree = await this.loadTree(scope);
        const nodes = ids.map((id) => this.nodeOrFail(tree, id));
        const parent = parentId ? this.nodeOrFail(tree, parentId) : null;
        const targetCategory = parent?.category ?? category ?? nodes[0].category;

        if (parent?.visibility === "Archived") {
            throw badRequest("Can't move pages into an archived page");
        }
        for (const node of nodes) {
            if (node.visibility === "Archived") {
                throw badRequest("Can't move an archived page");
            }
            if (node.slug === homeSlug && parentId !== null) {
                throw badRequest(`The page "${homeSlug}" can't be moved into another page`);
            }
            if (parentId && tree.isAncestorOrSelf(node.id, parentId)) {
                throw badRequest("A page can't be moved into itself or one of its subpages");
            }
        }

        const siblings = tree.children(parentId, targetCategory).filter((sibling) => !ids.includes(sibling.id));
        const index = clamp(pos - 1, 0, siblings.length);
        const assignedPaths: string[] = [];
        const movedNodes = nodes.map((node) => {
            const slug =
                node.parentId === parentId
                    ? node.slug
                    : this.nextAvailableSlug(tree, { parentId, slug: node.slug, except: ids, taken: assignedPaths });
            assignedPaths.push(tree.pathFor(parentId, slug));
            return { ...node, slug };
        });
        const descendantIds = nodes.flatMap((node) => tree.descendants(node.id).map((descendant) => descendant.id));

        const { pageTreeNodes } = this.deps.schema;
        await this.deps.database.batch((db) => [
            ...movedNodes.map((node, movedIndex) =>
                db
                    .update(pageTreeNodes)
                    .set({ parentId, pos: index + movedIndex + 1, slug: node.slug, category: targetCategory })
                    .where(eq(pageTreeNodes.id, node.id)),
            ),
            ...(descendantIds.length > 0
                ? [db.update(pageTreeNodes).set({ category: targetCategory }).where(inArray(pageTreeNodes.id, descendantIds))]
                : []),
            ...this.reorder(db, siblings.slice(0, index), { startPos: 1 }),
            ...this.reorder(db, siblings.slice(index), { startPos: index + movedNodes.length + 1 }),
        ]);

        const updatedTree = await this.loadTree(scope);
        return ids.map((id) => this.nodeOrFail(updatedTree, id));
    }

    /** Moves the node with its subpages to the end of another category's root nodes */
    async updateCategory(node: PageTreeNode, category: string): Promise<PageTreeNode> {
        if (node.visibility === "Archived") {
            throw badRequest("Can't move an archived page");
        }
        const tree = await this.loadTree(this.scopeOrNothing(node.scope));
        const rootNodes = tree.children(null, category).filter((rootNode) => rootNode.id !== node.id);
        await this.move({ ids: [node.id], parentId: null, pos: rootNodes.length + 1, category }, this.scopeOrNothing(node.scope));
        return (await this.findOneById(node.id)) as PageTreeNode;
    }

    async delete(node: PageTreeNode): Promise<void> {
        if (node.slug === homeSlug) {
            throw badRequest(`The page "${homeSlug}" can't be deleted`);
        }
        const tree = await this.loadTree(this.scopeOrNothing(node.scope));
        const { pageTreeNodes } = this.deps.schema;
        const ids = [node.id, ...tree.descendants(node.id).map((descendant) => descendant.id)];
        await this.db.delete(pageTreeNodes).where(inArray(pageTreeNodes.id, ids));
    }

    private reorder(db: PortableDrizzle, nodes: PageTreeNode[], { startPos }: { startPos: number }): BatchQuery[] {
        const { pageTreeNodes } = this.deps.schema;
        return nodes
            .map((node, index) => ({ node, pos: startPos + index }))
            .filter(({ node, pos }) => node.pos !== pos)
            .map(({ node, pos }) => db.update(pageTreeNodes).set({ pos }).where(eq(pageTreeNodes.id, node.id)));
    }

    private assertPathAvailable(
        tree: PageTreeSnapshot,
        { parentId, slug, except }: { parentId: string | null; slug: string; except?: string },
    ): void {
        const path = tree.pathFor(parentId, slug);
        if (this.isReserved(path, slug)) {
            throw badRequest("Reserved path");
        }
        if (tree.nodeByPath(path, { except: except ? [except] : [] })) {
            throw badRequest("Slug leads to duplicate path");
        }
    }

    /** The slug "home" is reserved for the home page, a root node */
    private isReserved(path: string, slug: string): boolean {
        return this.reservedPaths.includes(path) || (slug === homeSlug && path !== "/");
    }

    private nextAvailableSlug(
        tree: PageTreeSnapshot,
        { parentId, slug, except, taken = [] }: { parentId: string | null; slug: string; except: string[]; taken?: string[] },
    ): string {
        const isAvailable = (candidate: string) => {
            const path = tree.pathFor(parentId, candidate);
            return !this.isReserved(path, candidate) && !taken.includes(path) && !tree.nodeByPath(path, { except });
        };
        let candidate = slug;
        for (let counter = 1; !isAvailable(candidate); counter++) {
            candidate = `${slug}-${counter}`;
        }
        return candidate;
    }

    private nodeOrFail(tree: PageTreeSnapshot, id: string): PageTreeNode {
        const node = tree.node(id);
        if (!node) {
            throw notFound(`Page tree node ${id} not found`);
        }
        return node;
    }

    private scopeOrNothing(scope: ContentScope): ContentScope | undefined {
        return this.deps.scopeColumns.hasScope ? scope : undefined;
    }
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
