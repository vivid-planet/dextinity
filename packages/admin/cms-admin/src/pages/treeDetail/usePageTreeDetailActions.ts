import { gql, useApolloClient } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import type { TreeViewMove, UndoableAction } from "@dextinity/ui";
import { useIntl } from "react-intl";

import type { GQLPageTreeNodeVisibility } from "../../graphql.generated";
import { updatePageVisibilityMutation } from "../pageTree/PageVisibility";
import type { GQLUpdatePageVisibilityMutation, GQLUpdatePageVisibilityMutationVariables } from "../pageTree/PageVisibility.generated";
import type { GQLPageTreePageFragment } from "../pageTree/usePageTree";
import { getAncestorIds, getSubtree, getTopmostPageIds, isHomePage, type PageTreeStructure } from "./pageTreeStructure";
import type {
    GQLPageTreeDetailMovePagesMutation,
    GQLPageTreeDetailMovePagesMutationVariables,
    GQLPageTreeDetailResetSlugMutation,
    GQLPageTreeDetailResetSlugMutationVariables,
} from "./usePageTreeDetailActions.generated";

const movePagesMutation = gql`
    mutation PageTreeDetailMovePages($ids: [ID!]!, $input: MovePageTreeNodesByNeighbourInput!) {
        movePageTreeNodesByNeighbour(ids: $ids, input: $input) {
            id
            parentId
            pos
            slug
            path
        }
    }
`;

const resetSlugMutation = gql`
    mutation PageTreeDetailResetSlug($id: ID!, $slug: String!) {
        updatePageTreeNodeSlug(id: $id, slug: $slug) {
            id
            slug
            path
        }
    }
`;

interface NeighbourPosition {
    parentId: string | null;
    afterId: string | null;
    beforeId: string | null;
}

interface UsePageTreeDetailActionsOptions {
    structure: PageTreeStructure;
    perform: (action: UndoableAction) => void;
    block: (reason: string) => void;
}

export function canChangeVisibility(page: GQLPageTreePageFragment, visibility: GQLPageTreeNodeVisibility) {
    return page.visibility !== visibility && (visibility === "Published" || !isHomePage(page));
}

/**
 * Changes the visibility of pages and moves them, each undoable through a toast.
 */
