import { createMemoryHistory, type MemoryHistory } from "history";
import type { PropsWithChildren } from "react";
import { Router } from "react-router";
import { act, renderHook } from "test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { remoteListFilterParam } from "../remoteListFilterParams";
import { toGqlSort } from "../toGqlSort";
import { useRemoteListState } from "../useRemoteListState";

const filters = {
    status: remoteListFilterParam.oneOf(["active", "deleted"]),
    visibleOnly: remoteListFilterParam.boolean(true),
};
const sortableColumns = ["title", "date"];
const defaultSort = { key: "date", direction: "desc" } as const;

function renderRemoteListState(history: MemoryHistory, queryParamsPrefix?: string) {
    const wrapper = ({ children }: PropsWithChildren) => <Router history={history}>{children}</Router>;
    return renderHook(() => useRemoteListState({ filters, sortableColumns, defaultSort, queryParamsPrefix, defaultPageSize: 10 }), { wrapper });
}

describe("useRemoteListState", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("reads the defaults without URL parameters", () => {
        const { result } = renderRemoteListState(createMemoryHistory({ initialEntries: ["/list"] }));

        expect(result.current.filters).toEqual({ status: null, visibleOnly: true });
        expect(result.current.sort).toEqual(defaultSort);
        expect(result.current.page).toBe(1);
        expect(result.current.offset).toBe(0);
        expect(result.current.limit).toBe(10);
        expect(result.current.isFiltered).toBe(false);
    });

    it("reads valid URL parameters and ignores invalid ones", () => {
        const history = createMemoryHistory({ initialEntries: ["/list?filter_status=active&filter_visibleOnly=maybe&sort=title:asc&page=3&q=foo"] });
        const { result } = renderRemoteListState(history);

        expect(result.current.filters).toEqual({ status: "active", visibleOnly: true });
        expect(result.current.sort).toEqual({ key: "title", direction: "asc" });
        expect(result.current.page).toBe(3);
        expect(result.current.offset).toBe(20);
        expect(result.current.search).toBe("foo");
        expect(result.current.isFiltered).toBe(true);
    });

    it("falls back to the default sort for a column that isn't sortable", () => {
        const { result } = renderRemoteListState(createMemoryHistory({ initialEntries: ["/list?sort=secret:asc"] }));

        expect(result.current.sort).toEqual(defaultSort);
    });

    it("goes back to the first page when a filter changes and leaves default values out of the URL", () => {
        const history = createMemoryHistory({ initialEntries: ["/list?page=2&other=kept"] });
        const { result } = renderRemoteListState(history);

        act(() => result.current.setFilter("visibleOnly", false));

        expect(result.current.filters.visibleOnly).toBe(false);
        expect(result.current.page).toBe(1);
        expect(new URLSearchParams(history.location.search).toString()).toBe("other=kept&filter_visibleOnly=false");

        act(() => result.current.setFilter("visibleOnly", true));

        expect(history.location.search).toBe("?other=kept");
    });

    it("keeps the page when the sort changes", () => {
        const history = createMemoryHistory({ initialEntries: ["/list?page=2"] });
        const { result } = renderRemoteListState(history);

        act(() => result.current.setSort({ key: "title", direction: "asc" }));

        expect(result.current.page).toBe(2);
        expect(toGqlSort(result.current.sort)).toEqual([{ field: "title", direction: "ASC" }]);
    });

    it("applies the search after the debounce", () => {
        const history = createMemoryHistory({ initialEntries: ["/list"] });
        const { result } = renderRemoteListState(history);

        act(() => result.current.setSearchInput("news"));

        expect(result.current.searchInput).toBe("news");
        expect(result.current.search).toBe("");

        act(() => {
            vi.advanceTimersByTime(300);
        });

        expect(result.current.search).toBe("news");
        expect(history.location.search).toBe("?q=news");
    });

    it("resets the search and the filters", () => {
        const history = createMemoryHistory({ initialEntries: ["/list?q=foo&filter_status=deleted&sort=title:asc"] });
        const { result } = renderRemoteListState(history);

        act(() => result.current.resetFilters());

        expect(result.current.searchInput).toBe("");
        expect(result.current.search).toBe("");
        expect(result.current.filters).toEqual({ status: null, visibleOnly: true });
        expect(result.current.sort).toEqual({ key: "title", direction: "asc" });
        expect(result.current.isFiltered).toBe(false);
    });

    it("prefixes the URL parameters so that two lists don't interfere", () => {
        const history = createMemoryHistory({ initialEntries: ["/list?page=4"] });
        const { result } = renderRemoteListState(history, "dependents");

        expect(result.current.page).toBe(1);

        act(() => result.current.setPage(2));

        expect(new URLSearchParams(history.location.search).get("dependents_page")).toBe("2");
        expect(new URLSearchParams(history.location.search).get("page")).toBe("4");
    });
});
