import { useQuery } from "@apollo/client";
import { useStoredState } from "@dextinity/admin";
import { AssetBrowser, type AssetBrowserView, Button, Dialog, EmptyState, Icon, Spinner } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { useIntl } from "react-intl";

import { DamScopeProvider } from "../../../dam/config/DamScopeProvider";
import { useDamAcceptedMimeTypes } from "../../../dam/config/useDamAcceptedMimeTypes";
import { useDamScope } from "../../../dam/config/useDamScope";
import { ManualDuplicatedFilenamesHandlerContextProvider } from "../../../dam/DataGrid/duplicatedFilenames/ManualDuplicatedFilenamesHandler";
import { FileUploadContextProvider } from "../../../dam/DataGrid/fileUpload/FileUploadContext";
import { useDamFileUpload } from "../../../dam/DataGrid/fileUpload/useDamFileUpload";
import { createAssetBrowserLabels } from "../../../dam/finder/createAssetBrowserLabels";
import { damFinderRootFolderId, toAssetBrowserAsset, toAssetBrowserFolder } from "../../../dam/finder/damFinderItems";
import { useDamFinderFiles } from "../../../dam/finder/useDamFinderFiles";
import { damFilePickerFoldersQuery } from "./DamFilePickerDialog.gql";
import type { GQLDamFilePickerFoldersQuery, GQLDamFilePickerFoldersQueryVariables } from "./DamFilePickerDialog.gql.generated";

export interface DamFilePickerDialogProps {
    open: boolean;
    onClose: () => void;
    /** Called with the ids of the chosen files: one, or with `multiple` any number, in the order they were selected. */
    onChoose: (fileIds: string[]) => void | Promise<void>;
    /** Lets several files be chosen, also from different folders. */
    multiple?: boolean;
    /** The files selected when the dialog opens, e.g. the field's current value. */
    initialFileIds?: string[];
    /** Offers only files of these MIME types, and only accepts them for upload. */
    allowedMimetypes?: string[];
    /** The title; by default "Select file" or "Select files". */
    title?: string;
}

/**
 * A dialog to choose files from the assets, built with `@dextinity/ui`: the folder tree and the folder's files as in the asset finder,
 * and an upload into the open folder. The last folder is remembered per scope.
 */
export function DamFilePickerDialog(props: DamFilePickerDialogProps) {
    return (
        <DamScopeProvider>
            <FileUploadContextProvider>
                <ManualDuplicatedFilenamesHandlerContextProvider>
                    <DamFilePickerDialogContent {...props} />
                </ManualDuplicatedFilenamesHandlerContextProvider>
            </FileUploadContextProvider>
        </DamScopeProvider>
    );
}

