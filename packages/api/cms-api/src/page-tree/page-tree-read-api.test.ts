import { parseISO } from "date-fns";
import { describe, expect, it, vi } from "vitest";

import { SortDirection } from "../common/sorting/sort-direction.enum";
import { getError, NoErrorThrownError } from "../common/test/get-error";
import { PageTreeNodeSortField } from "./dto/page-tree-node.sort";
import { createReadApi, paginatePreloadedNodes, sortPreloadedNodes } from "./page-tree-read-api";
import type { PageTreeNodeInterface } from "./types";

describe("PageTreeReadApi", () => {
    describe("getNodeByPath", () => {
        it("should return null for path /home", async () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const api = createReadApi({ pageTreeNodeRepository: {} as any, attachedDocumentsRepository: {} as any });
            await expect(api.getNodeByPath("/home")).resolves.toBeNull();
        });
    });

    describe("getNode", () => {
        function createReadApiWithNodes(nodes: PageTreeNodeInterface[]) {
            const find = vi.fn(async ({ id }: { id: { $in: string[] } }) => nodes.filter((node) => id.$in.includes(node.id)));

            return {
                find,
                api: createReadApi({
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    pageTreeNodeRepository: { find } as any,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    attachedDocumentsRepository: {} as any,
                }),
            };
        }

        const nodes = [
            { id: "root", slug: "root", parentId: null },
            { id: "child", slug: "child", parentId: "root" },
        ] as PageTreeNodeInterface[];

        it("should load concurrently requested nodes with a single query", async () => {
            const { api, find } = createReadApiWithNodes(nodes);

            const [root, child] = await Promise.all([api.getNode("root"), api.getNode("child")]);

            expect(find).toHaveBeenCalledTimes(1);
            expect(find).toHaveBeenCalledWith(expect.objectContaining({ id: { $in: ["root", "child"] } }));
            expect(root).toBe(nodes[0]);
            expect(child).toBe(nodes[1]);
        });

        it("should query a node requested multiple times concurrently only once", async () => {
            const { api, find } = createReadApiWithNodes(nodes);

            const loadedNodes = await Promise.all([api.getNode("root"), api.getNode("root"), api.getNode("root")]);

            expect(find).toHaveBeenCalledTimes(1);
            expect(loadedNodes).toEqual([nodes[0], nodes[0], nodes[0]]);
        });

        it("should not query an already loaded node again", async () => {
            const { api, find } = createReadApiWithNodes(nodes);

            await api.getNode("root");
            await api.getNode("root");

            expect(find).toHaveBeenCalledTimes(1);
        });

        it("should not query a node again that doesn't exist", async () => {
            const { api, find } = createReadApiWithNodes(nodes);

            await expect(api.getNode("unknown")).resolves.toBeNull();
            await expect(api.getNode("unknown")).resolves.toBeNull();

            expect(find).toHaveBeenCalledTimes(1);
        });

        it("should load the path of multiple nodes with one query per level", async () => {
            const { api, find } = createReadApiWithNodes(nodes);

            const paths = await Promise.all([api.nodePathById("child"), api.nodePathById("child"), api.nodePathById("root")]);

            expect(paths).toEqual(["/root/child", "/root/child", "/root"]);
            expect(find).toHaveBeenCalledTimes(1);
        });
    });

    describe("getChildNodes", () => {
        const scope = { domain: "main", language: "en" };

        // A tree with three levels below the root: root > a > a1 > a1x, root > b > b1
        const tree = [
            { id: "root", slug: "root", parentId: null, scope, visibility: "Published", category: "main", hideInMenu: false },
            { id: "a", slug: "a", parentId: "root", scope, visibility: "Published", category: "main", hideInMenu: false },
            { id: "b", slug: "b", parentId: "root", scope, visibility: "Published", category: "main", hideInMenu: true },
            { id: "a1", slug: "a1", parentId: "a", scope, visibility: "Published", category: "main", hideInMenu: false },
            { id: "b1", slug: "b1", parentId: "b", scope, visibility: "Published", category: "main", hideInMenu: false },
            { id: "a1x", slug: "a1x", parentId: "a1", scope, visibility: "Published", category: "main", hideInMenu: false },
        ] as unknown as PageTreeNodeInterface[];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function matchesCondition(node: PageTreeNodeInterface, condition: Record<string, any>): boolean {
            return Object.entries(condition).every(([field, value]) => {
                if (field === "$or") {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    return (value as Array<Record<string, any>>).some((subCondition) => matchesCondition(node, subCondition));
                }
                if (field === "scope") {
                    return JSON.stringify(node.scope) === JSON.stringify(value);
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const nodeValue = (node as any)[field];
                if (Array.isArray(value)) {
                    return value.includes(nodeValue);
                }
                if (value !== null && typeof value === "object" && "$in" in value) {
                    return (value.$in as unknown[]).includes(nodeValue);
                }
                return nodeValue === value;
            });
        }

        function createReadApiWithTree(nodes: PageTreeNodeInterface[] = tree) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const queries: Array<Record<string, any>> = [];

            const createQueryBuilder = () => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const conditions: Array<Record<string, any>> = [];
                const queryBuilder = {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    where(condition: Record<string, any>) {
                        conditions.push(condition);
                        return queryBuilder;
                    },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    andWhere(condition: Record<string, any>) {
                        conditions.push(condition);
                        return queryBuilder;
                    },
                    orderBy() {
                        return queryBuilder;
                    },
                    async getResultList() {
                        queries.push(Object.assign({}, ...conditions));
                        return nodes.filter((node) => conditions.every((condition) => matchesCondition(node, condition)));
                    },
                };
                return queryBuilder;
            };

            return {
                queries,
                api: createReadApi({
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    pageTreeNodeRepository: { createQueryBuilder } as any,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    attachedDocumentsRepository: {} as any,
                }),
            };
        }

        function nodeWithId(id: string) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return tree.find((node) => node.id === id)!;
        }

        it("should load the children of multiple nodes with a single query", async () => {
            const { api, queries } = createReadApiWithTree();

            const [childNodesOfA, childNodesOfB] = await Promise.all([api.getChildNodes(nodeWithId("a")), api.getChildNodes(nodeWithId("b"))]);

            expect(queries).toHaveLength(1);
            expect(childNodesOfA.map((node) => node.id)).toEqual(["a1"]);
            expect(childNodesOfB.map((node) => node.id)).toEqual(["b1"]);
        });

        it("should not load the children of the same node twice", async () => {
            const { api, queries } = createReadApiWithTree();

            await api.getChildNodes(nodeWithId("a"));
            await api.getChildNodes(nodeWithId("a"));

            expect(queries).toHaveLength(1);
        });

        it("should return an empty array for a node without children", async () => {
            const { api, queries } = createReadApiWithTree();

            await expect(api.getChildNodes(nodeWithId("a1x"))).resolves.toEqual([]);
            expect(queries).toHaveLength(1);
        });

        it("should load root nodes together with child nodes", async () => {
            const { api, queries } = createReadApiWithTree();

            const [rootNodes, childNodesOfA] = await Promise.all([api.pageTreeRootNodeList({ scope }), api.getChildNodes(nodeWithId("a"))]);

            expect(queries).toHaveLength(1);
            expect(rootNodes.map((node) => node.id)).toEqual(["root"]);
            expect(childNodesOfA.map((node) => node.id)).toEqual(["a1"]);
        });

        it("should still apply filters that are not part of the batch key", async () => {
            const { api } = createReadApiWithTree();

            const visibleChildNodes = await api.pageTreeRootNodeList({ scope, excludeHiddenInMenu: true, category: "main" });
            const childNodesInMenu = await api.getChildNodes(nodeWithId("root"));

            expect(visibleChildNodes.map((node) => node.id)).toEqual(["root"]);
            // `b` is hidden in menu, so it is only returned when the filter is not applied
            expect(childNodesInMenu.map((node) => node.id)).toEqual(["a", "b"]);
        });

        it("should load one query per tree level in getDescendants", async () => {
            const { api, queries } = createReadApiWithTree();

            const descendants = await api.getDescendants(nodeWithId("root"));

            // one query per level: children of root, of a+b, of a1+b1, and of the deepest node a1x
            expect(queries).toHaveLength(4);
            expect(descendants.map((node) => node.id)).toEqual(["a", "b", "a1", "a1x", "b1"]);
        });

        it("should load one query per path segment when resolving multiple paths", async () => {
            const { api, queries } = createReadApiWithTree();

            const [first, second] = await Promise.all([api.getNodeByPath("/root/a/a1", { scope }), api.getNodeByPath("/root/b/b1", { scope })]);

            expect(queries).toHaveLength(3);
            expect(first?.id).toBe("a1");
            expect(second?.id).toBe("b1");
        });
    });

    describe("sortPreloadedNodes", () => {
        it("should skip sorting if only sort criteria is by pos ascending", () => {
            const alreadySorted = [{ pos: 1 }, { pos: 2 }] as PageTreeNodeInterface[];

            // Use toBe() to check if the array is the same instance
            expect(sortPreloadedNodes(alreadySorted, [{ field: PageTreeNodeSortField.pos, direction: SortDirection.ASC }])).toBe(alreadySorted);
        });

        it("should sort by pos descending", () => {
            const unsorted = [{ pos: 1 }, { pos: 2 }] as PageTreeNodeInterface[];

            const sorted = [{ pos: 2 }, { pos: 1 }] as PageTreeNodeInterface[];

            expect(sortPreloadedNodes(unsorted, [{ field: PageTreeNodeSortField.pos, direction: SortDirection.DESC }])).toEqual(sorted);
        });

        it("should sort by updatedAt ascending", () => {
            const unsorted = [
                { updatedAt: parseISO("2023-07-31T00:00:00") },
                { updatedAt: parseISO("2023-07-28T00:00:00") },
                { updatedAt: parseISO("2023-07-28T02:00:00") },
            ] as PageTreeNodeInterface[];

            const sorted = [
                { updatedAt: parseISO("2023-07-28T00:00:00") },
                { updatedAt: parseISO("2023-07-28T02:00:00") },
                { updatedAt: parseISO("2023-07-31T00:00:00") },
            ] as PageTreeNodeInterface[];

            expect(sortPreloadedNodes(unsorted, [{ field: PageTreeNodeSortField.updatedAt, direction: SortDirection.ASC }])).toEqual(sorted);
        });

        it("should sort by updatedAt descending", () => {
            const unsorted = [
                { updatedAt: parseISO("2023-07-28T00:00:00") },
                { updatedAt: parseISO("2023-07-31T00:00:00") },
                { updatedAt: parseISO("2023-07-28T02:00:00") },
            ] as PageTreeNodeInterface[];

            const sorted = [
                { updatedAt: parseISO("2023-07-31T00:00:00") },
                { updatedAt: parseISO("2023-07-28T02:00:00") },
                { updatedAt: parseISO("2023-07-28T00:00:00") },
            ] as PageTreeNodeInterface[];

            expect(sortPreloadedNodes(unsorted, [{ field: PageTreeNodeSortField.updatedAt, direction: SortDirection.DESC }])).toEqual(sorted);
        });

        it("should sort first by position, then by updatedAt", () => {
            const unsorted = [
                { pos: 2, updatedAt: parseISO("2023-07-28T00:00:00") },
                { pos: 1, updatedAt: parseISO("2023-07-28T02:00:00") },
                { pos: 2, updatedAt: parseISO("2023-07-31T00:00:00") },
                { pos: 1, updatedAt: parseISO("2023-07-31T02:00:00") },
            ] as PageTreeNodeInterface[];

            const sorted = [
                { pos: 1, updatedAt: parseISO("2023-07-31T02:00:00") },
                { pos: 1, updatedAt: parseISO("2023-07-28T02:00:00") },
                { pos: 2, updatedAt: parseISO("2023-07-31T00:00:00") },
                { pos: 2, updatedAt: parseISO("2023-07-28T00:00:00") },
            ] as PageTreeNodeInterface[];

            expect(
                sortPreloadedNodes(unsorted, [
                    { field: PageTreeNodeSortField.pos, direction: SortDirection.ASC },
                    { field: PageTreeNodeSortField.updatedAt, direction: SortDirection.DESC },
                ]),
            ).toEqual(sorted);
        });

        it("should sort first by updatedAt, then by position", () => {
            const unsorted = [
                { updatedAt: parseISO("2023-07-31T00:00:00"), pos: 2 },
                { updatedAt: parseISO("2023-07-28T00:00:00"), pos: 2 },
                { updatedAt: parseISO("2023-07-31T00:00:00"), pos: 1 },
                { updatedAt: parseISO("2023-07-28T00:00:00"), pos: 1 },
            ] as PageTreeNodeInterface[];

            const sorted = [
                { updatedAt: parseISO("2023-07-28T00:00:00"), pos: 1 },
                { updatedAt: parseISO("2023-07-28T00:00:00"), pos: 2 },
                { updatedAt: parseISO("2023-07-31T00:00:00"), pos: 1 },
                { updatedAt: parseISO("2023-07-31T00:00:00"), pos: 2 },
            ] as PageTreeNodeInterface[];

            expect(
                sortPreloadedNodes(unsorted, [
                    { field: PageTreeNodeSortField.updatedAt, direction: SortDirection.ASC },
                    { field: PageTreeNodeSortField.pos, direction: SortDirection.ASC },
                ]),
            ).toEqual(sorted);
        });
    });

    describe("paginatePreloadedNodes", () => {
        describe("Nodes [1, 2, 3] with correct offset and limit options", () => {
            it("Should return [1] with offset 0 limit 1", () => {
                const nodes = [1, 2, 3] as unknown as PageTreeNodeInterface[];
                const options = {
                    offset: 0,
                    limit: 1,
                };

                expect(paginatePreloadedNodes(nodes, options)).toEqual([1]);
            });

            it("Should return [2, 3] with offset 1 limit 2", () => {
                const nodes = [1, 2, 3] as unknown as PageTreeNodeInterface[];
                const options = {
                    offset: 1,
                    limit: 2,
                };

                expect(paginatePreloadedNodes(nodes, options)).toEqual([2, 3]);
            });

            it("Should return empty array with offset 3 limit 1", () => {
                const nodes = [1, 2, 3] as unknown as PageTreeNodeInterface[];
                const options = {
                    offset: 3,
                    limit: 1,
                };

                expect(paginatePreloadedNodes(nodes, options)).toEqual([]);
            });
        });

        describe("Nodes [1, 2, 3] with incorrect offset and limit options", () => {
            it("Should throw Error with offset -1 limit 2", async () => {
                const nodes = [1, 2, 3] as unknown as PageTreeNodeInterface[];
                const options = {
                    offset: -1,
                    limit: 2,
                };
                const error = await getError(() => paginatePreloadedNodes(nodes, options));

                expect(error).not.toBeInstanceOf(NoErrorThrownError);
                expect(error).toHaveProperty("message", "Invalid offset '-1'");
            });

            it("Should throw Error with offset 1 limit -1", async () => {
                const nodes = [1, 2, 3] as unknown as PageTreeNodeInterface[];
                const options = {
                    offset: 1,
                    limit: -1,
                };
                const error = await getError(() => paginatePreloadedNodes(nodes, options));

                expect(error).not.toBeInstanceOf(NoErrorThrownError);
                expect(error).toHaveProperty("message", "Invalid limit '-1'");
            });
        });
    });
});
