import { useMutation, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext, useStoredState } from "@dextinity/admin";
import {
    AssetBrowser,
    type AssetBrowserLabels,
    type AssetBrowserView,
    Button,
    ConfirmDialog,
    FinderLayout,
    Icon,
    PageHeader,
    QuickLook,
    type QuickLookItem,
    Spinner,
    ToastViewport,
    useToasts,
} from "@dextinity/ui";
import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { type IntlShape, useIntl } from "react-intl";
import { useHistory, useLocation, useRouteMatch } from "react-router";

import { useContentScope } from "../../contentScope/Provider";
import { useContentScopeConfig } from "../../contentScope/useContentScopeConfig";
import { DamScopeProvider } from "../config/DamScopeProvider";
import { useDamAcceptedMimeTypes } from "../config/useDamAcceptedMimeTypes";
import { useDamScope } from "../config/useDamScope";
import { ManualDuplicatedFilenamesHandlerContextProvider } from "../DataGrid/duplicatedFilenames/ManualDuplicatedFilenamesHandler";
import { FileUploadContextProvider } from "../DataGrid/fileUpload/FileUploadContext";
import { useDamFileUpload } from "../DataGrid/fileUpload/useDamFileUpload";
import { moveDamFilesMutation, moveDamFoldersMutation } from "../DataGrid/FolderDataGrid";
import type {
    GQLMoveDamFilesMutation,
    GQLMoveDamFilesMutationVariables,
    GQLMoveDamFoldersMutation,
    GQLMoveDamFoldersMutationVariables,
} from "../DataGrid/FolderDataGrid.gql.generated";
import { DamFinderFileDetails, DamFinderFolderDetails, DamFinderSelectionDetails } from "./DamFinderDetails";
import type { DamFinderUnsavedChanges } from "./DamFinderFormState";
import { damFinderRootFolderId, getFileExtension, toAssetBrowserAsset, toAssetBrowserFolder } from "./damFinderItems";
import { DamFinderNewFolderDialog } from "./DamFinderNewFolderDialog";
import {
    archiveDamFinderFilesMutation,
    createDamFinderFolderMutation,
    damFinderFileUsagesQuery,
    damFinderFoldersQuery,
    deleteDamFinderFileMutation,
    deleteDamFinderFolderMutation,
    restoreDamFinderFilesMutation,
} from "./DamFinderPage.gql";
import type {
    GQLArchiveDamFinderFilesMutation,
    GQLArchiveDamFinderFilesMutationVariables,
    GQLCreateDamFinderFolderMutation,
    GQLCreateDamFinderFolderMutationVariables,
    GQLDamFinderFileUsagesQuery,
    GQLDamFinderFileUsagesQueryVariables,
    GQLDamFinderFoldersQuery,
    GQLDamFinderFoldersQueryVariables,
    GQLDeleteDamFinderFileMutation,
    GQLDeleteDamFinderFileMutationVariables,
    GQLDeleteDamFinderFolderMutation,
    GQLDeleteDamFinderFolderMutationVariables,
    GQLRestoreDamFinderFilesMutation,
    GQLRestoreDamFinderFilesMutationVariables,
} from "./DamFinderPage.gql.generated";
import { DetailsColumn, FinderBody, FinderDropzone } from "./DamFinderPage.sc";
import { DamFinderQuickLookPreview } from "./DamFinderQuickLookPreview";
import { useDamFinderFiles } from "./useDamFinderFiles";
import { useDamFinderWindowHeight } from "./useDamFinderWindowHeight";

const folderParam = "folder";

export interface DamFinderPageProps {
    /** The title of the page header. */
    title?: string;
    /** The label above the title. */
    eyebrow?: ReactNode;
    /** The URL of a file's full settings, e.g. in the `DamPage`. Without it, the details panel links nowhere. */
    editFileUrl?: (fileId: string) => string;
}

/**
 * The assets as a finder built with `@dextinity/ui`: the folder tree, the folder's files as icons, a list, columns, or a gallery, a
 * quick look on Space, and the details of the selection. Files are uploaded by dropping them onto the finder or with "Upload".
 */
