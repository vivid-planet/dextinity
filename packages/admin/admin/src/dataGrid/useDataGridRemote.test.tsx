import type { GridApi, GridFilterModel, GridSortDirection } from "@mui/x-data-grid";
import { createMemoryHistory } from "history";
import queryString from "query-string";
import { Router } from "react-router";
import { act, renderHook } from "test-utils";
import { describe, expect, it } from "vitest";

import { useDataGridRemote } from "./useDataGridRemote";

const mockedSortField = "description";
const mockedSort = "asc";
const mockedFilterModel: GridFilterModel = {
    items: [{ field: "price", id: 1, operator: ">", value: "30" }],
    quickFilterValues: ["a"],
};
const mockedPage = 17;
const mockedPageSize = 42;

const mockedApi: GridApi = {} as GridApi;

describe("useDataGridRemote", () => {
    it("reads sort param from URL and returns correct value", () => {
        const history = createMemoryHistory({ initialEntries: [`?${queryString.stringify({ sort: `${mockedSortField}:${mockedSort}` })}`] });

        const { result } = renderHook(() => useDataGridRemote(), { wrapper: ({ children }) => <Router history={history}>{children}</Router> });

        expect(result.current.sortModel).toEqual([{ field: mockedSortField, sort: mockedSort }]);
    });

    it("reads filter param from URL and returns correct value", () => {
        const history = createMemoryHistory({ initialEntries: [`?${queryString.stringify({ filter: JSON.stringify(mockedFilterModel) })}`] });

        const { result } = renderHook(() => useDataGridRemote(), { wrapper: ({ children }) => <Router history={history}>{children}</Router> });

        expect(result.current.filterModel).toEqual(mockedFilterModel);
    });

    it("reads page param from URL and returns correct value", () => {
        const history = createMemoryHistory({ initialEntries: [`?${queryString.stringify({ page: mockedPage })}`] });

        const { result } = renderHook(() => useDataGridRemote(), { wrapper: ({ children }) => <Router history={history}>{children}</Router> });

        expect(result.current.paginationModel?.page).toEqual(mockedPage);
    });

    it("reads pageSize param from URL and returns correct value", () => {
        const history = createMemoryHistory({ initialEntries: [`?${queryString.stringify({ pageSize: mockedPageSize })}`] });

        const { result } = renderHook(() => useDataGridRemote(), { wrapper: ({ children }) => <Router history={history}>{children}</Router> });

        expect(result.current.paginationModel?.pageSize).toEqual(mockedPageSize);
    });

    it("writes sort param to URL", () => {
        const history = createMemoryHistory();

        const { result } = renderHook(() => useDataGridRemote(), { wrapper: ({ children }) => <Router history={history}>{children}</Router> });

        act(() => {
            result.current.onSortModelChange?.([{ field: mockedSortField, sort: mockedSort }], {
                api: mockedApi,
            });
        });

        expect(history.location.search).toEqual(`?${queryString.stringify({ sort: `${mockedSortField}:${mockedSort}` })}`);
    });

    it("writes filter param to URL", () => {
        const history = createMemoryHistory();

        const { result } = renderHook(() => useDataGridRemote(), { wrapper: ({ children }) => <Router history={history}>{children}</Router> });

        act(() => {
            result.current.onFilterModelChange?.(mockedFilterModel, {
                api: mockedApi,
            });
        });

        expect(history.location.search).toEqual(`?${queryString.stringify({ filter: JSON.stringify(mockedFilterModel) })}`);
    });

    it("writes page param to URL", () => {
        const history = createMemoryHistory();

        const { result } = renderHook(() => useDataGridRemote(), { wrapper: ({ children }) => <Router history={history}>{children}</Router> });

        act(() => {
            result.current.onPaginationModelChange?.(
                { page: mockedPage, pageSize: 25 },
                {
                    api: mockedApi,
                },
            );
        });

        expect(history.location.search).toEqual(`?${queryString.stringify({ page: mockedPage, pageSize: 25 })}`);
    });

    it("writes pageSize param to URL", () => {
        const history = createMemoryHistory();

        const { result } = renderHook(() => useDataGridRemote(), { wrapper: ({ children }) => <Router history={history}>{children}</Router> });

        act(() => {
            result.current.onPaginationModelChange?.({ page: 0, pageSize: mockedPageSize }, { api: mockedApi });
        });

        expect(history.location.search).toEqual(`?${queryString.stringify({ pageSize: mockedPageSize, page: 0 })}`);
    });

    it("uses queryParamsPrefix when reading params from URL", () => {
        const prefix = "mocked";

        const history = createMemoryHistory({
            initialEntries: [
                `?${queryString.stringify({
                    [`${prefix}sort`]: `${mockedSortField}:${mockedSort}`,
                    [`${prefix}filter`]: JSON.stringify(mockedFilterModel),
                    [`${prefix}page`]: mockedPage,
                    [`${prefix}pageSize`]: mockedPageSize,
                })}`,
            ],
        });

        const { result } = renderHook(() => useDataGridRemote({ queryParamsPrefix: prefix }), {
            wrapper: ({ children }) => <Router history={history}>{children}</Router>,
        });

        expect(result.current.sortModel).toEqual([{ field: mockedSortField, sort: mockedSort }]);
        expect(result.current.filterModel).toEqual(mockedFilterModel);
        expect(result.current.paginationModel?.page).toEqual(mockedPage);
        expect(result.current.paginationModel?.pageSize).toEqual(mockedPageSize);
    });

    it("adds queryParamsPrefix when writing to URL if queryParamsPrefix is set", () => {
        const prefix = "mocked";
        const history = createMemoryHistory();

        const { result } = renderHook(() => useDataGridRemote({ queryParamsPrefix: prefix }), {
            wrapper: ({ children }) => <Router history={history}>{children}</Router>,
        });

        act(() => {
            result.current.onSortModelChange?.([{ field: mockedSortField, sort: mockedSort }], { api: mockedApi });
        });

        expect(history.location.search).toContain(`${prefix}sort`);

        act(() => {
            result.current.onFilterModelChange?.(mockedFilterModel, { api: mockedApi });
        });
        expect(history.location.search).toContain(`${prefix}filter`);

        act(() => {
            result.current.onPaginationModelChange?.({ page: mockedPage, pageSize: mockedPage }, { api: mockedApi });
        });
        expect(history.location.search).toContain(`${prefix}page`);
        expect(history.location.search).toContain(`${prefix}pageSize`);
    });

    it("uses initial default pageSize if no pageSize is set in the URL", () => {
        const mockedInitialPageSize = 37;

        const history = createMemoryHistory();

        const { result } = renderHook(() => useDataGridRemote({ pageSize: mockedInitialPageSize }), {
            wrapper: ({ children }) => <Router history={history}>{children}</Router>,
        });

        expect(result.current.paginationModel?.pageSize).toEqual(mockedInitialPageSize);
    });

    it("doesn't use initial default pageSize if a pageSize is set in the URL", () => {
        const mockedInitialPageSize = 37;
        const mockedUrlPageSize = mockedPageSize;

        const history = createMemoryHistory({ initialEntries: [`?${queryString.stringify({ pageSize: mockedPageSize })}`] });

        const { result } = renderHook(() => useDataGridRemote({ pageSize: mockedInitialPageSize }), {
            wrapper: ({ children }) => <Router history={history}>{children}</Router>,
        });

        expect(result.current.paginationModel?.pageSize).toEqual(mockedUrlPageSize);
    });

    it("uses initial sort if no sort is set in the URL", () => {
        const mockedInitialSort: Array<{ field: string; sort: GridSortDirection }> = [{ field: "initial", sort: "desc" }];

        const history = createMemoryHistory();

        const { result } = renderHook(() => useDataGridRemote({ initialSort: mockedInitialSort }), {
            wrapper: ({ children }) => <Router history={history}>{children}</Router>,
        });

        expect(result.current.sortModel).toEqual(mockedInitialSort);
    });

    it("doesn't use initial default sort if sort is set in the URL", () => {
        const mockedInitialSortModel: Array<{ field: string; sort: GridSortDirection }> = [{ field: "initial", sort: "desc" }];
        const mockedUrlField = mockedSortField;
        const mockedUrlSort = mockedSort;
        const mockedUrlSortModel = [{ field: mockedUrlField, sort: mockedUrlSort }];

        const history = createMemoryHistory({ initialEntries: [`?${queryString.stringify({ sort: `${mockedUrlField}:${mockedUrlSort}` })}`] });

        const { result } = renderHook(() => useDataGridRemote({ initialSort: mockedInitialSortModel }), {
            wrapper: ({ children }) => <Router history={history}>{children}</Router>,
        });

        expect(result.current.sortModel).toEqual(mockedUrlSortModel);
    });

    it("should set empty initial filter if not provided", () => {
        const history = createMemoryHistory();

        const { result } = renderHook(() => useDataGridRemote(), { wrapper: ({ children }) => <Router history={history}>{children}</Router> });

        expect(result.current.filterModel).toEqual({ items: [] });
    });

    it("uses initial filter if no filter is set in the URL", () => {
        const history = createMemoryHistory();

        const { result } = renderHook(() => useDataGridRemote({ initialFilter: mockedFilterModel }), {
            wrapper: ({ children }) => <Router history={history}>{children}</Router>,
        });

        expect(result.current.filterModel).toEqual(mockedFilterModel);
    });

    it("doesn't use initial default filter if filter is set in the URL", () => {
        const mockedUrlFilterModel = { items: [{ columnField: "description", id: 1, operatorValue: "equal", value: "Test" }] };

        const history = createMemoryHistory({
            initialEntries: [
                `?${queryString.stringify({ filter: '{"items":[{"columnField":"description","id":1,"operatorValue":"equal","value":"Test"}]}' })}`,
            ],
        });

        const { result } = renderHook(() => useDataGridRemote({ initialFilter: mockedFilterModel }), {
            wrapper: ({ children }) => <Router history={history}>{children}</Router>,
        });

        expect(result.current.filterModel).toEqual(mockedUrlFilterModel);
    });
});
