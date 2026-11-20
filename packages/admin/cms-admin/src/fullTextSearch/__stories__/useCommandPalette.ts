import type { SvgIconProps } from "@mui/material";
import { type ComponentType, type KeyboardEvent, type ReactNode, useMemo, useState } from "react";

import type { SearchResult } from "./shared/types";
import { useFullTextSearch } from "./shared/useFullTextSearch";
import { useListKeyboardNavigation } from "./shared/useListKeyboardNavigation";
import { useRecentSearches } from "./shared/useRecentSearches";

export interface QuickAction {
    id: string;
    label: ReactNode;
    icon: ComponentType<SvgIconProps>;
}

export type PaletteItem =
    | { kind: "result"; key: string; result: SearchResult }
    | { kind: "recentResult"; key: string; result: SearchResult }
    | { kind: "quickAction"; key: string; action: QuickAction };

export const allEntitiesFilter = "all";

interface Options {
    quickActions: QuickAction[];
    onSelectResult: (result: SearchResult) => void;
    onQuickAction: (action: QuickAction) => void;
    onClose: () => void;
    enabledEntityNames?: string[];
}

export function useCommandPalette({ quickActions, onSelectResult, onQuickAction, onClose, enabledEntityNames }: Options) {
    const [search, setSearch] = useState("");
    const [entityFilter, setEntityFilter] = useState(allEntitiesFilter);
    const recentSearches = useRecentSearches();
    // A large limit so the type tabs can show counts. With the real API, the counts per type should come from the server.
    const fullTextSearch = useFullTextSearch({ search, limit: 50 });

    const isSearchEmpty = search.trim().length === 0;

    const visibleResults = useMemo(
        () =>
            enabledEntityNames ? fullTextSearch.results.filter((result) => enabledEntityNames.includes(result.entityName)) : fullTextSearch.results,
        [fullTextSearch.results, enabledEntityNames],
    );
    const visibleTotalCount = enabledEntityNames ? visibleResults.length : fullTextSearch.totalCount;

    const entityCounts = useMemo(() => {
        const counts = new Map<string, number>();
        for (const result of visibleResults) {
            counts.set(result.entityName, (counts.get(result.entityName) ?? 0) + 1);
        }
        return [...counts.entries()].map(([entityName, count]) => ({ entityName, count }));
    }, [visibleResults]);

    const activeEntityFilter = entityCounts.some(({ entityName }) => entityName === entityFilter) ? entityFilter : allEntitiesFilter;

    const items = useMemo<PaletteItem[]>(() => {
        if (isSearchEmpty) {
            return [
                ...recentSearches.results.map((result): PaletteItem => ({
                    kind: "recentResult",
                    key: `recent:${result.entityName}:${result.id}`,
                    result,
                })),
                ...quickActions.map((action): PaletteItem => ({ kind: "quickAction", key: `action:${action.id}`, action })),
            ];
        }
        if (fullTextSearch.areResultsStale) {
            return [];
        }
        const groupOrder = entityCounts.map(({ entityName }) => entityName);
        return visibleResults
            .filter((result) => activeEntityFilter === allEntitiesFilter || result.entityName === activeEntityFilter)
            .sort((a, b) => groupOrder.indexOf(a.entityName) - groupOrder.indexOf(b.entityName))
            .map((result): PaletteItem => ({ kind: "result", key: `result:${result.entityName}:${result.id}`, result }));
    }, [isSearchEmpty, recentSearches.results, quickActions, fullTextSearch.areResultsStale, visibleResults, activeEntityFilter, entityCounts]);

    const selectItem = (item: PaletteItem) => {
        if (item.kind === "quickAction") {
            onQuickAction(item.action);
        } else {
            recentSearches.addTerm(search);
            recentSearches.addResult(item.result);
            onSelectResult(item.result);
        }
        onClose();
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

    const filterKeys = [allEntitiesFilter, ...entityCounts.map(({ entityName }) => entityName)];

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Tab" && !isSearchEmpty && filterKeys.length > 1) {
            event.preventDefault();
            const direction = event.shiftKey ? -1 : 1;
            const currentIndex = filterKeys.indexOf(activeEntityFilter);
            setEntityFilter(filterKeys[(currentIndex + direction + filterKeys.length) % filterKeys.length]);
            return;
        }
        keyboardNavigation.handleKeyDown(event);
    };

    return {
        search,
        setSearch,
        isSearchEmpty,
        items,
        selectItem,
        recentSearches,
        entityCounts,
        entityFilter: activeEntityFilter,
        setEntityFilter,
        ...fullTextSearch,
        visibleResults,
        visibleTotalCount,
        ...keyboardNavigation,
        handleKeyDown,
    };
}