export function DamFinderPage(props: DamFinderPageProps) {
    const { match } = useContentScope();
    const routeMatch = useRouteMatch();
    useContentScopeConfig({ redirectPathAfterChange: routeMatch.url.replace(match.url, "") });

    return (
        <DamScopeProvider>
            <FileUploadContextProvider>
                <ManualDuplicatedFilenamesHandlerContextProvider>
                    <DamFinderView {...props} />
                </ManualDuplicatedFilenamesHandlerContextProvider>
            </FileUploadContextProvider>
        </DamScopeProvider>
    );
}

function createAssetBrowserLabels(intl: IntlShape): Partial<AssetBrowserLabels> {
    return {
        folders: intl.formatMessage({ id: "dextinity.damFinder.folders", defaultMessage: "Folders" }),
        items: intl.formatMessage({ id: "dextinity.damFinder.items", defaultMessage: "Files and folders" }),
        view: intl.formatMessage({ id: "dextinity.damFinder.view", defaultMessage: "View" }),
        icons: intl.formatMessage({ id: "dextinity.damFinder.view.icons", defaultMessage: "Icons" }),
        list: intl.formatMessage({ id: "dextinity.damFinder.view.list", defaultMessage: "List" }),
        columns: intl.formatMessage({ id: "dextinity.damFinder.view.columns", defaultMessage: "Columns" }),
        gallery: intl.formatMessage({ id: "dextinity.damFinder.view.gallery", defaultMessage: "Gallery" }),
        up: intl.formatMessage({ id: "dextinity.damFinder.up", defaultMessage: "Enclosing folder" }),
        name: intl.formatMessage({ id: "dextinity.damFinder.column.name", defaultMessage: "Name" }),
        details: intl.formatMessage({ id: "dextinity.damFinder.column.details", defaultMessage: "Details" }),
        modified: intl.formatMessage({ id: "dextinity.damFinder.column.modified", defaultMessage: "Modified" }),
        empty: intl.formatMessage({ id: "dextinity.damFinder.empty", defaultMessage: "This folder is empty" }),
        itemCount: (count) =>
            intl.formatMessage({ id: "dextinity.damFinder.itemCount", defaultMessage: "{count, plural, one {# item} other {# items}}" }, { count }),
        selectedCount: (selected, total) =>
            intl.formatMessage({ id: "dextinity.damFinder.selectedCount", defaultMessage: "{selected} of {total} selected" }, { selected, total }),
    };
}

function byName(first: { name: string }, second: { name: string }) {
    return first.name.localeCompare(second.name);
}

