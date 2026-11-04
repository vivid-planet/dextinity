import escapeRegExp from "lodash.escaperegexp";
import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useState } from "react";

import { traversePreOrder } from "../../pages/pageTree/treemap/TreeMapUtils";
import type { FolderSearchMatch } from "./MoveDamItemDialog";
import type { FolderTreeMap, FolderWithRenderInformation } from "./useFolderTree";

const findMatchesAndExpandedIdsBasedOnSearchQuery = (
    searchQuery: string,
    { folderTree, expandedIds }: { folderTree: FolderTreeMap; expandedIds: Set<string> },
) => {
    const internalExpandedIds = new Set(expandedIds);
    const newMatches: FolderSearchMatch[] = [];
    const regex = new RegExp(`(${escapeRegExp(searchQuery)})`, "gi");

    traversePreOrder(folderTree, (element) => {
        let hasMatch = false;

        let match: RegExpExecArray | null;
        while ((match = regex.exec(element.name)) !== null) {
            hasMatch = true;

            newMatches.push({
                start: match.index,
                end: match.index + searchQuery.length - 1,
                focused: newMatches.length === 0,
                folder: {
                    id: element.id,
                },
            });
        }

        if (hasMatch) {
            internalExpandedIds.add(element.id);
            for (const ancestorId of element.mpath) {
                internalExpandedIds.add(ancestorId);
            }
        }
    });

    return { matches: newMatches, expandedIds: internalExpandedIds };
};

export interface FolderWithMatches extends FolderWithRenderInformation {
    matches: FolderSearchMatch[] | null;
}

interface UseFolderTreeSearchProps {
    folderTree: FolderTreeMap;
    foldersToRender: Array<FolderWithRenderInformation>;
    setExpandedIds: Dispatch<SetStateAction<Set<string>>>;
}
interface UseFolderTreeSearchApi {
    foldersToRenderWithMatches: FolderWithMatches[];
    query: string;
    setQuery: Dispatch<SetStateAction<string>>;
    currentMatchIndex?: number;
    focusedFolderId?: string;
    totalMatches?: number;
    updateCurrentMatchIndex: (index: number | undefined) => void;
    jumpToNextMatch?: () => void;
    jumpToPreviousMatch?: () => void;
}

export const useFolderTreeSearch = ({ folderTree, foldersToRender, setExpandedIds }: UseFolderTreeSearchProps): UseFolderTreeSearchApi => {
    const [query, setQuery] = useState("");
    const [matches, setMatches] = useState<FolderSearchMatch[] | null>(null);
    const [currentMatchIndex, setCurrentMatchIndex] = useState<number | undefined>(undefined);

    const updateCurrentMatchIndex = useCallback(
        (nextCurrentMatchIndex: number | undefined) => {
            if (matches === null) {
                return;
            }

            setMatches(matches.map((match, index) => ({ ...match, focused: index === nextCurrentMatchIndex })));
            setCurrentMatchIndex(nextCurrentMatchIndex);
        },
        [matches],
    );

    const jumpToNextMatch = useCallback(() => {
        if (matches === null || currentMatchIndex === undefined) {
            return;
        }

        updateCurrentMatchIndex(currentMatchIndex === matches.length - 1 ? 0 : currentMatchIndex + 1);
    }, [currentMatchIndex, matches, updateCurrentMatchIndex]);

    const jumpToPreviousMatch = useCallback(() => {
        if (matches === null || currentMatchIndex === undefined) {
            return;
        }

        updateCurrentMatchIndex(currentMatchIndex === 0 ? matches.length - 1 : currentMatchIndex - 1);
    }, [currentMatchIndex, matches, updateCurrentMatchIndex]);

    useEffect(() => {
        if (query === undefined || query.length === 0) {
            setMatches([]);
            return;
        }

        setExpandedIds((prevExpandedIds) => {
            const { matches: newMatches, expandedIds: newExpandedIds } = findMatchesAndExpandedIdsBasedOnSearchQuery(query, {
                folderTree,
                expandedIds: prevExpandedIds,
            });

            setMatches(newMatches);

            return newExpandedIds;
        });

        // This should only be executed if the searchQuery changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    const foldersToRenderWithMatches = useMemo(
        () => foldersToRender.map((folder) => ({ ...folder, matches: matches?.filter((match) => match.folder.id === folder.id) ?? [] })),
        [matches, foldersToRender],
    );

    return {
        foldersToRenderWithMatches,
        query,
        setQuery,
        currentMatchIndex,
        focusedFolderId: currentMatchIndex === undefined ? undefined : matches?.[currentMatchIndex]?.folder?.id,
        totalMatches: matches?.length,
        updateCurrentMatchIndex,
        jumpToNextMatch,
        jumpToPreviousMatch,
    };
};
