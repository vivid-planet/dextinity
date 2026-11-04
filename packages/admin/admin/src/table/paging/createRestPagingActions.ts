import queryString from "query-string";

import type { IPagingApi } from "../useTableQueryPaging";
import type { IPagingInfo } from "./IPagingInfo";

function getPageParameterFromUrl(url: string, options: IOptions) {
    const params = queryString.parse(queryString.extract(url));
    return params && params[options.pageParameterName] ? parseInt(params[options.pageParameterName] as string, 10) : null;
}

interface IRestPagingData {
    nextPage?: string;
    previousPage?: string;
    totalPages?: number | null;
}

interface IOptions {
    pageParameterName: string;
}

/**
 * @deprecated Use MUI X Data Grid in combination with `useDataGridRemote` instead.
 */
export function createRestPagingActions<TData extends IRestPagingData>(
    pagingApi: IPagingApi<number>,
    data: TData,
    options: IOptions = { pageParameterName: "page" },
): IPagingInfo {
    const nextPage = data.nextPage ? getPageParameterFromUrl(data.nextPage, options) : null;
    const previousPage = data.previousPage ? getPageParameterFromUrl(data.previousPage, options) : null;
    return {
        fetchNextPage: nextPage
            ? () => {
                  pagingApi.changePage(nextPage, nextPage);
              }
            : undefined,
        fetchPreviousPage: previousPage
            ? () => {
                  pagingApi.changePage(previousPage, previousPage);
              }
            : undefined,
        totalPages: data.totalPages,
        currentPage: pagingApi.currentPage,
        attachTableRef: pagingApi.attachTableRef,
    };
}