export function usePageTreeDetailActions({ structure, perform, block }: UsePageTreeDetailActionsOptions) {
    const client = useApolloClient();
    const intl = useIntl();

    const visibilityLabel = (visibility: GQLPageTreeNodeVisibility) =>
        intl.formatMessage(
            {
                id: "dextinity.pageTreeDetail.visibilityChanged",
                defaultMessage: "{visibility, select, Published {published} Unpublished {unpublished} other {archived}}",
            },
            { visibility },
        );

    const updateVisibility = (page: GQLPageTreePageFragment, visibility: GQLPageTreeNodeVisibility) =>
        client.mutate<GQLUpdatePageVisibilityMutation, GQLUpdatePageVisibilityMutationVariables>({
            mutation: updatePageVisibilityMutation,
            variables: { id: page.id, input: { visibility } },
            context: LocalErrorScopeApolloContext,
            optimisticResponse: {
                updatePageTreeNodeVisibility: { __typename: "PageTreeNode", id: page.id, visibility, path: page.path, slug: page.slug },
            },
        });

    const changeVisibility = (pageIds: string[], visibility: GQLPageTreeNodeVisibility) => {
        const selectedPages = getTopmostPageIds(structure, pageIds).flatMap((id) => {
            const page = structure.pagesById.get(id);
            if (page == null) {
                return [];
            }
            return visibility === "Archived" ? getSubtree(structure, page) : [page];
        });
        const pagesToChange = [...new Map(selectedPages.map((page) => [page.id, page])).values()].filter((page) =>
            canChangeVisibility(page, visibility),
        );
        if (pagesToChange.length === 0) {
            return;
        }

        const runAll = async (getVisibility: (page: GQLPageTreePageFragment) => GQLPageTreeNodeVisibility) => {
            await Promise.all(pagesToChange.map((page) => updateVisibility(page, getVisibility(page)))).catch(() =>
                block(intl.formatMessage({ id: "dextinity.pageTreeDetail.visibilityFailed", defaultMessage: "Visibility could not be changed" })),
            );
        };

        perform({
            run: () => void runAll(() => visibility),
            undo: () => void runAll((page) => page.visibility),
            message: intl.formatMessage(
                {
                    id: "dextinity.pageTreeDetail.visibilityChangedMessage",
                    defaultMessage: "{count, plural, one {“{name}”} other {# pages}} {visibility}",
                },
                { count: pagesToChange.length, name: pagesToChange[0].name, visibility: visibilityLabel(visibility) },
            ),
            undoneMessage: intl.formatMessage({ id: "dextinity.pageTreeDetail.visibilityRestored", defaultMessage: "Visibility restored" }),
        });
    };

    const getIdsToMove = (move: TreeViewMove, checkedIds: string[]) => {
        if (!checkedIds.includes(move.id)) {
            return [move.id];
        }
        return getTopmostPageIds(structure, checkedIds);
    };

    const canMove = (move: TreeViewMove, checkedIds: string[]) => {
        const target = structure.pagesById.get(move.targetId);
        if (target == null) {
            return false;
        }
        const targetAndAncestors = [target.id, ...getAncestorIds(structure, target.id)];
        return getIdsToMove(move, checkedIds).every((id) => {
            const page = structure.pagesById.get(id);
            if (page == null || targetAndAncestors.includes(id)) {
                return false;
            }
            return !(isHomePage(page) && move.position === "inside");
        });
    };

    const getTargetPosition = (move: TreeViewMove, idsToMove: string[]): NeighbourPosition => {
        const target = structure.pagesById.get(move.targetId);
        if (target == null || move.position !== "inside") {
            return {
                parentId: target?.parentId ?? null,
                afterId: move.position === "after" ? move.targetId : null,
                beforeId: move.position === "before" ? move.targetId : null,
            };
        }
        const children = (structure.childrenByParentId.get(target.id) ?? []).filter((child) => !idsToMove.includes(child.id));
        return { parentId: target.id, afterId: children[children.length - 1]?.id ?? null, beforeId: null };
    };

    /** Where a page was before the move, relative to siblings that are not moved or are already back in place. */
    const getOriginalPosition = (page: GQLPageTreePageFragment, pagesNotInPlace: Set<string>): NeighbourPosition => {
        const siblings = structure.childrenByParentId.get(page.parentId) ?? [];
        const index = siblings.findIndex((sibling) => sibling.id === page.id);
        const previous = siblings
            .slice(0, index)
            .reverse()
            .find((sibling) => !pagesNotInPlace.has(sibling.id));
        const next = siblings.slice(index + 1).find((sibling) => !pagesNotInPlace.has(sibling.id));
        return { parentId: page.parentId, afterId: previous?.id ?? null, beforeId: previous == null ? (next?.id ?? null) : null };
    };

    const movePages = (move: TreeViewMove, checkedIds: string[]) => {
        if (!canMove(move, checkedIds)) {
            return;
        }
        const idsToMove = getIdsToMove(move, checkedIds);
        const pagesToMove = idsToMove.flatMap((id) => structure.pagesById.get(id) ?? []).sort((pageA, pageB) => pageA.pos - pageB.pos);
        const targetPosition = getTargetPosition(move, idsToMove);

        const moveTo = (ids: string[], input: NeighbourPosition) =>
            client.mutate<GQLPageTreeDetailMovePagesMutation, GQLPageTreeDetailMovePagesMutationVariables>({
                mutation: movePagesMutation,
                variables: { ids, input },
                context: LocalErrorScopeApolloContext,
            });

        const run = async () => {
            try {
                await moveTo(
                    pagesToMove.map((page) => page.id),
                    targetPosition,
                );
            } catch {
                block(intl.formatMessage({ id: "dextinity.pageTreeDetail.moveFailed", defaultMessage: "The page could not be moved" }));
            }
            await client.refetchQueries({ include: ["Pages"] });
        };

        const undo = async () => {
            const pagesNotInPlace = new Set(idsToMove);
            try {
                for (const page of pagesToMove) {
                    await moveTo([page.id], getOriginalPosition(page, pagesNotInPlace));
                    await client.mutate<GQLPageTreeDetailResetSlugMutation, GQLPageTreeDetailResetSlugMutationVariables>({
                        mutation: resetSlugMutation,
                        variables: { id: page.id, slug: page.slug },
                        context: LocalErrorScopeApolloContext,
                    });
                    pagesNotInPlace.delete(page.id);
                }
            } catch {
                block(intl.formatMessage({ id: "dextinity.pageTreeDetail.moveUndoFailed", defaultMessage: "The move could not be undone" }));
            }
            await client.refetchQueries({ include: ["Pages"] });
        };

        perform({
            run: () => void run(),
            undo: () => void undo(),
            message: intl.formatMessage(
                { id: "dextinity.pageTreeDetail.moved", defaultMessage: "{count, plural, one {“{name}”} other {# pages}} moved" },
                { count: pagesToMove.length, name: pagesToMove[0].name },
            ),
            undoneMessage: intl.formatMessage({ id: "dextinity.pageTreeDetail.moveUndone", defaultMessage: "Move undone" }),
        });
    };

    return { changeVisibility, movePages, canMove };
}
