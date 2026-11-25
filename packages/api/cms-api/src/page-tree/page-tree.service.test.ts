import { Entity, PrimaryKey } from "@mikro-orm/decorators/legacy";
import { describe, expect, it } from "vitest";

import { PageTreeService } from "./page-tree.service.js";
import { type PageTreeNodeInterface, PageTreeNodeVisibility } from "./types.js";

// Decorating a stand-in entity registers "PageTreeNode" in MikroORM's metadata, which is all `resolvePageTreeNodeEntity()` needs.
@Entity({ tableName: "PageTreeNode" })
class PageTreeNode {
    @PrimaryKey({ columnType: "uuid" })
    id!: string;
}

function createServiceWithNodes(nodes: PageTreeNodeInterface[]): { service: PageTreeService; queriedFilters: Array<Record<string, unknown>> } {
    const queriedFilters: Array<Record<string, unknown>> = [];

    const entityManager = {
        createQueryBuilder: (entity: unknown) => {
            if (entity !== PageTreeNode) {
                throw new Error("Unexpected entity passed to createQueryBuilder");
            }
            const filters: Record<string, unknown> = {};
            const queryBuilder = {
                where: () => queryBuilder,
                andWhere: (arg: Record<string, unknown>) => {
                    Object.assign(filters, arg);
                    return queryBuilder;
                },
                orderBy: () => queryBuilder,
                limit: () => queryBuilder,
                getResultList: async () => {
                    queriedFilters.push({ ...filters });
                    return nodes.filter((node) => {
                        if ("slug" in filters && node.slug !== filters.slug) {
                            return false;
                        }
                        if ("parentId" in filters && node.parentId !== filters.parentId) {
                            return false;
                        }
                        return true;
                    });
                },
            };
            return queryBuilder;
        },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const service = new PageTreeService(entityManager as any, {} as any, {} as any);

    return { service, queriedFilters };
}

type AttachmentRecord = { pageTreeNodeId: string; documentId: string; type: string };

// Models a page a savePage resolver already mutated but not yet flushed. Any read on the request EntityManager
// commits the pending change (the default AUTO flush mode), while reads on the forked EntityManager do not.
type PendingPage = { committed: string; pending: string };

function createServiceForScopeChecks({
    nodes,
    attachments,
    pendingPage,
}: {
    nodes: PageTreeNodeInterface[];
    attachments: AttachmentRecord[];
    pendingPage?: PendingPage;
}): {
    service: PageTreeService;
    persisted: AttachmentRecord[];
} {
    const persisted: AttachmentRecord[] = [];
    const findNode = (id: unknown) => nodes.find((node) => node.id === id) ?? null;
    const autoFlush = () => {
        if (pendingPage) {
            pendingPage.committed = pendingPage.pending;
        }
    };

    const forkedEm = {
        find: async (_entity: unknown, where: { documentId: string }) =>
            attachments.filter((attachment) => attachment.documentId === where.documentId),
        findOne: async (_entity: unknown, id: unknown) => findNode(id),
    };

    const entityManager = {
        fork: () => forkedEm,
        find: async (_entity: unknown, where: { documentId: string }) => {
            autoFlush();
            return attachments.filter((attachment) => attachment.documentId === where.documentId);
        },
        findOne: async (entity: unknown, where: unknown) => {
            autoFlush();
            if (entity === PageTreeNode) {
                return findNode(where);
            }
            if (typeof where === "object" && where !== null) {
                const { pageTreeNodeId, documentId } = where as { pageTreeNodeId: string; documentId: string };
                return attachments.find((attachment) => attachment.pageTreeNodeId === pageTreeNodeId && attachment.documentId === documentId) ?? null;
            }
            return {};
        },
        getMetadata: () => ({ getByClassName: () => ({ class: "Document" }) }),
        create: (_entity: unknown, data: AttachmentRecord) => data,
        persist: (data: AttachmentRecord) => {
            persisted.push(data);
        },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const service = new PageTreeService(entityManager as any, {} as any, {} as any);

    return { service, persisted };
}

function createPageTreeNode(node: Partial<PageTreeNodeInterface>): PageTreeNodeInterface {
    return {
        parentId: null,
        visibility: PageTreeNodeVisibility.Published,
        ...node,
    } as PageTreeNodeInterface;
}

const homeNode = createPageTreeNode({ id: "home-id", slug: "home" });

describe("PageTreeService", () => {
    describe("nodeWithSamePath", () => {
        it("detects an existing home page when checking the path '/home'", async () => {
            // The home page has the slug "home" but lives at the canonical path "/", so a duplicate
            // check for the path "/home" must still find it (e.g. when copying the home page).
            const { service, queriedFilters } = createServiceWithNodes([homeNode]);

            await expect(service.nodeWithSamePath("/home")).resolves.toBe(homeNode);
            expect(queriedFilters).toContainEqual({ slug: "home" });
        });

        it("returns null when no home page exists yet", async () => {
            const { service } = createServiceWithNodes([]);

            await expect(service.nodeWithSamePath("/home")).resolves.toBeNull();
        });

        it("finds the home page via its canonical path '/'", async () => {
            const { service } = createServiceWithNodes([homeNode]);

            await expect(service.nodeWithSamePath("/")).resolves.toBe(homeNode);
        });

        it("resolves a non-home path normally", async () => {
            const aboutNode = createPageTreeNode({ id: "about-id", slug: "about" });
            const { service } = createServiceWithNodes([homeNode, aboutNode]);

            await expect(service.nodeWithSamePath("/about")).resolves.toBe(aboutNode);
        });

        it("resolves a nested non-home path normally", async () => {
            const parentNode = createPageTreeNode({ id: "parent-id", slug: "products" });
            const childNode = createPageTreeNode({ id: "child-id", slug: "shoes", parentId: "parent-id" });
            const { service } = createServiceWithNodes([parentNode, childNode]);

            await expect(service.nodeWithSamePath("/products/shoes")).resolves.toBe(childNode);
        });

        it("returns null for a non-home path without a matching node", async () => {
            const { service } = createServiceWithNodes([homeNode]);

            await expect(service.nodeWithSamePath("/about")).resolves.toBeNull();
        });
    });

    describe("delete", () => {
        it("refuses to delete the home page", async () => {
            const { service } = createServiceWithNodes([homeNode]);

            await expect(service.delete(homeNode)).rejects.toThrow(`Page "home" cannot be deleted`);
        });
    });

    describe("attachDocument single attachment", () => {
        it("rejects attaching a document that is already attached to a node in a different scope", async () => {
            const { service } = createServiceForScopeChecks({
                nodes: [
                    createPageTreeNode({ id: "target-node", slug: "target", scope: { domain: "main" } }),
                    createPageTreeNode({ id: "foreign-node", slug: "foreign", scope: { domain: "secondary" } }),
                ],
                attachments: [{ pageTreeNodeId: "foreign-node", documentId: "doc-1", type: "Page" }],
            });

            await expect(service.attachDocument({ id: "doc-1", type: "Page" }, "target-node")).rejects.toThrow(
                "The document is already attached to another page tree node",
            );
        });

        it("rejects attaching a document that is already attached to a different node in the same scope", async () => {
            const { service, persisted } = createServiceForScopeChecks({
                nodes: [
                    createPageTreeNode({ id: "target-node", slug: "target", scope: { domain: "main" } }),
                    createPageTreeNode({ id: "sibling-node", slug: "sibling", scope: { domain: "main" } }),
                ],
                attachments: [{ pageTreeNodeId: "sibling-node", documentId: "doc-1", type: "Page" }],
            });

            await expect(service.attachDocument({ id: "doc-1", type: "Page" }, "target-node")).rejects.toThrow(
                "The document is already attached to another page tree node",
            );
            expect(persisted).toHaveLength(0);
        });

        it("allows attaching a document again to the node it is already attached to", async () => {
            const { service, persisted } = createServiceForScopeChecks({
                nodes: [createPageTreeNode({ id: "target-node", slug: "target", scope: { domain: "main" } })],
                attachments: [{ pageTreeNodeId: "target-node", documentId: "doc-1", type: "Page" }],
            });

            await expect(service.attachDocument({ id: "doc-1", type: "Page" }, "target-node")).resolves.toBeUndefined();
            expect(persisted).toHaveLength(0);
        });

        it("allows attaching a document that is not attached anywhere yet", async () => {
            const { service, persisted } = createServiceForScopeChecks({
                nodes: [createPageTreeNode({ id: "target-node", slug: "target", scope: { domain: "main" } })],
                attachments: [],
            });

            await expect(service.attachDocument({ id: "new-doc", type: "Page" }, "target-node")).resolves.toBeUndefined();
            expect(persisted).toContainEqual({ pageTreeNodeId: "target-node", documentId: "new-doc", type: "Page" });
        });

        it("does not flush a pending document change when rejecting an attach", async () => {
            // A savePage resolver mutates the page before calling attachDocument. The check must reject before a
            // read on the request EntityManager auto-flushes that change, so the forked read matters here.
            const pendingPage: PendingPage = { committed: "original", pending: "overwritten" };
            const { service } = createServiceForScopeChecks({
                nodes: [
                    createPageTreeNode({ id: "target-node", slug: "target", scope: { domain: "main" } }),
                    createPageTreeNode({ id: "foreign-node", slug: "foreign", scope: { domain: "secondary" } }),
                ],
                attachments: [{ pageTreeNodeId: "foreign-node", documentId: "doc-1", type: "Page" }],
                pendingPage,
            });

            await expect(service.attachDocument({ id: "doc-1", type: "Page" }, "target-node")).rejects.toThrow(
                "The document is already attached to another page tree node",
            );
            expect(pendingPage.committed).toBe("original");
        });
    });
});
