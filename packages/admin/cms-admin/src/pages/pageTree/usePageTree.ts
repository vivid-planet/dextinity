import { gql } from "@apollo/client";
import { useStoredState } from "@dextinity/admin";
import { type Dispatch, type SetStateAction, useCallback, useMemo, useState } from "react";

import type { PageSearchMatch } from "../pageSearch/usePageSearch";
import { arrayToTreeMap, subTreeFromNodes, type TreeMap } from "./treemap/TreeMapUtils";
import type { GQLPageTreePageFragment } from "./usePageTree.generated";

export type { GQLPageTreePageFragment } from "./usePageTree.generated";

export const pageTreePageFragment = gql`
    fragment PageTreePage on PageTreeNode {
        id
        name
        parentId
        documentType
        pos
        path
        category
        hideInMenu
        visibility
        slug
    }
`;

interface PageTreePageAdditionalFieldsForUi {
    selected: boolean;
    expanded: boolean | null;
    ancestorIds: Array<string>;
    level: number;
    matches: PageSearchMatch[];
}
export type PageTreePage<AdditionalFields = object> = GQLPageTreePageFragment & AdditionalFields & PageTreePageAdditionalFieldsForUi;

interface UsePageTreeProps {
    pages: GQLPageTreePageFragment[];
    storageKeyExpandedIds?: string | false;
    filter?: (page: GQLPageTreePageFragment) => boolean;
}

export type PageTreeSelectionState = "nothing_selected" | "some_selected" | "all_selected";
interface UsePageTreeApi {
    pagesToRender: PageTreePage[];
    tree: TreeMap<GQLPageTreePageFragment>;
    selectedTree: TreeMap<GQLPageTreePageFragment>;
    setExpandedIds: Dispatch<SetStateAction<string[]>>;
    expandedIds: string[];
    toggleExpand: (pageId: string) => void;
    onSelectChanged: (pageId: string, value: boolean) => void;
    selectState: PageTreeSelectionState;
    setSelectedIds: Dispatch<SetStateAction<string[]>>;
    expandPage: (pageId: string) => void; // includes all its parents
}

export function usePageTree({
    pages: passedPages,
    storageKeyExpandedIds = "pageTreeExpandedIds",
    filter = () => true,
}: UsePageTreeProps): UsePageTreeApi {
    const [expandedIds, setExpandedIds] = useStoredState<string[]>(storageKeyExpandedIds, [], window.sessionStorage);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const pages = useMemo(() => passedPages.filter(filter), [passedPages, filter]);

    const { children: tree, parents } = useMemo(() => {
        const sortedPages = [...pages].sort((pageA, pageB) => pageA.pos - pageB.pos);
        const tree = arrayToTreeMap(sortedPages);
        const parentsMap = new Map<string, string | null>();

        [...pages]
            .sort((pageA, pageB) => pageA.pos - pageB.pos)
            .forEach((page) => {
                parentsMap.set(page.id, page.parentId);
            });
        return { children: tree, parents: parentsMap };
    }, [pages]);

    const selectedTree = useMemo(() => {
        return subTreeFromNodes(selectedIds, tree);
    }, [selectedIds, tree]);

    const pagesToRender = useMemo(() => {
        const buildPagesForParent = (parentId = "root", level = 0, ancestorIds: string[] = []) => {
            const pages = tree.get(parentId) || [];
            const ret: PageTreePage[] = [];
            pages.forEach((pageData) => {
                const hasChildren = tree.has(pageData.id);

                const page: PageTreePage = {
                    ...pageData,
                    selected: selectedIds.includes(pageData.id),
                    expanded: hasChildren ? expandedIds.includes(pageData.id) : null,
                    ancestorIds,
                    level,
                    matches: [],
                };

                ret.push(page);

                if (page.expanded) {
                    ret.push(...buildPagesForParent(page.id, level + 1, [...ancestorIds, page.id]));
                }
            });

            return ret;
        };

        return buildPagesForParent();
    }, [tree, selectedIds, expandedIds]);

    const toggleExpand = useCallback(
        (pageId: string) => {
            setExpandedIds((expandedIds) => (expandedIds.includes(pageId) ? expandedIds.filter((id) => id !== pageId) : [...expandedIds, pageId]));
        },
        [setExpandedIds],
    );

    const onSelectChanged = useCallback(
        (pageId: string, selected: boolean) => {
            const pagesToModify = [...resolveFlatChildrenForPage(pageId, passedPages), ...passedPages.filter((page) => page.id === pageId)];
            let tempSelectedIds = [...selectedIds];

            pagesToModify.forEach((page) => {
                if (selected) {
                    // add to list
                    if (!tempSelectedIds.includes(page.id)) {
                        tempSelectedIds = [...tempSelectedIds, page.id];
                    }
                } else {
                    //remove from list
                    if (tempSelectedIds.includes(page.id)) {
                        tempSelectedIds = tempSelectedIds.filter((id) => id !== page.id);
                    }
                }
            });

            setSelectedIds(tempSelectedIds);
        },
        [selectedIds, passedPages, setSelectedIds],
    );

    // Expands page with all its parent pages
    const expandPage = useCallback(
        (pageId: string) => {
            function selfWithParents(pageId: string): string[] {
                const parentId = parents.get(pageId);
                return parentId ? [pageId, ...selfWithParents(parentId)] : [pageId];
            }
            setExpandedIds((expandedIds) => {
                const addedPageIds: string[] = selfWithParents(pageId);

                // Terminate a possible render-loop by not triggering an update
                // when all expected ids are already expanded
                const alreadyExpanded = addedPageIds.every((c) => expandedIds.includes(c));
                if (alreadyExpanded) {
                    return expandedIds; // no update
                } else {
                    return [...expandedIds, ...addedPageIds].filter((value, index, self) => self.indexOf(value) === index); // remove duplicates
                }
            });
        },
        [setExpandedIds, parents],
    );

    return {
        pagesToRender,
        tree,
        /* expanded */
        setExpandedIds,
        toggleExpand,
        expandPage,
        expandedIds,

        /* selected */
        selectedTree,
        onSelectChanged,
        setSelectedIds,
        selectState: resolveSelectedState(selectedIds, pagesToRender),
    };
}

const resolveSelectedState = (checkedIds: string[], flatPagesList: GQLPageTreePageFragment[]): PageTreeSelectionState => {
    const checkedCount = flatPagesList.filter((page) => checkedIds.includes(page.id)).length;
    const pagesCount = flatPagesList.length;
    if (checkedCount > 0 && checkedCount >= pagesCount) {
        return "all_selected";
    } else if (checkedCount > 0) {
        return "some_selected";
    } else {
        return "nothing_selected";
    }
};

const resolveFlatChildrenForPage = (pageId: string, flatPagesList: GQLPageTreePageFragment[]): GQLPageTreePageFragment[] => {
    return flatPagesList.reduce<GQLPageTreePageFragment[]>((acc, page) => {
        if (page.parentId === pageId) {
            return [...acc, page, ...resolveFlatChildrenForPage(page.id, flatPagesList)];
        }
        return acc;
    }, []);
};
