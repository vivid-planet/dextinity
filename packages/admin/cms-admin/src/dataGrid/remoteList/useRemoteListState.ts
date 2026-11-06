import { useStoredState } from "@dextinity/admin";
import type { DataGridSort } from "@dextinity/ui";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router";

import type { RemoteListFilterParams, RemoteListFilterValues } from "./remoteListFilterParams";

export interface UseRemoteListStateOptions<Filters extends RemoteListFilterParams> {
    /** Prefixes the URL parameters, needed when several lists are shown at the same time. */
    queryParamsPrefix?: string;
    filters?: Filters;
    /** The sort keys the API accepts; a sort from the URL with another key falls back to `defaultSort`. */
    sortableColumns?: readonly string[];
    defaultSort?: DataGridSort;
    /** @defaultValue `25` */
    defaultPageSize?: number;
    /** Remembers the page size in the local storage under this key. */
    pageSizeStorageKey?: string;
    /** @defaultValue `300` */
    searchDebounceMs?: number;
}

export interface RemoteListStateChanges<Filters extends RemoteListFilterParams> {
    search?: string;
    filters?: Partial<RemoteListFilterValues<Filters>>;
    sort?: DataGridSort;
    page?: number;
}

export interface RemoteListState<Filters extends RemoteListFilterParams> {
    /** The search sent to the API, which follows `searchInput` after a debounce. */
    search: string;
    /** The text of the search field; pass it to `FilterBar` as `searchValue`. */
    searchInput: string;
    setSearchInput: (search: string) => void;
    filters: RemoteListFilterValues<Filters>;
    setFilter: <Key extends keyof Filters>(key: Key, value: RemoteListFilterValues<Filters>[Key]) => void;
    sort: DataGridSort | undefined;
    setSort: (sort: DataGridSort) => void;
    /** The current page, starting at 1. */
    page: number;
    setPage: (page: number) => void;
    pageSize: number;
    setPageSize: (pageSize: number) => void;
    offset: number;
    limit: number;
    /** Whether the search or a filter differs from its default. */
    isFiltered: boolean;
    resetFilters: () => void;
    /** Changes several parts at once. The page goes back to 1 unless it's part of the changes. */
    update: (changes: RemoteListStateChanges<Filters>) => void;
}

/**
 * The state of a list whose rows are loaded page by page from the API: search, filters, sort and page, kept in the URL so
 * that a link or a reload shows the same rows. Map it to the query variables and pass it to the `DataGrid`, `FilterBar`
 * and `Pagination` of `@dextinity/ui`.
 */
