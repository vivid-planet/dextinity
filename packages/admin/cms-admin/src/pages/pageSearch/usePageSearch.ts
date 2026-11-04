import { gql } from "@apollo/client";
import escapeRegExp from "lodash.escaperegexp";
import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { TextMatch } from "../../common/MarkedMatches";
import type { PageTreePage } from "../pageTree/usePageTree";
import type { GQLPageSearchFragment } from "./usePageSearch.generated";

export type PageSearchMatch = TextMatch & { page: { id: string; ancestorIds: string[] }; where: "name" | "path" };

export const pageSearchFragment = gql`
    fragment PageSearch on PageTreeNode {
        id
        name
        path
    }
`;

export interface PageSearchApi {
    pagesToRenderWithMatches: PageTreePage[];
    query: string;
    setQuery: Dispatch<SetStateAction<string>>;
    currentMatch?: number;
    totalMatches?: number;
    jumpToNextMatch?: () => void;
    jumpToPreviousMatch?: () => void;
}

interface UsePageSearchOptions {
    tree: Map<string, GQLPageSearchFragment[]>;
    pagesToRender: PageTreePage[];
    siteUrl: string;
    setExpandedIds: Dispatch<SetStateAction<string[]>>;
    onUpdateCurrentMatch: (pageId: string, pages: PageTreePage[]) => void;
}

const usePageSearch = ({ tree, siteUrl, setExpandedIds, onUpdateCurrentMatch, pagesToRender }: UsePageSearchOptions): PageSearchApi => {
    const [matches, setMatches] = useState<PageSearchMatch[] | null>(null);
    const [currentMatchIndex, setCurrentMatchIndex] = useState<number | null>(null);
    const [query, setQuery] = useState("");

    // Page id of a match that should be scrolled to once its tree row is rendered. Scrolling has to be deferred
    // because navigating to a match may first need to re-expand collapsed ancestors (e.g. after "Collapse all").
    const pageIdToScrollTo = useRef<string | null>(null);

    let domainHost: string | undefined;

    try {
        domainHost = new URL(siteUrl).host;
    } catch (error) {
        console.error("Invalid siteUrl provided:", siteUrl, error);
        domainHost = undefined;
    }

    const inorderPages = useMemo(() => {
        const buildPagesForParent = (parentId = "root", ancestorIds: string[] = []) => {
            const returnValue: Array<{ id: string; parentId: string | null; name: string; ancestorIds: string[]; path: string }> = [];

            const pagesForParent = tree.get(parentId) || [];

            pagesForParent.forEach((page) => {
                returnValue.push({
                    id: page.id,
                    name: page.name,
                    parentId,
                    ancestorIds,
                    path: page.path,
                });

                const hasChildren = tree.has(page.id);

                if (hasChildren) {
                    returnValue.push(...buildPagesForParent(page.id, [...ancestorIds, page.id]));
                }
            });

            return returnValue;
        };

        return buildPagesForParent();
    }, [tree]);

    const expandTreeForMatches = useCallback(
        (matches: PageSearchMatch[]) => {
            setExpandedIds((previousExpandedIds) => {
                const expandedIds = [...previousExpandedIds];

                matches.forEach((match) => {
                    expandedIds.push(...match.page.ancestorIds.filter((ancestorId) => !expandedIds.includes(ancestorId)));
                });

                return expandedIds;
            });
        },
        [setExpandedIds],
    );

    useEffect(() => {
        if (!query) {
            setMatches(null);
            setCurrentMatchIndex(null);
            return;
        }

        const matches: PageSearchMatch[] = [];

        try {
            const url = new URL(query);

            if (domainHost && !url.host.includes(domainHost)) {
                return;
            }

            const pageExactMatch = inorderPages.find((page) => page.path === url.pathname);

            if (pageExactMatch) {
                const { id, name, ancestorIds } = pageExactMatch;
                matches.push({ page: { id, ancestorIds }, start: 0, end: name.length - 1, focused: true, where: "name" });
            }
        } catch {
            const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");

            inorderPages.forEach((page) => {
                let match;

                while ((match = regex.exec(page.path)) !== null) {
                    const { id, ancestorIds } = page;
                    const where = "path";
                    matches.push({
                        page: { id, ancestorIds },
                        start: match.index,
                        end: match.index + query.length - 1,
                        focused: matches.length === 0,
                        where,
                    });
                }
                regex.lastIndex = 0;

                while ((match = regex.exec(page.name)) !== null) {
                    const { id, ancestorIds } = page;
                    const where = "name";
                    matches.push({
                        page: { id, ancestorIds },
                        start: match.index,
                        end: match.index + query.length - 1,
                        focused: matches.length === 0,
                        where,
                    });
                }
            });
        }

        setMatches(matches);
        setCurrentMatchIndex(0);

        expandTreeForMatches(matches);
    }, [query, inorderPages, expandTreeForMatches, domainHost]);

    const pagesToRenderWithMatches = useMemo(
        () => pagesToRender.map((c) => ({ ...c, matches: matches?.filter((match) => match.page.id === c.id) ?? [] })),
        [matches, pagesToRender],
    );

    useEffect(() => {
        const pageId = pageIdToScrollTo.current;
        if (pageId === null) {
            return;
        }

        if (pagesToRenderWithMatches.some((page) => page.id === pageId)) {
            onUpdateCurrentMatch(pageId, pagesToRenderWithMatches);
            pageIdToScrollTo.current = null;
        }
    }, [pagesToRenderWithMatches, currentMatchIndex, onUpdateCurrentMatch]);

    const pageSearchPartialApi = useMemo(() => {
        if (matches === null || currentMatchIndex === null) {
            return {};
        }

        if (matches.length === 0) {
            return { currentMatch: 0, totalMatches: 0 };
        }

        const jumpToNextMatch = () => {
            updateCurrentMatch(currentMatchIndex === matches.length - 1 ? 0 : currentMatchIndex + 1);
        };

        const jumpToPreviousMatch = () => {
            updateCurrentMatch(currentMatchIndex === 0 ? matches.length - 1 : currentMatchIndex - 1);
        };

        const updateCurrentMatch = (nextCurrentMatchIndex: number) => {
            const nextMatch = matches[nextCurrentMatchIndex];
            setMatches(matches.map((match, index) => ({ ...match, focused: index === nextCurrentMatchIndex })));
            setCurrentMatchIndex(nextCurrentMatchIndex);
            // Re-expand the match's ancestors in case they were collapsed (e.g. via "Collapse all"), then scroll to it
            // once the row is rendered.
            expandTreeForMatches([nextMatch]);
            pageIdToScrollTo.current = nextMatch.page.id;
        };

        return {
            currentMatch: currentMatchIndex,
            totalMatches: matches.length,
            jumpToNextMatch,
            jumpToPreviousMatch,
        };
    }, [matches, currentMatchIndex, expandTreeForMatches]);

    return { query, setQuery, pagesToRenderWithMatches, ...pageSearchPartialApi };
};

export { usePageSearch };
