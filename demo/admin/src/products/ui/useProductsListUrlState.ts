import { useStoredState } from "@dextinity/admin";
import type { DataGridSort } from "@dextinity/ui";
import type { GQLProductStatus, GQLProductType } from "@src/graphql.generated";
import { useCallback, useMemo } from "react";
import { useHistory, useLocation } from "react-router";

import { productStatuses, productTypes } from "./productLabels";

export type ProductStatusFilter = GQLProductStatus | "all";

const sortableProductColumns = ["title", "type", "price", "status", "updatedAt"] as const;

const defaultSort: DataGridSort = { key: "title", direction: "asc" };

interface ProductsListUrlState {
    search: string;
    status: ProductStatusFilter;
    type: GQLProductType | null;
    sort: DataGridSort;
    page: number;
    selectedProductId: string | null;
}

function parseSort(value: string | null): DataGridSort {
    const [key, direction] = (value ?? "").split(":");
    if ((sortableProductColumns as readonly string[]).includes(key) && (direction === "asc" || direction === "desc")) {
        return { key, direction };
    }
    return defaultSort;
}

export function useProductsListUrlState() {
    const location = useLocation();
    const history = useHistory();
    const [pageSize, setPageSize] = useStoredState<number>("demo-admin-products-ui-page-size", 25);

    const state = useMemo<ProductsListUrlState>(() => {
        const params = new URLSearchParams(location.search);
        const status = params.get("status");
        const type = params.get("type");
        const page = Number(params.get("page"));
        return {
            search: params.get("q") ?? "",
            status: (productStatuses as string[]).includes(status ?? "") ? (status as GQLProductStatus) : "all",
            type: (productTypes as string[]).includes(type ?? "") ? (type as GQLProductType) : null,
            sort: parseSort(params.get("sort")),
            page: Number.isInteger(page) && page > 0 ? page : 1,
            selectedProductId: params.get("product"),
        };
    }, [location.search]);

    const update = useCallback(
        (changes: Partial<ProductsListUrlState>) => {
            const next = { ...state, page: 1, ...changes };
            const params = new URLSearchParams();
            if (next.search) {
                params.set("q", next.search);
            }
            if (next.status !== "all") {
                params.set("status", next.status);
            }
            if (next.type) {
                params.set("type", next.type);
            }
            if (next.sort.key !== defaultSort.key || next.sort.direction !== defaultSort.direction) {
                params.set("sort", `${next.sort.key}:${next.sort.direction}`);
            }
            if (next.page > 1) {
                params.set("page", String(next.page));
            }
            if (next.selectedProductId) {
                params.set("product", next.selectedProductId);
            }
            const search = params.toString();
            history.replace({ pathname: location.pathname, search: search ? `?${search}` : "" });
        },
        [state, history, location.pathname],
    );

    const selectProduct = useCallback((selectedProductId: string | null) => update({ selectedProductId, page: state.page }), [update, state.page]);

    return { ...state, pageSize, setPageSize, update, selectProduct };
}
