import { describe, expect, it } from "vitest";

import { PageTreeService } from "./page-tree.service";
import { type PageTreeNodeInterface, PageTreeNodeVisibility } from "./types";

function createServiceWithNodes(nodes: PageTreeNodeInterface[]): { service: PageTreeService; queriedFilters: Array<Record<string, unknown>> } {
    const queriedFilters: Array<Record<string, unknown>> = [];

    const pageTreeRepository = {
        createQueryBuilder: () => {
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
    const service = new PageTreeService(pageTreeRepository as any, {} as any, {} as any, {} as any, {} as any);

    return { service, queriedFilters };
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
});