function DamFinderView({ title, eyebrow, editFileUrl }: DamFinderPageProps) {
    const intl = useIntl();
    const history = useHistory();
    const location = useLocation();
    const scope = useDamScope();
    const { allAcceptedMimeTypes } = useDamAcceptedMimeTypes();
    const { toasts, add: addToast, dismiss: dismissToast } = useToasts();

    const [view, setView] = useStoredState<AssetBrowserView>("damFinderView", "icons");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [quickLookIndex, setQuickLookIndex] = useState<number>();
    const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>();
    const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
    const [detailsUnsavedChanges, setDetailsUnsavedChanges] = useState<DamFinderUnsavedChanges>();
    const [pendingSelectedIds, setPendingSelectedIds] = useState<string[]>();
    const layoutRef = useRef<HTMLDivElement>(null);
    const windowContentRef = useRef<HTMLDivElement>(null);
    const layoutStyle = useDamFinderWindowHeight({ layoutRef, windowContentRef });

    const foldersQuery = useQuery<GQLDamFinderFoldersQuery, GQLDamFinderFoldersQueryVariables>(damFinderFoldersQuery, { variables: { scope } });
    const [createFolder] = useMutation<GQLCreateDamFinderFolderMutation, GQLCreateDamFinderFolderMutationVariables>(createDamFinderFolderMutation);
    const [moveFiles] = useMutation<GQLMoveDamFilesMutation, GQLMoveDamFilesMutationVariables>(moveDamFilesMutation);
    const [moveFolders] = useMutation<GQLMoveDamFoldersMutation, GQLMoveDamFoldersMutationVariables>(moveDamFoldersMutation);
    const [deleteFile] = useMutation<GQLDeleteDamFinderFileMutation, GQLDeleteDamFinderFileMutationVariables>(deleteDamFinderFileMutation);
    const [deleteFolder] = useMutation<GQLDeleteDamFinderFolderMutation, GQLDeleteDamFinderFolderMutationVariables>(deleteDamFinderFolderMutation);
    const [archiveFiles] = useMutation<GQLArchiveDamFinderFilesMutation, GQLArchiveDamFinderFilesMutationVariables>(archiveDamFinderFilesMutation);
    const [restoreFiles] = useMutation<GQLRestoreDamFinderFilesMutation, GQLRestoreDamFinderFilesMutationVariables>(restoreDamFinderFilesMutation);

    const damFolders = useMemo(() => foldersQuery.data?.damFoldersFlat ?? [], [foldersQuery.data]);
    const damFolderById = useMemo(() => new Map(damFolders.map((folder) => [folder.id, folder])), [damFolders]);

    const folderIdParam = new URLSearchParams(location.search).get(folderParam);
    const folderId = folderIdParam != null && damFolderById.has(folderIdParam) ? folderIdParam : damFinderRootFolderId;

    const pathFolderIdsKey = useMemo(() => {
        const ids = [folderId];
        let parentId = damFolderById.get(folderId)?.parent?.id;
        while (parentId != null) {
            ids.unshift(parentId);
            parentId = damFolderById.get(parentId)?.parent?.id;
        }
        return [damFinderRootFolderId, ...ids.filter((id) => id !== damFinderRootFolderId)].join("/");
    }, [folderId, damFolderById]);
    const pathFolderIds = useMemo(() => pathFolderIdsKey.split("/"), [pathFolderIdsKey]);

    const { filesByFolderId, loadingFolderIds, error: filesError, reload } = useDamFinderFiles(pathFolderIds);

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
    const assets = useMemo(
        () => Object.entries(filesByFolderId).flatMap(([id, files]) => files.map((file) => toAssetBrowserAsset(intl, file, id))),
        [filesByFolderId, intl],
    );
    const currentFiles = useMemo(() => [...(filesByFolderId[folderId] ?? [])].sort(byName), [filesByFolderId, folderId]);
    const fileById = useMemo(
        () => new Map(Object.values(filesByFolderId).flatMap((files) => files.map((file) => [file.id, file]))),
        [filesByFolderId],
    );

    const selectedFile = selectedIds.length === 1 ? fileById.get(selectedIds[0]) : undefined;
    const selectedFolder = selectedIds.length === 1 ? damFolderById.get(selectedIds[0]) : undefined;

    const undoLabel = intl.formatMessage({ id: "dextinity.damFinder.undo", defaultMessage: "Undo" });
    const showError = useCallback((message: string) => addToast({ message, tone: "error" }), [addToast]);

    const changeFolder = (id: string) => {
        const searchParams = new URLSearchParams(location.search);
        if (id === damFinderRootFolderId) {
            searchParams.delete(folderParam);
        } else {
            searchParams.set(folderParam, id);
        }
        history.push({ ...location, search: searchParams.toString() });
    };

    const refresh = async (folderIds: string[]) => {
        await Promise.all([reload(folderIds), foldersQuery.refetch()]);
    };

    const {
        uploadFiles,
        dialogs: uploadDialogs,
        dropzoneConfig,
        maxFileSizeInBytes,
    } = useDamFileUpload({
        acceptedMimetypes: allAcceptedMimeTypes,
    });
    const upload = async (acceptedFiles: File[], fileRejections: FileRejection[] = []) => {
        await uploadFiles({ acceptedFiles, fileRejections }, { folderId: folderId === damFinderRootFolderId ? undefined : folderId });
        await refresh([folderId]);
    };
    const { getInputProps, open: openFileChooser } = useDropzone({
        ...dropzoneConfig,
        noClick: true,
        noDrag: true,
        onDrop: (acceptedFiles, fileRejections) => upload(acceptedFiles, fileRejections),
    });
    const handleDroppedFiles = (files: File[]) => {
        const isAccepted = (file: File) => allAcceptedMimeTypes.includes(file.type) && file.size <= maxFileSizeInBytes;
        // The upload's error dialog reads only the file's name, type, and size of a rejection
        const toRejection = (file: File) => ({ file: file as FileRejection["file"], errors: [] });
        upload(files.filter(isAccepted), files.filter((file) => !isAccepted(file)).map(toRejection));
    };

    const moveItems = async ({ fileIds, folderIds, targetFolderId }: { fileIds: string[]; folderIds: string[]; targetFolderId: string }) => {
        const targetId = targetFolderId === damFinderRootFolderId ? null : targetFolderId;
        if (fileIds.length > 0) {
            await moveFiles({ variables: { fileIds, targetFolderId: targetId } });
        }
        if (folderIds.length > 0) {
            await moveFolders({ variables: { folderIds, targetFolderId: targetId, scope } });
        }
    };

    const getSourceFolderId = (id: string) =>
        damFolderById.get(id)?.parent?.id ??
        Object.entries(filesByFolderId).find(([, files]) => files.some((file) => file.id === id))?.[0] ??
        damFinderRootFolderId;

    const undoMove = async (ids: string[], sourceFolderIds: Map<string, string>, targetFolderId: string) => {
        const idsBySourceFolderId = new Map<string, string[]>();
        for (const id of ids) {
            const sourceFolderId = sourceFolderIds.get(id) ?? damFinderRootFolderId;
            idsBySourceFolderId.set(sourceFolderId, [...(idsBySourceFolderId.get(sourceFolderId) ?? []), id]);
        }
        try {
            for (const [sourceFolderId, sourceIds] of idsBySourceFolderId) {
                await moveItems({
                    fileIds: sourceIds.filter((id) => !damFolderById.has(id)),
                    folderIds: sourceIds.filter((id) => damFolderById.has(id)),
                    targetFolderId: sourceFolderId,
                });
            }
            addToast({
                message: intl.formatMessage(
                    { id: "dextinity.damFinder.moveUndone", defaultMessage: "Moved {count, plural, one {# item} other {# items}} back" },
                    { count: ids.length },
                ),
                tone: "success",
            });
        } catch {
            showError(intl.formatMessage({ id: "dextinity.damFinder.moveUndoFailed", defaultMessage: "The items couldn't be moved back" }));
        }
        await refresh([folderId, targetFolderId, ...idsBySourceFolderId.keys()]);
    };

    const handleMove = async (ids: string[], targetFolderId: string) => {
        const fileIds = ids.filter((id) => fileById.has(id));
        const folderIds = ids.filter((id) => damFolderById.has(id));
        const movedIds = [...fileIds, ...folderIds];
        const sourceFolderIds = new Map(movedIds.map((id) => [id, getSourceFolderId(id)]));
        try {
            await moveItems({ fileIds, folderIds, targetFolderId });
            setSelectedIds([]);
            addToast({
                message: intl.formatMessage(
                    { id: "dextinity.damFinder.moved", defaultMessage: "Moved {count, plural, one {# item} other {# items}}" },
                    { count: movedIds.length },
                ),
                tone: "success",
                action: { label: undoLabel, onClick: () => undoMove(movedIds, sourceFolderIds, targetFolderId) },
            });
        } catch {
            showError(intl.formatMessage({ id: "dextinity.damFinder.moveFailed", defaultMessage: "The items couldn't be moved" }));
        }
        await refresh([folderId, targetFolderId]);
    };

    const pendingDeleteFileIds = pendingDeleteIds?.filter((id) => fileById.has(id)) ?? [];
    const pendingDeleteFolderIds = pendingDeleteIds?.filter((id) => damFolderById.has(id)) ?? [];

    const pendingDeleteUsagesQuery = useQuery<GQLDamFinderFileUsagesQuery, GQLDamFinderFileUsagesQueryVariables>(damFinderFileUsagesQuery, {
        variables: { scope, ids: pendingDeleteFileIds },
        skip: pendingDeleteFileIds.length === 0,
        fetchPolicy: "network-only",
    });
    const pendingDeleteUsedFiles = (pendingDeleteUsagesQuery.data?.damFilesList.nodes ?? []).filter((file) => file.dependents.totalCount > 0);
    const pendingDeleteUsageCount = pendingDeleteUsedFiles.reduce((sum, file) => sum + file.dependents.totalCount, 0);

    const handleDelete = async () => {
        if (pendingDeleteIds == null) {
            return;
        }
        setPendingDeleteIds(undefined);
        const results = await Promise.allSettled([
            ...pendingDeleteFileIds.map((id) => deleteFile({ variables: { id } })),
            ...pendingDeleteFolderIds.map((id) => deleteFolder({ variables: { id } })),
        ]);
        const failedCount = results.filter((result) => result.status === "rejected").length;
        setSelectedIds([]);
        if (failedCount > 0) {
            showError(
                intl.formatMessage(
                    {
                        id: "dextinity.damFinder.deleteFailed",
                        defaultMessage: "{count, plural, one {# item} other {# items}} couldn't be deleted",
                    },
                    { count: failedCount },
                ),
            );
        } else {
            addToast({
                message: intl.formatMessage(
                    { id: "dextinity.damFinder.deleted", defaultMessage: "Deleted {count, plural, one {# item} other {# items}}" },
                    { count: results.length },
                ),
                tone: "success",
            });
        }
        await refresh([folderId]);
    };

    const undoArchive = async (fileIds: string[]) => {
        try {
            await restoreFiles({ variables: { ids: fileIds } });
            addToast({
                message: intl.formatMessage(
                    { id: "dextinity.damFinder.restored", defaultMessage: "Restored {count, plural, one {# file} other {# files}}" },
                    { count: fileIds.length },
                ),
                tone: "success",
            });
        } catch {
            showError(intl.formatMessage({ id: "dextinity.damFinder.restoreFailed", defaultMessage: "The files couldn't be restored" }));
        }
        await refresh([folderId]);
    };

    const handleArchive = async () => {
        const archivedFileIds = pendingDeleteFileIds;
        setPendingDeleteIds(undefined);
        try {
            await archiveFiles({ variables: { ids: archivedFileIds } });
            setSelectedIds([]);
            addToast({
                message: intl.formatMessage(
                    { id: "dextinity.damFinder.archived", defaultMessage: "Archived {count, plural, one {# file} other {# files}}" },
                    { count: archivedFileIds.length },
                ),
                tone: "success",
                action: { label: undoLabel, onClick: () => undoArchive(archivedFileIds) },
            });
        } catch {
            showError(intl.formatMessage({ id: "dextinity.damFinder.archiveFailed", defaultMessage: "The files couldn't be archived" }));
        }
        await refresh([folderId]);
    };

    const handleCreateFolder = async (name: string) => {
        try {
            const { data } = await createFolder({
                variables: {
                    input: { name, parentId: folderId === damFinderRootFolderId ? undefined : folderId },
                    scope,
                },
                context: LocalErrorScopeApolloContext,
            });
            setIsNewFolderDialogOpen(false);
            await foldersQuery.refetch();
            if (data != null) {
                setSelectedIds([data.createDamFolder.id]);
            }
            return undefined;
        } catch {
            const message = intl.formatMessage({ id: "dextinity.damFinder.createFolderFailed", defaultMessage: "The folder couldn't be created" });
            showError(message);
            return message;
        }
    };

    const changeSelection = (ids: string[]) => {
        const keepsDetailsItem = ids.length === 1 && selectedIds.length === 1 && ids[0] === selectedIds[0];
        if (detailsUnsavedChanges != null && !keepsDetailsItem) {
            setPendingSelectedIds(ids);
        } else {
            setSelectedIds(ids);
        }
    };
    const discardAndApplyPendingSelection = () => {
        detailsUnsavedChanges?.discard();
        if (pendingSelectedIds != null) {
            setSelectedIds(pendingSelectedIds);
        }
        setPendingSelectedIds(undefined);
    };
    const saveAndApplyPendingSelection = async () => {
        const nextSelectedIds = pendingSelectedIds;
        setPendingSelectedIds(undefined);
        const isSaved = (await detailsUnsavedChanges?.save()) ?? true;
        if (isSaved && nextSelectedIds != null) {
            setSelectedIds(nextSelectedIds);
        }
    };

    const openQuickLook = (fileId: string) => {
        const index = currentFiles.findIndex((file) => file.id === fileId);
        if (index !== -1) {
            setQuickLookIndex(index);
        }
    };
    const quickLookItems = currentFiles.map((file): QuickLookItem => ({
        src: file.fileUrl,
        title: file.name,
        alt: file.altText ?? undefined,
        description: [
            getFileExtension(file.name),
            file.image != null ? `${file.image.width} × ${file.image.height}` : undefined,
            file.title ?? undefined,
        ]
            .filter((part) => part != null)
            .join(" · "),
    }));
    const renderQuickLookPreview = (item: QuickLookItem) => {
        const file = quickLookIndex != null ? currentFiles[quickLookIndex] : undefined;
        if (file == null) {
            return <img src={item.src} alt={item.alt ?? item.title} />;
        }
        return <DamFinderQuickLookPreview key={file.id} file={file} />;
    };

    if (foldersQuery.error != null) {
        throw foldersQuery.error;
    }
    if (filesError != null) {
        throw filesError;
    }

    const isCurrentFolderLoading = loadingFolderIds.includes(folderId) || foldersQuery.loading;

    const renderDetails = () => {
        if (selectedFile != null) {
            return (
                <DamFinderFileDetails
                    key={selectedFile.id}
                    file={selectedFile}
                    editUrl={editFileUrl?.(selectedFile.id)}
                    onQuickLook={() => openQuickLook(selectedFile.id)}
                    onChange={() => reload([folderId])}
                    onError={showError}
                    onUnsavedChangesChange={setDetailsUnsavedChanges}
                />
            );
        }
        if (selectedFolder != null) {
            return (
                <DamFinderFolderDetails
                    key={selectedFolder.id}
                    folder={selectedFolder}
                    onOpen={() => changeFolder(selectedFolder.id)}
                    onChange={() => foldersQuery.refetch()}
                    onError={showError}
                    onUnsavedChangesChange={setDetailsUnsavedChanges}
                />
            );
        }
        return <DamFinderSelectionDetails count={selectedIds.length} />;
    };

    return (
        <>
            <FinderLayout
                ref={layoutRef}
                style={layoutStyle}
                header={
                    <PageHeader
                        eyebrow={eyebrow}
                        title={title ?? intl.formatMessage({ id: "dextinity.damFinder.title", defaultMessage: "Assets" })}
                        subtitle={
                            foldersQuery.data != null
                                ? intl.formatMessage(
                                      {
                                          id: "dextinity.damFinder.subtitle",
                                          defaultMessage:
                                              "{files, plural, one {# file} other {# files}} in {folders, plural, one {# folder} other {# folders}}",
                                      },
                                      {
                                          files: damFolders.reduce(
                                              (sum, folder) => sum + folder.numberOfFiles,
                                              filesByFolderId[damFinderRootFolderId]?.length ?? 0,
                                          ),
                                          folders: damFolders.length,
                                      },
                                  )
                                : undefined
                        }
                        actions={
                            <>
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<Icon name="folder" />}
                                    onClick={() => setIsNewFolderDialogOpen(true)}
                                >
                                    {intl.formatMessage({ id: "dextinity.damFinder.newFolder", defaultMessage: "New folder" })}
                                </Button>
                                <Button startIcon={<Icon name="upload" />} onClick={openFileChooser}>
                                    {intl.formatMessage({ id: "dextinity.damFinder.upload", defaultMessage: "Upload" })}
                                </Button>
                                <input {...getInputProps()} />
                            </>
                        }
                    />
                }
            >
                <FinderDropzone
                    ref={windowContentRef}
                    overlay
                    onFiles={handleDroppedFiles}
                    labels={{
                        title: intl.formatMessage({ id: "dextinity.damFinder.dropzone.title", defaultMessage: "Drag files here" }),
                        or: intl.formatMessage({ id: "dextinity.damFinder.dropzone.or", defaultMessage: "or" }),
                        browse: intl.formatMessage({ id: "dextinity.damFinder.dropzone.browse", defaultMessage: "choose files" }),
                        drop: intl.formatMessage(
                            { id: "dextinity.damFinder.dropzone.drop", defaultMessage: "Drop files to upload them to “{folder}”" },
                            { folder: folders.find((folder) => folder.id === folderId)?.name },
                        ),
                    }}
                >
                    <FinderBody>
                        <AssetBrowser
                            folders={folders}
                            assets={assets}
                            folderId={folderId}
                            onFolderChange={changeFolder}
                            view={view}
                            onViewChange={setView}
                            selectedIds={selectedIds}
                            onSelectionChange={changeSelection}
                            onOpen={(asset) => openQuickLook(asset.id)}
                            onQuickLook={(asset) => openQuickLook(asset.id)}
                            onMove={handleMove}
                            onDelete={setPendingDeleteIds}
                            toolbar={
                                isCurrentFolderLoading ? (
                                    <Spinner
                                        size="small"
                                        aria-label={intl.formatMessage({ id: "dextinity.damFinder.loading", defaultMessage: "Loading" })}
                                    />
                                ) : undefined
                            }
                            labels={createAssetBrowserLabels(intl)}
                        />
                        <DetailsColumn>{renderDetails()}</DetailsColumn>
                    </FinderBody>
                </FinderDropzone>
            </FinderLayout>
            <QuickLook
                open={quickLookIndex != null}
                onOpenChange={(open) => {
                    if (!open) {
                        setQuickLookIndex(undefined);
                    }
                }}
                items={quickLookItems}
                index={quickLookIndex ?? 0}
                onIndexChange={(index) => {
                    setQuickLookIndex(index);
                    changeSelection([currentFiles[index].id]);
                }}
                renderPreview={renderQuickLookPreview}
                labels={{
                    close: intl.formatMessage({ id: "dextinity.damFinder.quickLook.close", defaultMessage: "Close" }),
                    previous: intl.formatMessage({ id: "dextinity.damFinder.quickLook.previous", defaultMessage: "Previous" }),
                    next: intl.formatMessage({ id: "dextinity.damFinder.quickLook.next", defaultMessage: "Next" }),
                    browse: intl.formatMessage({ id: "dextinity.damFinder.quickLook.browse", defaultMessage: "Browse" }),
                    closeKey: intl.formatMessage({ id: "dextinity.damFinder.quickLook.closeKey", defaultMessage: "Space" }),
                    position: (index, count) =>
                        intl.formatMessage(
                            { id: "dextinity.damFinder.quickLook.position", defaultMessage: "{index} / {count}" },
                            { index: index + 1, count },
                        ),
                }}
            />
            <ConfirmDialog
                open={pendingDeleteIds != null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingDeleteIds(undefined);
                    }
                }}
                tone="danger"
                title={intl.formatMessage(
                    { id: "dextinity.damFinder.delete.title", defaultMessage: "Delete {count, plural, one {# item} other {# items}}?" },
                    { count: pendingDeleteIds?.length ?? 0 },
                )}
                description={[
                    pendingDeleteUsedFiles.length > 0
                        ? intl.formatMessage(
                              {
                                  id: "dextinity.damFinder.delete.inUse",
                                  defaultMessage:
                                      "{files, plural, one {# file is} other {# files are}} still used {usages, plural, one {# time} other {# times}}, e.g. on pages. These places lose the file.",
                              },
                              { files: pendingDeleteUsedFiles.length, usages: pendingDeleteUsageCount },
                          )
                        : undefined,
                    intl.formatMessage({
                        id: "dextinity.damFinder.delete.description",
                        defaultMessage:
                            "Deleted files and folders, including everything inside them, can't be restored. Archived files stay available in the asset manager.",
                    }),
                ]
                    .filter((part) => part != null)
                    .join(" ")}
                confirmLabel={intl.formatMessage({ id: "dextinity.damFinder.delete.confirm", defaultMessage: "Delete" })}
                confirmIcon={<Icon name="trash" />}
                onConfirm={handleDelete}
                secondaryLabel={
                    pendingDeleteFolderIds.length === 0
                        ? intl.formatMessage({ id: "dextinity.damFinder.delete.archive", defaultMessage: "Archive instead" })
                        : undefined
                }
                onSecondary={pendingDeleteFolderIds.length === 0 ? handleArchive : undefined}
                labels={{ cancel: intl.formatMessage({ id: "dextinity.damFinder.delete.cancel", defaultMessage: "Cancel" }) }}
            />
            <DamFinderNewFolderDialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen} onCreate={handleCreateFolder} />
            <ConfirmDialog
                open={pendingSelectedIds != null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingSelectedIds(undefined);
                    }
                }}
                title={intl.formatMessage({ id: "dextinity.damFinder.unsavedChanges.title", defaultMessage: "Unsaved changes" })}
                description={intl.formatMessage({
                    id: "dextinity.damFinder.unsavedChanges.description",
                    defaultMessage: "Save them before you select something else?",
                })}
                secondaryLabel={intl.formatMessage({ id: "dextinity.damFinder.unsavedChanges.discard", defaultMessage: "Discard" })}
                onSecondary={discardAndApplyPendingSelection}
                confirmLabel={intl.formatMessage({ id: "dextinity.damFinder.unsavedChanges.save", defaultMessage: "Save and continue" })}
                onConfirm={saveAndApplyPendingSelection}
                labels={{ cancel: intl.formatMessage({ id: "dextinity.damFinder.unsavedChanges.cancel", defaultMessage: "Cancel" }) }}
            />
            <ToastViewport
                toasts={toasts}
                onDismiss={dismissToast}
                labels={{ region: intl.formatMessage({ id: "dextinity.damFinder.notifications", defaultMessage: "Notifications" }) }}
            />
            {uploadDialogs}
        </>
    );
}
