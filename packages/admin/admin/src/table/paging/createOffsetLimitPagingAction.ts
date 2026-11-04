import type { IPagingApi } from "../useTableQueryPaging";
import type { IPagingInfo } from "./IPagingInfo";

interface OffsetLimitPagingData {
    totalCount: number;
}

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export function createOffsetLimitPagingAction<TData extends OffsetLimitPagingData>(
    pagingApi: IPagingApi<number>,
    { totalCount }: TData,
    limit: number,
): IPagingInfo {
    const currentPage = pagingApi.currentPage ?? 1;
    const totalPages = Math.ceil(totalCount / limit);

    const createFetchNextPage = () => {
        const nextPage = currentPage + 1;

        if (nextPage <= totalPages) {
            return () => pagingApi.changePage(pagingApi.current + limit, nextPage);
        }
    };
    const createFetchPreviousPage = () => {
        const previousPage = currentPage - 1;

        if (previousPage > 0) {
            return () => pagingApi.changePage(pagingApi.current - limit, previousPage);
        }
    };

    return {
        fetchNextPage: createFetchNextPage(),
        fetchPreviousPage: createFetchPreviousPage(),
        totalPages,
        currentPage,
        attachTableRef: pagingApi.attachTableRef,
    };
}