function DamFilePickerDialogContent({ open, onClose, onChoose, multiple, initialFileIds, allowedMimetypes, title }: DamFilePickerDialogProps) {
    const intl = useIntl();
    const scope = useDamScope();
    const { allAcceptedMimeTypes } = useDamAcceptedMimeTypes();
    const scopeKey = Object.values(scope).join("-");

    const [view, setView] = useStoredState<AssetBrowserView>("damFilePickerView", "icons");
    const [storedFolderId, setStoredFolderId] = useStoredState<string>(`damFilePickerFolder-${scopeKey}`, damFinderRootFolderId);
    const [selectedFileIds, setSelectedFileIds] = useState<string[]>(initialFileIds ?? []);
    const [isChoosing, setIsChoosing] = useState(false);

    useEffect(() => {
        if (open) {
            setSelectedFileIds(initialFileIds ?? []);
        }
        // Only reset the selection when the dialog opens, not when the caller passes a new array for the same files
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const foldersQuery = useQuery<GQLDamFilePickerFoldersQuery, GQLDamFilePickerFoldersQueryVariables>(damFilePickerFoldersQuery, {
        variables: { scope },
        skip: !open,
    });
    const damFolders = useMemo(() => foldersQuery.data?.damFoldersFlat ?? [], [foldersQuery.data]);
    const damFolderById = useMemo(() => new Map(damFolders.map((folder) => [folder.id, folder])), [damFolders]);
    const folderId = storedFolderId === damFinderRootFolderId || damFolderById.has(storedFolderId) ? storedFolderId : damFinderRootFolderId;

    const pathFolderIdsKey = useMemo(() => {
        const ids = [folderId];
        let parentId = damFolderById.get(folderId)?.parent?.id;
        while (parentId != null) {
            ids.unshift(parentId);
            parentId = damFolderById.get(parentId)?.parent?.id;
        }
        return [damFinderRootFolderId, ...ids.filter((id) => id !== damFinderRootFolderId)].join("/");
    }, [folderId, damFolderById]);
    const pathFolderIds = useMemo(() => (open ? pathFolderIdsKey.split("/") : []), [open, pathFolderIdsKey]);
    const { filesByFolderId, loadingFolderIds, error: filesError, reload } = useDamFinderFiles(pathFolderIds);

    const isAllowed = (mimetype: string) => allowedMimetypes == null || allowedMimetypes.includes(mimetype);
    const folders = useMemo(
        () => [
            {
                id: damFinderRootFolderId,
                name: intl.formatMessage({ id: "dextinity.damFinder.rootFolder", defaultMessage: "All assets" }),
                parentId: null,
            },
            ...damFolders.map((folder) => toAssetBrowserFolder(intl, folder)),
        ],
        [damFolders, intl],
    );
    const allowedMimetypesKey = allowedMimetypes?.join(",");
    const assets = useMemo(
        () =>
            Object.entries(filesByFolderId).flatMap(([id, files]) =>
                files
                    .filter((file) => allowedMimetypesKey == null || allowedMimetypesKey.split(",").includes(file.mimetype))
                    .map((file) => toAssetBrowserAsset(intl, file, id)),
            ),
        [filesByFolderId, intl, allowedMimetypesKey],
    );
    const currentFolderAssetIds = useMemo(
        () => new Set(assets.filter((asset) => asset.folderId === folderId).map((asset) => asset.id)),
        [assets, folderId],
    );
    const allAssetIds = useMemo(() => new Set(assets.map((asset) => asset.id)), [assets]);

    const changeSelection = (ids: string[]) => {
        const fileIds = ids.filter((id) => allAssetIds.has(id));
        if (!multiple) {
            const addedFileId = fileIds.find((id) => !selectedFileIds.includes(id)) ?? fileIds[fileIds.length - 1];
            setSelectedFileIds(addedFileId != null ? [addedFileId] : []);
            return;
        }
        const keptFromOtherFolders = selectedFileIds.filter((id) => !currentFolderAssetIds.has(id));
        const keptInFolder = selectedFileIds.filter((id) => fileIds.includes(id));
        const added = fileIds.filter((id) => !selectedFileIds.includes(id));
        setSelectedFileIds([...keptFromOtherFolders, ...keptInFolder, ...added]);
    };

    const choose = async (fileIds: string[]) => {
        setIsChoosing(true);
        try {
            await onChoose(fileIds);
        } finally {
            setIsChoosing(false);
        }
    };

    const acceptedMimetypes = allowedMimetypes != null ? allAcceptedMimeTypes.filter(isAllowed) : allAcceptedMimeTypes;
    const { uploadFiles, dialogs: uploadDialogs, dropzoneConfig } = useDamFileUpload({ acceptedMimetypes });
    const [isUploading, setIsUploading] = useState(false);
    const upload = async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
        setIsUploading(true);
        try {
            const { uploadedItems } = await uploadFiles(
                { acceptedFiles, fileRejections },
                { folderId: folderId === damFinderRootFolderId ? undefined : folderId },
            );
            await Promise.all([reload([folderId]), foldersQuery.refetch()]);
            const uploadedFileIds = uploadedItems.filter((item) => item.type === "file").map((item) => item.id);
            if (uploadedFileIds.length > 0) {
                setSelectedFileIds((ids) =>
                    multiple ? [...ids.filter((id) => !uploadedFileIds.includes(id)), ...uploadedFileIds] : [uploadedFileIds[0]],
                );
            }
        } finally {
            setIsUploading(false);
        }
    };
    const { getInputProps, open: openFileChooser } = useDropzone({
        ...dropzoneConfig,
        multiple: Boolean(multiple),
        noClick: true,
        noDrag: true,
        onDrop: (acceptedFiles, fileRejections) => upload(acceptedFiles, fileRejections),
    });

    const isCurrentFolderLoading = loadingFolderIds.includes(folderId) || foldersQuery.loading;
    const error = foldersQuery.error ?? filesError;

    const renderContent = (): ReactNode => {
        if (error) {
            return (
                <EmptyState
                    icon={<Icon name="warning" />}
                    title={intl.formatMessage({ id: "dextinity.form.file.picker.error", defaultMessage: "The assets couldn't be loaded" })}
                    description={error.message}
                />
            );
        }
        return (
            <AssetBrowser
                mode="pick"
                folders={folders}
                assets={assets}
                folderId={folderId}
                onFolderChange={setStoredFolderId}
                view={view}
                onViewChange={setView}
                selectedIds={selectedFileIds}
                onSelectionChange={changeSelection}
                onOpen={(asset) => {
                    if (!multiple) {
                        choose([asset.id]);
                    }
                }}
                toolbar={
                    <>
                        {(isCurrentFolderLoading || isUploading) && (
                            <Spinner size="small" aria-label={intl.formatMessage({ id: "dextinity.damFinder.loading", defaultMessage: "Loading" })} />
                        )}
                        <input {...getInputProps()} />
                        <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            startIcon={<Icon name="upload" />}
                            onClick={openFileChooser}
                            disabled={isUploading}
                        >
                            {intl.formatMessage({ id: "dextinity.damFinder.upload", defaultMessage: "Upload" })}
                        </Button>
                    </>
                }
                labels={createAssetBrowserLabels(intl)}
            />
        );
    };

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) {
                        onClose();
                    }
                }}
                dismissible={!isChoosing}
                size="large"
                title={
                    title ??
                    (multiple
                        ? intl.formatMessage({ id: "dextinity.form.file.selectFiles", defaultMessage: "Select files from DAM" })
                        : intl.formatMessage({ id: "dextinity.form.file.selectFile", defaultMessage: "Select file from DAM" }))
                }
                labels={{ close: intl.formatMessage({ id: "dextinity.generic.close", defaultMessage: "Close" }) }}
                footer={
                    <>
                        <Button variant="text" color="secondary" onClick={onClose} disabled={isChoosing}>
                            {intl.formatMessage({ id: "dextinity.generic.cancel", defaultMessage: "Cancel" })}
                        </Button>
                        <Button disabled={selectedFileIds.length === 0 || isChoosing} onClick={() => choose(selectedFileIds)}>
                            {multiple
                                ? intl.formatMessage(
                                      {
                                          id: "dextinity.form.file.applyFileSelection",
                                          defaultMessage: "Select {count, plural, one {# file} other {# files}}",
                                      },
                                      { count: selectedFileIds.length },
                                  )
                                : intl.formatMessage({ id: "dextinity.form.file.picker.select", defaultMessage: "Select" })}
                        </Button>
                    </>
                }
            >
                <Content>{renderContent()}</Content>
            </Dialog>
            {uploadDialogs}
        </>
    );
}

const Content = styled("div")`
    block-size: min(62vh, 620px);

    > .dextinityAssetBrowser {
        --dextinity-asset-browser-height: 100%;
    }
`;