export function useRemoteListState<Filters extends RemoteListFilterParams = Record<string, never>>({
    queryParamsPrefix,
    filters: filterParams,
    sortableColumns,
    defaultSort,
    defaultPageSize = 25,
    pageSizeStorageKey,
    searchDebounceMs = 300,
}: UseRemoteListStateOptions<Filters> = {}): RemoteListState<Filters> {
    const location = useLocation();
    const history = useHistory();
    const [pageSize, storePageSize] = useStoredState<number>(pageSizeStorageKey ?? false, defaultPageSize);

    const paramName = useCallback((key: string) => (queryParamsPrefix ? `${queryParamsPrefix}_${key}` : key), [queryParamsPrefix]);

    const parsed = useMemo(() => {
        const params = new URLSearchParams(location.search);
        const filters = Object.fromEntries(
            Object.entries(filterParams ?? {}).map(([key, filterParam]) => {
                const value = params.get(paramName(`filter_${key}`));
                const parsedValue = value === null ? undefined : filterParam.parse(value);
                return [key, parsedValue === undefined ? filterParam.defaultValue : parsedValue];
            }),
        ) as RemoteListFilterValues<Filters>;
        const page = Number(params.get(paramName("page")));
        return {
            search: params.get(paramName("q")) ?? "",
            filters,
            sort: parseSort(params.get(paramName("sort")), sortableColumns) ?? defaultSort,
            page: Number.isInteger(page) && page > 0 ? page : 1,
        };
    }, [location.search, filterParams, paramName, sortableColumns, defaultSort]);

    const update = useCallback(
        (changes: RemoteListStateChanges<Filters>) => {
            const next = {
                search: changes.search ?? parsed.search,
                filters: { ...parsed.filters, ...changes.filters },
                sort: changes.sort ?? parsed.sort,
                page: changes.page ?? 1,
            };
            const params = new URLSearchParams(location.search);
            const setParam = (key: string, value: string | null) => {
                if (value === null) {
                    params.delete(paramName(key));
                } else {
                    params.set(paramName(key), value);
                }
            };
            setParam("q", next.search || null);
            for (const [key, filterParam] of Object.entries(filterParams ?? {})) {
                const value = next.filters[key];
                setParam(`filter_${key}`, value === filterParam.defaultValue ? null : filterParam.serialize(value));
            }
            const isDefaultSort = next.sort === undefined || (next.sort.key === defaultSort?.key && next.sort.direction === defaultSort.direction);
            setParam("sort", isDefaultSort || !next.sort ? null : `${next.sort.key}:${next.sort.direction}`);
            setParam("page", next.page > 1 ? String(next.page) : null);
            const search = params.toString();
            history.replace({ pathname: location.pathname, search: search ? `?${search}` : "", hash: location.hash });
        },
        [parsed, location.search, location.pathname, location.hash, filterParams, paramName, defaultSort, history],
    );

    const [searchInput, setSearchInput] = useState(parsed.search);
    const committedSearch = useRef(parsed.search);
    // The debounce must not restart when `update` changes because the page re-renders, e.g. when the rows arrive
    const updateRef = useRef(update);
    useEffect(() => {
        updateRef.current = update;
    }, [update]);

    useEffect(() => {
        if (parsed.search !== committedSearch.current) {
            committedSearch.current = parsed.search;
            setSearchInput(parsed.search);
        }
    }, [parsed.search]);

    useEffect(() => {
        if (searchInput === committedSearch.current) {
            return;
        }
        const timeout = window.setTimeout(() => {
            committedSearch.current = searchInput;
            updateRef.current({ search: searchInput });
        }, searchDebounceMs);
        return () => window.clearTimeout(timeout);
    }, [searchInput, searchDebounceMs]);

    const isFiltered =
        parsed.search !== "" || Object.entries(filterParams ?? {}).some(([key, filterParam]) => parsed.filters[key] !== filterParam.defaultValue);

    const resetFilters = useCallback(() => {
        const defaultFilters = Object.fromEntries(
            Object.entries(filterParams ?? {}).map(([key, filterParam]) => [key, filterParam.defaultValue]),
        ) as RemoteListFilterValues<Filters>;
        committedSearch.current = "";
        setSearchInput("");
        update({ search: "", filters: defaultFilters });
    }, [filterParams, update]);

    return {
        search: parsed.search,
        searchInput,
        setSearchInput,
        filters: parsed.filters,
        setFilter: useCallback(
            (key, value) => update({ filters: { [key]: value } as unknown as Partial<RemoteListFilterValues<Filters>> }),
            [update],
        ),
        sort: parsed.sort,
        setSort: useCallback((sort: DataGridSort) => update({ sort, page: parsed.page }), [update, parsed.page]),
        page: parsed.page,
        setPage: useCallback((page: number) => update({ page }), [update]),
        pageSize,
        setPageSize: useCallback(
            (nextPageSize: number) => {
                storePageSize(nextPageSize);
                update({ page: 1 });
            },
            [storePageSize, update],
        ),
        offset: (parsed.page - 1) * pageSize,
        limit: pageSize,
        isFiltered,
        resetFilters,
        update,
    };
}

function parseSort(value: string | null, sortableColumns: readonly string[] | undefined): DataGridSort | undefined {
    const [key, direction] = (value ?? "").split(":");
    if (key && (sortableColumns === undefined || sortableColumns.includes(key)) && (direction === "asc" || direction === "desc")) {
        return { key, direction };
    }
    return undefined;
}
