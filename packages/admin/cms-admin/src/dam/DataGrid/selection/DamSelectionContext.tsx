import { gql, useApolloClient } from "@apollo/client";
import { downloadFile } from "@dextinity/admin";
import { createContext, type Dispatch, type ReactNode, type SetStateAction, useCallback, useContext, useState } from "react";

import { ConfirmDeleteDialog } from "../../FileActions/ConfirmDeleteDialog";
import { clearDamItemCache } from "../../helpers/clearDamItemCache";
import { MoveDamItemDialog } from "../../MoveDamItemDialog/MoveDamItemDialog";
import type { DamItemSelectionMap } from "../FolderDataGrid";
import type {
    GQLArchiveFilesMutation,
    GQLArchiveFilesMutationVariables,
    GQLDamFileDownloadInfoFragment,
    GQLDeleteDamFileMutation,
    GQLDeleteDamFileMutationVariables,
    GQLDeleteDamFolderMutation,
    GQLDeleteDamFolderMutationVariables,
    GQLRestoreFilesMutation,
    GQLRestoreFilesMutationVariables,
} from "./DamSelectionContext.generated";

const damFileDownloadInfoFragment = gql`
    fragment DamFileDownloadInfo on DamFile {
        id
        fileUrl
        name
    }
`;

interface DamSelectionApi {
    selectionMap: DamItemSelectionMap;
    setSelectionMap: (selectionMap: DamItemSelectionMap) => void;

    // delete
    deleteSelected: () => void;
    deleting: boolean;
    hasDeletionErrors: boolean;

    // restore
    restoreSelected: () => void;
    restoring: boolean;
    hasRestoreErrors: boolean;

    // archive
    archiveSelected: () => void;
    archiving: boolean;
    hasArchiveErrors: boolean;

    // move
    moveSelected: () => void;
    moving: boolean;
    hasMoveErrors: boolean;

    // download
    downloadSelected: () => void;
    downloading: boolean;
    hasDownloadErrors: boolean;
}

const DamSelectionContext = createContext<DamSelectionApi>({
    selectionMap: new Map(),
    setSelectionMap: () => {
        throw new Error("Missing DamSelectionContext. Please add a <DamSelectionProvider /> somewhere up in the tree.");
    },

    deleteSelected: () => {
        throw new Error("Missing DamSelectionContext. Please add a <DamSelectionProvider /> somewhere up in the tree.");
    },
    deleting: false,
    hasDeletionErrors: false,

    restoreSelected: () => {
        throw new Error("Missing DamSelectionContext. Please add a <DamSelectionProvider /> somewhere up in the tree.");
    },
    restoring: false,
    hasRestoreErrors: false,

    archiveSelected: () => {
        throw new Error("Missing DamSelectionContext. Please add a <DamSelectionProvider /> somewhere up in the tree.");
    },
    archiving: false,
    hasArchiveErrors: false,

    moveSelected: () => {
        throw new Error("Missing DamSelectionContext. Please add a <DamSelectionProvider /> somewhere up in the tree.");
    },
    moving: false,
    hasMoveErrors: false,

    downloadSelected: () => {
        throw new Error("Missing DamSelectionContext. Please add a <DamSelectionProvider /> somewhere up in the tree.");
    },
    downloading: false,
    hasDownloadErrors: false,
});

export const useDamSelectionApi = () => {
    return useContext(DamSelectionContext);
};

interface DamSelectionProviderProps {
    children?: ReactNode;
    initialSelection?: DamItemSelectionMap;
    onSelectionChange?: (next: DamItemSelectionMap) => void;
}

