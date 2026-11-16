import type { GridApi, GridFilterModel, GridSortDirection } from "@mui/x-data-grid";
import queryString from "query-string";
import type { PropsWithChildren } from "react";
import type { Location } from "react-router";
import { act, LocationSpy, renderHook, waitFor } from "test-utils";
import { describe, expect, it } from "vitest";

import { RouterMemoryRouter } from "../router/MemoryRouter";
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
const mockedCallbackDetails = { api: mockedApi, apiRef: { current: mockedApi } };

function createRouter(initialEntries?: string[]) {
    let currentLocation: Location | undefined;
    function Wrapper({ children }: PropsWithChildren) {
        return (
            <RouterMemoryRouter initialEntries={initialEntries}>
                {children}
                <LocationSpy
                    onChange={(location) => {
                        currentLocation = location;
                    }}
                />
            </RouterMemoryRouter>
        );
    }
    return { wrapper: Wrapper, getLocation: () => currentLocation };
}

describe("useDataGridRemote", () => {
    it("reads sort param from URL and returns correct value", () => {
        const router = createRouter([`?${queryString.stringify({ sort: `${mockedSortField}:${mockedSort}` })}`]);

        const { result } = renderHook(() => useDataGridRemote(), { wrapper: router.wrapper });

        expect(result.current.sortModel).toEqual([{ field: mockedSortField, sort: mockedSort }]);
    });

    it("reads filter param from URL and returns correct value", () => {
        const router = createRouter([`?${queryString.stringify({ filter: JSON.stringify(mockedFilterModel) })}`]);

        const { result } = renderHook(() => useDataGridRemote(), { wrapper: router.wrapper });

        expect(result.current.filterModel).toEqual(mockedFilterModel);
    });

    it("reads page param from URL and returns correct value", () => {
        const router = createRouter([`?${queryString.stringify({ page: mockedPage })}`]);

        const { result } = renderHook(() => useDataGridRemote(), { wrapper: router.wrapper });

        expect(result.current.paginationModel?.page).toEqual(mockedPage);
    });

    it("reads pageSize param from URL and returns correct value", () => {
        const router = createRouter([`?${queryString.stringify({ pageSize: mockedPageSize })}`]);

        const { result } = renderHook(() => useDataGridRemote(), { wrapper: router.wrapper });

        expect(result.current.paginationModel?.pageSize).toEqual(mockedPageSize);
    });

    it("writes sort param to URL", async () => {
        const router = createRouter();

        const { result } = renderHook(() => useDataGridRemote(), { wrapper: router.wrapper });

        await act(async () => {
            result.current.onSortModelChange?.([{ field: mockedSortField, sort: mockedSort }], mockedCallbackDetails);
        });

        await waitFor(() => {
            expect(router.getLocation()?.search).toEqual(`?${queryString.stringify({ sort: `${mockedSortField}:${mockedSort}` })}`);
        });
    });

    it("writes filter param to URL", async () => {
        const router = createRouter();

        const { result } = renderHook(() => useDataGridRemote(), { wrapper: router.wrapper });

        await act(async () => {
            result.current.onFilterModelChange?.(mockedFilterModel, mockedCallbackDetails);
        });

        await waitFor(() => {
            expect(router.getLocation()?.search).toEqual(`?${queryString.stringify({ filter: JSON.stringify(mockedFilterModel) })}`);
        });
    });

    it("writes page param to URL", async () => {
        const router = createRouter();

        const { result } = renderHook(() => useDataGridRemote(), { wrapper: router.wrapper });

        await act(async () => {
            result.current.onPaginationModelChange?.({ page: mockedPage, pageSize: 25 }, mockedCallbackDetails);
        });

        await waitFor(() => {
            expect(router.getLocation()?.search).toEqual(`?${queryString.stringify({ page: mockedPage, pageSize: 25 })}`);
        });
    });

    it("writes pageSize param to URL", async () => {
        const router = createRouter();

        const { result } = renderHook(() => useDataGridRemote(), { wrapper: router.wrapper });

        await act(async () => {
            result.current.onPaginationModelChange?.({ page: 0, pageSize: mockedPageSize }, mockedCallbackDetails);
        });

        await waitFor(() => {
            expect(router.getLocation()?.search).toEqual(`?${queryString.stringify({ pageSize: mockedPageSize, page: 0 })}`);
        });
    });

    it("uses queryParamsPrefix when reading params from URL", () => {
        const prefix = "mocked";

        const router = createRouter([
            `?${queryString.stringify({
                [`${prefix}sort`]: `${mockedSortField}:${mockedSort}`,
                [`${prefix}filter`]: JSON.stringify(mockedFilterModel),
                [`${prefix}page`]: mockedPage,
                [`${prefix}pageSize`]: mockedPageSize,
            })}`,
        ]);

        const { result } = renderHook(() => useDataGridRemote({ queryParamsPrefix: prefix }), {
            wrapper: router.wrapper,
        });

        expect(result.current.sortModel).toEqual([{ field: mockedSortField, sort: mockedSort }]);
        expect(result.current.filterModel).toEqual(mockedFilterModel);
        expect(result.current.paginationModel?.page).toEqual(mockedPage);
        expect(result.current.paginationModel?.pageSize).toEqual(mockedPageSize);
    });

    it("adds queryParamsPrefix when writing to URL if queryParamsPrefix is set", async () => {
        const prefix = "mocked";
        const router = createRouter();

        const { result } = renderHook(() => useDataGridRemote({ queryParamsPrefix: prefix }), {
            wrapper: router.wrapper,
        });

        await act(async () => {
            result.current.onSortModelChange?.([{ field: mockedSortField, sort: mockedSort }], mockedCallbackDetails);
        });

        await waitFor(() => {
            expect(router.getLocation()?.search).toContain(`${prefix}sort`);
        });

        await act(async () => {
            result.current.onFilterModelChange?.(mockedFilterModel, mockedCallbackDetails);
        });
        await waitFor(() => {
            expect(router.getLocation()?.search).toContain(`${prefix}filter`);
        });

        await act(async () => {
            result.current.onPaginationModelChange?.({ page: mockedPage, pageSize: mockedPage }, mockedCallbackDetails);
        });
        await waitFor(() => {
            expect(router.getLocation()?.search).toContain(`${prefix}page`);
        });
        await waitFor(() => {
            expect(router.getLocation()?.search).toContain(`${prefix}pageSize`);
        });
    });

    it("uses initial default pageSize if no pageSize is set in the URL", () => {
        const mockedInitialPageSize = 37;

        const router = createRouter();

        const { result } = renderHook(() => useDataGridRemote({ pageSize: mockedInitialPageSize }), {
            wrapper: router.wrapper,
        });

        expect(result.current.paginationModel?.pageSize).toEqual(mockedInitialPageSize);
    });

    it("doesn't use initial default pageSize if a pageSize is set in the URL", () => {
        const mockedInitialPageSize = 37;
        const mockedUrlPageSize = mockedPageSize;

        const router = createRouter([`?${queryString.stringify({ pageSize: mockedPageSize })}`]);

        const { result } = renderHook(() => useDataGridRemote({ pageSize: mockedInitialPageSize }), {
            wrapper: router.wrapper,
        });

        expect(result.current.paginationModel?.pageSize).toEqual(mockedUrlPageSize);
    });

    it("uses initial sort if no sort is set in the URL", () => {
        const mockedInitialSort: Array<{ field: string; sort: GridSortDirection }> = [{ field: "initial", sort: "desc" }];

        const router = createRouter();

        const { result } = renderHook(() => useDataGridRemote({ initialSort: mockedInitialSort }), {
            wrapper: router.wrapper,
        });

        expect(result.current.sortModel).toEqual(mockedInitialSort);
    });

    it("doesn't use initial default sort if sort is set in the URL", () => {
        const mockedInitialSortModel: Array<{ field: string; sort: GridSortDirection }> = [{ field: "initial", sort: "desc" }];
        const mockedUrlField = mockedSortField;
        const mockedUrlSort = mockedSort;
        const mockedUrlSortModel = [{ field: mockedUrlField, sort: mockedUrlSort }];

        const router = createRouter([`?${queryString.stringify({ sort: `${mockedUrlField}:${mockedUrlSort}` })}`]);

        const { result } = renderHook(() => useDataGridRemote({ initialSort: mockedInitialSortModel }), {
            wrapper: router.wrapper,
        });

        expect(result.current.sortModel).toEqual(mockedUrlSortModel);
    });

    it("should set empty initial filter if not provided", () => {
        const router = createRouter();

        const { result } = renderHook(() => useDataGridRemote(), { wrapper: router.wrapper });

        expect(result.current.filterModel).toEqual({ items: [] });
    });

    it("uses initial filter if no filter is set in the URL", () => {
        const router = createRouter();

        const { result } = renderHook(() => useDataGridRemote({ initialFilter: mockedFilterModel }), {
            wrapper: router.wrapper,
        });

        expect(result.current.filterModel).toEqual(mockedFilterModel);
    });

    it("doesn't use initial default filter if filter is set in the URL", () => {
        const mockedUrlFilterModel = { items: [{ columnField: "description", id: 1, operatorValue: "equal", value: "Test" }] };

        const router = createRouter([
            `?${queryString.stringify({ filter: '{"items":[{"columnField":"description","id":1,"operatorValue":"equal","value":"Test"}]}' })}`,
        ]);

        const { result } = renderHook(() => useDataGridRemote({ initialFilter: mockedFilterModel }), {
            wrapper: router.wrapper,
        });

        expect(result.current.filterModel).toEqual(mockedUrlFilterModel);
    });
});
