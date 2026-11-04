import type { RefObject } from "react";

import { usePersistedState } from "./usePersistedState";

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export interface IPagingApi<T> {
    init: T;
    current: T;
    currentPage?: number;
    changePage: (variables: T, page?: number, changePageOptions?: IChangePageOptions) => void;
    attachTableRef: (ref: RefObject<HTMLDivElement | undefined | null>) => void;
}

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export interface IChangePageOptions {
    noScrollToTop?: boolean;
}

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export function useTableQueryPaging<T>(
    init: T,
    options: {
        persistedStateId?: string;
    } = {},
): IPagingApi<T> {
    const [page, setPage] = usePersistedState(1, {
        persistedStateId: options.persistedStateId ? `${options.persistedStateId}_pagingPage` : undefined,
    });
    const [variables, setVariables] = usePersistedState<T>(init, {
        persistedStateId: options.persistedStateId ? `${options.persistedStateId}_pagingVariables` : undefined,
    });

    let tableRef: RefObject<HTMLDivElement | undefined | null> | undefined;
    function attachTableRef(ref: any) {
        tableRef = ref;
    }

    function changePage(vars: T, p?: number, changePageOptions?: IChangePageOptions) {
        setVariables(vars);
        if (p) {
            setPage(p);
        }
        if (tableRef && tableRef.current && !changePageOptions?.noScrollToTop) {
            tableRef.current.scrollIntoView();
        }
    }

    return {
        init,
        current: variables,
        currentPage: page,
        changePage,
        attachTableRef,
    };
}