export const DamSelectionProvider = ({ children, initialSelection, onSelectionChange }: DamSelectionProviderProps) => {
    const apolloClient = useApolloClient();
    const [selectionMap, setSelectionMap] = useState<DamItemSelectionMap>(() => initialSelection ?? new Map());

    const onSelectionMapChange = (newSelectionMap: DamItemSelectionMap) => {
        setSelectionMap(newSelectionMap);
        onSelectionChange?.(newSelectionMap);
    };

    const showError = (setError: Dispatch<SetStateAction<boolean>>) => {
        setError(true);
        setTimeout(() => {
            setError(false);
        }, 3000);
    };

    // delete
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const [deleting, setDeleting] = useState(false);
    const [hasDeletionErrors, setHasDeletionErrors] = useState(false);

    const openDeleteDialog = useCallback(() => {
        setDeleteDialogOpen(true);
    }, []);

    const deleteSelected = useCallback(async () => {
        setDeleting(true);

        const selectedItems = Array.from(selectionMap.entries()).map((item) => {
            return { id: item[0], type: item[1] };
        });

        let errors;
        for (const selectedItem of selectedItems) {
            if (selectedItem.type === "file") {
                const result = await apolloClient.mutate<GQLDeleteDamFileMutation, GQLDeleteDamFileMutationVariables>({
                    mutation: gql`
                        mutation DeleteDamFile($id: ID!) {
                            deleteDamFile(id: $id)
                        }
                    `,
                    variables: { id: selectedItem.id },
                    errorPolicy: "all",
                });

                errors = result.errors;
            } else {
                const result = await apolloClient.mutate<GQLDeleteDamFolderMutation, GQLDeleteDamFolderMutationVariables>({
                    mutation: gql`
                        mutation DeleteDamFolder($id: ID!) {
                            deleteSuccessful: deleteDamFolder(id: $id)
                        }
                    `,
                    variables: { id: selectedItem.id },
                    errorPolicy: "all",
                });

                errors = result.errors;
            }
        }

        if (errors) {
            showError(setHasDeletionErrors);
        } else {
            clearDamItemCache(apolloClient.cache);
        }

        setDeleting(false);
    }, [apolloClient, selectionMap]);

    // restore
    const [restoring, setRestoring] = useState(false);
    const [hasRestoreErrors, setHasRestoreErrors] = useState(false);

    const restoreSelected = useCallback(async () => {
        setRestoring(true);

        const fileIds = Array.from(selectionMap.entries())
            .filter(([, type]) => type === "file")
            .map(([id]) => {
                return id;
            });

        const { errors } = await apolloClient.mutate<GQLRestoreFilesMutation, GQLRestoreFilesMutationVariables>({
            mutation: gql`
                mutation RestoreFiles($ids: [ID!]!) {
                    restoreDamFiles(ids: $ids) {
                        id
                        archived
                    }
                }
            `,
            variables: {
                ids: fileIds,
            },
            errorPolicy: "all",
        });

        if (errors) {
            showError(setHasRestoreErrors);
        } else {
            clearDamItemCache(apolloClient.cache);
        }

        setRestoring(false);
    }, [apolloClient, selectionMap]);

    // archive
    const [archiving, setArchiving] = useState(false);
    const [hasArchiveErrors, setHasArchiveErrors] = useState(false);

    const archiveSelected = useCallback(async () => {
        setArchiving(true);

        const fileIds = Array.from(selectionMap.entries())
            .filter(([, type]) => type === "file")
            .map(([id]) => {
                return id;
            });

        const { errors } = await apolloClient.mutate<GQLArchiveFilesMutation, GQLArchiveFilesMutationVariables>({
            mutation: gql`
                mutation ArchiveFiles($ids: [ID!]!) {
                    archiveDamFiles(ids: $ids) {
                        id
                        archived
                    }
                }
            `,
            variables: {
                ids: fileIds,
            },
            errorPolicy: "all",
        });

        if (errors) {
            showError(setHasArchiveErrors);
        } else {
            clearDamItemCache(apolloClient.cache);
        }

        setArchiving(false);
    }, [apolloClient, selectionMap]);

    // move
    const [moveDialogOpen, setMoveDialogOpen] = useState(false);
    const [moving, setMoving] = useState(false);
    const [hasMoveErrors, setHasMoveErrors] = useState(false);

    const openMoveDialog = useCallback(() => {
        setMoveDialogOpen(true);
    }, []);

    // download
    const [downloading, setDownloading] = useState(false);
    const [hasDownloadErrors, setHasDownloadErrors] = useState(false);

    const downloadSelected = async () => {
        setDownloading(true);

        const fileIds = Array.from(selectionMap.entries())
            .filter(([, type]) => type === "file")
            .map(([id]) => {
                return id;
            });

        for (const id of fileIds) {
            const downloadInfo = apolloClient.cache.readFragment<GQLDamFileDownloadInfoFragment>({
                id: apolloClient.cache.identify({ __typename: "DamFile", id: id }),
                fragment: damFileDownloadInfoFragment,
            });

            if (downloadInfo === null) {
                showError(setHasDownloadErrors);
            } else {
                downloadFile(downloadInfo.fileUrl, downloadInfo.name);
            }
        }

        setDownloading(false);
    };

    return (
        <DamSelectionContext.Provider
            value={{
                selectionMap,
                setSelectionMap: onSelectionMapChange,

                deleteSelected: openDeleteDialog,
                deleting,
                hasDeletionErrors,

                restoreSelected,
                restoring,
                hasRestoreErrors,

                archiveSelected,
                archiving,
                hasArchiveErrors,

                moveSelected: openMoveDialog,
                moving,
                hasMoveErrors,

                downloadSelected,
                downloading,
                hasDownloadErrors,
            }}
        >
            {children}
            <ConfirmDeleteDialog
                open={deleteDialogOpen}
                onCloseDialog={async (confirmed) => {
                    if (confirmed) {
                        await deleteSelected();
                    }
                    setDeleteDialogOpen(false);
                }}
                itemType="selected_items"
            />
            <MoveDamItemDialog
                damItemsToMove={Array.from(selectionMap.entries()).map((item) => {
                    return { id: item[0], type: item[1] };
                })}
                setMoving={setMoving}
                handleHasErrors={(hasErrors) => {
                    if (hasErrors) {
                        showError(setHasMoveErrors);
                    }
                }}
                open={moveDialogOpen}
                onClose={() => {
                    setMoveDialogOpen(false);
                }}
                moving={moving}
                hasErrors={hasMoveErrors}
            />
        </DamSelectionContext.Provider>
    );
};
