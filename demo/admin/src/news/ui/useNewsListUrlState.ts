import { useStoredState } from "@dextinity/admin";
import type { DataGridSort } from "@dextinity/ui";
import type { GQLNewsCategory, GQLNewsStatus } from "@src/graphql.generated";
import { useCallback, useMemo } from "react";
import { useHistory, useLocation } from "react-router";

import { newsCategories } from "./newsLabels";

export type NewsStatusFilter = GQLNewsStatus | "all";

export const sortableNewsColumns = ["title", "date", "category", "status", "updatedAt"] as const;

const defaultSort: DataGridSort = { key: "date", direction: "desc" };

interface NewsListUrlState {
    search: string;
    status: NewsStatusFilter;
    category: GQLNewsCategory | null;
    sort: DataGridSort;
    page: number;
}

function parseSort(value: string | null): DataGridSort {
    const [key, direction] = (value ?? "").split(":");
    if ((sortableNewsColumns as readonly string[]).includes(key) && (direction === "asc" || direction === "desc")) {
        return { key, direction };
    }
    return defaultSort;
}

export function useNewsListUrlState() {
    const location = useLocation();
    const history = useHistory();
    const [pageSize, setPageSize] = useStoredState<number>("demo-admin-news-ui-page-size", 25);

    const state = useMemo<NewsListUrlState>(() => {
        const params = new URLSearchParams(location.search);
        const status = params.get("status");
        const category = params.get("category");
        const page = Number(params.get("page"));
        return {
            search: params.get("q") ?? "",
            status: status === "active" || status === "deleted" ? status : "all",
            category: (newsCategories as string[]).includes(category ?? "") ? (category as GQLNewsCategory) : null,
            sort: parseSort(params.get("sort")),
            page: Number.isInteger(page) && page > 0 ? page : 1,
        };
    }, [location.search]);

    const update = useCallback(
        (changes: Partial<NewsListUrlState>) => {
            const next = { ...state, page: 1, ...changes };
            const params = new URLSearchParams();
            if (next.search) {
                params.set("q", next.search);
            }
            if (next.status !== "all") {
                params.set("status", next.status);
            }
            if (next.category) {
                params.set("category", next.category);
            }
            if (next.sort.key !== defaultSort.key || next.sort.direction !== defaultSort.direction) {
                params.set("sort", `${next.sort.key}:${next.sort.direction}`);
            }
            if (next.page > 1) {
                params.set("page", String(next.page));
            }
            const search = params.toString();
            history.replace({ pathname: location.pathname, search: search ? `?${search}` : "" });
        },
        [state, history, location.pathname],
    );

    return { ...state, pageSize, setPageSize, update };
}
