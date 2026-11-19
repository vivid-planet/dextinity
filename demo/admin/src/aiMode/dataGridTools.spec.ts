import { dataGridDateColumn, type GridColDef } from "@dextinity/admin";
import { describe, expect, it, vi } from "vitest";

import type { AiModeTool } from "./AiModeToolsets";
import { type AiModeDataGridState, createDataGridTools } from "./dataGridTools";

const columns: GridColDef[] = [
    { field: "title", headerName: "Title" },
    { ...dataGridDateColumn, field: "date", headerName: "Date" },
    { field: "category", headerName: "Category", type: "singleSelect", valueOptions: ["events", "awards"] },
    { field: "image", headerName: "Image", filterable: false, sortable: false },
    { field: "actions", type: "actions" },
];

const rows = [{ id: "1", title: "Award won", date: "2026-01-31", category: "awards", image: { damFileId: "2" } }];

/**
 * Stands in for the URL state of `useDataGridRemote`: a change takes effect only on the next render, and each handler
 * writes the state of the render it belongs to, so a second change in the same render would undo the first.
 */
function createGridState() {
    let state: AiModeDataGridState;
    const render = (next: Omit<AiModeDataGridState, "onFilterModelChange" | "onSortModelChange" | "onPaginationModelChange">) => {
        const rendered = next;
        state = {
            ...rendered,
            onFilterModelChange: (filterModel) => setTimeout(() => render({ ...rendered, filterModel })),
            onSortModelChange: (sortModel) => setTimeout(() => render({ ...rendered, sortModel })),
            onPaginationModelChange: (paginationModel) => setTimeout(() => render({ ...rendered, paginationModel })),
        };
    };
    render({ filterModel: { items: [] }, sortModel: [], paginationModel: { page: 3, pageSize: 25 } });
    return { getState: () => state };
}

function createTools({ isLoading = false }: { isLoading?: boolean } = {}) {
    const grid = createGridState();
    const openForm = vi.fn();
    const tools = createDataGridTools({
        entityName: "news",
        entityLabel: "news articles",
        columns,
        getState: grid.getState,
        rows,
        totalCount: 1,
        isLoading,
        openForm,
    });
    const call = (name: string, args: Record<string, unknown> = {}) => findTool(tools, name).handler(args, { clearTextSelection: vi.fn() });
    return { ...grid, tools, call, openForm };
}

function findTool(tools: AiModeTool[], name: string) {
    const tool = tools.find((candidate) => candidate.name === name);
    if (!tool) {
        throw new Error(`No tool "${name}"`);
    }
    return tool;
}

const waitForRender = () => new Promise((resolve) => setTimeout(resolve, 20));

describe("get_<entity>_grid_rows", () => {
    it("returns the rows with the columns the agent can read, and the view of the grid", () => {
        const { call } = createTools();

        expect(call("get_news_grid_rows")).toEqual({
            rows: [{ id: "1", title: "Award won", date: "2026-01-31", category: "awards" }],
            totalCount: 1,
            search: "",
            filters: [],
            sort: [],
            page: 3,
            pageSize: 25,
        });
    });

    it("says that the rows are still loading rather than returning those of the previous view", () => {
        const { call } = createTools({ isLoading: true });

        expect(call("get_news_grid_rows")).toMatch(/still loading/);
    });
});

describe("set_<entity>_grid_view", () => {
    it("lists the filterable columns with their operators", () => {
        const { tools } = createTools();
        const { description } = findTool(tools, "set_news_grid_view");

        expect(description).toContain("title (contains,");
        expect(description).toContain("date (is, not, after, onOrAfter, before, onOrBefore, isEmpty, isNotEmpty)");
        expect(description).not.toContain("image (");
    });

    it("applies a search, filters, and sorting together, one render after another, and goes back to the first page", async () => {
        const { call, getState } = createTools();

        await call("set_news_grid_view", {
            search: "award won",
            filters: [{ field: "category", operator: "is", value: "awards" }],
            sort: [{ field: "date", direction: "desc" }],
        });
        await waitForRender();

        expect(getState()).toMatchObject({
            filterModel: { items: [{ field: "category", operator: "is", value: "awards" }], quickFilterValues: ["award", "won"] },
            sortModel: [{ field: "date", sort: "desc" }],
            paginationModel: { page: 0 },
        });
    });

    it("keeps the page when only the sorting changes", async () => {
        const { call, getState } = createTools();

        await call("set_news_grid_view", { sort: [{ field: "title", direction: "asc" }] });
        await waitForRender();

        expect(getState().paginationModel.page).toBe(3);
    });

    it.each([
        [{ filters: [{ field: "image", operator: "contains", value: "x" }] }, '"image" is no column that can be filtered'],
        [{ filters: [{ field: "date", operator: "contains", value: "x" }] }, '"contains" is no operator of the column "date"'],
        [{ sort: [{ field: "image", direction: "asc" }] }, '"image" is no column the grid can be sorted by'],
        [{ sort: [{ field: "title", direction: "up" }] }, 'the direction must be "asc" or "desc"'],
        [{ page: -1 }, '"page" must be a page number'],
    ])("refuses %o and changes nothing", async (args, message) => {
        const { call, getState } = createTools();
        const state = getState();

        await expect(async () => call("set_news_grid_view", { search: "award", ...args })).rejects.toThrow(message);
        await waitForRender();

        expect(getState()).toBe(state);
    });
});

it("runs every tool without the user's approval, because none changes data", () => {
    const { tools } = createTools();

    expect(tools.map(({ name, readOnlyHint }) => [name, readOnlyHint])).toEqual([
        ["get_news_grid_rows", true],
        ["set_news_grid_view", true],
        ["open_news_form", true],
    ]);
});

describe("open_<entity>_form", () => {
    it("opens the form of a row, or the form for a new one without an ID", () => {
        const { call, openForm } = createTools();

        call("open_news_form", { id: "1" });
        call("open_news_form");

        expect(openForm.mock.calls).toEqual([["1"], []]);
    });
});
