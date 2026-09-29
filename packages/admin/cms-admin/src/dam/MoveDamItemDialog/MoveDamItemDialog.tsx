import { useApolloClient, useQuery } from "@apollo/client";
import type { FetchResult } from "@apollo/client/link/core";
import { Button, SaveButton } from "@dextinity/admin";
import { Move, Reset } from "@dextinity/admin-icons";
import {
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useCallback } from "react";
import { FormattedMessage } from "react-intl";

import type { TextMatch } from "../../common/MarkedMatches";
import { SearchInput } from "../../common/SearchInput";
import { useDamScope } from "../config/useDamScope";
import {
    type GQLMoveDamFilesMutation,
    type GQLMoveDamFilesMutationVariables,
    type GQLMoveDamFoldersMutation,
    type GQLMoveDamFoldersMutationVariables,
    moveDamFilesMutation,
    moveDamFoldersMutation,
} from "../DataGrid/FolderDataGrid";
import { clearDamItemCache } from "../helpers/clearDamItemCache";
import { allFoldersQuery, ChooseFolder, type GQLAllFoldersWithoutFiltersQuery, type GQLAllFoldersWithoutFiltersQueryVariables } from "./ChooseFolder";
import { useFolderTree } from "./useFolderTree";
import { useFolderTreeSearch } from "./useFolderTreeSearch";

const FixedHeightDialog = styled(Dialog)`
    & .MuiDialog-paper {
        height: 80vh;
    }
`;

export type FolderSearchMatch = TextMatch & { folder: { id: string } };

interface MoveDamItemDialogProps {
    damItemsToMove: Array<{ id: string; type: "file" | "folder" }>;
    setMoving?: (moving: boolean) => void;
    handleHasErrors?: (hasErrors: boolean) => void;
    open: boolean;
    onClose: () => void;
    moving?: boolean;
    hasErrors?: boolean;
}

const MoveDamItemDialogInner = ({
    open,
    damItemsToMove,
    setMoving,
    handleHasErrors,
    onClose,
    moving = false,
    hasErrors = false,
}: MoveDamItemDialogProps) => {
    const apolloClient = useApolloClient();
    const scope = useDamScope();
    const { data, loading } = useQuery<GQLAllFoldersWithoutFiltersQuery, GQLAllFoldersWithoutFiltersQueryVariables>(allFoldersQuery, {
        fetchPolicy: "cache-and-network",
        variables: {
            scope,
        },
    });

    const {
        tree: folderTree,
        foldersToRender,
        setExpandedIds,
        toggleExpand,
        selectedId,
        setSelectedId,
    } = useFolderTree({ damFoldersFlat: data?.damFoldersFlat });

    const {
        foldersToRenderWithMatches,
        query,
        setQuery,
        currentMatchIndex,
        focusedFolderId,
        totalMatches,
        updateCurrentMatchIndex,
        jumpToNextMatch,
        jumpToPreviousMatch,
    } = useFolderTreeSearch({
        folderTree,
        foldersToRender,
        setExpandedIds,
    });

    const moveSelected = useCallback(async () => {
        if (selectedId === undefined) {
            return;
        }

        setMoving?.(true);

        const fileIds = damItemsToMove.filter((item) => item.type === "file").map((item) => item.id);
        const folderIds = damItemsToMove.filter((item) => item.type === "folder").map((item) => item.id);

        const mutations: Array<Promise<FetchResult>> = [];

        if (fileIds.length > 0) {
            mutations.push(
                apolloClient.mutate<GQLMoveDamFilesMutation, GQLMoveDamFilesMutationVariables>({
                    mutation: moveDamFilesMutation,
                    variables: {
                        fileIds,
                        targetFolderId: selectedId,
                    },
                    errorPolicy: "all",
                }),
            );
        }

        if (folderIds.length > 0) {
            mutations.push(
                apolloClient.mutate<GQLMoveDamFoldersMutation, GQLMoveDamFoldersMutationVariables>({
                    mutation: moveDamFoldersMutation,
                    variables: {
                        folderIds,
                        targetFolderId: selectedId,
                        scope,
                    },
                    errorPolicy: "all",
                }),
            );
        }

        const promiseResults = await Promise.all(mutations);
        const hasErrors = promiseResults.filter((result) => result.errors !== undefined).length > 0;

        if (hasErrors) {
            handleHasErrors?.(hasErrors);
        } else {
            clearDamItemCache(apolloClient.cache);
        }

        setMoving?.(false);
    }, [apolloClient, damItemsToMove, handleHasErrors, scope, selectedId, setMoving]);

    const handleClose = () => {
        setSelectedId(undefined);
        setExpandedIds(new Set());
        setQuery("");
        onClose();
    };

    return (
        <FixedHeightDialog
            open={open}
            onClose={() => {
                handleClose();
            }}
            fullWidth
            maxWidth="lg"
        >
            <DialogTitle>
                <FormattedMessage id="dextinity.dam.moveDamItemDialog.selectTargetFolder" defaultMessage="Select target folder" />
            </DialogTitle>
            <DialogContent sx={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div
                    style={{
                        width: "100%",
                        marginBottom: "20px",
                    }}
                >
                    <SearchInput
                        autoFocus={true}
                        query={query}
                        onQueryChange={(newQuery) => {
                            setQuery((prevQuery) => {
                                if (prevQuery === "") {
                                    updateCurrentMatchIndex(0);
                                } else if (newQuery === "") {
                                    updateCurrentMatchIndex(undefined);
                                }

                                return newQuery;
                            });
                        }}
                        totalMatches={totalMatches ?? 0}
                        currentMatch={currentMatchIndex}
                        jumpToNextMatch={jumpToNextMatch}
                        jumpToPreviousMatch={jumpToPreviousMatch}
                    />
                </div>
                <div style={{ flexGrow: 1 }}>
                    <ChooseFolder
                        folderTree={folderTree}
                        foldersToRenderWithMatches={foldersToRenderWithMatches}
                        loading={loading}
                        toggleExpand={toggleExpand}
                        selectedId={selectedId}
                        onFolderClick={(id: string | null) => {
                            setSelectedId(id);
                        }}
                        focusedFolderId={focusedFolderId}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="textDark"
                    startIcon={<Reset />}
                    onClick={() => {
                        setSelectedId(undefined);
                    }}
                    disabled={selectedId === undefined}
                >
                    <FormattedMessage id="dextinity.dam.moveDamItemDialog.startOver" defaultMessage="Start over" />
                </Button>
                <SaveButton
                    startIcon={<Move />}
                    onClick={async () => {
                        await moveSelected();
                        handleClose();
                    }}
                    disabled={selectedId === undefined}
                    loading={moving}
                    hasErrors={hasErrors}
                >
                    <FormattedMessage
                        id="dextinity.dam.moveDamItemDialog.moveItems"
                        defaultMessage="Move {num, plural, one {item} other {items}}"
                        values={{
                            num: damItemsToMove.length,
                        }}
                    />
                </SaveButton>
            </DialogActions>
        </FixedHeightDialog>
    );
};

export const MoveDamItemDialog = (props: MoveDamItemDialogProps) => {
    if (!props.open) {
        return null;
    }

    return <MoveDamItemDialogInner {...props} />;
};
