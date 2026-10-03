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
