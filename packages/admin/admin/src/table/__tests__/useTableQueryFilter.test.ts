import { act, renderHook } from "test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useTableQueryFilter } from "../useTableQueryFilter";

describe("useTableQueryFilter", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    function renderUseTableQueryFilter(options?: Parameters<typeof useTableQueryFilter>[1]) {
        const hook = renderHook(() => useTableQueryFilter({ query: "" }, options));
        // Wait for the debounce of the initial form state to pass
        act(() => {
            vi.advanceTimersByTime(500);
        });
        return hook;
    }

    it("should apply the first change immediately", () => {
        const { result } = renderUseTableQueryFilter();

        act(() => {
            result.current.formApi.change("query", "a");
        });

        expect(result.current.current).toEqual({ query: "a" });
    });

    it("should apply the last of several quick changes 500ms after the last one", () => {
        const { result } = renderUseTableQueryFilter();

        act(() => {
            result.current.formApi.change("query", "a");
        });
        act(() => {
            vi.advanceTimersByTime(200);
            result.current.formApi.change("query", "ab");
        });
        act(() => {
            vi.advanceTimersByTime(200);
            result.current.formApi.change("query", "abc");
        });
        act(() => {
            vi.advanceTimersByTime(499);
        });

        expect(result.current.current).toEqual({ query: "a" });

        act(() => {
            vi.advanceTimersByTime(1);
        });

        expect(result.current.current).toEqual({ query: "abc" });
    });

    it("should reset the paging to the first page when the filter changes", () => {
        const pagingApi = { init: {}, changePage: vi.fn() };
        const { result } = renderUseTableQueryFilter({ pagingApi: pagingApi as never });

        act(() => {
            result.current.formApi.change("query", "a");
        });

        expect(pagingApi.changePage).toHaveBeenCalledExactlyOnceWith(pagingApi.init, 1, { noScrollToTop: true });
    });

    it("should not reset the paging after unmount", () => {
        const pagingApi = { init: {}, changePage: vi.fn() };
        const { result, unmount } = renderUseTableQueryFilter({ pagingApi: pagingApi as never });

        act(() => {
            result.current.formApi.change("query", "a");
            result.current.formApi.change("query", "ab");
        });
        pagingApi.changePage.mockClear();
        unmount();
        act(() => {
            vi.advanceTimersByTime(500);
        });

        expect(pagingApi.changePage).not.toHaveBeenCalled();
    });
});
