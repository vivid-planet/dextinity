import { useMemo, useState } from "react";

import type { SearchResult } from "./types";
import { useFullTextSearch } from "./useFullTextSearch";
import { useListKeyboardNavigation } from "./useListKeyboardNavigation";
import { useRecentSearches } from "./useRecentSearches";

export type PanelItem =
    | { kind: "result"; key: string; result: SearchResult }
    | { kind: "recentResult"; key: string; result: SearchResult }
    | { kind: "recentTerm"; key: string; term: string }
    | { kind: "showAll"; key: string };

interface Options {
    onSelectResult: (result: SearchResult) => void;
    onClose: () => void;
    initialLimit?: number;
}

export function useSearchPanel({ onSelectResult, onClose, initialLimit = 8 }: Options) {
    const [search, setSearch] = useState("");
    const recentSearches = useRecentSearches();
    const fullTextSearch = useFullTextSearch({ search, initialLimit });

    const isSearchEmpty = search.trim().length === 0;
    const hasMoreResults = fullTextSearch.totalCount > fullTextSearch.results.length;

    const items = useMemo<PanelItem[]>(() => {
        if (isSearchEmpty) {
            return [
                ...recentSearches.terms.map((term): PanelItem => ({ kind: "recentTerm", key: `term:${term}`, term })),
                ...recentSearches.results.map((result): PanelItem => ({
                    kind: "recentResult",
                    key: `recent:${result.entityName}:${result.id}`,
                    result,
                })),
            ];
        }
        const resultItems = fullTextSearch.results.map((result): PanelItem => ({
            kind: "result",
            key: `result:${result.entityName}:${result.id}`,
            result,
        }));
        return hasMoreResults ? [...resultItems, { kind: "showAll", key: "showAll" }] : resultItems;
    }, [isSearchEmpty, recentSearches.terms, recentSearches.results, fullTextSearch.results, hasMoreResults]);

    const selectItem = (item: PanelItem) => {
        if (item.kind === "recentTerm") {
            setSearch(item.term);
        } else if (item.kind === "showAll") {
            fullTextSearch.showAll();
        } else {
            recentSearches.addTerm(search);
            recentSearches.addResult(item.result);
            onSelectResult(item.result);
            setSearch("");
            onClose();
        }
    };

    const keyboardNavigation = useListKeyboardNavigation({
        items,
        onSelect: selectItem,
        onEscape: () => {
            if (isSearchEmpty) {
                onClose();
            } else {
                setSearch("");
            }
        },
    });

    return {
        search,
        setSearch,
        isSearchEmpty,
        items,
        selectItem,
        recentSearches,
        ...fullTextSearch,
        hasMoreResults,
        ...keyboardNavigation,
    };
}

export function groupItemsByEntity(items: PanelItem[]) {
    const groups = new Map<string, Array<{ item: PanelItem; index: number }>>();
    items.forEach((item, index) => {
        const groupKey = item.kind === "result" ? item.result.entityName : item.kind;
        const group = groups.get(groupKey) ?? [];
        group.push({ item, index });
        groups.set(groupKey, group);
    });
    return [...groups.entries()].map(([groupKey, entries]) => ({ groupKey, entries }));
}
